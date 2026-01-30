import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useGemini } from '@/hooks/useGemini';
import { useSchema } from '@/hooks/useSchema';
import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';
import { formatSchemaForPrompt, PROMPTS } from '@/services/prompts';

export function NLToQuery() {
  const { activeDatabase } = useUIStore();
  const setContent = useEditorStore((state) => state.setContent);
  const { generateContent } = useGemini();
  const { data, isLoading: schemaLoading } = useSchema();

  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Enter a request to convert.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const schemaText = formatSchemaForPrompt(data, activeDatabase);
      const prompt = PROMPTS.naturalLanguageToQuery(schemaText, description, activeDatabase);
      const response = await generateContent(prompt);
      setResult(response.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate query.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToEditor = () => {
    if (result) {
      setContent(result);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Natural Language to Query
        </h4>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleGenerate}
          isLoading={isLoading}
        >
          Generate
        </Button>
      </div>

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        placeholder="Describe the query you want to run..."
        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {schemaLoading && (
        <p className="text-xs text-gray-500 dark:text-gray-400">Loading schema context...</p>
      )}

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <div className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
            {result}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyToEditor}
            leftIcon={<Copy className="w-4 h-4" />}
          >
            Copy to Editor
          </Button>
        </div>
      )}
    </section>
  );
}
