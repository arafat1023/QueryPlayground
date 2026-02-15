import { useState, useEffect, useRef } from 'react';
import { Menu, Settings, Sparkles, Keyboard, BrainCircuit, HelpCircle, MoreHorizontal } from 'lucide-react';
import { DatabaseSwitch } from '@/components/common/DatabaseSwitch';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Tooltip } from '@/components/common/Tooltip';
import { SettingsModal } from '@/components/common/SettingsModal';
import { KeyboardShortcutsModal } from '@/components/common/KeyboardShortcutsModal';
import { AIPanel } from '@/components/ai/AIPanel';
import { PracticeMode } from '@/components/ai/PracticeMode';
import { StorageIndicator } from '@/components/common/StorageIndicator';
import { WelcomeModal } from '@/components/common/WelcomeModal';
import { useUIStore } from '@/store/uiStore';
import type { DatabaseMode } from '@/types/editor';

interface HeaderProps {
  onDatabaseChange?: (db: DatabaseMode) => void;
}

export function Header({onDatabaseChange}: HeaderProps) {
  const {activeDatabase, toggleSidebar} = useUIStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  const handleDatabaseSwitch = (db: DatabaseMode) => {
    onDatabaseChange?.(db);
  };

  const handleStartPractice = () => {
    setShowAI(false);
    setShowPractice(true);
  };

  // Close overflow menu on click outside
  useEffect(() => {
    if (!showOverflow) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOverflow]);

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200" role="banner">
        {/* Left section: Logo and sidebar toggle */}
        <div className="flex items-center gap-3">
          <Tooltip label="Toggle sidebar">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </Tooltip>

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

        {/* Right section: AI, Shortcuts, Storage, Settings, Theme */}
        <div className="flex items-center gap-1">
          {/* AI button - always visible */}
          <Tooltip label="AI Assistant">
            <button
              onClick={() => setShowAI(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              aria-label="AI Assistant"
            >
              <BrainCircuit className="w-5 h-5" />
            </button>
          </Tooltip>

          {/* Desktop-only buttons (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-1">
            <Tooltip label="Keyboard shortcuts">
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="w-5 h-5" />
              </button>
            </Tooltip>
            <StorageIndicator />
            <Tooltip label="Settings">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </Tooltip>
            <Tooltip label="Help">
              <button
                onClick={() => setShowWelcome(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                aria-label="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>

          {/* Mobile overflow menu (visible only < 640px) */}
          <div className="relative sm:hidden" ref={overflowRef}>
            <button
              onClick={() => setShowOverflow((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              aria-label="More options"
              aria-expanded={showOverflow}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showOverflow && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
                <button
                  onClick={() => { setShowShortcuts(true); setShowOverflow(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Keyboard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  Keyboard Shortcuts
                </button>
                <button
                  onClick={() => { setShowSettings(true); setShowOverflow(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  Settings
                </button>
                <button
                  onClick={() => { setShowWelcome(true); setShowOverflow(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  Help
                </button>
              </div>
            )}
          </div>

          {/* Theme toggle - always visible */}
          <ThemeToggle />
        </div>
      </header>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <AIPanel isOpen={showAI} onClose={() => setShowAI(false)} onStartPractice={handleStartPractice} />
      <PracticeMode isOpen={showPractice} onClose={() => setShowPractice(false)} />
      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
    </>
  );
}
