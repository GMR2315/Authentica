import { pinJSONToIPFS } from './ipfsService.js';
import { computeMetadataHash } from './blockchainService.js';

/**
 * Build the canonical metadata.json object for a product.
 * Keys are sorted alphabetically to ensure deterministic hashing.
 *
 * @param {object} product - The full Product record from Prisma.
 * @param {object[]} provenanceEvents - Array of ProvenanceEvent records.
 * @returns {object} The metadata object (ready to be stringified and hashed).
 */
export function buildMetadata(product, provenanceEvents = []) {
  return {
    // Core product fields
    product_id: product.product_id,
    name: product.name,
    model: product.model,
    serial_number: product.serial_number,
    description: product.description || null,

    // Extended product fields
    brand: product.brand || null,
    category: product.category || null,
    manufacturing_date: product.manufacturing_date
      ? product.manufacturing_date.toISOString()
      : null,
    manufacturing_location: product.manufacturing_location || null,
    materials: product.materials || null,
    weight_grams: product.weight_grams || null,
    dimensions: product.dimensions || null,
    color: product.color || null,
    special_features: product.special_features || null,
    retail_price: product.retail_price != null ? String(product.retail_price) : null,
    warranty_period: product.warranty_period || null,
    batch_id: product.batch_id || null,
    quality_score: product.quality_score || null,

    // Asset CIDs
    image_cids: product.image_cids || [],
    document_cids: product.document_cids || [],

    // Provenance chain
    provenance: provenanceEvents.map((e) => ({
      event_id: e.event_id,
      event_type: e.event_type,
      event_description: e.event_description || null,
      event_time: e.event_time.toISOString(),
    })),

    // Timestamp
    created_at: product.created_at.toISOString(),
  };
}

/**
 * Create the canonical JSON string from metadata object.
 * Uses sorted keys to ensure deterministic output for hashing.
 *
 * @param {object} metadata - The metadata object from buildMetadata().
 * @returns {string} Deterministic JSON string.
 */
export function canonicalStringify(metadata) {
  return JSON.stringify(metadata, Object.keys(metadata).sort());
}

/**
 * Full metadata pipeline:
 *   1. Build metadata object from product + provenance
 *   2. Create canonical JSON string
 *   3. Compute keccak256 hash
 *   4. Pin metadata.json to IPFS
 *
 * @param {object} product - Full Product record from Prisma.
 * @param {object[]} provenanceEvents - ProvenanceEvent records.
 * @returns {Promise<{ metadata: object, metadataJson: string, metadataHash: string, cid: string, url: string }>}
 */
export async function createAndPinMetadata(product, provenanceEvents = []) {
  const metadata = buildMetadata(product, provenanceEvents);
  const metadataJson = canonicalStringify(metadata);
  const metadataHash = computeMetadataHash(metadataJson);

  const pinResult = await pinJSONToIPFS(metadata, `metadata-${product.product_id}.json`);

  return {
    metadata,
    metadataJson,
    metadataHash,
    cid: pinResult.cid,
    url: pinResult.url,
  };
}
