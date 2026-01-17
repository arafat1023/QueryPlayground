// Global type definitions for QueryPlayground

export interface DatabaseType {
  type: 'postgresql' | 'mongodb';
}

export interface QueryError {
  message: string;
  code?: string;
  statement?: string;
  line?: number;
  column?: number;
  hint?: string;
}

export interface QueryResult {
  success: boolean;
  rows?: unknown[];
  fields?: unknown[];
  rowCount?: number;
  error?: string | QueryError;
  executionTime: number;
  statementCount?: number;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export interface CollectionSchema {
  name: string;
  fields: FieldSchema[];
  count: number;
}

export interface FieldSchema {
  name: string;
  type: string;
}
