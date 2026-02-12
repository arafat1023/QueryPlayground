import { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, Dumbbell, MessageSquare, Wand2, CheckCircle } from 'lucide-react';
import { ApiKeyInput } from './ApiKeyInput';
import { QuestionGenerator } from './QuestionGenerator';
import { useAIStore } from '@/store/aiStore';
import { QueryExplainer } from './QueryExplainer';
import { NLToQuery } from './NLToQuery';
import { AnswerValidator } from './AnswerValidator';
import { HintPanel } from './HintPanel';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPractice?: () => void;
}

type AITab = 'practice' | 'explain' | 'generate' | 'validate';

const AI_TABS: { id: AITab; label: string; Icon: typeof Dumbbell }[] = [
  { id: 'practice', label: 'Practice', Icon: Dumbbell },
  { id: 'explain', label: 'Explain', Icon: MessageSquare },
  { id: 'generate', label: 'Generate', Icon: Wand2 },
  { id: 'validate', label: 'Validate', Icon: CheckCircle },
];

export function AIPanel({ isOpen, onClose, onStartPractice }: AIPanelProps) {
  const apiKey = useAIStore((state) => state.apiKey);
  const [mounted, setMounted] = useState(false);
  const [animState, setAnimState] = useState<'enter' | 'visible' | 'exit'>('enter');
  const [activeTab, setActiveTab] = useState<AITab>('practice');

  // Animation mount/unmount
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setAnimState('enter');
      const raf = requestAnimationFrame(() => {
        setAnimState('visible');
      });
      return () => cancelAnimationFrame(raf);
    } else if (mounted) {
      setAnimState('exit');
      const timer = setTimeout(() => {
        setMounted(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key to close
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!mounted) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mounted, handleEscape]);

  if (!mounted) return null;

  const drawerClass =
    animState === 'enter'
      ? 'drawer-slide-enter'
      : animState === 'visible'
        ? 'drawer-slide-visible'
        : 'drawer-slide-exit';

  const backdropClass =
    animState === 'enter'
      ? 'modal-backdrop-enter'
      : animState === 'visible'
        ? 'modal-backdrop-visible'
        : 'modal-backdrop-exit';

  const renderTabContent = () => {
    if (activeTab === 'practice') {
      return <QuestionGenerator onStartPractice={onStartPractice} />;
    }

    if (!apiKey) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
          Add your API key above to unlock this feature.
        </div>
      );
    }

    switch (activeTab) {
      case 'explain':
        return <QueryExplainer />;
      case 'generate':
        return <NLToQuery />;
      case 'validate':
        return (
          <div className="space-y-6">
            <AnswerValidator />
            <HintPanel />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none" style={{ top: '3.5rem' }}>
      {/* Backdrop - mobile only */}
      <div
        className={`lg:hidden absolute inset-0 bg-black/30 pointer-events-auto ${backdropClass}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-96 max-w-[90vw] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl flex flex-col pointer-events-auto ${drawerClass}`}
        role="dialog"
        aria-modal="true"
        aria-label="AI Assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Close AI panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* API Key */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <ApiKeyInput />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          {AI_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors ${
                activeTab === id
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
