import { Database, RefreshCw, AlertCircle, HardDrive, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';
import { useSchema } from '@/hooks/useSchema';
import { Tooltip } from '@/components/common/Tooltip';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [schemaSearch, setSchemaSearch] = useState('');

  // Filter schema data by search term
  const filteredData = useMemo(() => {
    if (!schemaSearch.trim()) return data;
    const term = schemaSearch.toLowerCase();
    return data.filter((item: { name: string }) => item.name.toLowerCase().includes(term));
  }, [data, schemaSearch]);

  // Memoize modal close handlers to prevent unnecessary re-renders
  const handleCloseImportModal = useCallback(() => setShowImportModal(false), []);
  const handleCloseWorkspaceImportModal = useCallback(() => setShowWorkspaceImportModal(false), []);

  const isPostgres = activeDatabase === 'postgresql';

  const handleTableClick = (tableName: string) => {
    // Set active table for export functionality
    setActiveTable(tableName);
    // Insert at cursor or set content if editor is empty/default
    const trimmed = content.trim();
    if (!trimmed || trimmed === 'SELECT 1 + 1 AS result') {
      setContent(`SELECT * FROM ${tableName};`);
    } else {
      // Insert table name at current cursor position via content append
      setContent(content + ` ${tableName}`);
    }
  };

  const handleColumnClick = (columnName: string) => {
    // Append column name with proper separator
    const trimmed = content.trimEnd();
    if (!trimmed) {
      setContent(columnName);
    } else if (trimmed.endsWith(',') || trimmed.endsWith('(') || trimmed.endsWith(' ')) {
      setContent(content + columnName);
    } else {
      setContent(content + ', ' + columnName);
    }
  };

  const handleCollectionClick = (collectionName: string) => {
    // Set active collection for export functionality
    setActiveCollection(collectionName);
    // Insert at cursor or set content if editor is empty/default
    const trimmed = content.trim();
    if (!trimmed || trimmed === 'db.users.find({})') {
      setContent(`db.${collectionName}.find({})`);
    } else {
      setContent(content + ` db.${collectionName}`);
    }
  };

  const handleFieldClick = (fieldName: string) => {
    // Append field name with proper separator
    const trimmed = content.trimEnd();
    if (!trimmed) {
      setContent(fieldName);
    } else if (trimmed.endsWith(',') || trimmed.endsWith('{') || trimmed.endsWith(' ') || trimmed.endsWith(':')) {
      setContent(content + fieldName);
    } else {
      setContent(content + ', ' + fieldName);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex items-center gap-2 text-left"
          aria-label={isCollapsed ? 'Expand schema explorer' : 'Collapse schema explorer'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
          <Database className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isPostgres ? 'Tables' : 'Collections'}
          </span>
          {data.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-400">
              ({data.length})
            </span>
          )}
        </button>
        <Tooltip label="Refresh schema">
          <button
            onClick={refresh}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors ${
              isLoading ? 'animate-spin' : ''
            }`}
            aria-label="Refresh schema"
            disabled={isLoading}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Error state */}
      {!isCollapsed && error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-600 dark:text-red-400 flex-1 truncate">
            {error}
          </span>
        </div>
      )}

      {!isCollapsed && (
        <>
          {/* Schema search */}
          {data.length > 3 && (
            <div className="px-2 py-1.5 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={schemaSearch}
                  onChange={(e) => setSchemaSearch(e.target.value)}
                  placeholder={`Search ${isPostgres ? 'tables' : 'collections'}...`}
                  className="w-full pl-7 pr-7 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {schemaSearch && (
                  <button
                    onClick={() => setSchemaSearch('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Schema list */}
          <div className="flex-1 overflow-y-auto">
            {isPostgres ? (
              <TableList
                tables={filteredData as import('@/db/postgres/types').PostgresTableSchema[]}
                isLoading={isLoading}
                onTableClick={handleTableClick}
                onColumnClick={handleColumnClick}
              />
            ) : (
              <CollectionList
                collections={filteredData as import('@/db/mongodb/types').MongoCollectionSchema[]}
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
        </>
      )}

      {/* Import Modal */}
      <ImportDataModal isOpen={showImportModal} onClose={handleCloseImportModal} />

      {/* Workspace Import Modal */}
      <WorkspaceImportModal isOpen={showWorkspaceImportModal} onClose={handleCloseWorkspaceImportModal} />
    </div>
  );
}
