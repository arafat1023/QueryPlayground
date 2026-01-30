import { useMemo, useState } from 'react';
import { Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { DifficultySelector } from './DifficultySelector';
import { useGemini } from '@/hooks/useGemini';
import { useSchema } from '@/hooks/useSchema';
import { useUIStore } from '@/store/uiStore';
import { usePracticeStore } from '@/store/practiceStore';
import { buildPracticePrompt } from '@/services/practicePrompts';
import type { PracticeDifficulty, PracticeQuestion } from '@/types/practice';
import type { DatabaseMode } from '@/types/editor';

interface QuestionGeneratorProps {
  onStartPractice?: () => void;
}

const DEFAULT_COUNT = 5;

const isSafeExpectedQuery = (query: string, database: DatabaseMode): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;

  if (database === 'postgresql') {
    return normalized.startsWith('select') || normalized.startsWith('with');
  }

  return /db\.[a-z0-9_]+\.(find|findone|aggregate)\s*\(/i.test(query);
};

const fallbackHints = [
  'Review the schema to find the right fields.',
  'Start with a simple filter and refine the query.',
  'Double-check required columns in the output.',
];

const parseQuestionResponse = (
  text: string,
  database: DatabaseMode,
  difficulty: PracticeDifficulty
): PracticeQuestion[] => {
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const rawJson = jsonBlockMatch?.[1] ?? (() => {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return '';
    return text.slice(start, end + 1);
  })();

  if (!rawJson) {
    throw new Error('AI response did not contain JSON.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (error) {
    throw new Error('Failed to parse AI JSON response.');
  }

  if (!parsed || typeof parsed !== 'object' || !('questions' in parsed)) {
    throw new Error('AI JSON response missing questions array.');
  }

  const questions = (parsed as { questions: unknown[] }).questions;
  if (!Array.isArray(questions)) {
    throw new Error('AI JSON response questions is not an array.');
  }

  return questions
    .map((item, index) => {
      const raw = item as Record<string, unknown>;
      const prompt = typeof raw.prompt === 'string' ? raw.prompt : '';
      const expectedQuery = typeof raw.expectedQuery === 'string' ? raw.expectedQuery : '';
      const hints = Array.isArray(raw.hints) ? raw.hints.filter((hint) => typeof hint === 'string') : [];
      const id = typeof raw.id === 'string' ? raw.id : `q_${index + 1}`;
      const qDifficulty = (raw.difficulty as PracticeDifficulty) || difficulty;

      if (!prompt || !expectedQuery || !isSafeExpectedQuery(expectedQuery, database)) {
        return null;
      }

      return {
        id,
        prompt,
        expectedQuery,
        hints: hints.length >= 3 ? hints.slice(0, 3) : [...hints, ...fallbackHints].slice(0, 3),
        difficulty: qDifficulty,
        database,
      } satisfies PracticeQuestion;
    })
    .filter((question): question is PracticeQuestion => question !== null);
};

export function QuestionGenerator({ onStartPractice }: QuestionGeneratorProps) {
  const { generateContent, apiKey } = useGemini();
  const { data: schema, isLoading, error } = useSchema();
  const activeDatabase = useUIStore((state) => state.activeDatabase);
  const practiceStatus = usePracticeStore((state) => state.status);
  const questions = usePracticeStore((state) => state.questions);
  const startSession = usePracticeStore((state) => state.startSession);
  const resumeSession = usePracticeStore((state) => state.resumeSession);

  const [difficulty, setDifficulty] = useState<PracticeDifficulty>('easy');
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const canResume = practiceStatus === 'active' && questions.length > 0;

  const schemaReady = useMemo(() => {
    if (isLoading) return false;
    if (!schema || schema.length === 0) return false;
    return true;
  }, [schema, isLoading]);

  const handleGenerate = async () => {
    setLastError(null);
    if (!apiKey) {
      setLastError('Add your Gemini API key to generate practice questions.');
      return;
    }
    if (!schemaReady) {
      setLastError('Schema is not ready yet. Try again in a moment.');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = buildPracticePrompt({
        schema,
        database: activeDatabase,
        difficulty,
        count,
      });

      const response = await generateContent(prompt);
      const parsedQuestions = parseQuestionResponse(response, activeDatabase, difficulty);

      if (parsedQuestions.length === 0) {
        throw new Error('No valid questions returned. Try again.');
      }

      startSession(parsedQuestions.slice(0, count), activeDatabase, difficulty);
      onStartPractice?.();
    } catch (error) {
      setLastError(error instanceof Error ? error.message : 'Failed to generate questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResume = () => {
    resumeSession();
    onStartPractice?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Practice Mode</h3>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Generate AI-powered questions based on your current schema and start a practice session.
      </p>

      <DifficultySelector value={difficulty} onChange={setDifficulty} disabled={isGenerating} />

      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500 dark:text-gray-400">Questions</label>
        <select
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
          className="text-xs rounded border border-gray-200 bg-white px-2 py-1 dark:border-gray-800 dark:bg-gray-900"
          disabled={isGenerating}
        >
          {[3, 5, 7, 10].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {lastError && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
          {lastError}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleGenerate}
          isLoading={isGenerating}
          disabled={!schemaReady || isGenerating || !apiKey}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Generate Questions
        </Button>

        {canResume && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResume}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Resume Session
          </Button>
        )}
      </div>
    </div>
  );
}
