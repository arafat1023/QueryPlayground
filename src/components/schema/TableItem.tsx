import { useState } from 'react';
import { ChevronDown, ChevronRight, Table as TableIcon, ArrowRightToLine } from 'lucide-react';
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

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleInsertQuery = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTableClick?.(table.name);
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      {/* Table header */}
      <div
        className="group flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
        onClick={handleToggleExpand}
      >
        {/* Expand/collapse icon */}
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-400 flex-shrink-0" />
        )}

        {/* Table icon */}
        <TableIcon className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />

        {/* Table name */}
        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {table.name}
        </span>

        {/* Insert query button */}
        {onTableClick && (
          <button
            onClick={handleInsertQuery}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400 transition-all min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            title={`Insert SELECT * FROM ${table.name}`}
            aria-label={`Insert query for ${table.name}`}
          >
            <ArrowRightToLine className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Row count badge */}
        <span className="text-[10px] text-gray-400 dark:text-gray-400 font-mono">
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
            <div className="px-2 py-2 text-xs text-gray-400 dark:text-gray-400 italic">
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
