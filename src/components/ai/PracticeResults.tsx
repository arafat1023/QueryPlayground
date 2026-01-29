import { CheckCircle2, XCircle, SkipForward } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { QuestionCard } from './QuestionCard';
import type { PracticeQuestion, PracticeAnswer } from '@/types/practice';

interface PracticeResultsProps {
  questions: PracticeQuestion[];
  answers: Record<string, PracticeAnswer>;
  onClose: () => void;
  onReview: () => void;
  onReset: () => void;
}

export function PracticeResults({ questions, answers, onClose, onReview, onReset }: PracticeResultsProps) {
  const totals = questions.reduce(
    (acc, question) => {
      const status = answers[question.id]?.status ?? 'unanswered';
      if (status === 'correct') acc.correct += 1;
      if (status === 'incorrect') acc.incorrect += 1;
      if (status === 'skipped') acc.skipped += 1;
      return acc;
    },
    { correct: 0, incorrect: 0, skipped: 0 }
  );

  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((totals.correct / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{score}%</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Correct</div>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> {totals.correct}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Incorrect / Skipped</div>
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
            <XCircle className="w-4 h-4" /> {totals.incorrect}
            <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <SkipForward className="w-4 h-4" /> {totals.skipped}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            status={answers[question.id]?.status ?? 'unanswered'}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onReview}>
          Review Questions
        </Button>
        <Button variant="ghost" onClick={onReset}>
          Start New Session
        </Button>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
