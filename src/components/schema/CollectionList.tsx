import type { MongoCollectionSchema } from '@/db/mongodb/types';
import { CollectionItem, CollectionItemSkeleton } from './CollectionItem';

interface CollectionListProps {
  collections: MongoCollectionSchema[];
  isLoading?: boolean;
  onCollectionClick?: (collectionName: string) => void;
  onFieldClick?: (fieldName: string) => void;
}

/**
 * Component for displaying a list of MongoDB collections
 */
export function CollectionList({
  collections,
  isLoading,
  onCollectionClick,
  onFieldClick,
}: CollectionListProps) {
  if (isLoading) {
    return (
      <div className="p-2 space-y-1">
        <CollectionItemSkeleton />
        <CollectionItemSkeleton />
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          No collections yet
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
          Run insertOne() or insertMany() to create collections
        </p>
      </div>
    );
  }

  return (
    <div className="py-1">
      {collections.map((collection) => (
        <CollectionItem
          key={collection.name}
          collection={collection}
          onCollectionClick={onCollectionClick}
          onFieldClick={onFieldClick}
        />
      ))}
    </div>
  );
}
