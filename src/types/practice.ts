import type { DatabaseMode } from '@/types/editor';

export type PracticeDifficulty = 'easy' | 'medium' | 'hard';

export interface PracticeQuestion {
  id: string;
  prompt: string;
  difficulty: PracticeDifficulty;
  database: DatabaseMode;
  expectedQuery: string;
  hints: string[];
}

export type PracticeAnswerStatus = 'unanswered' | 'correct' | 'incorrect' | 'skipped';

export interface PracticeAnswer {
  query: string;
  status: PracticeAnswerStatus;
  hintsUsed: number;
  showSolution: boolean;
  feedback: string | null;
  lastCheckedAt: number | null;
}

export interface PracticeSessionSummary {
  id: string;
  database: DatabaseMode;
  difficulty: PracticeDifficulty;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  skipped: number;
  startedAt: number;
  completedAt: number;
  score: number;
}
