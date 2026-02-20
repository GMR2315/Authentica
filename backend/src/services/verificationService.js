import { prisma } from '../config/prisma.js';
import { getHashFromChain, computeMetadataHash } from './blockchainService.js';
import { fetchFromIPFS } from './ipfsService.js';
import { canonicalStringify } from './metadataService.js';

/**
 * Verification result statuses.
 * AUTHENTIC, TAMPERED, FAKE match Prisma VerificationStatus enum.
 * BLOCKCHAIN_UNAVAILABLE is for API response only (not stored in VerificationLog).
 */
export const VerificationStatus = {
  AUTHENTIC: 'AUTHENTIC',
  TAMPERED: 'TAMPERED',
  FAKE: 'FAKE',
  BLOCKCHAIN_UNAVAILABLE: 'BLOCKCHAIN_UNAVAILABLE',
};

/**
 * Full verification flow:
 *
 *   1. Validate tag_id format
 *   2. Fetch Tag → NFTPassport → Product from DB
 *   3. Fetch metadata hash from blockchain (getHash)
 *   4. Fetch metadata.json from IPFS (using metadata_cid)
 *   5. Canonical stringify the fetched IPFS metadata
 *   6. Compute keccak256 of the IPFS metadata
 *   7. Compare:
 *      - IPFS hash vs on-chain hash
 *      - DB metadata_hash vs on-chain hash
 *   8. Determine verdict: AUTHENTIC / TAMPERED / FAKE
 *   9. Log result + internal details to VerificationLog / console
 *  10. Return public-safe verification result (no raw hashes)
 *
 * @param {string} tagId - The tag_id scanned from QR/NFC tag.
 * @returns {Promise<object>} Public verification result (no internal hashes).
 */
export async function verifyProduct(tagId) {
  // 1. Validate tag_id format
  if (!tagId || typeof tagId !== 'string' || !tagId.trim()) {
    return buildPublicResult(tagId, VerificationStatus.FAKE, 'Invalid tag_id', null);
  }

  const cleanTagId = tagId.trim();

  // 2. Fetch Tag + NFTPassport + Product from DB
  const tag = await prisma.tag.findUnique({
    where: { tag_id: cleanTagId },
    include: {
      nft_passport: true,
      product: {
        include: {
          provenance: true,
        },
      },
    },
  });

  if (!tag) {
    await logVerification(cleanTagId, VerificationStatus.FAKE);
    return buildPublicResult(cleanTagId, VerificationStatus.FAKE, 'Tag not found in database', null);
  }

  if (!tag.nft_passport) {
    await logVerification(cleanTagId, VerificationStatus.FAKE);
    return buildPublicResult(cleanTagId, VerificationStatus.FAKE, 'No NFT passport linked to this tag', tag.product);
  }

  const { nft_passport: passport, product } = tag;

  // 3. Fetch metadata hash from blockchain
  let onChainHash;
  try {
    onChainHash = await getHashFromChain(passport.token_id);
  } catch (err) {
    const isNetworkError =
      err.code === 'NETWORK_ERROR' ||
      err.code === 'ECONNREFUSED' ||
      err.code === 'ETIMEDOUT' ||
      err.message?.includes('missing response') ||
      err.message?.toLowerCase().includes('network');
    const errMsg = (err.message || '') + (err.reason || '') + (err.shortMessage || '');
    const isTokenNotExist =
      errMsg.includes('token does not exist') ||
      errMsg.includes('NFTPassport: token') ||
      (err.code === 'CALL_EXCEPTION' && errMsg.includes('token'));

    if (isNetworkError) {
      logInternal(cleanTagId, 'BLOCKCHAIN_UNAVAILABLE', {
        step: 'blockchain_fetch',
        token_id: passport.token_id.toString(),
        error: err.message,
        hint: 'RPC unreachable or timeout',
      });
      return buildPublicResult(
        cleanTagId,
        VerificationStatus.BLOCKCHAIN_UNAVAILABLE,
        'Blockchain unavailable. Please try again later.',
        product,
        { tag_type: tag.tag_type, minted_at: passport.minted_at },
      );
    }

    if (isTokenNotExist) {
      console.error(
        `[verification] MISMATCH: Tag ${cleanTagId} exists in DB (token_id=${passport.token_id}) but token does not exist on chain. Possible chain reset or wrong CONTRACT_ADDRESS.`,
      );
      logInternal(cleanTagId, 'TAMPERED', {
        step: 'blockchain_fetch',
        token_id: passport.token_id.toString(),
        error: err.message,
        hint: 'Tag in DB but not on chain',
      });
      await logVerification(cleanTagId, VerificationStatus.TAMPERED);
      return buildPublicResult(
        cleanTagId,
        VerificationStatus.TAMPERED,
        'Verification failed: on-chain record not found (possible chain reset).',
        product,
        { tag_type: tag.tag_type, minted_at: passport.minted_at },
      );
    }

    logInternal(cleanTagId, 'TAMPERED', {
      step: 'blockchain_fetch',
      token_id: passport.token_id.toString(),
      error: err.message,
    });
    await logVerification(cleanTagId, VerificationStatus.TAMPERED);
    return buildPublicResult(
      cleanTagId,
      VerificationStatus.TAMPERED,
      'Verification failed: unable to confirm on-chain record.',
      product,
      { tag_type: tag.tag_type, minted_at: passport.minted_at },
    );
  }

  // 4. Fetch metadata.json from IPFS
  let ipfsMetadata;
  try {
    ipfsMetadata = await fetchFromIPFS(passport.metadata_cid);
  } catch (err) {
    logInternal(cleanTagId, 'TAMPERED', {
      step: 'ipfs_fetch',
      metadata_cid: passport.metadata_cid,
      error: err.message,
    });
    await logVerification(cleanTagId, VerificationStatus.TAMPERED);
    return buildPublicResult(
      cleanTagId,
      VerificationStatus.TAMPERED,
      'Verification failed: unable to retrieve product metadata.',
      product,
      { tag_type: tag.tag_type, minted_at: passport.minted_at },
    );
  }

  // 5. Canonical stringify the IPFS metadata (catch malformed JSON)
  let ipfsMetadataJson;
  try {
    ipfsMetadataJson = canonicalStringify(ipfsMetadata);
  } catch (err) {
    logInternal(cleanTagId, 'TAMPERED', {
      step: 'json_parse',
      metadata_cid: passport.metadata_cid,
      error: err.message,
    });
    await logVerification(cleanTagId, VerificationStatus.TAMPERED);
    return buildPublicResult(
      cleanTagId,
      VerificationStatus.TAMPERED,
      'Verification failed: product metadata is malformed.',
      product,
      { tag_type: tag.tag_type, minted_at: passport.minted_at },
    );
  }

  // 6. Compute keccak256 of the IPFS metadata
  const computedHash = computeMetadataHash(ipfsMetadataJson);

  // 7. Compare hashes
  const dbHash = passport.metadata_hash;
  const onChainHashHex = onChainHash.toLowerCase();
  const computedHashHex = computedHash.toLowerCase();
  const dbHashHex = dbHash.toLowerCase();

  const ipfsMatchesChain = computedHashHex === onChainHashHex;
  const dbMatchesChain = dbHashHex === onChainHashHex;

  // 8. Determine verdict
  let status;
  let reason;

  if (ipfsMatchesChain && dbMatchesChain) {
    status = VerificationStatus.AUTHENTIC;
    reason = 'All verification checks passed. Product is authentic.';
  } else if (!ipfsMatchesChain) {
    status = VerificationStatus.TAMPERED;
    reason = 'Verification failed: product metadata integrity check did not pass.';
  } else {
    status = VerificationStatus.TAMPERED;
    reason = 'Verification failed: product records integrity check did not pass.';
  }

  // 9. Log internal details (hashes) — never sent to the client
  logInternal(cleanTagId, status, {
    step: 'hash_comparison',
    token_id: passport.token_id.toString(),
    on_chain_hash: onChainHash,
    computed_ipfs_hash: computedHash,
    db_hash: dbHash,
    ipfs_matches_chain: ipfsMatchesChain,
    db_matches_chain: dbMatchesChain,
  });

  await logVerification(cleanTagId, status);

  // 10. Return public-safe result (no raw hashes)
  return buildPublicResult(cleanTagId, status, reason, product, {
    tag_type: tag.tag_type,
    minted_at: passport.minted_at,
    contract_address: passport.contract_address,
    token_id: passport.token_id.toString(),
    ipfs_verified: ipfsMatchesChain,
    chain_verified: dbMatchesChain,
  });
}

/**
 * Build a public-safe verification result.
 * No raw hashes (on-chain, computed, DB) are included.
 *
 * @param {string} tagId
 * @param {string} status - AUTHENTIC | TAMPERED | FAKE
 * @param {string} reason - Human-readable explanation (no hash details)
 * @param {object|null} product - Product record (if found)
 * @param {object} [details] - Public-safe details (no hashes)
 * @returns {object}
 */
function buildPublicResult(tagId, status, reason, product, details = {}) {
  return {
    tag_id: tagId,
    status,
    reason,
    verified_at: new Date().toISOString(),
    product: product
      ? {
          product_id: product.product_id,
          name: product.name,
          model: product.model,
          serial_number: product.serial_number,
          brand: product.brand || null,
        }
      : null,
    details,
  };
}

/**
 * Log internal verification details to console (server-side only).
 * Contains raw hashes and diagnostic info that must NOT reach the client.
 *
 * @param {string} tagId
 * @param {string} status
 * @param {object} internals - Hash values, error messages, step info
 */
function logInternal(tagId, status, internals) {
  console.log(
    JSON.stringify({
      level: 'info',
      service: 'verification',
      tag_id: tagId,
      status,
      ...internals,
      timestamp: new Date().toISOString(),
    }),
  );
}

/**
 * Log a verification attempt to the VerificationLog table.
 *
 * @param {string} tagId
 * @param {string} status - AUTHENTIC | TAMPERED | FAKE
 */
async function logVerification(tagId, status) {
  try {
    await prisma.verificationLog.create({
      data: {
        tag_id: tagId,
        status,
      },
    });
  } catch (err) {
    console.error(`[verification] Failed to write VerificationLog for tag ${tagId}: ${err.message}`);
  }
}
