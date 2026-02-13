import { addProvenanceEvent } from '../services/provenanceService.js';
import { prisma } from '../config/prisma.js';
import pkg from '@prisma/client';
const { Prisma } = pkg;

/**
 * POST /api/admin/products/:product_id/provenance
 * Add a provenance event for a product. Input validation only. No IPFS, no blockchain.
 */
export async function addProvenanceEventHandler(req, res) {
  try {
    const { product_id: productId } = req.params;
    const { event_type, event_description, event_time } = req.body;

    // Input validation
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return res.status(400).json({ error: 'product_id is required in the URL' });
    }
    if (typeof event_type !== 'string' || !event_type.trim()) {
      return res.status(400).json({ error: 'event_type is required and must be a non-empty string' });
    }
    if (event_description !== undefined && event_description !== null && typeof event_description !== 'string') {
      return res.status(400).json({ error: 'event_description must be a string if provided' });
    }
    if (event_time == null || event_time === '') {
      return res.status(400).json({ error: 'event_time is required (ISO 8601 date string)' });
    }

    const eventTimeDate = new Date(event_time);
    if (Number.isNaN(eventTimeDate.getTime())) {
      return res.status(400).json({ error: 'event_time must be a valid ISO 8601 date string' });
    }

    // Ensure product exists
    const product = await prisma.product.findUnique({
      where: { product_id: productId.trim() },
    });
    if (!product) {
      return res.status(404).json({ error: 'product not found', product_id: productId });
    }

    const event = await addProvenanceEvent(productId.trim(), {
      event_type: event_type.trim(),
      event_description: event_description != null ? event_description.trim() || null : null,
      event_time: eventTimeDate,
    });

    return res.status(201).json(event);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2003') {
        return res.status(404).json({ error: 'product not found' });
      }
    }
    throw err;
  }
}
