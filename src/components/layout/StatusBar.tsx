import { useUIStore } from '@/store/uiStore';

interface StatusBarProps {
  isReady: boolean;
  isRunning: boolean;
}

/**
 * Persistent bottom status bar showing database connection status and query state.
 */
export function StatusBar({ isReady, isRunning }: StatusBarProps) {
  const activeDatabase = useUIStore((s) => s.activeDatabase);
  const dbLabel = activeDatabase === 'postgresql' ? 'PostgreSQL' : 'MongoDB';

  return (
    <div className="h-6 flex-shrink-0 flex items-center justify-between px-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 select-none">
      <div className="flex items-center gap-2">
        {/* Connection status */}
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isReady
                ? 'bg-green-500'
                : 'bg-yellow-500 animate-pulse'
            }`}
          />
          {dbLabel}
        </span>
        {!isReady && (
          <span className="text-yellow-600 dark:text-yellow-500">Connecting...</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isRunning && (
          <span className="text-blue-600 dark:text-blue-400 font-medium">Running query...</span>
        )}
      </div>
    </div>
  );
}
