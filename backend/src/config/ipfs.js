/**
 * Pinata IPFS configuration.
 * Reads credentials from environment variables.
 */

if (!process.env.PINATA_JWT) {
  console.warn('WARN: PINATA_JWT is not set. IPFS uploads will fail.');
}

export const pinataConfig = {
  jwt: process.env.PINATA_JWT || '',
  apiKey: process.env.PINATA_API_KEY || '',
  secretKey: process.env.PINATA_SECRET_KEY || '',
  baseUrl: 'https://api.pinata.cloud',
  gateway: process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs',
};
