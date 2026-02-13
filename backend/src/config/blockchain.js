import { ethers } from 'ethers';

/**
 * Blockchain configuration.
 * Connects to the RPC node and initialises the signer (backend wallet)
 * and the NFTPassport contract instance.
 *
 * Required env vars: RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS
 */

if (!process.env.RPC_URL) {
  console.warn('WARN: RPC_URL is not set. Blockchain calls will fail.');
}
if (!process.env.PRIVATE_KEY) {
  console.warn('WARN: PRIVATE_KEY is not set. Blockchain calls will fail.');
}
if (!process.env.CONTRACT_ADDRESS) {
  console.warn('WARN: CONTRACT_ADDRESS is not set. Blockchain calls will fail.');
}

// Minimal ABI — only the functions the backend needs to call.
// Matches NFTPassport.sol exactly.
export const NFT_PASSPORT_ABI = [
  // mintPassport(address to, bytes32 metadataHash) → uint256
  'function mintPassport(address to, bytes32 metadataHash) external returns (uint256)',
  // getHash(uint256 tokenId) → bytes32
  'function getHash(uint256 tokenId) external view returns (bytes32)',
  // nextTokenId() → uint256
  'function nextTokenId() external view returns (uint256)',
  // owner() → address
  'function owner() external view returns (address)',
  // Events
  'event PassportMinted(uint256 indexed tokenId, address indexed to, bytes32 metadataHash)',
];

/** JSON-RPC provider */
export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');

/** Backend wallet (signer) — the contract owner that can call mintPassport */
export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '0x' + '0'.repeat(64), provider);

/**
 * Returns a connected NFTPassport contract instance.
 * @returns {ethers.Contract}
 */
export function getNFTPassportContract() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS environment variable is not set');
  }
  return new ethers.Contract(contractAddress, NFT_PASSPORT_ABI, wallet);
}
