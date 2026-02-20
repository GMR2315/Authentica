import FormData from 'form-data';
import axios from 'axios';
import crypto from 'crypto';
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
 * On failure (timeout, network, etc.): use dev fallback — deterministic fake CID so mint never fails.
 * @param {object} jsonData - The JSON object to pin
 * @param {string} name - Name for Pinata metadata
 * @returns {Promise<{ cid: string, size: number, url: string }>}
 */
export async function pinJSONToIPFS(jsonData, name = 'metadata.json') {
  const payload = {
    pinataContent: jsonData,
    pinataMetadata: { name },
    pinataOptions: { cidVersion: 1 },
  };

  try {
    console.log('[ipfsService] Starting JSON pin to IPFS (timeout 60s)');

    const controller = new AbortController();
    const timeout = 60000; // 60 seconds
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${pinataConfig.baseUrl}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataConfig.jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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
  } catch (error) {
    console.warn('[ipfsService] ⚠ IPFS FAILED — Using local fallback CID', error?.message || error);

    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const cid = `LOCAL_FAKE_CID_${hash.slice(0, 16)}`;

    return {
      cid,
      size: 0,
      url: `${pinataConfig.gateway}/${cid}`,
    };
  }
}

/**
 * Fetch JSON content from IPFS via Pinata gateway.
 * @param {string} cid - IPFS CID
 * @returns {Promise<object>}
 */
export async function fetchFromIPFS(cid) {
  const controller = new AbortController();
  const timeout = 60000; // 60 seconds
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    response = await fetch(`${pinataConfig.gateway}/${cid}`, {
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('IPFS request timed out after 60 seconds');
    }
    throw error;
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`IPFS fetch failed (${response.status}) for CID: ${cid}`);
  }

  return response.json();
}
