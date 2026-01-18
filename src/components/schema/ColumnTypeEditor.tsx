import { ColumnTypeInference } from '@/services/csvParser';

interface ColumnTypeEditorProps {
  columns: ColumnTypeInference[];
  onChange: (columns: ColumnTypeInference[]) => void;
  disabled?: boolean;
}

/**
 * Column type editor for PostgreSQL imports
 * Allows users to edit inferred column types before importing
 */
export function ColumnTypeEditor({
  columns,
  onChange,
  disabled = false,
}: ColumnTypeEditorProps) {
  const handleTypeChange = (
    columnName: string,
    newType: ColumnTypeInference['type']
  ) => {
    const updated = columns.map((col) =>
      col.name === columnName ? { ...col, type: newType } : col
    );
    onChange(updated);
  };

  const columnTypes: ColumnTypeInference['type'][] = [
    'TEXT',
    'INTEGER',
    'NUMERIC',
    'BOOLEAN',
    'DATE',
  ];

  return (
    <div className="space-y-2">
      {columns.map((col) => (
        <div
          key={col.name}
          className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
        >
          <span className="flex-1 font-mono text-sm truncate" title={col.name}>
            {col.name}
          </span>
          <select
            value={col.type}
            onChange={(e) =>
              handleTypeChange(col.name, e.target.value as ColumnTypeInference['type'])
            }
            disabled={disabled}
            className="px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
          >
            {columnTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {col.nullable && (
            <span
              className="text-xs text-gray-500 dark:text-gray-400"
              title="Column can be NULL"
            >
              nullable
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
