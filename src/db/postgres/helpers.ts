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
 * @returns Promise resolving to array of table names
 */
export async function getTableList(): Promise<string[]> {
  const query = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  try {
    const { executePostgresQuery } = await import('./client');
    const result = await executePostgresQuery(query);

    if (result.success && result.rows) {
      return result.rows.map((row: unknown) => (row as { table_name: string }).table_name);
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Get schema information for a specific table
 * @param tableName - The name of the table
 * @returns Promise resolving to table schema
 */
export async function getTableSchema(tableName: string): Promise<PostgresTableSchema | null> {
  const query = `
    SELECT
      column_name,
      data_type,
      is_nullable,
      column_default,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_name = columns.table_name
            AND kcu.column_name = columns.column_name
            AND tc.constraint_type = 'PRIMARY KEY'
        )
        THEN true
        ELSE false
      END as is_primary_key,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.referential_constraints rc
            ON tc.constraint_name = rc.constraint_name
          WHERE tc.table_name = columns.table_name
            AND kcu.column_name = columns.column_name
            AND tc.constraint_type = 'FOREIGN KEY'
        )
        THEN true
        ELSE false
      END as is_foreign_key
    FROM information_schema.columns columns
    WHERE table_name = $1
    ORDER BY ordinal_position;
  `;

  try {
    const { executePostgresQuery } = await import('./client');
    const result = await executePostgresQuery(query.replace('$1', `'${tableName}'`));

    if (result.success && result.rows && result.rows.length > 0) {
      return {
        name: tableName,
        columns: result.rows.map((row: unknown) => {
          const r = row as Record<string, unknown>;
          return {
            name: r.column_name as string,
            type: r.data_type as string,
            nullable: r.is_nullable === 'YES',
            defaultValue: r.column_default as string | undefined,
            isPrimaryKey: r.is_primary_key as boolean,
            isForeignKey: r.is_foreign_key as boolean,
          };
        }),
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
  const query = `SELECT COUNT(*) as count FROM "${tableName}";`;

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
