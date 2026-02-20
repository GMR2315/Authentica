import { createProduct } from '../services/productService.js';
import { prisma } from '../config/prisma.js';
import pkg from '@prisma/client';
const { Prisma } = pkg;

/**
 * GET /api/admin/products
 * List all products. Ordered by created_at descending.
 */
export async function listProductsHandler(req, res) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { created_at: 'desc' },
    });
    return res.status(200).json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/admin/products/:product_id
 * Get a single product by ID with nft_passport and provenance (ordered by event_time asc).
 */
export async function getProductByIdHandler(req, res) {
  try {
    const { product_id } = req.params;

    const product = await prisma.product.findUnique({
      where: { product_id },
      include: {
        nft_passport: true,
        provenance: {
          orderBy: { event_time: 'asc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json(
      JSON.parse(
        JSON.stringify(product, (_, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      )
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

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
