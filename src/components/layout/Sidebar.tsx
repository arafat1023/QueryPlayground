import { History } from 'lucide-react';
import { SchemaExplorer } from '@/components/schema/SchemaExplorer';

interface SidebarProps {
  onResetToDefault?: () => void;
}

export function Sidebar({ onResetToDefault }: SidebarProps) {
  const handleImportData = () => {
    // TODO: Implement import data modal (branch 11)
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Schema Explorer Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <SchemaExplorer
          onImportData={handleImportData}
          onResetToDefault={onResetToDefault}
        />
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
