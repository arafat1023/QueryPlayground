import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileText, Database, AlertCircle, X, Download, Plus, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { ColumnTypeEditor } from '@/components/schema/ColumnTypeEditor';
import {
  parseCSVFile,
  inferColumnTypes,
  generateCreateTableSQL,
  convertCSVToMongoDocuments,
  type ColumnTypeInference,
} from '@/services/csvParser';
import {
  parseJSONFile,
  inferPostgresTypesFromJSON,
} from '@/services/jsonParser';
import { executePostgresQuery } from '@/db/postgres/client';
import { getCollection, getCollectionNames, insertMany } from '@/db/mongodb/queryExecutor';
import { useUIStore } from '@/store/uiStore';
import { toast } from 'sonner';
import { validateImportFile } from '@/services/importValidator';

// PostgreSQL identifier max length
const MAX_IDENTIFIER_LENGTH = 63;

// Valid PostgreSQL identifier pattern: letter or underscore followed by alphanumeric/underscore
const VALID_IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// Check for PostgreSQL reserved keywords
const RESERVED_WORDS = new Set([
  'select', 'insert', 'update', 'delete', 'drop', 'create', 'alter', 'truncate',
  'table', 'index', 'view', 'schema', 'database', 'user', 'role', 'grant',
  'revoke', 'commit', 'rollback', 'begin', 'transaction', 'where', 'from',
  'join', 'inner', 'outer', 'left', 'right', 'on', 'and', 'or', 'not', 'in',
  'like', 'between', 'null', 'true', 'false', 'is', 'order', 'group', 'by',
  'having', 'limit', 'offset', 'distinct', 'union', 'intersect', 'except',
  'case', 'when', 'then', 'else', 'end', 'exists', 'asc', 'desc', 'with',
  'recursive', 'check', 'default', 'primary', 'foreign', 'key', 'references',
  'unique', 'constraint', 'cascade', 'restrict', 'no', 'action', 'set',
  'current', 'time', 'timestamp', 'date', 'interval', 'local', 'timezone',
]);

/**
 * Check if a table name is a reserved SQL keyword
 */
function isReservedKeyword(name: string): boolean {
  return RESERVED_WORDS.has(name.toLowerCase());
}

/**
 * Check if a table name is valid (returns boolean, doesn't throw)
 */
function isValidTableName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  if (name.length > MAX_IDENTIFIER_LENGTH) return false;
  if (!VALID_IDENTIFIER_PATTERN.test(name)) return false;
  if (isReservedKeyword(name)) return false;
  return true;
}

/**
 * Sanitize a filename into a valid PostgreSQL table name
 * - Converts to lowercase
 * - Removes file extension
 * - Replaces invalid characters with underscores
 * - Ensures it starts with a letter or underscore
 * - Truncates to max identifier length
 */
function sanitizeTableName(filename: string): string {
  // Remove extension and convert to lowercase
  let name = filename.replace(/\.[^/.]+$/, '').toLowerCase();

  // Replace invalid characters with underscores
  name = name.replace(/[^a-z0-9_]/g, '_');

  // Ensure it starts with a letter or underscore (prepend underscore if needed)
  if (/^[0-9]/.test(name)) {
    name = '_' + name;
  }

  // Truncate to max length
  if (name.length > MAX_IDENTIFIER_LENGTH) {
    name = name.substring(0, MAX_IDENTIFIER_LENGTH);
  }

  // Handle edge case: if name is empty or just underscores, use a default
  if (!name || /^_+$/.test(name)) {
    name = 'imported_table';
  }

  return name;
}

/**
 * Validates a PostgreSQL table/collection name to prevent SQL injection.
 * Only allows alphanumeric characters and underscores, starting with letter or underscore.
 * Also enforces PostgreSQL's maximum identifier length.
 * @throws Error if the table name is invalid
 */
function validateTableName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new Error('Table name cannot be empty');
  }

  if (name.length > MAX_IDENTIFIER_LENGTH) {
    throw new Error(`Table name cannot exceed ${MAX_IDENTIFIER_LENGTH} characters`);
  }

  if (!VALID_IDENTIFIER_PATTERN.test(name)) {
    throw new Error(
      'Table name can only contain letters, numbers, and underscores, and must start with a letter or underscore'
    );
  }

  if (isReservedKeyword(name)) {
    throw new Error(`"${name}" is a reserved SQL keyword and cannot be used as a table name`);
  }
}

type ImportStep = 'upload' | 'preview' | 'importing';
type ImportFormat = 'csv' | 'json';
type ImportMode = 'create' | 'append' | 'replace';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportDataModal({ isOpen, onClose }: ImportDataModalProps) {
  const { activeDatabase } = useUIStore();
  const [step, setStep] = useState<ImportStep>('upload');
  const [format, setFormat] = useState<ImportFormat | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('create');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [previewData, setPreviewData] = useState<Record<string, unknown>[] | null>(null);
  const [columnInfo, setColumnInfo] = useState<ColumnTypeInference[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingTables, setExistingTables] = useState<Array<{ name: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing tables/collections when modal opens or import mode changes
  const fetchExistingTargets = useCallback(async () => {
    try {
      if (activeDatabase === 'postgresql') {
        const result = await executePostgresQuery(`
          SELECT table_name as name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `);
        setExistingTables((result.rows ?? []) as Array<{ name: string }>);
      } else {
        const collections = getCollectionNames();
        setExistingTables(collections.map(name => ({ name })));
      }
    } catch (err) {
      console.error('Failed to fetch existing targets:', err);
    }
  }, [activeDatabase]);

  useEffect(() => {
    if (isOpen && (importMode === 'append' || importMode === 'replace')) {
      fetchExistingTargets();
    }
  }, [isOpen, importMode, fetchExistingTargets]);

  // Get existing schema for validation (PostgreSQL only)
  const getExistingSchema = async (targetTable: string) => {
    // Validate table name to prevent SQL injection
    validateTableName(targetTable);

    const result = await executePostgresQuery(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = $1
       ORDER BY ordinal_position;`,
      [targetTable]
    );
    return result.rows ?? [];
  };

  // Validate column compatibility for append mode
  const validateColumnCompatibility = (
    importColumns: ColumnTypeInference[],
    existingSchema: Array<{ column_name: string; data_type: string }>
  ): string[] => {
    const mismatches: string[] = [];

    for (const importCol of importColumns) {
      const existing = existingSchema.find(sc => sc.column_name === importCol.name);

      if (existing) {
        // Check for type compatibility (simplified check)
        const importType = importCol.type.toUpperCase();
        const existingType = existing.data_type.toUpperCase();

        // TEXT is compatible with most types
        if (importType === 'TEXT' || existingType.includes('TEXT') || existingType.includes('CHAR')) {
          continue;
        }

        // INTEGER compatibility
        if (importType === 'INTEGER' && (existingType.includes('INTEGER') || existingType.includes('BIGINT') || existingType.includes('SMALLINT'))) {
          continue;
        }

        // NUMERIC compatibility
        if (importType === 'NUMERIC' && (existingType.includes('NUMERIC') || existingType.includes('DECIMAL') || existingType.includes('REAL') || existingType.includes('DOUBLE'))) {
          continue;
        }

        // BOOLEAN compatibility
        if (importType === 'BOOLEAN' && existingType.includes('BOOLEAN')) {
          continue;
        }

        // DATE compatibility
        if (importType === 'DATE' && (existingType.includes('DATE') || existingType.includes('TIMESTAMP'))) {
          continue;
        }

        mismatches.push(`${importCol.name}: import type ${importType} vs existing type ${existingType}`);
      }
    }

    return mismatches;
  };

  // Handle file selection with validation
  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setError(null);

      // Validate file
      const validation = validateImportFile(selectedFile);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return;
      }

      if (validation.warnings.length > 0) {
        toast.warning(validation.warnings.join(', '));
      }

      const ext = selectedFile.name.split('.').pop()?.toLowerCase();

      if (ext === 'csv') {
        setFormat('csv');
        try {
          const result = await parseCSVFile(selectedFile);
          if (result.errors.length > 0) {
            setError(`CSV has ${result.errors.length} error(s). First: ${result.errors[0].message}`);
          }
          setPreviewData(result.data);
          setColumnInfo(inferColumnTypes(result.data));
          const suggestedName = sanitizeTableName(selectedFile.name);
          setTableName(suggestedName);
          setSelectedTarget(suggestedName);
          setStep('preview');
        } catch (err) {
          setError(`Failed to parse CSV: ${(err as Error).message}`);
        }
      } else if (ext === 'json') {
        setFormat('json');
        try {
          const result = await parseJSONFile(selectedFile);
          if (result.errors.length > 0) {
            setError(`JSON has ${result.errors.length} error(s)`);
          }
          setPreviewData(result.documents);
          // Convert to ColumnTypeInference format
          const inferredTypes = inferPostgresTypesFromJSON(result.documents);
          const columnInference: ColumnTypeInference[] = inferredTypes.map(t => ({
            name: t.name,
            type: t.type as ColumnTypeInference['type'],
            nullable: true,
            sampleValues: [],
          }));
          setColumnInfo(columnInference);
          const suggestedName = sanitizeTableName(selectedFile.name);
          setTableName(suggestedName);
          setSelectedTarget(suggestedName);
          setStep('preview');
        } catch (err) {
          setError(`Failed to parse JSON: ${(err as Error).message}`);
        }
      } else {
        setError('Unsupported file type. Please upload CSV or JSON files.');
      }

      setFile(selectedFile);
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

  // Execute import with transaction safety
  const handleImport = async () => {
    if (!previewData || !columnInfo) return;

    if (importMode !== 'create' && !selectedTarget) {
      setError('Please select a target table/collection');
      return;
    }

    const targetName = importMode === 'create' ? tableName : selectedTarget;
    if (!targetName) {
      setError('Please enter a name');
      return;
    }

    // Confirmation for replace mode
    if (importMode === 'replace') {
      const confirmed = confirm(
        `This will DELETE all existing data in "${targetName}" and replace it with the imported data. Continue?`
      );
      if (!confirmed) return;
    }

    setStep('importing');

    try {
      if (activeDatabase === 'postgresql') {
        await importToPostgreSQL(targetName);
      } else {
        await importToMongoDB(targetName);
      }

      toast.success(`Imported ${previewData.length} rows to ${targetName}`);
      handleClose();
      // Refresh schema
      window.dispatchEvent(new CustomEvent('schema-refresh'));
    } catch (err) {
      setError(`Import failed: ${(err as Error).message}`);
      setStep('preview');
    }
  };

  // Import to PostgreSQL with transaction safety
  const importToPostgreSQL = async (targetName: string) => {
    if (!columnInfo || !previewData) {
      throw new Error('Missing column info or preview data');
    }

    // Validate table name to prevent SQL injection
    validateTableName(targetName);

    // Start transaction
    await executePostgresQuery('BEGIN;');

    try {
      if (importMode === 'replace') {
        // Drop and recreate table
        await executePostgresQuery(`DROP TABLE IF EXISTS "${targetName}" CASCADE;`);
        const createSQL = generateCreateTableSQL(targetName, columnInfo);
        await executePostgresQuery(createSQL);
      } else if (importMode === 'create') {
        // Create new table
        const createSQL = generateCreateTableSQL(targetName, columnInfo);
        await executePostgresQuery(createSQL);
      } else if (importMode === 'append') {
        // Validate column compatibility
        const existingSchema = await getExistingSchema(targetName);
        const mismatches = validateColumnCompatibility(columnInfo, existingSchema as Array<{ column_name: string; data_type: string }>);
        if (mismatches.length > 0) {
          throw new Error(`Column type mismatches: ${mismatches.join(', ')}`);
        }
      }

      // Insert data in batches
      const batchSize = 100;
      const columns = columnInfo.map((c) => c.name);

      for (let i = 0; i < previewData.length; i += batchSize) {
        const batch = previewData.slice(i, i + batchSize);
        for (const row of batch) {
          const values = columns.map((col) => {
            const val = row[col];
            if (val === null || val === '') return 'NULL';
            if (typeof val === 'string') return `'${String(val).replace(/'/g, "''")}'`;
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            return String(val);
          });

          await executePostgresQuery(`
            INSERT INTO "${targetName}" ("${columns.join('", "')}")
            VALUES (${values.join(', ')});
          `);
        }
      }

      await executePostgresQuery('COMMIT;');
    } catch (err) {
      await executePostgresQuery('ROLLBACK;');
      throw err;
    }
  };

  // Import to MongoDB with rollback safety
  const importToMongoDB = async (targetName: string) => {
    if (!previewData) {
      throw new Error('Missing preview data');
    }

    // Save original data for rollback
    const originalDocs = importMode === 'replace'
      ? [...getCollection(targetName)]
      : [];

    try {
      if (importMode === 'replace') {
        // Clear collection
        const collection = getCollection(targetName);
        collection.length = 0;
      }

      // Import data
      const docs = format === 'csv'
        ? convertCSVToMongoDocuments(previewData)
        : previewData;

      insertMany(targetName, docs as any[]);

    } catch (err) {
      // Rollback for replace mode
      if (importMode === 'replace') {
        const collection = getCollection(targetName);
        collection.length = 0;
        collection.push(...originalDocs);
      }
      throw err;
    }
  };

  // Reset modal state
  const handleClose = () => {
    setStep('upload');
    setFormat(null);
    setFile(null);
    setTableName('');
    setImportMode('create');
    setSelectedTarget('');
    setPreviewData(null);
    setColumnInfo(null);
    setError(null);
    onClose();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFormat(null);
    setPreviewData(null);
    setColumnInfo(null);
    setTableName('');
    setSelectedTarget('');
    setImportMode('create');
    setError(null);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTargetLabel = () => {
    return activeDatabase === 'postgresql' ? 'Table' : 'Collection';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Data" size="lg">
      <div className="space-y-4">
        {/* Upload Step */}
        {step === 'upload' && (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                error
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag & drop a CSV or JSON file here, or click to select
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
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

            {/* Sample Data Section */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Get Sample Data
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                Download sample files to test the import functionality:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/test-data/employees.csv"
                  download
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  <span>employees.csv</span>
                </a>
                <a
                  href="/test-data/books.csv"
                  download
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  <span>books.csv</span>
                </a>
                <a
                  href="/test-data/products.json"
                  download
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  <span>products.json</span>
                </a>
                <a
                  href="/test-data/orders.json"
                  download
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  <span>orders.json</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && previewData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4" />
              {file?.name} • {previewData.length} rows • {format?.toUpperCase()}
            </div>

            {/* Import Mode Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Import Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors ${
                    importMode === 'create'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setImportMode('create')}
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors ${
                    importMode === 'append'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setImportMode('append')}
                >
                  <Database className="w-4 h-4" />
                  Append
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors ${
                    importMode === 'replace'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setImportMode('replace')}
                >
                  <RotateCcw className="w-4 h-4" />
                  Replace
                </button>
              </div>
            </div>

            {/* Target Selection for Append/Replace */}
            {importMode !== 'create' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Target {getTargetLabel()}
                </label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select target...</option>
                  {existingTables.map((table) => (
                    <option key={table.name} value={table.name}>
                      {table.name}
                    </option>
                  ))}
                </select>
                {existingTables.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No existing {getTargetLabel().toLowerCase()}s found
                  </p>
                )}
              </div>
            )}

            {/* Table name input for create mode */}
            {importMode === 'create' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  {getTargetLabel()} Name
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    tableName && !isValidTableName(tableName)
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}
                  placeholder={activeDatabase === 'postgresql' ? 'my_table' : 'myCollection'}
                />
                {tableName && !isValidTableName(tableName) && (
                  <p className="text-xs text-red-500 mt-1">
                    {tableName.length > MAX_IDENTIFIER_LENGTH
                      ? `Name too long (max ${MAX_IDENTIFIER_LENGTH} characters)`
                      : tableName.trim().length === 0
                      ? 'Name cannot be empty'
                      : isReservedKeyword(tableName)
                      ? `"${tableName}" is a reserved SQL keyword`
                      : 'Must start with a letter or underscore, followed by letters, numbers, or underscores'}
                  </p>
                )}
              </div>
            )}

            {/* Preview table */}
            <div className="max-h-64 overflow-auto border rounded-lg dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    {Object.keys(previewData[0] || {}).map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t dark:border-gray-700">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {val === null || val === '' ? (
                            <span className="text-gray-400 italic">NULL</span>
                          ) : typeof val === 'object' ? (
                            <span className="text-xs">{JSON.stringify(val)}</span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewData.length > 10 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing first 10 rows of {previewData.length} total rows
              </p>
            )}

            {/* Column type editor for PostgreSQL */}
            {activeDatabase === 'postgresql' && columnInfo && importMode !== 'append' && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Column Types:
                </p>
                <ColumnTypeEditor
                  columns={columnInfo}
                  onChange={setColumnInfo}
                />
              </div>
            )}

            {/* Column info display for PostgreSQL append mode */}
            {activeDatabase === 'postgresql' && importMode === 'append' && columnInfo && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Import Columns:
                </p>
                <div className="flex flex-wrap gap-2">
                  {columnInfo.map((col) => (
                    <span
                      key={col.name}
                      className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs"
                    >
                      {col.name}: {col.type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleRemoveFile} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleImport}
                className="flex-1"
                disabled={
                  (importMode === 'create' && !tableName) ||
                  (importMode !== 'create' && !selectedTarget) ||
                  previewData.length === 0
                }
              >
                Import Data
              </Button>
            </div>
          </div>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <div className="text-center py-8">
            <Database className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Importing data...</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This may take a moment for large files
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
