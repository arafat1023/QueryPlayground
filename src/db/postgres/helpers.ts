import type { PostgresQueryResult, PostgresTableSchema, PostgresError } from './types';

/**
 * Format query results for display
 * @param result - The raw query result from PGlite
 * @returns Formatted result with pretty-printed data
 */
export function formatQueryResult(result: PostgresQueryResult): PostgresQueryResult {
  if (!result.success || !result.rows) {
    return result;
  }

  return {
    ...result,
    rows: result.rows.map((row) => {
      // Convert dates to ISO strings
      const formatted: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row || {})) {
        if (value instanceof Date) {
          formatted[key] = value.toISOString();
        } else {
          formatted[key] = value;
        }
      }
      return formatted;
    }),
  };
}

/**
 * Parse PostgreSQL error message
 * @param error - The error object or message
 * @returns Parsed error with structured information
 */
export function parseError(error: unknown): PostgresError {
  if (error instanceof Error) {
    // Try to parse PostgreSQL error code from message
    const message = error.message;
    const codeMatch = message.match(/CODE: (\w+)/);
    const positionMatch = message.match(/POSITION: (\d+)/);

    return {
      message: message.replace(/CODE: \w+/, '').replace(/POSITION: \d+/, '').trim(),
      code: codeMatch?.[1],
      position: positionMatch?.[1],
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return {
    message: 'Unknown error occurred',
  };
}

/**
 * Get list of all tables in the database
 * Uses pg_tables instead of information_schema for better PGlite compatibility
 * @returns Promise resolving to array of table names
 */
export async function getTableList(): Promise<string[]> {
  // Try pg_tables first (more compatible with PGlite)
  const query1 = `
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;

  // Fallback to pg_class if pg_tables doesn't work
  const query2 = `
    SELECT relname as tablename
    FROM pg_class
    WHERE relkind = 'r'
    AND relnamespace = 'public'::regnamespace
    ORDER BY relname;
  `;

  // Last resort - information_schema
  const query3 = `
    SELECT table_name as tablename
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  const queries = [query1, query2, query3];

  for (const query of queries) {
    try {
      const { executePostgresQuery } = await import('./client');
      const result = await executePostgresQuery(query);

      if (result.success && result.rows && result.rows.length > 0) {
        const tables = result.rows.map((row: unknown) => (row as { tablename: string }).tablename);
        return tables;
      }
    } catch (err) {
      // Try next approach
      continue;
    }
  }

  return [];
}

/**
 * Map PostgreSQL type OID to readable type name
 */
function getPostgresTypeName(typeId: number): string {
  const typeMap: Record<number, string> = {
    16: 'boolean',
    20: 'bigint',
    23: 'integer',
    25: 'text',
    700: 'float4',
    701: 'float8',
    1043: 'varchar',
    1082: 'date',
    1114: 'timestamp',
    1186: 'interval',
    1700: 'numeric',
    3802: 'jsonb',
    1000: 'bool[]', // array
    1005: 'text[]', // array
    1007: 'int4[]', // array
    1015: 'varchar[]', // array
    1028: 'numeric[]', // array
  };
  return typeMap[typeId] || 'unknown';
}

/**
 * Get schema information for a specific table
 * Uses PGlite's describeQuery API for schema inspection
 * Note: Limited by PGlite's API - nullable/primary key info not available
 * @param tableName - The name of the table
 * @returns Promise resolving to table schema
 */
export async function getTableSchema(tableName: string): Promise<PostgresTableSchema | null> {
  const { quoteIdentifier } = await import('./client');
  const { getPostgresClient } = await import('./client');
  const quotedTableName = quoteIdentifier(tableName);

  // Use describeQuery to get column info without executing
  const query = `SELECT * FROM ${quotedTableName};`;

  try {
    const client = await getPostgresClient();
    const described = await client.describeQuery(query);

    if (described && described.resultFields && described.resultFields.length > 0) {
      return {
        name: tableName,
        columns: described.resultFields.map((field: Record<string, unknown>) => ({
          name: field.name as string,
          type: getPostgresTypeName(field.dataTypeID as number),
          nullable: true, // PGlite API limitation - cannot determine
          defaultValue: undefined,
          isPrimaryKey: false, // PGlite API limitation - cannot determine
          isForeignKey: false, // PGlite API limitation - cannot determine
        })),
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get row count for a table
 * @param tableName - The name of the table
 * @returns Promise resolving to row count
 */
export async function getTableRowCount(tableName: string): Promise<number> {
  const { quoteIdentifier } = await import('./client');
  const quotedTableName = quoteIdentifier(tableName);

  const query = `SELECT COUNT(*) as count FROM ${quotedTableName};`;

  try {
    const { executePostgresQuery } = await import('./client');
    const result = await executePostgresQuery(query);

    if (result.success && result.rows && result.rows.length > 0) {
      return (result.rows[0] as { count: number }).count;
    }

    return 0;
  } catch {
    return 0;
  }
}
