interface SkeletonProps {
  className?: string;
  /** Width as Tailwind class (e.g. "w-full", "w-24") */
  width?: string;
  /** Height as Tailwind class (e.g. "h-4", "h-8") */
  height?: string;
  /** Shape variant */
  variant?: 'text' | 'rect' | 'circle';
  /** Number of skeleton rows to render */
  count?: number;
}

/**
 * Reusable skeleton loading placeholder with pulse animation.
 * Uses the .skeleton-pulse class from index.css.
 */
export function Skeleton({
  className = '',
  width = 'w-full',
  height = 'h-4',
  variant = 'text',
  count = 1,
}: SkeletonProps) {
  const baseClass = 'bg-gray-200 dark:bg-gray-700 skeleton-pulse';

  const variantClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'rect'
        ? 'rounded-md'
        : 'rounded';

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`${baseClass} ${variantClass} ${width} ${height} ${className}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

/**
 * Pre-built skeleton for a schema table/collection list item.
 */
export function SchemaItemSkeleton() {
  return (
    <div className="px-3 py-2 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton variant="rect" width="w-4" height="h-4" />
        <Skeleton variant="text" width="w-28" height="h-4" />
        <Skeleton variant="text" width="w-8" height="h-3" className="ml-auto" />
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for the schema explorer loading state.
 */
export function SchemaListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-1 p-1">
      {Array.from({ length: count }, (_, i) => (
        <SchemaItemSkeleton key={i} />
      ))}
    </div>
  );
}

