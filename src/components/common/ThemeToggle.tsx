import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Tooltip } from '@/components/common/Tooltip';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <button
        onClick={toggleTheme}
        className={`
          p-2 rounded-lg transition-colors duration-200
          hover:bg-gray-100 dark:hover:bg-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-900
          ${className}
        `}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span key={theme} className="theme-icon-enter inline-flex">
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </span>
      </button>
    </Tooltip>
  );
}
