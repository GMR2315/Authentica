import { prisma } from '../config/prisma.js';

/**
 * Add a provenance event for a product. No IPFS, no blockchain.
 * @param {string} productId - product_id from Product table
 * @param {{ event_type: string, event_description?: string, event_time: Date }} data
 * @returns {Promise<import('@prisma/client').ProvenanceEvent>}
 * @throws {Error} If product not found (Prisma P2003)
 */
export async function addProvenanceEvent(productId, data) {
  return prisma.provenanceEvent.create({
    data: {
      product_id: productId,
      event_type: data.event_type,
      event_description: data.event_description ?? null,
      event_time: data.event_time,
    },
  });
}
