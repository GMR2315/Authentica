import { createProduct } from '../services/productService.js';
import pkg from '@prisma/client';
const { Prisma } = pkg;

/**
 * POST /api/admin/products
 * Create a new product. Input validation only. No IPFS, no blockchain.
 */
export async function createProductHandler(req, res) {
  try {
    const { name, model, serial_number, description } = req.body;

    // Input validation
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required and must be a non-empty string' });
    }
    if (typeof model !== 'string' || !model.trim()) {
      return res.status(400).json({ error: 'model is required and must be a non-empty string' });
    }
    if (typeof serial_number !== 'string' || !serial_number.trim()) {
      return res.status(400).json({ error: 'serial_number is required and must be a non-empty string' });
    }
    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({ error: 'description must be a string if provided' });
    }

    const product = await createProduct({
      name: name.trim(),
      model: model.trim(),
      serial_number: serial_number.trim(),
      description: description != null ? description.trim() || null : null,
    });

    return res.status(201).json(product);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({
        error: 'serial_number already exists',
        code: 'P2002',
      });
    }
    throw err;
  }
}
