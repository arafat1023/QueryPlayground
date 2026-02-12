import { useState } from 'react';
import { ChevronDown, ChevronRight, Braces, ArrowRightToLine } from 'lucide-react';
import type { MongoCollectionSchema } from '@/db/mongodb/types';
import { ColumnItem, ColumnItemSkeleton } from './ColumnItem';

interface CollectionItemProps {
  collection: MongoCollectionSchema;
  onCollectionClick?: (collectionName: string) => void;
  onFieldClick?: (fieldName: string) => void;
  defaultExpanded?: boolean;
}

/**
 * Component for displaying a single MongoDB collection with expandable fields
 */
export function CollectionItem({
  collection,
  onCollectionClick,
  onFieldClick,
  defaultExpanded = true,
}: CollectionItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleInsertQuery = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCollectionClick?.(collection.name);
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      {/* Collection header */}
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

        {/* Collection icon */}
        <Braces className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />

        {/* Collection name */}
        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {collection.name}
        </span>

        {/* Insert query button */}
        {onCollectionClick && (
          <button
            onClick={handleInsertQuery}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-500 dark:text-purple-400 transition-all min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            title={`Insert db.${collection.name}.find({})`}
            aria-label={`Insert query for ${collection.name}`}
          >
            <ArrowRightToLine className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Document count badge */}
        <span className="text-[10px] text-gray-400 dark:text-gray-400 font-mono">
          {collection.count} docs
        </span>
      </div>

      {/* Fields list */}
      {isExpanded && (
        <div className="pl-6 pr-2 pb-1 space-y-0.5">
          {collection.fields && collection.fields.length > 0 ? (
            collection.fields.map((field) => (
              <ColumnItem key={field.name} column={field} dbType="mongodb" onClick={onFieldClick} />
            ))
          ) : (
            <div className="px-2 py-2 text-xs text-gray-400 dark:text-gray-400 italic">
              No fields (empty collection)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loader for collection item
 */
export function CollectionItemSkeleton() {
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
