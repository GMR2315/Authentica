import { prisma } from '../config/prisma.js';

/**
 * Create a new product. No IPFS, no blockchain.
 * @param {{ name: string, model: string, serial_number: string, description?: string }} data
 * @returns {Promise<import('@prisma/client').Product>}
 * @throws {Error} If serial_number already exists (Prisma P2002)
 */
export async function createProduct(data) {
  return prisma.product.create({
    data: {
      name: data.name,
      model: data.model,
      serial_number: data.serial_number,
      description: data.description ?? null,
    },
  });
}
