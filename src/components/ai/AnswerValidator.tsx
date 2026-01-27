import { useMemo, useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';
import { useGemini } from '@/hooks/useGemini';
import { useSchema } from '@/hooks/useSchema';
import { formatSchemaForPrompt, PROMPTS } from '@/services/prompts';

interface ValidationResult {
  correctness?: 'yes' | 'partial' | 'no';
  issues?: string[];
  hint?: string;
}

export function AnswerValidator() {
  const { activeDatabase } = useUIStore();
  const query = useEditorStore((state) => state.content);
  const { generateContent } = useGemini();
  const { data } = useSchema();

  const [question, setQuestion] = useState('');
  const [rawResponse, setRawResponse] = useState('');
  const [parsedResult, setParsedResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const statusIcon = useMemo(() => {
    if (!parsedResult?.correctness) return null;
    if (parsedResult.correctness === 'yes') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  }, [parsedResult]);

  const handleValidate = async () => {
    if (!question.trim()) {
      setError('Enter the question you are trying to solve.');
      return;
    }
    if (!query.trim()) {
      setError('Enter your query in the editor first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setParsedResult(null);

    try {
      const schemaText = formatSchemaForPrompt(data, activeDatabase);
      const prompt = PROMPTS.validateAnswer(schemaText, question, query, activeDatabase);
      const response = await generateContent(prompt);
      setRawResponse(response);

      try {
        const json = JSON.parse(response) as ValidationResult;
        setParsedResult(json);
      } catch {
        setParsedResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate your answer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Validate Answer</h4>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleValidate}
          isLoading={isLoading}
        >
          Validate
        </Button>
      </div>

      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        rows={3}
        placeholder="Paste the question or prompt here..."
        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Using the current editor query as your answer.
      </p>

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {parsedResult && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
            {statusIcon}
            {parsedResult.correctness ? parsedResult.correctness.toUpperCase() : 'RESULT'}
          </div>
          {parsedResult.issues && parsedResult.issues.length > 0 && (
            <ul className="text-xs text-gray-600 dark:text-gray-300 list-disc pl-4">
              {parsedResult.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          )}
          {parsedResult.hint && (
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Hint: {parsedResult.hint}
            </p>
          )}
        </div>
      )}

      {rawResponse && !parsedResult && (
        <div className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          {rawResponse}
        </div>
      )}
    </section>
  );
}
