import { Database, Leaf } from 'lucide-react';
import type { DatabaseMode } from '@/types/editor';

interface DatabaseSwitchProps {
  activeDatabase: DatabaseMode;
  onSwitch: (db: DatabaseMode) => void;
  className?: string;
}

export function DatabaseSwitch({ activeDatabase, onSwitch, className = '' }: DatabaseSwitchProps) {
  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`} role="group" aria-label="Database mode switcher">
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
        <Leaf className="w-4 h-4" />
        <span className="hidden sm:inline">MongoDB</span>
        <span className="sm:hidden">Mongo</span>
      </button>
    </div>
  );
}
