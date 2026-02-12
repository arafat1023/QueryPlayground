import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/utils/storage';
import type { DatabaseMode } from '@/types/editor';
import type {
  PracticeQuestion,
  PracticeAnswer,
  PracticeDifficulty,
  PracticeSessionSummary,
  PracticeAnswerStatus,
} from '@/types/practice';

export type PracticeStatus = 'idle' | 'generating' | 'active' | 'completed';

interface PracticeState {
  status: PracticeStatus;
  sessionId: string | null;
  database: DatabaseMode | null;
  difficulty: PracticeDifficulty;
  questions: PracticeQuestion[];
  answers: Record<string, PracticeAnswer>;
  currentIndex: number;
  startedAt: number | null;
  completedAt: number | null;
  sessions: PracticeSessionSummary[];
  setGenerating: (database: DatabaseMode, difficulty: PracticeDifficulty) => void;
  startSession: (questions: PracticeQuestion[], database: DatabaseMode, difficulty: PracticeDifficulty) => void;
  setCurrentIndex: (index: number) => void;
  setAnswerQuery: (questionId: string, query: string) => void;
  updateAnswer: (questionId: string, patch: Partial<PracticeAnswer>) => void;
  markAnswerStatus: (questionId: string, status: PracticeAnswerStatus, feedback?: string | null) => void;
  revealHint: (questionId: string) => void;
  toggleSolution: (questionId: string, show: boolean) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  skipQuestion: (questionId: string) => void;
  completeSession: () => void;
  resetSession: () => void;
  resumeSession: () => void;
}

const MAX_SESSIONS = 20;

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const createEmptyAnswer = (): PracticeAnswer => ({
  query: '',
  status: 'unanswered',
  hintsUsed: 0,
  showSolution: false,
  feedback: null,
  lastCheckedAt: null,
});

const clampIndex = (index: number, total: number) => {
  if (total <= 0) return 0;
  if (index < 0) return 0;
  if (index > total - 1) return total - 1;
  return index;
};

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      sessionId: null,
      database: null,
      difficulty: 'easy',
      questions: [],
      answers: {},
      currentIndex: 0,
      startedAt: null,
      completedAt: null,
      sessions: [],

      setGenerating: (database, difficulty) => {
        set({ status: 'generating', database, difficulty });
      },

      startSession: (questions, database, difficulty) => {
        const answers = questions.reduce<Record<string, PracticeAnswer>>((acc, question) => {
          acc[question.id] = createEmptyAnswer();
          return acc;
        }, {});

        set({
          status: 'active',
          sessionId: generateId(),
          database,
          difficulty,
          questions,
          answers,
          currentIndex: 0,
          startedAt: Date.now(),
          completedAt: null,
        });
      },

      setCurrentIndex: (index) => {
        const total = get().questions.length;
        set({ currentIndex: clampIndex(index, total) });
      },

      setAnswerQuery: (questionId, query) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...(state.answers[questionId] ?? createEmptyAnswer()),
              query,
            },
          },
        }));
      },

      updateAnswer: (questionId, patch) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...(state.answers[questionId] ?? createEmptyAnswer()),
              ...patch,
            },
          },
        }));
      },

      markAnswerStatus: (questionId, status, feedback = null) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...(state.answers[questionId] ?? createEmptyAnswer()),
              status,
              feedback,
              lastCheckedAt: Date.now(),
            },
          },
        }));
      },

      revealHint: (questionId) => {
        set((state) => {
          const question = state.questions.find((q) => q.id === questionId);
          const maxHints = question?.hints.length || 3;
          const current = state.answers[questionId] ?? createEmptyAnswer();
          return {
            answers: {
              ...state.answers,
              [questionId]: {
                ...current,
                hintsUsed: Math.min(current.hintsUsed + 1, maxHints),
              },
            },
          };
        });
      },

      toggleSolution: (questionId, show) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...(state.answers[questionId] ?? createEmptyAnswer()),
              showSolution: show,
            },
          },
        }));
      },

      nextQuestion: () => {
        set((state) => ({
          currentIndex: clampIndex(state.currentIndex + 1, state.questions.length),
        }));
      },

      prevQuestion: () => {
        set((state) => ({
          currentIndex: clampIndex(state.currentIndex - 1, state.questions.length),
        }));
      },

      skipQuestion: (questionId) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...(state.answers[questionId] ?? createEmptyAnswer()),
              status: 'skipped',
              feedback: 'Skipped',
              lastCheckedAt: Date.now(),
            },
          },
        }));
      },

      completeSession: () => {
        const state = get();
        if (!state.startedAt) return;

        const totals = Object.values(state.answers).reduce(
          (acc, answer) => {
            if (answer.status === 'correct') acc.correct += 1;
            if (answer.status === 'incorrect') acc.incorrect += 1;
            if (answer.status === 'skipped') acc.skipped += 1;
            return acc;
          },
          { correct: 0, incorrect: 0, skipped: 0 }
        );

        const totalQuestions = state.questions.length;
        const score = totalQuestions > 0 ? Math.round((totals.correct / totalQuestions) * 100) : 0;
        const completedAt = Date.now();

        const summary: PracticeSessionSummary = {
          id: state.sessionId ?? generateId(),
          database: state.database ?? 'postgresql',
          difficulty: state.difficulty,
          totalQuestions,
          correct: totals.correct,
          incorrect: totals.incorrect,
          skipped: totals.skipped,
          startedAt: state.startedAt,
          completedAt,
          score,
        };

        set({
          status: 'completed',
          completedAt,
          sessions: [summary, ...state.sessions].slice(0, MAX_SESSIONS),
        });
      },

      resetSession: () => {
        set({
          status: 'idle',
          sessionId: null,
          database: null,
          questions: [],
          answers: {},
          currentIndex: 0,
          startedAt: null,
          completedAt: null,
        });
      },

      resumeSession: () => {
        const state = get();
        if (state.questions.length === 0) return;
        set({ status: 'active' });
      },
    }),
    {
      name: STORAGE_KEYS.PRACTICE_PROGRESS,
    }
  )
);
