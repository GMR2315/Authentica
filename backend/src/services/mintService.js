import { prisma } from '../config/prisma.js';
import { createAndPinMetadata } from './metadataService.js';
import { mintPassportOnChain } from './blockchainService.js';
import crypto from 'crypto';

/**
 * Full mint passport flow:
 *
 *   1. Fetch product + provenance from DB
 *   2. Guard: reject if product already has an NFTPassport
 *   3. Build metadata.json
 *   4. Compute keccak256 hash of metadata.json
 *   5. Pin metadata.json to IPFS → get CID
 *   6. Call smart contract mintPassport(walletAddress, metadataHash)
 *   7. Get token_id + tx_hash from receipt
 *   8. Inside a Prisma $transaction:
 *      a. Double-check guard (no passport created while we were minting)
 *      b. Create NFTPassport record
 *      c. Generate tag_id
 *      d. Create Tag record
 *   9. Return full result
 *
 * Atomicity:
 *   NFTPassport + Tag writes are wrapped in a single Prisma interactive
 *   transaction. If either DB write fails, both are rolled back.
 *   The double-check inside the transaction prevents a race condition
 *   where two concurrent mint requests for the same product could both
 *   pass the initial guard.
 *
 * @param {string} productId - The product_id to mint a passport for.
 * @param {{ tag_type?: 'QR'|'NFC'|'RFID'|'PUF' }} [options]
 * @returns {Promise<{ nftPassport: object, tag: object, metadata: object }>}
 */
export async function mintPassport(productId, options = {}) {
  const tagType = options.tag_type || 'QR';

  // 1. Fetch product and verify it exists
  const product = await prisma.product.findUnique({
    where: { product_id: productId },
    include: { nft_passport: true, provenance: true },
  });

  if (!product) {
    throw Object.assign(new Error('Product not found'), { status: 404 });
  }

  // 2. Guard: reject if product already has an NFTPassport
  if (product.nft_passport) {
    throw Object.assign(new Error('Product already has an NFT passport'), { status: 409 });
  }

  // 3–5. Build metadata, hash it, pin to IPFS
  const { metadataHash, cid, url } = await createAndPinMetadata(
    product,
    product.provenance,
  );

  // 6–7. Mint on-chain
  const { tokenId, txHash, contractAddress } = await mintPassportOnChain(metadataHash);

  // 8. Atomic DB writes inside a Prisma transaction
  let nftPassport;
  let tag;

  try {
    const txResult = await prisma.$transaction(async (tx) => {
      // 8a. Double-check guard inside transaction to prevent race conditions.
      //     Another request may have inserted a passport while we were minting.
      const existingPassport = await tx.nFTPassport.findUnique({
        where: { product_id: productId },
      });
      if (existingPassport) {
        throw Object.assign(
          new Error('Product already has an NFT passport (concurrent mint detected)'),
          { status: 409 },
        );
      }

      // 8b. Create NFTPassport record
      const createdPassport = await tx.nFTPassport.create({
        data: {
          product_id: productId,
          token_id: tokenId,
          contract_address: contractAddress,
          metadata_hash: metadataHash,
          metadata_cid: cid,
          mint_tx_hash: txHash,
        },
      });

      // 8c. Generate tag_id
      const tagId = generateTagId();

      // 8d. Create Tag record
      const createdTag = await tx.tag.create({
        data: {
          tag_id: tagId,
          product_id: productId,
          nft_passport_id: createdPassport.nft_passport_id,
          tag_type: tagType,
        },
      });

      return { nftPassport: createdPassport, tag: createdTag };
    });

    nftPassport = txResult.nftPassport;
    tag = txResult.tag;
  } catch (err) {
    // Log the DB failure clearly for diagnostics
    console.error(
      `[mintService] DB transaction failed for product ${productId}. ` +
      `On-chain token ${tokenId} was minted but DB records were NOT saved. ` +
      `tx_hash=${txHash}, error=${err.message}`,
    );
    throw err;
  }

  // 9. Return full result
  return {
    nftPassport: {
      ...nftPassport,
      // BigInt needs string conversion for JSON serialization
      token_id: nftPassport.token_id.toString(),
    },
    tag,
    metadata: {
      cid,
      url,
      hash: metadataHash,
    },
  };
}

/**
 * Generate a unique tag_id.
 * Format: TAG-XXXXXX-XXXX (uppercase hex, collision-resistant via crypto.randomBytes).
 *
 * @returns {string}
 */
function generateTagId() {
  const bytes = crypto.randomBytes(5);
  const hex = bytes.toString('hex').toUpperCase();
  return `TAG-${hex.slice(0, 6)}-${hex.slice(6, 10)}`;
}
