import { Router } from 'express';
import { verifyProductHandler } from '../controllers/verifyController.js';

const router = Router();

// GET /api/verify/:tag_id
router.get('/:tag_id', verifyProductHandler);

export default router;
