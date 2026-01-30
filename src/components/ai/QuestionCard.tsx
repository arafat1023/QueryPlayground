import type { PracticeQuestion, PracticeAnswerStatus } from '@/types/practice';

interface QuestionCardProps {
  question: PracticeQuestion;
  status: PracticeAnswerStatus;
}

const statusStyles: Record<PracticeAnswerStatus, string> = {
  unanswered: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  correct: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  incorrect: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  skipped: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

export function QuestionCard({ question, status }: QuestionCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          {question.difficulty}
        </span>
        <span className={`px-2 py-0.5 text-[11px] rounded-full ${statusStyles[status]}`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200">{question.prompt}</p>
    </div>
  );
}
