import type { DatabaseMode } from '@/types/editor';

/**
 * Checks if a query is safe for practice mode (read-only operations only).
 * Used to validate both user queries and AI-generated expected queries.
 */
export const isSafeQuery = (query: string, database: DatabaseMode): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;

  if (database === 'postgresql') {
    return normalized.startsWith('select') || normalized.startsWith('with');
  }

  return /db\.[a-z0-9_]+\.(find|findone|aggregate)\s*\(/i.test(query);
};
