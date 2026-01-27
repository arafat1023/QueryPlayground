import { Sparkles } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { ApiKeyInput } from './ApiKeyInput';
import { useAIStore } from '@/store/aiStore';

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
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              AI Features
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Generate practice questions',
              'Explain current query',
              'Natural language to query',
              'Validate your answer',
            ].map((feature) => (
              <div
                key={feature}
                className={`rounded-md border px-3 py-2 text-xs ${
                  apiKey
                    ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-200'
                    : 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400'
                }`}
              >
                {feature}
              </div>
            ))}
          </div>
          {!apiKey && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Add an API key to unlock AI features in the next step.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
