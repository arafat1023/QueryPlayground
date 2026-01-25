import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Database, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import {
  parseWorkspaceBackupFile,
  importWorkspace,
  type WorkspaceBackup,
} from '@/services/workspaceExport';
import { validateWorkspaceBackupFile } from '@/services/importValidator';
import { toast } from 'sonner';

type ImportStep = 'upload' | 'preview' | 'importing' | 'success';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportOptions {
  clearBeforeImport: boolean;
  skipPreferences: boolean;
}

export function WorkspaceImportModal({ isOpen, onClose }: ImportDataModalProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [backup, setBackup] = useState<WorkspaceBackup | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    clearBeforeImport: false,
    skipPreferences: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ tables: number; collections: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setBackup(null);
    setImportOptions({ clearBeforeImport: false, skipPreferences: false });
    setError(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // Handle file selection with validation
  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setError(null);
      setBackup(null);

      // Validate file
      const validation = validateWorkspaceBackupFile(selectedFile);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return;
      }

      if (validation.warnings.length > 0) {
        toast.warning(validation.warnings.join(', '));
      }

      try {
        const parsedBackup = await parseWorkspaceBackupFile(selectedFile);
        setBackup(parsedBackup);
        setFile(selectedFile);
        setStep('preview');
      } catch (err) {
        setError(`Failed to parse workspace backup: ${(err as Error).message}`);
      }
    },
    []
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Execute import
  const handleImport = async () => {
    if (!backup) return;

    setStep('importing');
    setError(null);

    try {
      const result = await importWorkspace(backup, importOptions);
      setImportResult(result);
      setStep('success');
      toast.success(`Imported ${result.tables} tables, ${result.collections} collections`);

      // Schedule close and refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('schema-refresh'));
        handleClose();
      }, 2000);
    } catch (err) {
      setError(`Import failed: ${(err as Error).message}`);
      setStep('preview');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setBackup(null);
    setError(null);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Workspace" size="lg">
      <div className="space-y-4">
        {/* Upload Step */}
        {step === 'upload' && (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                error
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag & drop a workspace backup file, or click to select
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                Backup files are JSON files named queryplayground-backup-*.json
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="workspace-file-upload"
              />
              <label htmlFor="workspace-file-upload">
                <span className="inline-block">
                  <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </Button>
                </span>
              </label>
              {error && (
                <div className="mt-4 flex items-center justify-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            {/* File info when file is selected */}
            {file && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && backup && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4" />
              {file?.name} • Version {backup.version} • Exported {formatDate(backup.exportedAt)}
            </div>

            {/* Backup Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    PostgreSQL Tables
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {backup.postgres.tables.length}
                </p>
                {backup.postgres.tables.length > 0 && (
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    {backup.postgres.tables.reduce((sum, t) => sum + t.rowCount, 0)} total rows
                  </div>
                )}
                {backup.postgres.tables.length <= 5 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {backup.postgres.tables.map((t) => (
                      <span key={t.name} className="text-xs bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                        {t.name} ({t.rowCount})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                    MongoDB Collections
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {backup.mongodb.collections.length}
                </p>
                {backup.mongodb.collections.length > 0 && (
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    {backup.mongodb.collections.reduce((sum, c) => sum + c.documentCount, 0)} total documents
                  </div>
                )}
                {backup.mongodb.collections.length <= 5 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {backup.mongodb.collections.map((c) => (
                      <span key={c.name} className="text-xs bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded">
                        {c.name} ({c.documentCount})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Import Options */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Import Options
              </h3>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.clearBeforeImport}
                  onChange={(e) =>
                    setImportOptions({ ...importOptions, clearBeforeImport: e.target.checked })
                  }
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Clear existing data before import
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Deletes all existing tables and collections before importing. This cannot be undone.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.skipPreferences}
                  onChange={(e) =>
                    setImportOptions({ ...importOptions, skipPreferences: e.target.checked })
                  }
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Skip preferences import
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Keeps your current theme and editor settings instead of using the backup's preferences.
                  </div>
                </div>
              </label>
            </div>

            {/* Warning for clear option */}
            {importOptions.clearBeforeImport && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Warning: Data will be deleted
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    All existing tables, collections, and their data will be permanently deleted. This action cannot be undone.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleRemoveFile} className="flex-1">
                Back
              </Button>
              <Button onClick={handleImport} className="flex-1">
                Import Workspace
              </Button>
            </div>
          </div>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <div className="text-center py-8">
            <Database className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Importing workspace...</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              This may take a moment for large backups
            </p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && importResult && (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Workspace Imported Successfully!
            </h3>
            <div className="flex justify-center gap-8 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {importResult.tables}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tables</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {importResult.collections}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Collections</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Closing automatically...
            </p>
          </div>
        )}

        {/* Error state (non-blocking) */}
        {error && step !== 'upload' && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
