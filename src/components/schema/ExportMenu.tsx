import { useState, useRef, useEffect } from 'react';
import { Download, Database, HardDrive, FileDown } from 'lucide-react';
import { exportWorkspace, downloadWorkspaceBackup } from '@/services/workspaceExport';
import { useUIStore } from '@/store/uiStore';
import { toast } from 'sonner';
import { Button } from '@/components/common/Button';
import { executePostgresQuery } from '@/db/postgres/client';
import { getCollection } from '@/db/mongodb/queryExecutor';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';

export function ExportMenu() {
  const { activeDatabase, activeTable, activeCollection } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExportTableCSV = async () => {
    if (!activeTable) return;
    setIsExporting(true);
    try {
      const result = await executePostgresQuery(`SELECT * FROM "${activeTable}"`);
      if (result.success && result.rows) {
        exportToCSV(result.rows, `${activeTable}.csv`);
        toast.success(`Exported ${activeTable} as CSV`);
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to export table');
      }
    } catch (error) {
      toast.error(`Export failed: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTableJSON = async () => {
    if (!activeTable) return;
    setIsExporting(true);
    try {
      const result = await executePostgresQuery(`SELECT * FROM "${activeTable}"`);
      if (result.success && result.rows) {
        exportToJSON(result.rows, `${activeTable}.json`);
        toast.success(`Exported ${activeTable} as JSON`);
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to export table');
      }
    } catch (error) {
      toast.error(`Export failed: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCollectionJSON = async () => {
    if (!activeCollection) return;
    setIsExporting(true);
    try {
      const docs = getCollection(activeCollection);
      exportToJSON(docs, `${activeCollection}.json`);
      toast.success(`Exported ${activeCollection} as JSON`);
      setIsOpen(false);
    } catch (error) {
      toast.error(`Export failed: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWorkspace = async () => {
    setIsExporting(true);
    try {
      const backup = await exportWorkspace();
      downloadWorkspaceBackup(backup);
      toast.success('Workspace exported successfully');
      setIsOpen(false);
    } catch (error) {
      toast.error(`Export failed: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        leftIcon={<Download className="w-4 h-4" />}
      >
        Export
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg py-2 z-50 min-w-[240px]">
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 flex items-center gap-2">
              <Database className="w-3 h-3" />
              {activeDatabase === 'postgresql' ? 'PostgreSQL Active' : 'MongoDB Active'}
            </div>

            {/* Table/Collection Export */}
            {activeDatabase === 'postgresql' && activeTable && (
              <>
                <button
                  onClick={handleExportTableCSV}
                  disabled={isExporting}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      Export "{activeTable}" as CSV
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {activeTable} table data
                    </div>
                  </div>
                </button>
                <button
                  onClick={handleExportTableJSON}
                  disabled={isExporting}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      Export "{activeTable}" as JSON
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {activeTable} table data
                    </div>
                  </div>
                </button>
                <div className="border-t dark:border-gray-700 my-1"></div>
              </>
            )}

            {activeDatabase === 'mongodb' && activeCollection && (
              <>
                <button
                  onClick={handleExportCollectionJSON}
                  disabled={isExporting}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      Export "{activeCollection}"
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {activeCollection} collection data
                    </div>
                  </div>
                </button>
                <div className="border-t dark:border-gray-700 my-1"></div>
              </>
            )}

            <button
              onClick={handleExportWorkspace}
              disabled={isExporting}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <HardDrive className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="flex-1">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  Export Entire Workspace
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  All tables, collections & settings
                </div>
              </div>
            </button>

            {/* Placeholder for future export options */}
            {/* <div className="border-t dark:border-gray-700 my-1"></div>
            <button
              disabled
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="flex-1">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  Export Current Table
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {activeDatabase === 'postgresql' ? 'As SQL or CSV' : 'As JSON'}
                </div>
              </div>
            </button> */}
          </div>
        </>
      )}
    </div>
  );
}
