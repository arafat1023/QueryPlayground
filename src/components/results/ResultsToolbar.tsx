import { useState, useEffect, useRef } from 'react';
import { Clock, Table2, Code, Download, Copy, Braces, Search } from 'lucide-react';
import { copyTableAsCSV, copyTableAsJSON, exportToCSV, exportToJSON } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface ResultsToolbarProps {
  rowCount: number;
  executionTime: number;
  viewMode: 'table' | 'json';
  onViewModeChange: (mode: 'table' | 'json') => void;
  rows?: unknown[];
  isMongoDB?: boolean;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
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
  filterValue,
  onFilterChange,
}: ResultsToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showExportMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const handleExportCSV = () => {
    exportToCSV(rows, `query-results-${Date.now()}.csv`);
    toast.success('Exported to CSV');
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    exportToJSON(rows, `query-results-${Date.now()}.json`);
    toast.success('Exported to JSON');
    setShowExportMenu(false);
  };

  const handleCopyAsCSV = async () => {
    const success = await copyTableAsCSV(rows);
    if (success) {
      toast.success('Copied table as CSV to clipboard');
    } else {
      toast.error('Failed to copy');
    }
    setShowExportMenu(false);
  };

  const handleCopyAsJSON = async () => {
    const success = await copyTableAsJSON(rows);
    if (success) {
      toast.success('Copied table as JSON to clipboard');
    } else {
      toast.error('Failed to copy');
    }
    setShowExportMenu(false);
  };

  return (
    <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {/* Left side: Title and stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {viewMode === 'json' ? (
            <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : isMongoDB ? (
            <Braces className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <Table2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isMongoDB ? 'Documents' : viewMode === 'json' ? 'JSON' : 'Table'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{rowCount} row{rowCount !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {executionTime.toFixed(0)}ms
          </span>
        </div>

        {onFilterChange && rows.length > 0 && !isMongoDB && viewMode === 'table' && (
          <div className="relative flex items-center">
            <Search className="w-3 h-3 absolute left-2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={filterValue ?? ''}
              onChange={(e) => onFilterChange(e.target.value)}
              placeholder="Filter rows..."
              className="pl-7 pr-2 py-1 text-xs w-36 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter results"
            />
          </div>
        )}
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
              aria-label="Switch to table view"
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
              aria-label="Switch to JSON view"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Export dropdown */}
        {rows.length > 0 && (
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Export results"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            {/* Dropdown menu */}
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
