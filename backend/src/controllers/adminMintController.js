import { mintPassport } from '../services/mintService.js';

/**
 * POST /api/admin/products/:product_id/mint
 * Mint an NFT passport for a product.
 *
 * Body (optional):
 *   { "tag_type": "QR" | "NFC" | "RFID" | "PUF" }   default: "QR"
 *
 * Flow:
 *   1. Build metadata.json from product + provenance
 *   2. Hash metadata.json (keccak256)
 *   3. Pin metadata.json to IPFS
 *   4. Call smart contract mintPassport()
 *   5. Store NFTPassport + Tag in DB
 *   6. Return full result
 */
export async function mintPassportHandler(req, res) {
  const { product_id: productId } = req.params;
  const { tag_type: tagType } = req.body || {};

  // Validate tag_type if provided
  const validTagTypes = ['QR', 'NFC', 'RFID', 'PUF'];
  if (tagType && !validTagTypes.includes(tagType)) {
    return res.status(400).json({
      error: `tag_type must be one of: ${validTagTypes.join(', ')}`,
    });
  }

  try {
    const result = await mintPassport(productId, { tag_type: tagType });
    return res.status(201).json(result);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    if (err.status === 409) {
      return res.status(409).json({ error: err.message });
    }
    throw err;
  }
}
