import { Database, RefreshCw, AlertCircle, HardDrive } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';
import { useSchema } from '@/hooks/useSchema';
import { TableList } from './TableList';
import { CollectionList } from './CollectionList';
import { ImportDataModal } from './ImportDataModal';
import { WorkspaceImportModal } from './WorkspaceImportModal';
import { ExportMenu } from './ExportMenu';

interface SchemaExplorerProps {
  onResetToDefault?: () => void;
}

/**
 * Main schema explorer component that displays tables/collections
 * Automatically switches between PostgreSQL and MongoDB views
 */
export function SchemaExplorer({ onResetToDefault }: SchemaExplorerProps) {
  const { activeDatabase, setActiveTable, setActiveCollection } = useUIStore();
  const { content, setContent } = useEditorStore();
  const { data, isLoading, error, refresh } = useSchema();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showWorkspaceImportModal, setShowWorkspaceImportModal] = useState(false);

  // Memoize modal close handlers to prevent unnecessary re-renders
  const handleCloseImportModal = useCallback(() => setShowImportModal(false), []);
  const handleCloseWorkspaceImportModal = useCallback(() => setShowWorkspaceImportModal(false), []);

  const isPostgres = activeDatabase === 'postgresql';

  const handleTableClick = (tableName: string) => {
    // Set active table for export functionality
    setActiveTable(tableName);
    // Insert table name into editor
    const newText = `SELECT * FROM ${tableName};`;
    setContent(newText);
  };

  const handleColumnClick = (columnName: string) => {
    // Append column name to editor content
    setContent(content + columnName);
  };

  const handleCollectionClick = (collectionName: string) => {
    // Set active collection for export functionality
    setActiveCollection(collectionName);
    // Insert collection query into editor
    const newText = `db.${collectionName}.find({})`;
    setContent(newText);
  };

  const handleFieldClick = (fieldName: string) => {
    // Append field name to editor content
    setContent(content + fieldName);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isPostgres ? 'Tables' : 'Collections'}
          </span>
          {data.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({data.length})
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors ${
            isLoading ? 'animate-spin' : ''
          }`}
          title="Refresh schema"
          disabled={isLoading}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-600 dark:text-red-400 flex-1 truncate">
            {error}
          </span>
        </div>
      )}

      {/* Schema list */}
      <div className="flex-1 overflow-y-auto">
        {isPostgres ? (
          <TableList
            tables={data as import('@/db/postgres/types').PostgresTableSchema[]}
            isLoading={isLoading}
            onTableClick={handleTableClick}
            onColumnClick={handleColumnClick}
          />
        ) : (
          <CollectionList
            collections={data as import('@/db/mongodb/types').MongoCollectionSchema[]}
            isLoading={isLoading}
            onCollectionClick={handleCollectionClick}
            onFieldClick={handleFieldClick}
          />
        )}
      </div>

      {/* Footer actions */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <button
          onClick={() => setShowImportModal(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <Database className="w-4 h-4" />
          <span>Import Data</span>
        </button>

        <button
          onClick={() => setShowWorkspaceImportModal(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <HardDrive className="w-4 h-4" />
          <span>Import Workspace</span>
        </button>

        <div className="flex gap-1">
          <ExportMenu />
          {onResetToDefault && (
            <button
              onClick={onResetToDefault}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Import Modal */}
      <ImportDataModal isOpen={showImportModal} onClose={handleCloseImportModal} />

      {/* Workspace Import Modal */}
      <WorkspaceImportModal isOpen={showWorkspaceImportModal} onClose={handleCloseWorkspaceImportModal} />
    </div>
  );
}
