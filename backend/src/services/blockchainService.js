import { ethers } from 'ethers';
import { getNFTPassportContract, wallet } from '../config/blockchain.js';

/**
 * Mint a new NFT passport on-chain.
 *
 * @param {string} metadataHashHex - The keccak256 hash of metadata.json as a 0x-prefixed hex string (bytes32).
 * @returns {Promise<{ tokenId: bigint, txHash: string, contractAddress: string }>}
 */
export async function mintPassportOnChain(metadataHashHex) {
  const contract = getNFTPassportContract();
  const contractAddress = await contract.getAddress();
  console.log('[blockchainService] Before mint: RPC contract=', contractAddress, 'signer=', wallet.address);

  // Call mintPassport — mints to the backend wallet address (owner)
  const tx = await contract.mintPassport(wallet.address, metadataHashHex);
  console.log('[blockchainService] Tx sent: hash=', tx.hash);

  const receipt = await tx.wait();
  console.log('[blockchainService] Receipt received: blockNumber=', receipt.blockNumber, 'status=', receipt.status, 'logs count=', receipt.logs?.length);

  if (receipt.status !== 1) {
    console.error('[blockchainService] Tx reverted: status=', receipt.status);
    throw new Error('Mint transaction reverted');
  }

  console.log('[blockchainService] receipt.logs:', JSON.stringify(receipt.logs?.map((l) => ({ address: l.address, topics: l.topics, dataLength: l.data?.length }))));

  // Parse the PassportMinted event to extract the tokenId
  let tokenId;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({
        topics: log.topics,
        data: log.data,
      });
      if (parsed && parsed.name === 'PassportMinted') {
        tokenId = parsed.args.tokenId;
        console.log('[blockchainService] Parsed PassportMinted: tokenId=', tokenId?.toString());
        break;
      }
    } catch {
      // Skip logs from other contracts (e.g. ERC721 Transfer)
    }
  }

  if (tokenId == null) {
    console.error('[blockchainService] Failed to parse PassportMinted from receipt.logs');
    throw new Error('Failed to parse PassportMinted event from transaction receipt');
  }

  return {
    tokenId,
    txHash: receipt.hash,
    contractAddress,
  };
}

/**
 * Fetch the metadata hash stored on-chain for a given token ID.
 *
 * @param {bigint|number|string} tokenId
 * @returns {Promise<string>} The metadata hash as a 0x-prefixed hex string (bytes32).
 */
export async function getHashFromChain(tokenId) {
  const contract = getNFTPassportContract();
  const hash = await contract.getHash(tokenId);
  return hash;
}

/**
 * Compute the keccak256 hash of a JSON string (the canonical metadata.json).
 *
 * @param {string} jsonString - The canonical JSON string (use JSON.stringify with sorted keys).
 * @returns {string} The 0x-prefixed keccak256 hash (bytes32).
 */
export function computeMetadataHash(jsonString) {
  return ethers.keccak256(ethers.toUtf8Bytes(jsonString));
}
