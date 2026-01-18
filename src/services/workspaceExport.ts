import { executePostgresQuery } from '@/db/postgres/client';
import { getCollection, getCollectionNames, insertMany, clearAllCollections } from '@/db/mongodb/queryExecutor';
import { STORAGE_KEYS } from '@/utils/storage';

export interface WorkspaceBackup {
  version: string;
  exportedAt: string;
  postgres: {
    tables: Array<{
      name: string;
      schema: Array<{ column_name: string; data_type: string; is_nullable: string }>;
      rowCount: number;
      data: Record<string, unknown>[];
    }>;
  };
  mongodb: {
    collections: Array<{
      name: string;
      documentCount: number;
      documents: Record<string, unknown>[];
    }>;
  };
  preferences: {
    theme: string | null;
    activeDatabase: string | null;
    editorSettings: Record<string, unknown>;
  };
}

/**
 * Get list of PostgreSQL table names
 */
async function getTableList(): Promise<string[]> {
  const result = await executePostgresQuery(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  return (result.rows ?? []).map((row: unknown) => (row as { table_name: string }).table_name);
}

/**
 * Export entire workspace to backup JSON
 */
export async function exportWorkspace(): Promise<WorkspaceBackup> {
  // Export PostgreSQL tables
  const pgTables = await getTableList();
  const postgres: WorkspaceBackup['postgres']['tables'] = [];

  for (const tableName of pgTables) {
    try {
      const schemaResult = await executePostgresQuery(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '${tableName.replace(/'/g, "''")}'
        ORDER BY ordinal_position;
      `);

      const dataResult = await executePostgresQuery(`SELECT * FROM "${tableName}"`);

      postgres.push({
        name: tableName,
        schema: (schemaResult.rows ?? []) as Array<{
          column_name: string;
          data_type: string;
          is_nullable: string;
        }>,
        rowCount: dataResult.rowCount ?? 0,
        data: (dataResult.rows ?? []) as Record<string, unknown>[],
      });
    } catch (error) {
      console.error(`Failed to export table ${tableName}:`, error);
    }
  }

  // Export MongoDB collections
  const mongoCollections = getCollectionNames();
  const mongodb: WorkspaceBackup['mongodb']['collections'] = [];

  for (const collectionName of mongoCollections) {
    try {
      const documents = getCollection(collectionName);
      mongodb.push({
        name: collectionName,
        documentCount: documents.length,
        documents: documents as Record<string, unknown>[],
      });
    } catch (error) {
      console.error(`Failed to export collection ${collectionName}:`, error);
    }
  }

  // Export preferences
  const preferences = {
    theme: localStorage.getItem(STORAGE_KEYS.THEME),
    activeDatabase: localStorage.getItem(STORAGE_KEYS.ACTIVE_DB),
    editorSettings: (() => {
      try {
        return JSON.parse(localStorage.getItem('qp_editor') || '{}');
      } catch {
        return {};
      }
    })(),
  };

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    postgres: { tables: postgres },
    mongodb: { collections: mongodb },
    preferences,
  };
}

/**
 * Download workspace backup as JSON file
 */
export function downloadWorkspaceBackup(backup: WorkspaceBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `queryplayground-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import workspace from backup JSON
 */
export async function importWorkspace(
  backup: WorkspaceBackup,
  options: {
    clearBeforeImport?: boolean;
    skipPreferences?: boolean;
  } = {}
): Promise<{ tables: number; collections: number }> {
  const { clearBeforeImport = false, skipPreferences = false } = options;

  let tableCount = 0;
  let collectionCount = 0;

  // Clear existing data if requested
  if (clearBeforeImport) {
    try {
      // Clear PostgreSQL tables
      const pgTables = await getTableList();
      for (const tableName of pgTables) {
        await executePostgresQuery(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
      }

      // Clear MongoDB collections
      clearAllCollections();
    } catch (error) {
      console.error('Failed to clear existing data:', error);
    }
  }

  // Import PostgreSQL tables
  for (const table of backup.postgres.tables) {
    try {
      // Drop existing table if any
      await executePostgresQuery(`DROP TABLE IF EXISTS "${table.name}" CASCADE;`);

      // Create table with schema
      const columnDefs = table.schema.map((col) => {
        return `"${col.column_name}" ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`;
      });

      await executePostgresQuery(`
        CREATE TABLE "${table.name}" (
          ${columnDefs.join(',\n  ')}
        );
      `);

      // Insert data
      for (const row of table.data) {
        const columns = Object.keys(row);
        const values = Object.values(row).map((v) => {
          if (v === null) return 'NULL';
          if (typeof v === 'string') return `'${String(v).replace(/'/g, "''")}'`;
          if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
          return String(v);
        });

        await executePostgresQuery(`
          INSERT INTO "${table.name}" ("${columns.join('", "')}")
          VALUES (${values.join(', ')});
        `);
      }

      tableCount++;
    } catch (error) {
      console.error(`Failed to import table ${table.name}:`, error);
    }
  }

  // Import MongoDB collections
  for (const collection of backup.mongodb.collections) {
    try {
      insertMany(collection.name, collection.documents as any[]);
      collectionCount++;
    } catch (error) {
      console.error(`Failed to import collection ${collection.name}:`, error);
    }
  }

  // Import preferences
  if (!skipPreferences && backup.preferences) {
    if (backup.preferences.theme) {
      localStorage.setItem(STORAGE_KEYS.THEME, backup.preferences.theme);
    }
    if (backup.preferences.activeDatabase) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DB, backup.preferences.activeDatabase);
    }
    localStorage.setItem('qp_editor', JSON.stringify(backup.preferences.editorSettings));
  }

  return { tables: tableCount, collections: collectionCount };
}

/**
 * Validate workspace backup file
 */
export function validateWorkspaceBackup(data: unknown): {
  valid: boolean;
  error?: string;
  backup?: WorkspaceBackup;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid backup file: not an object' };
  }

  const backup = data as Record<string, unknown>;

  if (typeof backup.version !== 'string') {
    return { valid: false, error: 'Invalid backup file: missing version' };
  }

  if (typeof backup.exportedAt !== 'string') {
    return { valid: false, error: 'Invalid backup file: missing exportedAt' };
  }

  if (!backup.postgres || typeof backup.postgres !== 'object') {
    return { valid: false, error: 'Invalid backup file: missing postgres data' };
  }

  if (!backup.mongodb || typeof backup.mongodb !== 'object') {
    return { valid: false, error: 'Invalid backup file: missing mongodb data' };
  }

  if (!backup.preferences || typeof backup.preferences !== 'object') {
    return { valid: false, error: 'Invalid backup file: missing preferences' };
  }

  return { valid: true, backup: backup as unknown as WorkspaceBackup };
}

/**
 * Parse workspace backup file
 */
export async function parseWorkspaceBackupFile(file: File): Promise<WorkspaceBackup> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        const validation = validateWorkspaceBackup(parsed);
        if (!validation.valid) {
          reject(new Error(validation.error));
          return;
        }

        resolve(validation.backup!);
      } catch (error) {
        reject(new Error(`Failed to parse workspace backup: ${(error as Error).message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
