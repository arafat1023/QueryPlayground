import { useState, useCallback } from 'react';
import { executeMongoQuery, isMongoReady, resetMongoDatabase } from '@/db/mongodb/client';
import type { MongoQueryResult } from '@/db/mongodb/types';

interface UseMongoDBReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  executeQuery: (query: string) => Promise<MongoQueryResult>;
  resetDatabase: () => void;
}

/**
 * React hook for interacting with MongoDB (Mingo)
 * Provides methods to execute queries and manage database state
 */
export function useMongoDB(): UseMongoDBReturn {
  const [isReady] = useState<boolean>(isMongoReady());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execute a MongoDB query string
   */
  const executeQuery = useCallback(async (query: string): Promise<MongoQueryResult> => {
    try {
      setIsLoading(true);
      setError(null);
      return await executeMongoQuery(query);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Query execution failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        executionTime: 0,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset the MongoDB database
   */
  const resetDatabase = useCallback(() => {
    try {
      resetMongoDatabase();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset database';
      setError(errorMessage);
    }
  }, []);

  return {
    isReady,
    isLoading,
    error,
    executeQuery,
    resetDatabase,
  };
}
