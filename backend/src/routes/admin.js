import { Router } from 'express';
import { createProductHandler } from '../controllers/adminProductController.js';
import { addProvenanceEventHandler } from '../controllers/adminProvenanceController.js';
import { uploadAssetsHandler } from '../controllers/adminAssetController.js';
import { mintPassportHandler } from '../controllers/adminMintController.js';
import { uploadFiles } from '../middlewares/upload.js';

const router = Router();

// POST /api/admin/products
router.post('/products', createProductHandler);

// POST /api/admin/products/:product_id/provenance
router.post('/products/:product_id/provenance', addProvenanceEventHandler);

// POST /api/admin/products/:product_id/assets
router.post('/products/:product_id/assets', uploadFiles, uploadAssetsHandler);

// POST /api/admin/products/:product_id/mint
router.post('/products/:product_id/mint', mintPassportHandler);

export default router;
