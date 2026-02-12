import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Tooltip } from '@/components/common/Tooltip';
import { useState, useEffect } from 'react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';
  const [animKey, setAnimKey] = useState(0);

  // Bump key on toggle to re-trigger the CSS animation
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [theme]);

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
        <span key={animKey} className="theme-icon-enter inline-flex">
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
