import type { MongoQueryResult, FindOptions, PipelineStage } from './types';
import { parseMongoQuery } from './queryParser';
import * as executor from './queryExecutor';

/**
 * Execute a MongoDB query string
 * @param query - MongoDB query string (e.g., "db.users.find({ age: { $gt: 25 } })")
 * @returns QueryResult with data, count, execution time, or error
 */
export async function executeMongoQuery(query: string): Promise<MongoQueryResult> {
  const start = performance.now();

  try {
    const parsed = parseMongoQuery(query);

    if (!parsed) {
      return {
        success: false,
        error: 'Invalid MongoDB query syntax',
        executionTime: performance.now() - start,
      };
    }

    const { collection, operation, args } = parsed;

    switch (operation) {
      case 'find': {
        const data = executor.find(
          collection,
          args.filter as Record<string, unknown>,
          args.options as FindOptions
        );
        return {
          success: true,
          data,
          count: data.length,
          executionTime: performance.now() - start,
        };
      }

      case 'findOne': {
        const data = executor.findOne(collection, args.filter as Record<string, unknown>);
        return {
          success: true,
          data: data ? [data] : [],
          count: data ? 1 : 0,
          executionTime: performance.now() - start,
        };
      }

      case 'insertOne': {
        const result = executor.insertOne(collection, args.document as Record<string, unknown>);
        return {
          success: true,
          data: [{ insertedId: result.insertedId }],
          count: 1,
          executionTime: performance.now() - start,
        };
      }

      case 'insertMany': {
        const result = executor.insertMany(collection, args.documents as Record<string, unknown>[]);
        return {
          success: true,
          data: [{ insertedIds: result.insertedIds }],
          count: result.insertedIds.length,
          executionTime: performance.now() - start,
        };
      }

      case 'updateOne': {
        const result = executor.update(
          collection,
          args.filter as Record<string, unknown>,
          args.update as Record<string, unknown>,
          { multi: false }
        );
        return {
          success: true,
          data: [
            {
              matchedCount: result.matchedCount,
              modifiedCount: result.modifiedCount,
            },
          ],
          executionTime: performance.now() - start,
        };
      }

      case 'updateMany': {
        const result = executor.update(
          collection,
          args.filter as Record<string, unknown>,
          args.update as Record<string, unknown>,
          { multi: true }
        );
        return {
          success: true,
          data: [
            {
              matchedCount: result.matchedCount,
              modifiedCount: result.modifiedCount,
            },
          ],
          executionTime: performance.now() - start,
        };
      }

      case 'deleteOne': {
        const result = executor.deleteDocs(collection, args.filter as Record<string, unknown>, {
          multi: false,
        });
        return {
          success: true,
          data: [{ deletedCount: result.deletedCount }],
          executionTime: performance.now() - start,
        };
      }

      case 'deleteMany': {
        const result = executor.deleteDocs(collection, args.filter as Record<string, unknown>, {
          multi: true,
        });
        return {
          success: true,
          data: [{ deletedCount: result.deletedCount }],
          executionTime: performance.now() - start,
        };
      }

      case 'countDocuments': {
        const count = executor.countDocuments(collection, args.filter as Record<string, unknown>);
        return {
          success: true,
          data: [{ count }],
          count,
          executionTime: performance.now() - start,
        };
      }

      case 'aggregate': {
        const data = executor.aggregate(collection, args.pipeline as PipelineStage[]);
        return {
          success: true,
          data,
          count: data.length,
          executionTime: performance.now() - start,
        };
      }

      case 'drop': {
        const dropped = executor.dropCollection(collection);
        return {
          success: true,
          data: [{ dropped, message: `Collection '${collection}' dropped` }],
          count: 0,
          executionTime: performance.now() - start,
        };
      }

      default:
        return {
          success: false,
          error: `Unknown operation: ${operation}`,
          executionTime: performance.now() - start,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: performance.now() - start,
    };
  }
}

/**
 * Get list of all collection names
 */
export function getCollectionList(): string[] {
  return executor.getCollectionNames();
}

/**
 * Get document count for a collection
 */
export function getCollectionCount(collectionName: string): number {
  return executor.getCollectionCount(collectionName);
}

/**
 * Drop a collection
 */
export function dropCollection(collectionName: string): boolean {
  return executor.dropCollection(collectionName);
}

/**
 * Clear all collections
 */
export function clearAllCollections(): void {
  executor.clearAllCollections();
}

/**
 * Check if MongoDB is ready (always true for in-memory)
 */
export function isMongoReady(): boolean {
  return true;
}

/**
 * Reset the MongoDB database (clear all collections)
 */
export function resetMongoDatabase(): void {
  clearAllCollections();
}
