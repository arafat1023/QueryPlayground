import { Query, Aggregator } from 'mingo';
import type { MongoDocument, FindOptions, UpdateOperators, PipelineStage } from './types';
import { generateObjectId } from './queryParser';

const PERSISTENCE_KEY = 'qp_mongo_collections';

// In-memory collection store
const collections: Map<string, MongoDocument[]> = new Map();

/**
 * Save collections to localStorage for persistence
 */
function saveCollections(): void {
  try {
    const collectionsData = Object.fromEntries(collections);
    localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(collectionsData));
  } catch (error) {
    console.error('Failed to save collections to localStorage:', error);
  }
}

/**
 * Load collections from localStorage on initialization
 */
function loadCollections(): void {
  try {
    const stored = localStorage.getItem(PERSISTENCE_KEY);
    if (stored) {
      const collectionsData = JSON.parse(stored);
      for (const [name, docs] of Object.entries(collectionsData)) {
        collections.set(name, docs as MongoDocument[]);
      }
    }
  } catch (error) {
    console.error('Failed to load collections from localStorage:', error);
  }
}

// Load persisted collections when module initializes
loadCollections();

/**
 * Get or create a collection
 */
export function getCollection(name: string): MongoDocument[] {
  if (!collections.has(name)) {
    collections.set(name, []);
  }
  return collections.get(name)!;
}

/**
 * Find documents matching the filter
 */
export function find(
  collectionName: string,
  filter: Record<string, unknown> = {},
  options?: FindOptions
): MongoDocument[] {
  const collection = getCollection(collectionName);
  const query = new Query(filter);

  // Don't pass projection to mingo (causes "assert is not defined" error in browser)
  let cursor = query.find(collection);

  // Apply sort
  if (options?.sort) {
    cursor = cursor.sort(options.sort);
  }

  // Apply skip
  if (options?.skip) {
    cursor = cursor.skip(options.skip);
  }

  // Apply limit
  if (options?.limit) {
    cursor = cursor.limit(options.limit);
  }

  let results = cursor.all() as MongoDocument[];

  // Manually apply projection if provided
  if (options?.projection) {
    results = applyProjection(results, options.projection);
  }

  return results;
}

/**
 * Manually apply projection to documents
 * Supports both inclusive and exclusive projections
 */
function applyProjection(
  docs: MongoDocument[],
  projection: Record<string, number | boolean | string>
): MongoDocument[] {
  const keys = Object.keys(projection);

  // If projection is empty, return docs as-is
  if (keys.length === 0) {
    return docs;
  }

  // Determine if this is an inclusive or exclusive projection
  // Inclusive: { name: 1, city: 1 } - only include these fields
  // Exclusive: { email: 0, password: 0 } - exclude these fields
  const isInclusive = Object.values(projection).some(
    (v) => v === 1 || v === true || v === '1'
  );

  return docs.map((doc) => {
    if (isInclusive) {
      // Inclusive projection - only include specified fields
      const projected: MongoDocument = {};
      for (const key of keys) {
        const value = projection[key];
        if (value === 1 || value === true || value === '1') {
          if (key in doc) {
            projected[key] = doc[key];
          }
        }
      }
      // MongoDB includes _id by default in inclusive projections unless explicitly excluded
      if (doc._id !== undefined && !(projection._id === 0 || projection._id === false || projection._id === '0')) {
        projected._id = doc._id;
      }
      return projected;
    } else {
      // Exclusive projection - exclude specified fields
      const projected = { ...doc };
      for (const key of keys) {
        const value = projection[key];
        if (value === 0 || value === false || value === '0') {
          delete projected[key];
        }
      }
      return projected;
    }
  });
}

/**
 * Find a single document matching the filter
 */
export function findOne(
  collectionName: string,
  filter: Record<string, unknown> = {}
): MongoDocument | null {
  const results = find(collectionName, filter, { limit: 1 });
  return results.length > 0 ? results[0] : null;
}

/**
 * Insert a single document
 */
export function insertOne(collectionName: string, doc: MongoDocument): { insertedId: string } {
  const collection = getCollection(collectionName);
  const newDoc = {
    ...doc,
    _id: doc._id || generateObjectId(),
  };
  collection.push(newDoc);
  saveCollections();
  return { insertedId: newDoc._id as string };
}

/**
 * Insert multiple documents
 */
export function insertMany(collectionName: string, docs: MongoDocument[]): {
  insertedIds: string[];
} {
  const collection = getCollection(collectionName);
  const newDocs = docs.map((doc) => ({
    ...doc,
    _id: doc._id || generateObjectId(),
  }));
  collection.push(...newDocs);
  saveCollections();
  return { insertedIds: newDocs.map((d) => d._id as string) };
}

/**
 * Update documents matching the filter
 */
export function update(
  collectionName: string,
  filter: Record<string, unknown>,
  update: UpdateOperators,
  options?: { multi?: boolean }
): { matchedCount: number; modifiedCount: number; upsertedId?: string } {
  const collection = getCollection(collectionName);
  const query = new Query(filter);

  // Find matching documents
  const matches = query.find(collection).all();
  const matchedCount = matches.length;

  if (matchedCount === 0) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  let modifiedCount = 0;
  let hasChanges = false;

  // Update each matching document
  for (const doc of matches) {
    const document = doc as MongoDocument;
    let updated = false;

    // Apply $set
    if (update.$set) {
      Object.assign(document, update.$set);
      updated = true;
    }

    // Apply $unset
    if (update.$unset) {
      Object.keys(update.$unset).forEach((key) => {
        delete document[key];
      });
      updated = true;
    }

    // Apply $inc
    if (update.$inc) {
      Object.entries(update.$inc).forEach(([key, value]) => {
        const current = (document[key] as number) || 0;
        document[key] = current + (value as number);
      });
      updated = true;
    }

    // Apply $mul
    if (update.$mul) {
      Object.entries(update.$mul).forEach(([key, value]) => {
        const current = (document[key] as number) || 1;
        document[key] = current * (value as number);
      });
      updated = true;
    }

    // Apply $min
    if (update.$min) {
      Object.entries(update.$min).forEach(([key, value]) => {
        const current = document[key] as number;
        if (current > (value as number)) {
          document[key] = value;
        }
      });
      updated = true;
    }

    // Apply $max
    if (update.$max) {
      Object.entries(update.$max).forEach(([key, value]) => {
        const current = document[key] as number;
        if (current < (value as number)) {
          document[key] = value;
        }
      });
      updated = true;
    }

    // Apply $rename
    if (update.$rename) {
      Object.entries(update.$rename).forEach(([oldKey, newKey]) => {
        if (oldKey in document) {
          document[newKey] = document[oldKey];
          delete document[oldKey];
        }
      });
      updated = true;
    }

    if (updated) {
      modifiedCount++;
      hasChanges = true;
    }

    // If not multi, only update first match
    if (!options?.multi) {
      break;
    }
  }

  if (hasChanges) {
    saveCollections();
  }

  return { matchedCount, modifiedCount };
}

/**
 * Delete documents matching the filter
 */
export function deleteDocs(
  collectionName: string,
  filter: Record<string, unknown>,
  options?: { multi?: boolean }
): { deletedCount: number } {
  const collection = getCollection(collectionName);
  const query = new Query(filter);
  let deletedCount = 0;

  if (options?.multi) {
    // Find all matches and remove them
    const matches = query.find(collection).all();
    matches.forEach((doc) => {
      const index = collection.indexOf(doc as MongoDocument);
      if (index > -1) {
        collection.splice(index, 1);
        deletedCount++;
      }
    });
  } else {
    // Single document deletion - find first match and remove it
    const match = query.find(collection).next();
    if (match) {
      const index = collection.indexOf(match as MongoDocument);
      if (index > -1) {
        collection.splice(index, 1);
        deletedCount = 1;
      }
    }
  }

  if (deletedCount > 0) {
    saveCollections();
  }

  return { deletedCount };
}

/**
 * Count documents matching the filter
 * Note: Mingo doesn't have a native count method, so we use .all().length
 */
export function countDocuments(
  collectionName: string,
  filter: Record<string, unknown> = {}
): number {
  const collection = getCollection(collectionName);
  const query = new Query(filter);
  return query.find(collection).all().length;
}

/**
 * Execute aggregation pipeline
 */
export function aggregate(collectionName: string, pipeline: PipelineStage[]): unknown[] {
  const collection = getCollection(collectionName);
  const aggregator = new Aggregator(pipeline);
  return aggregator.run(collection);
}

/**
 * Clear all collections
 */
export function clearAllCollections(): void {
  collections.clear();
  saveCollections();
}

/**
 * Drop a specific collection
 */
export function dropCollection(collectionName: string): boolean {
  const deleted = collections.delete(collectionName);
  if (deleted) {
    saveCollections();
  }
  return deleted;
}

/**
 * Get list of all collection names
 */
export function getCollectionNames(): string[] {
  return Array.from(collections.keys());
}

/**
 * Get document count for a collection
 */
export function getCollectionCount(collectionName: string): number {
  return getCollection(collectionName).length;
}
