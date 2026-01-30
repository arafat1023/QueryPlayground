import { Sparkles } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { ApiKeyInput } from './ApiKeyInput';
import { useAIStore } from '@/store/aiStore';
import { QueryExplainer } from './QueryExplainer';
import { NLToQuery } from './NLToQuery';
import { AnswerValidator } from './AnswerValidator';
import { HintPanel } from './HintPanel';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIPanel({ isOpen, onClose }: AIPanelProps) {
  const apiKey = useAIStore((state) => state.apiKey);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Assistant" size="lg">
      <div className="space-y-6">
        <ApiKeyInput />

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              AI Features
            </h3>
          </div>

          {!apiKey ? (
            <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-4">
              Add your API key to unlock AI features.
            </div>
          ) : (
            <div className="space-y-6">
              <QueryExplainer />
              <NLToQuery />
              <AnswerValidator />
              <HintPanel />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
