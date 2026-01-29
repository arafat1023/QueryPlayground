import type { PracticeDifficulty } from '@/types/practice';

interface DifficultySelectorProps {
  value: PracticeDifficulty;
  onChange: (value: PracticeDifficulty) => void;
  disabled?: boolean;
}

const difficultyOptions: { value: PracticeDifficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Basics & simple filters' },
  { value: 'medium', label: 'Medium', description: 'Joins & grouping' },
  { value: 'hard', label: 'Hard', description: 'Subqueries & advanced logic' },
];

export function DifficultySelector({ value, onChange, disabled }: DifficultySelectorProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {difficultyOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={`rounded-md border px-3 py-2 text-left text-xs transition-colors ${
            value === option.value
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-200'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <div className="font-semibold">{option.label}</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-500">{option.description}</div>
        </button>
      ))}
    </div>
  );
}
