import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EditorSettings, DatabaseMode } from '@/types/editor';

interface EditorState {
  // Current query content
  content: string;

  // Editor settings
  settings: EditorSettings;

  // Actions
  setContent: (content: string) => void;
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
      settings: DEFAULT_SETTINGS,

      // Set content
      // Note: Rely on Monaco's built-in undo/redo (Ctrl+Z/Ctrl+Shift+Z)
      setContent: (content: string) => {
        set({ content });
      },

      // Update settings
      updateSettings: (newSettings: Partial<EditorSettings>) => {
        set({
          settings: { ...get().settings, ...newSettings },
        });
      },

      // Reset editor to empty
      resetEditor: () => {
        set({ content: '' });
      },

      // Set default query based on database mode
      setDefaultQuery: (mode: DatabaseMode) => {
        set({ content: getDefaultQuery(mode) });
      },
    }),
    {
      name: 'qp_editor',
      partialize: (state) => ({
        settings: state.settings,
        // Don't persist content - always start with default query
      }),
    }
  )
);
