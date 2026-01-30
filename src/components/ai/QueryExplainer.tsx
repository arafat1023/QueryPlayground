import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { useGemini } from '@/hooks/useGemini';
import { PROMPTS } from '@/services/prompts';

export function QueryExplainer() {
  const query = useEditorStore((state) => state.content);
  const { activeDatabase } = useUIStore();
  const { generateContent } = useGemini();

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!query.trim()) {
      setError('Enter a query in the editor first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = PROMPTS.explainQuery(query, activeDatabase);
      const response = await generateContent(prompt);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to explain the query.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Explain Query</h4>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExplain}
          isLoading={isLoading}
        >
          Explain
        </Button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Uses your current editor query ({activeDatabase}) to produce a step-by-step explanation.
      </p>

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {result && (
        <div className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          {result}
        </div>
      )}
    </section>
  );
}
