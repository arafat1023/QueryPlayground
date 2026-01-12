import { AlertCircle, X } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
}

/**
 * Error display component for query errors
 * Shows error message in a styled alert box
 */
export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  // Try to extract useful information from the error
  const parseError = (errorMessage: string) => {
    // PostgreSQL error patterns
    const pgPatterns = [
      { regex: /relation "([^"]+)"/, message: 'Table' },
      { regex: /column "([^"]+)"/, message: 'Column' },
      { regex: /syntax error at or near/, message: 'Syntax error' },
    ];

    // MongoDB error patterns
    const mongoPatterns = [
      { regex: /\$([a-zA-Z]+)/, message: 'Operator' },
    ];

    // Check for known patterns
    for (const pattern of [...pgPatterns, ...mongoPatterns]) {
      const match = errorMessage.match(pattern.regex);
      if (match) {
        return {
          type: pattern.message,
          detail: match[1] || '',
          message: errorMessage,
        };
      }
    }

    return {
      type: 'Error',
      detail: '',
      message: errorMessage,
    };
  };

  const parsed = parseError(error);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="max-w-2xl w-full">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Query Error
                </h3>
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="p-0.5 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </button>
                )}
              </div>

              {parsed.detail && (
                <p className="text-xs text-red-600 dark:text-red-500 mb-2">
                  {parsed.type}: <span className="font-mono">{parsed.detail}</span>
                </p>
              )}

              <p className="text-xs text-red-700 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                {error}
              </p>

              {/* Common fixes suggestions */}
              {error.toLowerCase().includes('relation') && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/40 rounded">
                  <p className="text-xs text-red-700 dark:text-red-400">
                    <strong>Hint:</strong> Check if the table name is correct and exists in your
                    database.
                  </p>
                </div>
              )}

              {error.toLowerCase().includes('column') && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/40 rounded">
                  <p className="text-xs text-red-700 dark:text-red-400">
                    <strong>Hint:</strong> Check the Schema Explorer to see available columns.
                  </p>
                </div>
              )}

              {error.toLowerCase().includes('syntax') && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/40 rounded">
                  <p className="text-xs text-red-700 dark:text-red-400">
                    <strong>Hint:</strong> Check for missing commas, quotes, or keywords.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
            className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
