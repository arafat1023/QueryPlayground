import type { MongoDocument } from '@/db/mongodb/types';

export interface JSONParseResult {
  documents: MongoDocument[];
  errors: string[];
  isInferredCollection: boolean;
}

/**
 * Parse JSON file and validate structure
 * @param file - JSON file to parse
 */
export async function parseJSONFile(file: File): Promise<JSONParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Validate structure
        if (!Array.isArray(parsed)) {
          return resolve({
            documents: [parsed],
            errors: [],
            isInferredCollection: true,
          });
        }

        if (parsed.length === 0) {
          return resolve({
            documents: [],
            errors: ['JSON file is empty'],
            isInferredCollection: true,
          });
        }

        // Validate all items are objects
        const errors: string[] = [];
        const documents = parsed.filter((item, index) => {
          if (typeof item !== 'object' || item === null || Array.isArray(item)) {
            errors.push(`Item at index ${index} is not a valid object`);
            return false;
          }
          return true;
        });

        resolve({
          documents: documents as MongoDocument[],
          errors,
          isInferredCollection: true,
        });
      } catch (error) {
        reject(new Error(`JSON parsing failed: ${(error as Error).message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Infer collection schema from documents
 */
export function inferCollectionSchema(documents: MongoDocument[]): {
  fields: Array<{ name: string; types: string[] }>;
  sampleDocument: MongoDocument;
} {
  if (documents.length === 0) {
    return { fields: [], sampleDocument: {} };
  }

  const fieldTypes: Record<string, Set<string>> = {};

  documents.forEach((doc) => {
    Object.keys(doc).forEach((key) => {
      if (!fieldTypes[key]) {
        fieldTypes[key] = new Set();
      }
      const value = doc[key];
      const type = value === null ? 'null' : typeof value;
      if (Array.isArray(value)) {
        fieldTypes[key].add('array');
      } else {
        fieldTypes[key].add(type);
      }
    });
  });

  const fields = Object.entries(fieldTypes).map(([name, types]) => ({
    name,
    types: Array.from(types),
  }));

  return {
    fields,
    sampleDocument: documents[0],
  };
}

/**
 * Convert JSON documents to PostgreSQL rows
 * Flattens nested objects into JSON strings for TEXT columns
 */
export function convertJSONToPostgresRows(
  documents: MongoDocument[]
): Record<string, unknown>[] {
  if (documents.length === 0) return [];

  const allKeys = new Set<string>();
  documents.forEach((doc) => {
    Object.keys(doc).forEach((key) => allKeys.add(key));
  });

  const columns = Array.from(allKeys);

  return documents.map((doc) => {
    const row: Record<string, unknown> = {};
    columns.forEach((col) => {
      const value = doc[col];
      if (value === null || value === undefined) {
        row[col] = null;
      } else if (typeof value === 'object') {
        row[col] = JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        row[col] = value ? 'TRUE' : 'FALSE';
      } else {
        row[col] = value;
      }
    });
    return row;
  });
}

/**
 * Infer PostgreSQL column types from JSON documents
 */
export function inferPostgresTypesFromJSON(
  documents: MongoDocument[]
): Array<{ name: string; type: string }> {
  if (documents.length === 0) return [];

  const columnTypes: Record<string, Set<string>> = {};

  documents.forEach((doc) => {
    Object.keys(doc).forEach((key) => {
      if (!columnTypes[key]) {
        columnTypes[key] = new Set();
      }
      const value = doc[key];
      if (value === null || value === undefined) {
        columnTypes[key].add('null');
      } else if (typeof value === 'boolean') {
        columnTypes[key].add('boolean');
      } else if (typeof value === 'number') {
        columnTypes[key].add(Number.isInteger(value) ? 'integer' : 'numeric');
      } else if (typeof value === 'object') {
        columnTypes[key].add('text'); // JSON objects stored as TEXT
      } else {
        columnTypes[key].add('text');
      }
    });
  });

  return Object.entries(columnTypes).map(([name, types]) => {
    const nonNullTypes = new Set(types);
    nonNullTypes.delete('null');

    if (nonNullTypes.size === 0) {
      return { name, type: 'TEXT' };
    }

    const hasText = nonNullTypes.has('text');
    const hasNumeric = nonNullTypes.has('numeric');
    const hasInteger = nonNullTypes.has('integer');
    const hasBoolean = nonNullTypes.has('boolean');

    // Type hierarchy: TEXT > NUMERIC > INTEGER > BOOLEAN
    // Any mix that doesn't fit a clear promotion path defaults to TEXT
    if (hasText || (hasInteger && hasBoolean) || (hasNumeric && hasBoolean)) {
      return { name, type: 'TEXT' };
    }
    if (hasNumeric) {
      return { name, type: 'NUMERIC' };
    }
    if (hasInteger) {
      return { name, type: 'INTEGER' };
    }
    if (hasBoolean) {
      return { name, type: 'BOOLEAN' };
    }

    return { name, type: 'TEXT' }; // Fallback for other cases
  });
}
