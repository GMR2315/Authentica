import { prisma } from '../config/prisma.js';
import { pinFileToIPFS } from '../services/ipfsService.js';

// MIME types that count as images vs documents
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif'];

/**
 * POST /api/admin/products/:product_id/assets
 * Upload one or more files to IPFS and store CIDs in Product.image_cids / document_cids.
 *
 * Expects multipart/form-data with field name "files".
 */
export async function uploadAssetsHandler(req, res) {
  console.log("STEP 1: uploadAssetsHandler entered");
  const { product_id: productId } = req.params;

  // Validate product exists
  const product = await prisma.product.findUnique({
    where: { product_id: productId },
  });
  if (!product) {
    return res.status(404).json({ error: 'Product not found', product_id: productId });
  }
  console.log("STEP 2: product found");

  // Validate files present
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files provided. Upload at least one file in the "files" field.' });
  }

  console.log("STEP 3: files count =", req.files?.length);
  const uploadedImages = [];
  const uploadedDocuments = [];
  const results = [];

  for (const file of files) {
    const assetType = IMAGE_MIMES.includes(file.mimetype) ? 'image' : 'document';

    console.log("STEP 4: calling pinFileToIPFS for", file.originalname);
    const pinResult = await pinFileToIPFS(file.buffer, file.originalname, {
      product_id: productId,
      asset_type: assetType,
    });
    console.log("STEP 5: pinFileToIPFS completed");

    const entry = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      assetType,
      cid: pinResult.cid,
      url: pinResult.url,
    };

    if (assetType === 'image') {
      uploadedImages.push(pinResult.cid);
    } else {
      uploadedDocuments.push(pinResult.cid);
    }

    results.push(entry);
  }

  // Append new CIDs to existing arrays in the Product record
  const updatedProduct = await prisma.product.update({
    where: { product_id: productId },
    data: {
      image_cids: { push: uploadedImages },
      document_cids: { push: uploadedDocuments },
    },
    select: {
      product_id: true,
      name: true,
      image_cids: true,
      document_cids: true,
    },
  });

  return res.status(200).json({
    message: `${results.length} file(s) uploaded to IPFS`,
    uploads: results,
    product: updatedProduct,
  });
}
