import { PGlite } from '@electric-sql/pglite';
import type { PostgresQueryResult } from './types';

let db: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;

/**
 * Load the PGlite filesystem bundle
 * This is needed to properly load the PostgreSQL filesystem data file
 */
async function loadFsBundle(): Promise<Blob> {
  const response = await fetch('/pglite.data');
  if (!response.ok) {
    throw new Error(`Failed to load PGlite data file: ${response.statusText}`);
  }
  return await response.blob();
}

/**
 * Get or initialize the PGlite client singleton
 * Uses IndexedDB for persistence with 'idb://queryplayground-pg'
 */
export async function getPostgresClient(): Promise<PGlite> {
  if (db) return db;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Load the filesystem bundle
        const fsBundle = await loadFsBundle();

        // Initialize PGlite with IndexedDB persistence and the data bundle
        const pg = await PGlite.create('idb://queryplayground-pg', {
          fsBundle,
        });

        return pg;
      } catch (error) {
        initPromise = null; // Reset on error to allow retry
        throw error;
      }
    })();
  }

  db = await initPromise;
  return db;
}

/**
 * Execute a PostgreSQL query
 * @param sql - The SQL query to execute
 * @param params - Optional query parameters for parameterized queries
 * @returns QueryResult with rows, fields, execution time, or error
 */
export async function executePostgresQuery(
  sql: string,
  params: unknown[] = []
): Promise<PostgresQueryResult> {
  const start = performance.now();

  try {
    const client = await getPostgresClient();
    const result = await client.query(sql, params);

    const executionTime = performance.now() - start;

    return {
      success: true,
      rows: result.rows,
      fields: result.fields,
      rowCount: result.rows.length,
      executionTime,
    };
  } catch (error) {
    const executionTime = performance.now() - start;

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime,
    };
  }
}

/**
 * Quote a SQL identifier (table name, column name, etc.) to prevent SQL injection
 * @param identifier - The identifier to quote
 * @returns Quoted identifier safe for use in SQL queries
 */
export function quoteIdentifier(identifier: string): string {
  // Double quote the identifier and escape any internal double quotes
  return `"${identifier.replace(/"/g, '""')}"`;
}

/**
 * Check if PGlite is initialized
 */
export function isPostgresReady(): boolean {
  return db !== null;
}

/**
 * Reset the PostgreSQL database (clear all data)
 * WARNING: This will delete all tables and data
 */
export async function resetPostgresDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    initPromise = null;
  }

  // Delete the IndexedDB database
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('queryplayground-pg');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  // Re-initialize
  await getPostgresClient();
}
