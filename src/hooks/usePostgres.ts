import { useState, useEffect, useCallback } from 'react';
import {
  getPostgresClient,
  executePostgresQuery,
  isPostgresReady,
} from '@/db/postgres/client';
import type { PostgresQueryResult } from '@/db/postgres/types';

interface UsePostgresReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  executeQuery: (sql: string) => Promise<PostgresQueryResult>;
  initialize: () => Promise<void>;
}

/**
 * React hook for interacting with PostgreSQL (PGlite)
 * Provides methods to execute queries and manage database state
 */
export function usePostgres(): UsePostgresReturn {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize PGlite database
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await getPostgresClient();

      setIsReady(true);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize PostgreSQL';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  /**
   * Execute a SQL query
   */
  const executeQuery = useCallback(async (sql: string): Promise<PostgresQueryResult> => {
    try {
      setError(null);
      return await executePostgresQuery(sql);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Query execution failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        executionTime: 0,
      };
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (!isPostgresReady()) {
        await initialize();
      } else {
        setIsReady(true);
        setIsLoading(false);
      }
    };

    init();
  }, [initialize]);

  return {
    isReady,
    isLoading,
    error,
    executeQuery,
    initialize,
  };
}
