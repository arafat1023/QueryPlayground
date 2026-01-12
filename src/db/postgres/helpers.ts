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
    } catch {
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
 * Get primary key columns for a table using pg_constraint
 * @param tableName - The name of the table
 * @returns Promise resolving to set of primary key column names
 */
async function getPrimaryKeys(tableName: string): Promise<Set<string>> {
  const { quoteIdentifier } = await import('./client');
  const quotedTableName = quoteIdentifier(tableName);

  // Query pg_constraint to get primary key information
  const query = `
    SELECT a.attname AS column_name
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
    WHERE c.contype = 'p'
    AND c.conrelid = ${quotedTableName}::regclass;
  `;

  try {
    const { executePostgresQuery } = await import('./client');
    const result = await executePostgresQuery(query);

    if (result.success && result.rows && result.rows.length > 0) {
      const pkColumns = new Set<string>();
      for (const row of result.rows) {
        pkColumns.add((row as { column_name: string }).column_name);
      }
      return pkColumns;
    }
  } catch {
    // Silently fail if pg_constraint is not available
  }

  return new Set<string>();
}

/**
 * Get foreign key columns for a table using pg_constraint
 * @param tableName - The name of the table
 * @returns Promise resolving to map of foreign key column names to their referenced table/column
 */
async function getForeignKeys(tableName: string): Promise<Map<string, { table: string; column: string }>> {
  const { quoteIdentifier } = await import('./client');
  const quotedTableName = quoteIdentifier(tableName);

  // Query pg_constraint to get foreign key information
  const query = `
    SELECT
      a.attname AS column_name,
      confrelid::regclass AS references_table,
      af.attname AS references_column
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
    JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
    WHERE c.contype = 'f'
    AND c.conrelid = ${quotedTableName}::regclass;
  `;

  try {
    const { executePostgresQuery } = await import('./client');
    const result = await executePostgresQuery(query);

    if (result.success && result.rows && result.rows.length > 0) {
      const fkColumns = new Map<string, { table: string; column: string }>();
      for (const row of result.rows) {
        const fk = row as { column_name: string; references_table: string; references_column: string };
        fkColumns.set(fk.column_name, { table: fk.references_table, column: fk.references_column });
      }
      return fkColumns;
    }
  } catch {
    // Silently fail if pg_constraint is not available
  }

  return new Map();
}

/**
 * Get nullable (NOT NULL) columns for a table using pg_attribute
 * @param tableName - The name of the table
 * @returns Promise resolving to set of nullable column names
 */
async function getNullableColumns(tableName: string): Promise<Set<string>> {
  const { quoteIdentifier } = await import('./client');
  const quotedTableName = quoteIdentifier(tableName);

  // Query pg_attribute to get NOT NULL information
  const query = `
    SELECT a.attname AS column_name
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    WHERE c.relname = ${quotedTableName}
    AND a.attnum > 0
    AND NOT a.attisdropped
    AND a.attnotnull = false;
  `;

  try {
    const { executePostgresQuery } = await import('./client');
    const result = await executePostgresQuery(query);

    if (result.success && result.rows && result.rows.length > 0) {
      const nullableColumns = new Set<string>();
      for (const row of result.rows) {
        nullableColumns.add((row as { column_name: string }).column_name);
      }
      return nullableColumns;
    }
  } catch {
    // Silently fail if pg_attribute is not available
  }

  // Default to all columns being nullable if query fails
  return new Set<string>();
}

/**
 * Get schema information for a specific table
 * Uses PGlite's describeQuery API for column info, then augments with
 * PK/FK/nullable information from PostgreSQL system catalogs
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
      // Fetch constraint information in parallel
      const [primaryKeys, foreignKeys, nullableColumns] = await Promise.all([
        getPrimaryKeys(tableName),
        getForeignKeys(tableName),
        getNullableColumns(tableName),
      ]);

      return {
        name: tableName,
        columns: described.resultFields.map((field: Record<string, unknown>) => {
          const columnName = field.name as string;
          const fkInfo = foreignKeys.get(columnName);

          return {
            name: columnName,
            type: getPostgresTypeName(field.dataTypeID as number),
            nullable: nullableColumns.has(columnName),
            defaultValue: undefined,
            isPrimaryKey: primaryKeys.has(columnName),
            isForeignKey: foreignKeys.has(columnName),
            references: fkInfo,
          };
        }),
      };
    }

    return null;
  } catch (err) {
    console.error(`Failed to get schema for table ${tableName}:`, err);
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
  } catch (err) {
    console.error(`Failed to get row count for table ${tableName}:`, err);
    return 0;
  }
}
