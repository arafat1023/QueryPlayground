import { Modal } from './Modal';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutEntry {
  keys: string[];
  description: string;
}

const editorShortcuts: ShortcutEntry[] = [
  { keys: ['Ctrl', 'Enter'], description: 'Run query' },
  { keys: ['Ctrl', 'S'], description: 'Save query' },
  { keys: ['Ctrl', '/'], description: 'Toggle comment' },
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
  { keys: ['Ctrl', 'D'], description: 'Select next occurrence' },
  { keys: ['Ctrl', 'F'], description: 'Find & replace' },
];

const appShortcuts: ShortcutEntry[] = [
  { keys: ['Escape'], description: 'Close modal / panel' },
];

function ShortcutRow({ entry }: { entry: ShortcutEntry }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {entry.description}
      </span>
      <div className="flex items-center gap-1">
        {entry.keys.map((key, i) => (
          <span key={i}>
            {i > 0 && <span className="text-gray-400 dark:text-gray-400 mx-0.5">+</span>}
            <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
              {key}
            </kbd>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Keyboard shortcuts guide modal.
 * Lists all available shortcuts grouped by category.
 */
export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <div className="space-y-6">
        {/* Editor shortcuts */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Editor
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {editorShortcuts.map((entry, i) => (
              <ShortcutRow key={i} entry={entry} />
            ))}
          </div>
        </div>

        {/* Application shortcuts */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Application
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {appShortcuts.map((entry, i) => (
              <ShortcutRow key={i} entry={entry} />
            ))}
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-400 dark:text-gray-400 text-center">
          On macOS, use Cmd instead of Ctrl
        </p>
      </div>
    </Modal>
  );
}

