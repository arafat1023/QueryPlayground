import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EditorSettings, DatabaseMode } from '@/types/editor';

interface EditorState {
  // Current query content
  content: string;

  // Query history for undo/redo
  history: string[];
  historyIndex: number;

  // Editor settings
  settings: EditorSettings;

  // Actions
  setContent: (content: string) => void;
  addToHistory: (content: string) => void;
  undo: () => void;
  redo: () => void;
  updateSettings: (settings: Partial<EditorSettings>) => void;
  resetEditor: () => void;
  setDefaultQuery: (mode: DatabaseMode) => void;
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  minimap: false,
  theme: 'light',
};

const getDefaultQuery = (mode: DatabaseMode): string => {
  return mode === 'postgresql'
    ? 'SELECT 1 + 1 AS result'
    : 'db.users.find({})';
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      content: getDefaultQuery('postgresql'),
      history: [getDefaultQuery('postgresql')],
      historyIndex: 0,
      settings: DEFAULT_SETTINGS,

      // Set content and add to history
      setContent: (content: string) => {
        const { history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(content);
        set({
          content,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      // Add to history without changing current content
      addToHistory: (content: string) => {
        const { history } = get();
        set({ history: [...history, content] });
      },

      // Undo
      undo: () => {
        const { historyIndex, history } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({
            content: history[newIndex],
            historyIndex: newIndex,
          });
        }
      },

      // Redo
      redo: () => {
        const { historyIndex, history } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          set({
            content: history[newIndex],
            historyIndex: newIndex,
          });
        }
      },

      // Update settings
      updateSettings: (newSettings: Partial<EditorSettings>) => {
        set({
          settings: { ...get().settings, ...newSettings },
        });
      },

      // Reset editor to default
      resetEditor: () => {
        set({
          content: '',
          history: [''],
          historyIndex: 0,
        });
      },

      // Set default query based on database mode
      setDefaultQuery: (mode: DatabaseMode) => {
        const defaultQuery = getDefaultQuery(mode);
        const { history, historyIndex } = get();
        const newHistory = [...history.slice(0, historyIndex + 1), defaultQuery];
        set({
          content: defaultQuery,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
    }),
    {
      name: 'qp_editor',
      partialize: (state) => ({
        settings: state.settings,
        // Don't persist content/history - always start fresh or with defaults
      }),
    }
  )
);
