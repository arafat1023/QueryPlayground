import { useEffect, useMemo, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Lightbulb, SkipForward, Eye, Sparkles } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { QueryEditor } from '@/components/editor/QueryEditor';
import { usePracticeStore } from '@/store/practiceStore';
import { useUIStore } from '@/store/uiStore';
import { executePostgresQuery } from '@/db/postgres/client';
import { executeMongoQuery } from '@/db/mongodb/client';
import { PracticeResults } from './PracticeResults';
import type { DatabaseMode } from '@/types/editor';
import type { PracticeQuestion } from '@/types/practice';

interface PracticeModeProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExecutionResult {
  success: boolean;
  rows: unknown[];
  error?: string;
}

const isSafeUserQuery = (query: string, database: DatabaseMode): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;

  if (database === 'postgresql') {
    return normalized.startsWith('select') || normalized.startsWith('with');
  }

  return /db\.[a-z0-9_]+\.(find|findone|aggregate)\s*\(/i.test(query);
};

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`);
  return `{${entries.join(',')}}`;
};

const normalizeRows = (rows: unknown[]): string[] => {
  return rows.map((row) => stableStringify(row)).sort();
};

const executePracticeQuery = async (query: string, database: DatabaseMode): Promise<ExecutionResult> => {
  if (database === 'postgresql') {
    const result = await executePostgresQuery(query);
    if (!result.success) {
      return { success: false, rows: [], error: result.error ?? 'Query failed.' };
    }
    return { success: true, rows: result.rows ?? [] };
  }

  const result = await executeMongoQuery(query);
  if (!result.success) {
    return { success: false, rows: [], error: result.error ?? 'Query failed.' };
  }
  return { success: true, rows: result.data ?? [] };
};

const compareResults = (userRows: unknown[], expectedRows: unknown[]): boolean => {
  const userNormalized = normalizeRows(userRows);
  const expectedNormalized = normalizeRows(expectedRows);
  if (userNormalized.length !== expectedNormalized.length) return false;
  return userNormalized.every((row, index) => row === expectedNormalized[index]);
};

export function PracticeMode({ isOpen, onClose }: PracticeModeProps) {
  const {
    status,
    questions,
    answers,
    currentIndex,
    database,
    setCurrentIndex,
    setAnswerQuery,
    markAnswerStatus,
    revealHint,
    toggleSolution,
    nextQuestion,
    prevQuestion,
    skipQuestion,
    completeSession,
    resetSession,
    resumeSession,
  } = usePracticeStore();

  const theme = useUIStore((state) => state.theme);
  const setActiveDatabase = useUIStore((state) => state.setActiveDatabase);

  const [isChecking, setIsChecking] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const previousAnswerStatus = useRef<string | null>(null);

  const question: PracticeQuestion | null = questions[currentIndex] ?? null;
  const answer = question ? answers[question.id] : null;
  const activeDatabase = question?.database ?? database ?? null;

  const progress = useMemo(() => {
    const total = questions.length;
    const answered = questions.reduce((count, q) => {
      const status = answers[q.id]?.status ?? 'unanswered';
      return status === 'unanswered' ? count : count + 1;
    }, 0);
    return { total, answered };
  }, [questions, answers]);

  const handleRunCheck = async () => {
    if (!question || !activeDatabase) return;
    setLocalError(null);

    const userQuery = answer?.query ?? '';
    if (!userQuery.trim()) {
      setLocalError('Write a query before running the check.');
      return;
    }

    if (!isSafeUserQuery(userQuery, activeDatabase)) {
      setLocalError('Only read-only queries are allowed in practice mode.');
      return;
    }

    setIsChecking(true);
    try {
      const userResult = await executePracticeQuery(userQuery, activeDatabase);
      if (!userResult.success) {
        markAnswerStatus(question.id, 'incorrect', userResult.error ?? 'Query failed.');
        return;
      }

      const expectedResult = await executePracticeQuery(question.expectedQuery, activeDatabase);
      if (!expectedResult.success) {
        markAnswerStatus(question.id, 'incorrect', 'Unable to verify answer right now.');
        return;
      }

      const isCorrect = compareResults(userResult.rows, expectedResult.rows);
      markAnswerStatus(
        question.id,
        isCorrect ? 'correct' : 'incorrect',
        isCorrect
          ? 'Correct! Your query matches the expected results.'
          : 'Not quite. Compare your result with the hints and try again.'
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handleRevealHint = () => {
    if (!question) return;
    revealHint(question.id, question.hints.length || 3);
  };

  const handleToggleSolution = () => {
    if (!question || !answer) return;
    toggleSolution(question.id, !answer.showSolution);
  };

  const handleSkip = () => {
    if (!question) return;
    skipQuestion(question.id);
    nextQuestion();
  };

  const handleFinish = () => {
    completeSession();
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    const nextDatabase = question?.database ?? database;
    if (isOpen && nextDatabase) {
      setActiveDatabase(nextDatabase);
    }
  }, [isOpen, question, database, setActiveDatabase]);

  // Trigger celebration when answer becomes correct
  useEffect(() => {
    if (answer?.status === 'correct' && previousAnswerStatus.current !== 'correct') {
      setCelebrate(true);
      // Auto-advance to next question after celebration
      const timer = setTimeout(() => {
        setCelebrate(false);
        if (currentIndex < questions.length - 1) {
          nextQuestion();
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
    previousAnswerStatus.current = answer?.status ?? null;
  }, [answer?.status, currentIndex, questions.length, nextQuestion]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to submit
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!isChecking && status !== 'completed') {
          handleRunCheck();
        }
      }
      // Escape to close modal
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
      // Arrow keys for navigation (when not typing in editor)
      if (event.key === 'ArrowLeft' && currentIndex > 0) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
          prevQuestion();
        }
      }
      if (event.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
          nextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isChecking, status, currentIndex, questions.length, handleRunCheck, handleClose, prevQuestion, nextQuestion]);

  if (!isOpen) return null;

  if (questions.length === 0 || !question) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Practice Mode" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No practice session yet. Generate questions in the AI panel to get started.
          </p>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  if (status === 'completed') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Practice Results" size="xl">
        <PracticeResults
          questions={questions}
          answers={answers}
          onClose={handleClose}
          onReview={() => {
            resumeSession();
            setCurrentIndex(0);
          }}
          onReset={() => {
            resetSession();
            handleClose();
          }}
        />
      </Modal>
    );
  }

  if (!activeDatabase) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Practice Mode" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Practice session is missing a database context. Please regenerate questions.
          </p>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Practice Mode" size="xl">
      {/* Celebration Overlay */}
      {celebrate && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center bg-green-500/10 animate-in fade-in duration-300">
          <div className="text-center animate-in zoom-in-95 duration-300">
            <div className="relative">
              <Sparkles className="w-20 h-20 text-green-500 mx-auto animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={3} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-green-600 dark:text-green-400 animate-in slide-in-from-bottom-4 duration-300">
              Correct!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 animate-in slide-in-from-bottom-4 delay-100 duration-300">
              Moving to next question...
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {question.difficulty.toUpperCase()} • {activeDatabase === 'postgresql' ? 'PostgreSQL' : 'MongoDB'}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Progress: {progress.answered}/{progress.total}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-2">
          <p className="text-sm text-gray-800 dark:text-gray-200">{question.prompt}</p>
          {answer?.feedback && (
            <div
              className={`text-xs rounded-md px-3 py-2 ${
                answer.status === 'correct'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200'
                  : answer.status === 'incorrect'
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                  : 'bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-300'
              }`}
            >
              {answer.feedback}
            </div>
          )}
          {localError && (
            <div className="text-xs rounded-md px-3 py-2 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200">
              {localError}
            </div>
          )}
        </div>

        <QueryEditor
          mode={activeDatabase}
          value={answer?.query ?? ''}
          onChange={(value) => question && setAnswerQuery(question.id, value)}
          onRun={handleRunCheck}
          readOnly={isChecking}
          height={240}
          theme={theme}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={handleRunCheck}
            isLoading={isChecking}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Run & Check
            <span className="ml-2 text-xs opacity-60 hidden sm:inline">(Ctrl+Enter)</span>
          </Button>
          <Button variant="secondary" onClick={handleRevealHint} leftIcon={<Lightbulb className="w-4 h-4" />}>
            Hint
          </Button>
          <Button variant="ghost" onClick={handleToggleSolution} leftIcon={<Eye className="w-4 h-4" />}>
            {answer?.showSolution ? 'Hide Solution' : 'Show Solution'}
          </Button>
          <Button variant="ghost" onClick={handleSkip} leftIcon={<SkipForward className="w-4 h-4" />}>
            Skip
          </Button>
        </div>

        {question.hints.length > 0 && answer && answer.hintsUsed > 0 && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/20 p-4 space-y-2">
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-200">Hints</div>
            <ul className="text-xs text-blue-700 dark:text-blue-200 space-y-1">
              {question.hints.slice(0, answer.hintsUsed).map((hint, index) => (
                <li key={index}>• {hint}</li>
              ))}
            </ul>
          </div>
        )}

        {answer?.showSolution && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Solution</div>
            <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {question.expectedQuery}
            </pre>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={nextQuestion}
              disabled={currentIndex === questions.length - 1}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleFinish}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Finish Session
            </Button>
            <Button variant="ghost" onClick={handleClose} leftIcon={<XCircle className="w-4 h-4" />}>
              Close
              <span className="ml-2 text-xs opacity-60 hidden sm:inline">(Esc)</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
