import { Database } from 'lucide-react';
import type { DatabaseMode } from '@/types/editor';

interface DatabaseSwitchProps {
  activeDatabase: DatabaseMode;
  onSwitch: (db: DatabaseMode) => void;
  className?: string;
}

export function DatabaseSwitch({ activeDatabase, onSwitch, className = '' }: DatabaseSwitchProps) {
  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
      <button
        onClick={() => onSwitch('postgresql')}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
          transition-all duration-200
          ${
            activeDatabase === 'postgresql'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
        `}
        aria-pressed={activeDatabase === 'postgresql'}
      >
        <Database className="w-4 h-4" />
        <span className="hidden sm:inline">PostgreSQL</span>
        <span className="sm:hidden">PG</span>
      </button>
      <button
        onClick={() => onSwitch('mongodb')}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
          transition-all duration-200
          ${
            activeDatabase === 'mongodb'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
        `}
        aria-pressed={activeDatabase === 'mongodb'}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.546 24c-.406-.012-.77-.124-1.078-.336-.308-.212-.548-.5-.72-.864-.172-.364-.258-.79-.258-1.276v-1.668c-.968-.208-1.84-.57-2.616-1.086-.776-.516-1.424-1.162-1.944-1.938-.52-.776-.912-1.67-1.176-2.682-.264-1.012-.396-2.12-.396-3.324 0-1.632.264-3.084.792-4.356.528-1.272 1.248-2.346 2.16-3.222.912-.876 1.968-1.542 3.168-1.998C11.678.794 12.934.566 14.238.566c.912 0 1.776.108 2.592.324.816.216 1.548.528 2.196.936.648.408 1.176.9 1.584 1.476.408.576.612 1.224.612 1.944 0 .648-.168 1.194-.504 1.638-.336.444-.78.666-1.332.666-.432 0-.804-.15-1.116-.45-.312-.3-.588-.696-.828-1.188-.216-.456-.456-.87-.72-1.242-.264-.372-.588-.672-.972-.9-.384-.228-.864-.342-1.44-.342-.84 0-1.572.21-2.196.63-.624.42-1.104 1.014-1.44 1.782-.336.768-.504 1.674-.504 2.718 0 1.056.168 1.968.504 2.736.336.768.816 1.362 1.44 1.782.624.42 1.356.63 2.196.63.576 0 1.056-.114 1.44-.342.384-.228.708-.528.972-.9.264-.372.504-.786.72-1.242.24-.492.516-.888.828-1.188.312-.3.684-.45 1.116-.45.552 0 .996.222 1.332.666.336.444.504.99.504 1.638 0 .72-.204 1.368-.612 1.944-.408.576-.936 1.068-1.584 1.476-.648.408-1.38.72-2.196.936-.816.216-1.68.324-2.592.324-.24 0-.48-.012-.72-.036v1.704c0 .486-.086.912-.258 1.276-.172.364-.412.652-.72.864-.308.212-.672.324-1.092.336h-.012z" />
        </svg>
        <span className="hidden sm:inline">MongoDB</span>
        <span className="sm:hidden">Mongo</span>
      </button>
    </div>
  );
}
