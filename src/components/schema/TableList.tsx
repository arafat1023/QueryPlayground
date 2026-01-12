import type { PostgresTableSchema } from '@/db/postgres/types';
import { TableItem, TableItemSkeleton } from './TableItem';

interface TableListProps {
  tables: PostgresTableSchema[];
  isLoading?: boolean;
  onTableClick?: (tableName: string) => void;
  onColumnClick?: (columnName: string) => void;
}

/**
 * Component for displaying a list of PostgreSQL tables
 */
export function TableList({ tables, isLoading, onTableClick, onColumnClick }: TableListProps) {
  if (isLoading) {
    return (
      <div className="p-2 space-y-1">
        <TableItemSkeleton />
        <TableItemSkeleton />
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          No tables yet
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
          Create a table using SQL or import data from a CSV/JSON file
        </p>
      </div>
    );
  }

  return (
    <div className="py-1">
      {tables.map((table) => (
        <TableItem
          key={table.name}
          table={table}
          onTableClick={onTableClick}
          onColumnClick={onColumnClick}
        />
      ))}
    </div>
  );
}
