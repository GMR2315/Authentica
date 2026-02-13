import { verifyProduct } from '../services/verificationService.js';

/**
 * GET /api/verify/:tag_id
 *
 * Consumer-facing endpoint. Scans a tag (QR/NFC) → verifies product authenticity.
 * No blockchain or IPFS logic in this controller — delegated to verificationService.
 */
export async function verifyProductHandler(req, res) {
  const { tag_id: tagId } = req.params;

  if (!tagId || !tagId.trim()) {
    return res.status(400).json({ error: 'tag_id is required' });
  }

  const result = await verifyProduct(tagId);

  // Map verification status to HTTP status code
  const httpStatus = {
    AUTHENTIC: 200,
    TAMPERED: 200,
    FAKE: 200,
  };

  return res.status(httpStatus[result.status] || 200).json(result);
}
