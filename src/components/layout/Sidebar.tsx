import { Database, History, Plus, RefreshCw, Upload } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export function Sidebar() {
  const { activeDatabase } = useUIStore();
  const isPostgres = activeDatabase === 'postgresql';

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Schema Explorer Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isPostgres ? 'Tables' : 'Collections'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              title={isPostgres ? 'New Table' : 'New Collection'}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Schema list placeholder */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-center py-8">
            <Database className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No {isPostgres ? 'tables' : 'collections'} yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Run a CREATE statement or import data
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            <Upload className="w-4 h-4" />
            <span>Import Data</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
        </div>
      </div>

      {/* Query History Section */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              History
            </span>
          </div>
        </div>

        {/* History list placeholder */}
        <div className="max-h-40 overflow-y-auto p-2">
          <div className="text-center py-4">
            <History className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No queries yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
