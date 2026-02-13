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

  // Call mintPassport — mints to the backend wallet address (owner)
  const tx = await contract.mintPassport(wallet.address, metadataHashHex);
  const receipt = await tx.wait();

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
        break;
      }
    } catch {
      // Skip logs from other contracts (e.g. ERC721 Transfer)
    }
  }

  if (tokenId == null) {
    throw new Error('Failed to parse PassportMinted event from transaction receipt');
  }

  return {
    tokenId,
    txHash: receipt.hash,
    contractAddress: await contract.getAddress(),
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
