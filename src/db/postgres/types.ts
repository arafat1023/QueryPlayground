// PostgreSQL-specific type definitions for PGlite

export interface PostgresQueryResult {
  success: boolean;
  rows?: unknown[];
  fields?: PostgresField[];
  rowCount?: number;
  error?: string;
  executionTime: number;
}

export interface PostgresField {
  name: string;
  dataTypeID: number;
  dataTypeSize: number;
  dataTypeModifier: number;
  format: string;
  schema: string;
  table: string;
  column: number;
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
