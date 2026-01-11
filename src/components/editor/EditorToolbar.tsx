import { Play, Trash2, Save, Database } from 'lucide-react';
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
  const modeColor = mode === 'postgresql' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

  return (
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-2">
        {/* Mode indicator */}
        <div className={`px-3 py-1.5 rounded-md text-sm font-medium ${modeColor} flex items-center gap-2`}>
          <Database className="w-4 h-4" />
          {modeLabel}
        </div>

        {/* Keyboard shortcut hint */}
        <div className="px-3 py-1.5 rounded-md text-sm text-gray-500 bg-gray-100">
          <span className="hidden sm:inline">Ctrl+Enter to run</span>
          <span className="sm:hidden">Tap Run to execute</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Clear button */}
        <button
          onClick={onClear}
          disabled={isRunning}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 text-gray-700 hover:bg-gray-300"
          title="Clear editor"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Save button (placeholder for future) */}
        {onSave && (
          <button
            onClick={onSave}
            disabled={isRunning}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center gap-2"
            title="Save query (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>
        )}

        {/* Run button */}
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
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Query
            </>
          )}
        </button>
      </div>
    </div>
  );
}
