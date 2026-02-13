import { Router } from 'express';

const router = Router();

/**
 * GET /health
 * Health check endpoint for load balancers and monitoring.
 * No business logic. Does not require database.
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'authentica-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
