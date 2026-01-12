import { useCallback, useEffect, useState } from 'react';
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

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let schemaData: SchemaData;

      if (activeDatabase === 'postgresql') {
        // Fetch PostgreSQL schema
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

        schemaData = schemas;
      } else {
        // Fetch MongoDB schema
        const { getCollectionList } = await import('@/db/mongodb/client');
        const { getCollection, getCollectionCount } = await import('@/db/mongodb/queryExecutor');
        const collectionNames = getCollectionList();

        const inferMongoSchema = (
          collectionName: string,
          getCollectionFn: (name: string) => Record<string, unknown>[],
          getCollectionCountFn: (name: string) => number
        ): MongoCollectionSchema => {
          const collection = getCollectionFn(collectionName);
          const count = getCollectionCountFn(collectionName);

          // Infer fields from existing documents (sample first 100 for performance)
          const fieldsMap = new Map<string, Set<string>>();
          const sampleSize = Math.min(collection.length, 100);
          const sampledDocs = collection.slice(0, sampleSize);

          for (const doc of sampledDocs) {
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

          return { name: collectionName, fields, count };
        };

        schemaData = collectionNames.map((name) => inferMongoSchema(name, getCollection, getCollectionCount));
      }

      setData(schemaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schema');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeDatabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
          // For MongoDB, infer schema on-demand (sample first 100 for performance)
          const { getCollection, getCollectionCount } = await import('@/db/mongodb/queryExecutor');
          const collection = getCollection(tableName);
          const count = getCollectionCount(tableName);

          const fieldsMap = new Map<string, Set<string>>();
          const sampleSize = Math.min(collection.length, 100);
          const sampledDocs = collection.slice(0, sampleSize);

          for (const doc of sampledDocs) {
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
      } catch {
        // Silently fail for individual table schema
        setSchema(null);
      }
    };

    fetchSchema();
  }, [tableName, dbType]);

  return schema;
}
