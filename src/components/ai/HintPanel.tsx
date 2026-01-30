import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';
import { useGemini } from '@/hooks/useGemini';
import { useSchema } from '@/hooks/useSchema';
import { formatSchemaForPrompt, PROMPTS } from '@/services/prompts';

export function HintPanel() {
  const { activeDatabase } = useUIStore();
  const query = useEditorStore((state) => state.content);
  const { generateContent } = useGemini();
  const { data } = useSchema();

  const [question, setQuestion] = useState('');
  const [attempt, setAttempt] = useState(query);
  const [hints, setHints] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleHint = async () => {
    if (!question.trim()) {
      setError('Enter the question you are working on.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const schemaText = formatSchemaForPrompt(data, activeDatabase);
      const prompt = PROMPTS.hint(schemaText, question, attempt, hints);
      const response = await generateContent(prompt);
      setHints((prev) => [...prev, response.trim()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate hint.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetHints = () => {
    setHints([]);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Hint Assistant</h4>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetHints}
            disabled={hints.length === 0}
          >
            Clear Hints
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleHint}
            isLoading={isLoading}
          >
            Get Hint
          </Button>
        </div>
      </div>

      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        rows={2}
        placeholder="Paste the question you're trying to solve..."
        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <textarea
        value={attempt}
        onChange={(event) => setAttempt(event.target.value)}
        rows={3}
        placeholder="Optional: paste your current attempt (defaults to editor)"
        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {hints.length > 0 && (
        <div className="space-y-2">
          {hints.map((hint, index) => (
            <div
              key={`${hint}-${index}`}
              className="flex gap-2 text-xs text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
              <span className="whitespace-pre-wrap">{hint}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
