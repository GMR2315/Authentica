import { Router } from 'express';
import { loginHandler } from '../controllers/adminAuthController.js';
import { createProductHandler, listProductsHandler, getProductByIdHandler } from '../controllers/adminProductController.js';
import { addProvenanceEventHandler } from '../controllers/adminProvenanceController.js';
import { uploadAssetsHandler } from '../controllers/adminAssetController.js';
import { mintPassportHandler } from '../controllers/adminMintController.js';
import { uploadFiles } from '../middlewares/upload.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = Router();

// POST /api/admin/login — public, no JWT required
router.post('/login', loginHandler);

// All routes below require valid JWT
router.use(verifyAdmin);

// GET /api/admin/products
router.get('/products', listProductsHandler);
// GET /api/admin/products/:product_id
router.get('/products/:product_id', getProductByIdHandler);
// POST /api/admin/products
router.post('/products', createProductHandler);

// POST /api/admin/products/:product_id/provenance
router.post('/products/:product_id/provenance', addProvenanceEventHandler);

// POST /api/admin/products/:product_id/assets
router.post('/products/:product_id/assets', uploadFiles, uploadAssetsHandler);

// POST /api/admin/products/:product_id/mint
router.post('/products/:product_id/mint', mintPassportHandler);

export default router;
