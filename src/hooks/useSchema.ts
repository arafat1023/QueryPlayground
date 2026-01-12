import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import type { DatabaseMode } from '@/types/editor';
import type { PostgresTableSchema } from '@/db/postgres/types';
import type { MongoCollectionSchema } from '@/db/mongodb/types';

type SchemaData = PostgresTableSchema[] | MongoCollectionSchema[];
type SchemaError = string | null;

interface UseSchemaReturn {
  data: SchemaData;
  isLoading: boolean;
  error: SchemaError;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage database schema data
 * Automatically switches between PostgreSQL and MongoDB based on active database
 */
export function useSchema(): UseSchemaReturn {
  const [data, setData] = useState<SchemaData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SchemaError>(null);
  const { activeDatabase } = useUIStore();

  const fetchPostgresSchema = async (): Promise<PostgresTableSchema[]> => {
    const { getTableList, getTableSchema, getTableRowCount } = await import('@/db/postgres/helpers');

    const tableNames = await getTableList();
    const schemas: PostgresTableSchema[] = [];

    for (const tableName of tableNames) {
      const [schema, rowCount] = await Promise.all([
        getTableSchema(tableName),
        getTableRowCount(tableName),
      ]);

      if (schema) {
        schemas.push({ ...schema, rowCount });
      }
    }

    return schemas;
  };

  const inferMongoSchema = (
    collectionName: string,
    getCollection: (name: string) => Record<string, unknown>[],
    getCollectionCount: (name: string) => number
  ): MongoCollectionSchema => {
    const collection = getCollection(collectionName);
    const count = getCollectionCount(collectionName);

    // Infer fields from existing documents
    const fieldsMap = new Map<string, Set<string>>();

    for (const doc of collection) {
      for (const [key, value] of Object.entries(doc)) {
        if (!fieldsMap.has(key)) {
          fieldsMap.set(key, new Set());
        }

        const typeSet = fieldsMap.get(key)!;

        if (value === null) {
          typeSet.add('null');
        } else if (Array.isArray(value)) {
          typeSet.add('array');
        } else {
          const type = typeof value;
          if (type === 'boolean') {
            typeSet.add('boolean');
          } else if (type === 'number') {
            typeSet.add('number');
          } else if (type === 'string') {
            typeSet.add('string');
          } else if (type === 'object') {
            typeSet.add('object');
          }
        }
      }
    }

    const fields = Array.from(fieldsMap.entries()).map(([name, types]) => ({
      name,
      type: Array.from(types).join(' | '),
    }));

    return { name: collectionName, fields, count };
  };

  const fetchMongoSchema = async (): Promise<MongoCollectionSchema[]> => {
    const { getCollectionList } = await import('@/db/mongodb/client');
    const { getCollection, getCollectionCount } = await import('@/db/mongodb/queryExecutor');
    const collectionNames = getCollectionList();

    return collectionNames.map((name) => inferMongoSchema(name, getCollection, getCollectionCount));
  };

  const refresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let schemaData: SchemaData;

      if (activeDatabase === 'postgresql') {
        schemaData = await fetchPostgresSchema();
      } else {
        schemaData = await fetchMongoSchema();
      }

      setData(schemaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schema');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [activeDatabase]);

  return { data, isLoading, error, refresh };
}

/**
 * Hook to fetch schema for a specific table/collection
 */
export function useTableSchema(
  tableName: string,
  dbType: DatabaseMode
): PostgresTableSchema | MongoCollectionSchema | null {
  const [schema, setSchema] = useState<PostgresTableSchema | MongoCollectionSchema | null>(null);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        if (dbType === 'postgresql') {
          const { getTableSchema, getTableRowCount } = await import('@/db/postgres/helpers');
          const tableSchema = await getTableSchema(tableName);

          if (tableSchema) {
            const rowCount = await getTableRowCount(tableName);
            setSchema({ ...tableSchema, rowCount });
          } else {
            setSchema(null);
          }
        } else {
          // For MongoDB, infer schema on-demand
          const { getCollection, getCollectionCount } = await import('@/db/mongodb/queryExecutor');
          const collection = getCollection(tableName);
          const count = getCollectionCount(tableName);

          const fieldsMap = new Map<string, Set<string>>();

          for (const doc of collection) {
            for (const [key, value] of Object.entries(doc)) {
              if (!fieldsMap.has(key)) {
                fieldsMap.set(key, new Set());
              }

              const typeSet = fieldsMap.get(key)!;

              if (value === null) {
                typeSet.add('null');
              } else if (Array.isArray(value)) {
                typeSet.add('array');
              } else {
                typeSet.add(typeof value);
              }
            }
          }

          const fields = Array.from(fieldsMap.entries()).map(([name, types]) => ({
            name,
            type: Array.from(types).join(' | '),
          }));

          setSchema({ name: tableName, fields, count });
        }
      } catch (err) {
        // Silently fail for individual table schema
        setSchema(null);
      }
    };

    fetchSchema();
  }, [tableName, dbType]);

  return schema;
}
