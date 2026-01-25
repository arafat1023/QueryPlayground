import Papa from 'papaparse';

export interface CSVParseResult {
  data: Record<string, unknown>[];
  errors: Array<{ row: number; message: string }>;
  meta: {
    delimiter: string;
    linebreak: string;
    fields: string[] | null;
  };
}

export interface ColumnTypeInference {
  name: string;
  type: 'TEXT' | 'INTEGER' | 'NUMERIC' | 'BOOLEAN' | 'DATE';
  nullable: boolean;
  sampleValues: unknown[];
}

/**
 * Parse CSV file and infer column types
 * @param file - CSV file to parse
 * @param options - Parser options
 */
export function parseCSVFile(
  file: File,
  options: {
    skipEmptyLines?: boolean;
    header?: boolean;
    delimiter?: string;
    previewRows?: number;
  } = {}
): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: options.header ?? true,
      skipEmptyLines: options.skipEmptyLines ?? true,
      delimiter: options.delimiter,
      dynamicTyping: true, // Auto-convert numbers
      preview: options.previewRows,
      complete: (results) => {
        resolve({
          data: results.data as Record<string, unknown>[],
          errors: results.errors.map((e) => ({
            row: (e as any).row,
            message: e.message,
          })),
          meta: {
            delimiter: results.meta.delimiter || ',',
            linebreak: results.meta.linebreak || '\n',
            fields: results.meta.fields || null,
          },
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Infer PostgreSQL column types from data sample
 */
export function inferColumnTypes(
  data: Record<string, unknown>[],
  sampleSize: number = 100
): ColumnTypeInference[] {
  if (data.length === 0) return [];

  const sample = data.slice(0, sampleSize);
  const columns: Record<string, Set<unknown>> = {};

  // Collect all unique values per column
  sample.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!columns[key]) {
        columns[key] = new Set();
      }
      columns[key].add(row[key]);
    });
  });

  // Infer types from unique values
  return Object.entries(columns).map(([name, values]) => {
    const valueArray = Array.from(values);
    const nullable = valueArray.some((v) => v === null || v === '');

    // Determine type from non-null values
    const nonNullValues = valueArray.filter((v) => v !== null && v !== '');

    let type: ColumnTypeInference['type'] = 'TEXT';
    if (nonNullValues.length > 0) {
      const allNumbers = nonNullValues.every((v) => typeof v === 'number');
      const allIntegers = nonNullValues.every((v) => Number.isInteger(v as number));
      const allBooleans = nonNullValues.every((v) => typeof v === 'boolean');
      const allDates = nonNullValues.every((v) => !isNaN(Date.parse(String(v))));

      if (allBooleans) {
        type = 'BOOLEAN';
      } else if (allNumbers && allIntegers) {
        type = 'INTEGER';
      } else if (allNumbers) {
        type = 'NUMERIC';
      } else if (allDates) {
        type = 'DATE';
      }
    }

    return {
      name,
      type,
      nullable,
      sampleValues: valueArray.slice(0, 5), // First 5 for preview
    };
  });
}

/**
 * Generate CREATE TABLE statement from inferred schema
 */
export function generateCreateTableSQL(
  tableName: string,
  columns: ColumnTypeInference[]
): string {
  const columnDefs = columns.map((col) => {
    let def = `"${col.name}" ${col.type}`;
    if (!col.nullable && col.type !== 'TEXT') {
      def += ' NOT NULL';
    }
    return def;
  });

  return `CREATE TABLE "${tableName}" (\n  ${columnDefs.join(',\n  ')}\n);`;
}

/**
 * Convert CSV data to MongoDB documents
 */
export function convertCSVToMongoDocuments(
  data: Record<string, unknown>[]
): Record<string, unknown>[] {
  return data.map((row) => {
    const doc: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      // Keep null values as null, convert empty strings to null
      doc[key] = value === '' ? null : value;
    }
    return doc;
  });
}
