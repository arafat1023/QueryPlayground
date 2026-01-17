import { useState, useCallback, useRef, useEffect } from 'react';
import { usePostgres } from './usePostgres';
import { useMongoDB } from './useMongoDB';
import { useUIStore } from '../store/uiStore';
import type { QueryResult, QueryError } from '../types';

export interface UseQueryExecutionOptions {
  onSuccess?: (result: QueryResult) => void;
  onError?: (error: string) => void;
}

export interface UseQueryExecutionReturn {
  executeQuery: (query: string) => Promise<QueryResult | null>;
  isRunning: boolean;
  lastResult: QueryResult | null;
  clearResult: () => void;
}

const MIN_EXECUTION_INTERVAL = 300; // Minimum time between executions in ms

/**
 * Split PostgreSQL query into multiple statements
 * Handles quoted strings and comments properly
 */
function splitPostgresStatements(query: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '"';
  let inLineComment = false;
  let inBlockComment = false;
  let prevChar = '';

  for (let i = 0; i < query.length; i++) {
    const char = query[i];

    // Handle line comments (--)
    if (!inQuote && !inBlockComment && char === '-' && prevChar === '-') {
      inLineComment = true;
      current = current.slice(0, -1); // Remove the previous dash
      continue;
    }

    // End line comment on newline
    if (inLineComment && char === '\n') {
      inLineComment = false;
      current += char;
      prevChar = char;
      continue;
    }

    // Skip content in line comments
    if (inLineComment) {
      current += char;
      prevChar = char;
      continue;
    }

    // Handle block comments (/* */)
    if (!inQuote && char === '*' && prevChar === '/') {
      inBlockComment = true;
      current = current.slice(0, -1); // Remove the previous slash
      prevChar = char;
      continue;
    }

    if (inBlockComment && char === '/' && prevChar === '*') {
      inBlockComment = false;
      prevChar = char;
      continue;
    }

    // Skip content in block comments
    if (inBlockComment) {
      current += char;
      prevChar = char;
      continue;
    }

    // Handle quote toggling (single and double quotes)
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
      }
    }

    // Split on semicolon if not in quote or comment
    if (char === ';' && !inQuote && !inLineComment && !inBlockComment) {
      const stmt = current.trim();
      if (stmt) statements.push(stmt);
      current = '';
      prevChar = char;
      continue;
    }

    current += char;
    prevChar = char;
  }

  // Add last statement
  const lastStmt = current.trim();
  if (lastStmt) statements.push(lastStmt);

  return statements;
}

/**
 * Format error into user-friendly QueryError
 */
function formatError(error: unknown): QueryError {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check for PostgreSQL error codes
  const codeMatch = errorMessage.match(/^([A-Z0-9]{5}):/);
  const code = codeMatch ? codeMatch[1] : undefined;

  // Extract line/column info if available
  const lineMatch = errorMessage.match(/line (\d+)/);
  const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;

  const hint = getHintFromError(errorMessage);

  return {
    message: errorMessage,
    code,
    line,
    hint,
  };
}

/**
 * Get helpful hints based on error message
 */
function getHintFromError(errorMessage: string): string | undefined {
  const lowerError = errorMessage.toLowerCase();

  if (lowerError.includes('syntax error')) {
    return 'Check for typos, missing keywords, or incorrect punctuation';
  }
  if (lowerError.includes('relation') && lowerError.includes('does not exist')) {
    return 'Make sure the table name is correct and the table has been created';
  }
  if (lowerError.includes('column') && lowerError.includes('does not exist')) {
    return 'Check that the column name is spelled correctly';
  }
  if (lowerError.includes('division by zero')) {
    return 'Ensure the denominator is not zero';
  }
  if (lowerError.includes('unique constraint') || lowerError.includes('duplicate key')) {
    return 'A record with this value already exists';
  }
  if (lowerError.includes('foreign key constraint')) {
    return 'The referenced record does not exist';
  }
  if (lowerError.includes('invalid input syntax')) {
    return 'Check that your data types match the expected format';
  }

  return undefined;
}

/**
 * Check if query is empty or whitespace only
 */
function isEmptyQuery(query: string): boolean {
  return !query || query.trim().length === 0;
}

/**
 * Unified query execution hook
 * Handles routing to correct database, multi-statement queries, and error handling
 */
export function useQueryExecution(
  options: UseQueryExecutionOptions = {}
): UseQueryExecutionReturn {
  const { executeQuery: executePgQuery } = usePostgres();
  const { executeQuery: executeMongoQuery } = useMongoDB();
  const { activeDatabase } = useUIStore();

  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<QueryResult | null>(null);

  // Use ref for concurrency check to avoid dependency in useCallback
  const isRunningRef = useRef(false);
  // Keep options in a ref to avoid dependency on callbacks
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Track last execution time for debouncing
  const lastExecutionTime = useRef(0);

  /**
   * Execute PostgreSQL multi-statement query
   */
  const executePostgresStatements = useCallback(
    async (query: string): Promise<QueryResult> => {
      const statements = splitPostgresStatements(query);

      if (statements.length === 0) {
        return {
          success: false,
          error: {
            message: 'Empty query',
            hint: 'Please enter a SQL query',
          },
          executionTime: 0,
        };
      }

      let lastResult: QueryResult | null = null;
      const startTime = performance.now();

      try {
        // Execute statements sequentially
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          const result = await executePgQuery(statement);

          if (!result.success) {
            // Return error with statement context
            return {
              success: false,
              error: {
                ...formatError(result.error),
                statement: `Statement ${i + 1} of ${statements.length}`,
              },
              executionTime: performance.now() - startTime,
              statementCount: statements.length,
            };
          }

          lastResult = {
            ...result,
            statementCount: statements.length,
          };
        }

        return (
          lastResult || {
            success: true,
            executionTime: performance.now() - startTime,
            statementCount: statements.length,
          }
        );
      } catch (error) {
        return {
          success: false,
          error: formatError(error),
          executionTime: performance.now() - startTime,
          statementCount: statements.length,
        };
      }
    },
    [executePgQuery]
  );

  /**
   * Execute MongoDB query
   */
  const executeMongoStatement = useCallback(
    async (query: string): Promise<QueryResult> => {
      try {
        const result = await executeMongoQuery(query);

        if (!result.success) {
          return {
            success: false,
            error: formatError(result.error),
            executionTime: result.executionTime,
          };
        }

        // Transform Mongo result to match QueryResult format
        return {
          success: true,
          rows: result.data,
          rowCount: result.count,
          executionTime: result.executionTime,
        };
      } catch (error) {
        return {
          success: false,
          error: formatError(error),
          executionTime: 0,
        };
      }
    },
    [executeMongoQuery]
  );

  /**
   * Main execute query function with debouncing
   */
  const executeQuery = useCallback(
    async (query: string): Promise<QueryResult | null> => {
      // Prevent concurrent executions
      if (isRunningRef.current) {
        console.warn('[useQueryExecution] Query already executing, skipping');
        return lastResult;
      }

      // Debounce rapid executions
      const now = Date.now();
      if (now - lastExecutionTime.current < MIN_EXECUTION_INTERVAL) {
        console.warn(
          `[useQueryExecution] Query executed too quickly (debouncing ${MIN_EXECUTION_INTERVAL}ms)`
        );
        return lastResult;
      }

      // Check for empty query
      if (isEmptyQuery(query)) {
        const emptyError: QueryResult = {
          success: false,
          error: {
            message: 'Empty query',
            hint: 'Please enter a query to execute',
          },
          executionTime: 0,
        };
        optionsRef.current.onError?.('Empty query - please enter a query to execute');
        return emptyError;
      }

      isRunningRef.current = true;
      setIsRunning(true);
      lastExecutionTime.current = now;

      try {
        let result: QueryResult;

        // Route to correct database
        if (activeDatabase === 'postgresql') {
          result = await executePostgresStatements(query);
        } else {
          result = await executeMongoStatement(query);
        }

        setLastResult(result);

        // Handle callbacks using ref
        if (result.success) {
          optionsRef.current.onSuccess?.(result);
        } else {
          const errorMessage =
            typeof result.error === 'string' ? result.error : result.error?.message || 'Unknown error';
          optionsRef.current.onError?.(errorMessage);
        }

        return result;
      } finally {
        isRunningRef.current = false;
        setIsRunning(false);
      }
    },
    [executePostgresStatements, executeMongoStatement, activeDatabase, lastResult]
  );

  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    executeQuery,
    isRunning,
    lastResult,
    clearResult,
  };
}
