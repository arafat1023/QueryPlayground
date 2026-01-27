import { useState } from 'react';
import { Menu, Settings, Sparkles } from 'lucide-react';
import { DatabaseSwitch } from '@/components/common/DatabaseSwitch';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { SettingsModal } from '@/components/common/SettingsModal';
import { AIPanel } from '@/components/ai/AIPanel';
import { StorageIndicator } from '@/components/common/StorageIndicator';
import { useUIStore } from '@/store/uiStore';
import type { DatabaseMode } from '@/types/editor';

interface HeaderProps {
  onDatabaseChange?: (db: DatabaseMode) => void;
}

export function Header({onDatabaseChange}: HeaderProps) {
  const {activeDatabase, toggleSidebar} = useUIStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleDatabaseSwitch = (db: DatabaseMode) => {
    onDatabaseChange?.(db);
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        {/* Left section: Logo and sidebar toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                QueryPlayground
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                SQL & NoSQL Practice
              </p>
            </div>
          </div>
        </div>

        {/* Center section: Database switch */}
        <div className="flex items-center">
          <DatabaseSwitch
            activeDatabase={activeDatabase}
            onSwitch={handleDatabaseSwitch}
          />
        </div>

        {/* Right section: AI, Storage, Settings, Theme */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAI(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            aria-label="AI Assistant"
            title="AI Assistant"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <StorageIndicator />
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <ThemeToggle />
        </div>
      </header>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AIPanel isOpen={showAI} onClose={() => setShowAI(false)} />
    </>
  );
}
