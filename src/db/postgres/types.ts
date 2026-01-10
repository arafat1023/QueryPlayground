// PostgreSQL-specific type definitions for PGlite

export interface PostgresQueryResult {
  success: boolean;
  rows?: unknown[];
  fields?: PostgresField[];
  rowCount?: number;
  error?: string;
  executionTime: number;
}

// Matches PGlite's Results.fields type
// Note: This is simplified - PGlite only returns name and dataTypeID in query results
export interface PostgresField {
  name: string;
  dataTypeID: number;
}

export interface PostgresTableSchema {
  name: string;
  columns: PostgresColumnSchema[];
  rowCount?: number;
}

export interface PostgresColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface PostgresError {
  message: string;
  code?: string;
  position?: string;
  detail?: string;
}
