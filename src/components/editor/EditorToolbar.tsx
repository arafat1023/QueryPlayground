import { Play, Trash2, Save, Database } from 'lucide-react';
import { Tooltip } from '@/components/common/Tooltip';
import type { EditorToolbarProps } from '@/types/editor';

/**
 * EditorToolbar component - Action buttons for the query editor
 *
 * Features:
 * - Run button with loading state
 * - Clear button to reset editor
 * - Save button (disabled placeholder for future)
 * - Mode indicator badge
 * - Keyboard shortcut hints
 */
export function EditorToolbar({
  onRun,
  onClear,
  onSave,
  isRunning = false,
  mode,
}: EditorToolbarProps) {
  const modeLabel = mode === 'postgresql' ? 'PostgreSQL' : 'MongoDB';
  const modeColor =
    mode === 'postgresql'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mode indicator */}
        <div className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${modeColor} flex items-center gap-1.5 shrink-0`}>
          <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{modeLabel}</span>
          <span className="sm:hidden">{mode === 'postgresql' ? 'PG' : 'Mongo'}</span>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="hidden md:block px-3 py-1.5 rounded-md text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
          Ctrl+Enter to run
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Clear button */}
        <Tooltip label="Clear editor">
          <button
            onClick={onClear}
            disabled={isRunning}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Clear editor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Save button */}
        {onSave && (
          <Tooltip label="Save query (Ctrl+S)">
            <button
              onClick={onSave}
              disabled={isRunning}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
              aria-label="Save query"
            >
              <Save className="w-4 h-4" />
            </button>
          </Tooltip>
        )}

        {/* Run button */}
        <Tooltip label="Run query (Ctrl+Enter)">
          <button
            onClick={onRun}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              mode === 'postgresql'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Run Query</span>
              </>
            )}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
