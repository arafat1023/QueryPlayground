import { useState } from 'react';
import { ChevronDown, ChevronRight, Table as TableIcon } from 'lucide-react';
import type { PostgresTableSchema } from '@/db/postgres/types';
import { ColumnItem, ColumnItemSkeleton } from './ColumnItem';

interface TableItemProps {
  table: PostgresTableSchema;
  onTableClick?: (tableName: string) => void;
  onColumnClick?: (columnName: string) => void;
  defaultExpanded?: boolean;
}

/**
 * Component for displaying a single PostgreSQL table with expandable columns
 */
export function TableItem({
  table,
  onTableClick,
  onColumnClick,
  defaultExpanded = true,
}: TableItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleTableClick = () => {
    setIsExpanded(!isExpanded);
    onTableClick?.(table.name);
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      {/* Table header */}
      <div
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors ${
          onTableClick ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''
        }`}
        onClick={handleTableClick}
      >
        {/* Expand/collapse icon */}
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        )}

        {/* Table icon */}
        <TableIcon className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />

        {/* Table name */}
        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {table.name}
        </span>

        {/* Row count badge */}
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
          {table.rowCount} rows
        </span>
      </div>

      {/* Columns list */}
      {isExpanded && (
        <div className="pl-6 pr-2 pb-1 space-y-0.5">
          {table.columns && table.columns.length > 0 ? (
            table.columns.map((column) => (
              <ColumnItem
                key={column.name}
                column={column}
                dbType="postgresql"
                onClick={onColumnClick}
              />
            ))
          ) : (
            <div className="px-2 py-2 text-xs text-gray-400 dark:text-gray-500 italic">
              No columns
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loader for table item
 */
export function TableItemSkeleton() {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded skeleton-pulse" />
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton-pulse" />
        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton-pulse" />
        <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded skeleton-pulse" />
      </div>
      <div className="pl-6 pr-2 pb-1 space-y-0.5">
        <ColumnItemSkeleton />
        <ColumnItemSkeleton />
      </div>
    </div>
  );
}
