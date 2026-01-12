import { Key } from 'lucide-react';
import type { PostgresColumnSchema } from '@/db/postgres/types';
import type { MongoFieldSchema } from '@/db/mongodb/types';

type ColumnData = PostgresColumnSchema | MongoFieldSchema;

interface ColumnItemProps {
  column: ColumnData;
  dbType: 'postgresql' | 'mongodb';
  onClick?: (columnName: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  // PostgreSQL types
  'integer': 'text-blue-600 dark:text-blue-400',
  'bigint': 'text-blue-600 dark:text-blue-400',
  'smallint': 'text-blue-600 dark:text-blue-400',
  'numeric': 'text-green-600 dark:text-green-400',
  'decimal': 'text-green-600 dark:text-green-400',
  'real': 'text-green-600 dark:text-green-400',
  'double precision': 'text-green-600 dark:text-green-400',
  'varchar': 'text-orange-600 dark:text-orange-400',
  'text': 'text-orange-600 dark:text-orange-400',
  'char': 'text-orange-600 dark:text-orange-400',
  'date': 'text-pink-600 dark:text-pink-400',
  'timestamp': 'text-pink-600 dark:text-pink-400',
  'timestamptz': 'text-pink-600 dark:text-pink-400',
  'json': 'text-yellow-600 dark:text-yellow-400',
  'jsonb': 'text-yellow-600 dark:text-yellow-400',
  'uuid': 'text-cyan-600 dark:text-cyan-400',
  'array': 'text-indigo-600 dark:text-indigo-400',
  // MongoDB types (boolean already covered above)
  'string': 'text-orange-600 dark:text-orange-400',
  'number': 'text-blue-600 dark:text-blue-400',
  'object': 'text-yellow-600 dark:text-yellow-400',
  'null': 'text-gray-500 dark:text-gray-400',
};

const getTypeColor = (type: string): string => {
  const normalizedType = type.toLowerCase();
  for (const [key, color] of Object.entries(TYPE_COLORS)) {
    if (normalizedType.includes(key)) {
      return color;
    }
  }
  return 'text-gray-600 dark:text-gray-400';
};

const formatType = (type: string): string => {
  if (type.includes('|')) {
    // MongoDB union type
    return type;
  }
  return type.toUpperCase();
};

/**
 * Component for displaying a single column or field
 */
export function ColumnItem({ column, dbType, onClick }: ColumnItemProps) {
  const isPostgres = dbType === 'postgresql';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(column.name);
  };

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 text-xs rounded-sm cursor-pointer transition-colors ${
        onClick
          ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
          : 'cursor-default'
      }`}
      onClick={handleClick}
      title={column.name}
    >
      {/* Key icon for all columns */}
      <Key className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />

      {/* Column name */}
      <span className="flex-1 truncate font-mono text-gray-700 dark:text-gray-300">
        {column.name}
      </span>

      {/* Type badge */}
      <span className={`flex-shrink-0 font-mono text-[10px] ${getTypeColor(column.type)}`}>
        {formatType(column.type)}
      </span>

      {/* Primary key indicator for PostgreSQL */}
      {isPostgres && (column as PostgresColumnSchema).isPrimaryKey && (
        <span title="Primary Key">
          <Key className="w-3 h-3 text-yellow-500 dark:text-yellow-400" />
        </span>
      )}

      {/* Foreign key indicator for PostgreSQL */}
      {isPostgres && (column as PostgresColumnSchema).isForeignKey && (
        <span className="text-[9px] text-blue-500 dark:text-blue-400" title="Foreign Key">
          FK
        </span>
      )}

      {/* Nullable indicator for PostgreSQL */}
      {isPostgres && !(column as PostgresColumnSchema).nullable && (
        <span className="text-[9px] text-red-500 dark:text-red-400" title="NOT NULL">
          *
        </span>
      )}
    </div>
  );
}

/**
 * Skeleton loader for column item
 */
export function ColumnItemSkeleton() {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}
