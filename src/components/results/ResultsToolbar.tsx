import { Clock, Table2, Code, Download, Copy } from 'lucide-react';
import { copyTableAsCSV, copyTableAsJSON, exportToCSV, exportToJSON } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface ResultsToolbarProps {
  rowCount: number;
  executionTime: number;
  viewMode: 'table' | 'json';
  onViewModeChange: (mode: 'table' | 'json') => void;
  rows?: unknown[];
  isMongoDB?: boolean;
}

/**
 * Toolbar for the results panel
 * Shows row count, execution time, view toggle, and export buttons
 */
export function ResultsToolbar({
  rowCount,
  executionTime,
  viewMode,
  onViewModeChange,
  rows = [],
  isMongoDB = false,
}: ResultsToolbarProps) {
  const handleExportCSV = () => {
    exportToCSV(rows, `query-results-${Date.now()}.csv`);
    toast.success('Exported to CSV');
  };

  const handleExportJSON = () => {
    exportToJSON(rows, `query-results-${Date.now()}.json`);
    toast.success('Exported to JSON');
  };

  const handleCopyAsCSV = async () => {
    const success = await copyTableAsCSV(rows);
    if (success) {
      toast.success('Copied table as CSV to clipboard');
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleCopyAsJSON = async () => {
    const success = await copyTableAsJSON(rows);
    if (success) {
      toast.success('Copied table as JSON to clipboard');
    } else {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {/* Left side: Title and stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Results
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{rowCount} row{rowCount !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {executionTime.toFixed(0)}ms
          </span>
        </div>
      </div>

      {/* Right side: View toggle and export buttons */}
      <div className="flex items-center gap-1">
        {/* View mode toggle */}
        {rows.length > 0 && !isMongoDB && (
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded overflow-hidden mr-2">
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                viewMode === 'table'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              title="Table view"
            >
              <Table2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('json')}
              className={`p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                viewMode === 'json'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              title="JSON view"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Export dropdown */}
        {rows.length > 0 && (
          <div className="relative group">
            <button className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="py-1">
                {!isMongoDB && (
                  <>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export as CSV
                    </button>
                    <button
                      onClick={handleCopyAsCSV}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy as CSV
                    </button>
                  </>
                )}
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export as JSON
                </button>
                <button
                  onClick={handleCopyAsJSON}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy as JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
