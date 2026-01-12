import { Play, Database, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-query' | 'no-results' | 'loading';
  databaseType?: 'postgresql' | 'mongodb';
}

/**
 * Empty state component for the results panel
 * Shows different states: no query run, no results, or loading
 */
export function EmptyState({ type, databaseType = 'postgresql' }: EmptyStateProps) {
  if (type === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin" />
            <Database className="w-5 h-5 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Running query...</p>
        </div>
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm px-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Sparkles className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Query executed successfully
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              No rows returned. Try a different query or check your data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default: no query run yet
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full">
          <Play className="w-10 h-10 text-blue-500 dark:text-blue-400" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Ready to query
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {databaseType === 'postgresql'
              ? 'Write a SQL query to explore your data.'
              : 'Write a MongoDB query to explore your data.'}
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded font-mono">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded font-mono">
              Enter
            </kbd>
            <span className="mx-1">or</span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('run-query'))}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Run Query
            </button>
          </div>
        </div>

        {/* Example queries */}
        <div className="w-full max-w-sm mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try these examples:</p>
          <div className="space-y-2">
            {databaseType === 'postgresql' ? (
              <>
                <button
                  onClick={() => {
                    const event = new CustomEvent('load-example', {
                      detail: 'SELECT * FROM users LIMIT 10;',
                    });
                    window.dispatchEvent(event);
                  }}
                  className="w-full text-left px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-mono text-gray-700 dark:text-gray-300 transition-colors"
                >
                  SELECT * FROM users LIMIT 10;
                </button>
                <button
                  onClick={() => {
                    const event = new CustomEvent('load-example', {
                      detail: 'SELECT name, COUNT(*) FROM orders GROUP BY name;',
                    });
                    window.dispatchEvent(event);
                  }}
                  className="w-full text-left px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-mono text-gray-700 dark:text-gray-300 transition-colors"
                >
                  SELECT name, COUNT(*) FROM orders GROUP BY name;
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    const event = new CustomEvent('load-example', {
                      detail: 'db.users.find({}).limit(10)',
                    });
                    window.dispatchEvent(event);
                  }}
                  className="w-full text-left px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-mono text-gray-700 dark:text-gray-300 transition-colors"
                >
                  db.users.find({}).limit(10)
                </button>
                <button
                  onClick={() => {
                    const event = new CustomEvent('load-example', {
                      detail: 'db.posts.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }])',
                    });
                    window.dispatchEvent(event);
                  }}
                  className="w-full text-left px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-mono text-gray-700 dark:text-gray-300 transition-colors"
                >
                  db.posts.aggregate([...])
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
