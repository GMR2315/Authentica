import FormData from 'form-data';
import axios from 'axios';
import { pinataConfig } from '../config/ipfs.js';

/**
 * Pin a file buffer to IPFS via Pinata.
 * @param {Buffer} fileBuffer - The file contents
 * @param {string} fileName - Original file name (used as Pinata metadata)
 * @param {{ product_id?: string, asset_type?: string }} [metadata] - Optional key-value metadata
 * @returns {Promise<{ cid: string, size: number, url: string }>}
 */
export async function pinFileToIPFS(fileBuffer, fileName, metadata = {}) {
  const form = new FormData();
  form.append('file', fileBuffer, { filename: fileName });

  const pinataMetadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      product_id: metadata.product_id || '',
      asset_type: metadata.asset_type || '',
    },
  });
  form.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({ cidVersion: 1 });
  form.append('pinataOptions', pinataOptions);

  try {
    const response = await axios.post(
      `${pinataConfig.baseUrl}/pinning/pinFileToIPFS`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${pinataConfig.jwt}`,
        },
        maxBodyLength: Infinity,
      },
    );

    const data = response.data;
    return {
      cid: data.IpfsHash,
      size: data.PinSize,
      url: `${pinataConfig.gateway}/${data.IpfsHash}`,
    };
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const body = typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data;
      throw new Error(`Pinata upload failed (${status}): ${body}`);
    }
    throw err;
  }
}

/**
 * Pin a JSON object to IPFS via Pinata.
 * Used for metadata.json in later phases.
 * @param {object} jsonData - The JSON object to pin
 * @param {string} name - Name for Pinata metadata
 * @returns {Promise<{ cid: string, size: number, url: string }>}
 */
export async function pinJSONToIPFS(jsonData, name = 'metadata.json') {
  const body = JSON.stringify({
    pinataContent: jsonData,
    pinataMetadata: { name },
    pinataOptions: { cidVersion: 1 },
  });

  const response = await fetch(`${pinataConfig.baseUrl}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pinataConfig.jwt}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Pinata JSON pin failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  return {
    cid: data.IpfsHash,
    size: data.PinSize,
    url: `${pinataConfig.gateway}/${data.IpfsHash}`,
  };
}

/**
 * Fetch JSON content from IPFS via Pinata gateway.
 * Used in verification engine (Phase 7).
 * @param {string} cid - IPFS CID
 * @returns {Promise<object>}
 */
export async function fetchFromIPFS(cid) {
  const response = await fetch(`${pinataConfig.gateway}/${cid}`);

  if (!response.ok) {
    throw new Error(`IPFS fetch failed (${response.status}) for CID: ${cid}`);
  }

  return response.json();
}
