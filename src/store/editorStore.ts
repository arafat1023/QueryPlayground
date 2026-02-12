import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EditorSettings, DatabaseMode, EditorTab } from '@/types/editor';

interface EditorState {
  // Tab system
  tabs: EditorTab[];
  activeTabId: string;
  tabCounter: number;

  // Current query content (synced with active tab)
  content: string;

  // Per-database drafts to preserve content when switching
  pgDraft: string;
  mongoDraft: string;

  // Track dirty state (content differs from last saved/loaded)
  isDirty: boolean;
  lastSavedContent: string;

  // Editor settings
  settings: EditorSettings;

  // Actions
  setContent: (content: string) => void;
  updateSettings: (settings: Partial<EditorSettings>) => void;
  resetEditor: () => void;
  setDefaultQuery: (mode: DatabaseMode) => void;
  saveDraft: (mode: DatabaseMode) => void;
  restoreDraft: (mode: DatabaseMode) => void;
  markSaved: () => void;

  // Tab actions
  addTab: (database?: DatabaseMode) => void;
  removeTab: (id: string) => void;
  switchTab: (id: string) => void;
  renameTab: (id: string, name: string) => void;
  updateActiveTabDatabase: (database: DatabaseMode) => void;
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  minimap: false,
  theme: 'light',
};

export const getDefaultQuery = (mode: DatabaseMode): string => {
  return mode === 'postgresql'
    ? 'SELECT 1 + 1 AS result'
    : 'db.users.find({})';
};

const createInitialTab = (): EditorTab => ({
  id: 'tab-1',
  name: 'Query 1',
  content: getDefaultQuery('postgresql'),
  database: 'postgresql',
  isDirty: false,
});

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      tabs: [createInitialTab()],
      activeTabId: 'tab-1',
      tabCounter: 1,
      content: getDefaultQuery('postgresql'),
      pgDraft: getDefaultQuery('postgresql'),
      mongoDraft: getDefaultQuery('mongodb'),
      isDirty: false,
      lastSavedContent: getDefaultQuery('postgresql'),
      settings: DEFAULT_SETTINGS,

      // Set content (updates active tab too)
      setContent: (content: string) => {
        const { activeTabId, tabs, lastSavedContent } = get();
        const dirty = content !== lastSavedContent;
        set({
          content,
          isDirty: dirty,
          tabs: tabs.map(t =>
            t.id === activeTabId ? { ...t, content, isDirty: dirty } : t
          ),
        });
      },

      // Update settings
      updateSettings: (newSettings: Partial<EditorSettings>) => {
        set({
          settings: { ...get().settings, ...newSettings },
        });
      },

      // Reset editor to empty
      resetEditor: () => {
        const { activeTabId, tabs } = get();
        set({
          content: '',
          isDirty: true,
          tabs: tabs.map(t =>
            t.id === activeTabId ? { ...t, content: '', isDirty: true } : t
          ),
        });
      },

      // Set default query based on database mode
      setDefaultQuery: (mode: DatabaseMode) => {
        const defaultQuery = getDefaultQuery(mode);
        const { activeTabId, tabs } = get();
        set({
          content: defaultQuery,
          isDirty: false,
          lastSavedContent: defaultQuery,
          tabs: tabs.map(t =>
            t.id === activeTabId ? { ...t, content: defaultQuery, isDirty: false, database: mode } : t
          ),
        });
      },

      // Save current content as draft for the given database mode
      saveDraft: (mode: DatabaseMode) => {
        const { content } = get();
        if (mode === 'postgresql') {
          set({ pgDraft: content });
        } else {
          set({ mongoDraft: content });
        }
      },

      // Restore draft for the given database mode
      restoreDraft: (mode: DatabaseMode) => {
        const { pgDraft, mongoDraft, activeTabId, tabs } = get();
        const draft = mode === 'postgresql' ? pgDraft : mongoDraft;
        set({
          content: draft,
          isDirty: false,
          lastSavedContent: draft,
          tabs: tabs.map(t =>
            t.id === activeTabId ? { ...t, content: draft, isDirty: false } : t
          ),
        });
      },

      // Mark current content as saved
      markSaved: () => {
        const { content, activeTabId, tabs } = get();
        set({
          isDirty: false,
          lastSavedContent: content,
          tabs: tabs.map(t =>
            t.id === activeTabId ? { ...t, isDirty: false } : t
          ),
        });
      },

      // Add a new tab
      addTab: (database?: DatabaseMode) => {
        const { tabs, tabCounter, activeTabId, content, isDirty } = get();
        if (tabs.length >= 10) return;
        const activeTab = tabs.find(t => t.id === activeTabId);
        const db = database || activeTab?.database || 'postgresql';
        const newCounter = tabCounter + 1;
        const newTab: EditorTab = {
          id: `tab-${Date.now().toString(36)}`,
          name: `Query ${newCounter}`,
          content: getDefaultQuery(db),
          database: db,
          isDirty: false,
        };
        // Save current tab state before switching
        set({
          tabs: [...tabs.map(t =>
            t.id === activeTabId ? { ...t, content, isDirty } : t
          ), newTab],
          activeTabId: newTab.id,
          content: newTab.content,
          isDirty: false,
          lastSavedContent: newTab.content,
          tabCounter: newCounter,
        });
      },

      // Remove a tab
      removeTab: (id: string) => {
        const { tabs, activeTabId, content, isDirty } = get();
        if (tabs.length <= 1) return;
        // Save current tab state
        const currentTabs = tabs.map(t =>
          t.id === activeTabId ? { ...t, content, isDirty } : t
        );
        const idx = currentTabs.findIndex(t => t.id === id);
        const newTabs = currentTabs.filter(t => t.id !== id);
        if (activeTabId === id) {
          const newIdx = Math.min(idx, newTabs.length - 1);
          const newActive = newTabs[newIdx];
          set({
            tabs: newTabs,
            activeTabId: newActive.id,
            content: newActive.content,
            isDirty: newActive.isDirty,
            lastSavedContent: newActive.content,
          });
        } else {
          set({ tabs: newTabs });
        }
      },

      // Switch to a different tab
      switchTab: (id: string) => {
        const { tabs, activeTabId, content, isDirty } = get();
        if (id === activeTabId) return;
        const target = tabs.find(t => t.id === id);
        if (!target) return;
        // Save current tab's content
        const updatedTabs = tabs.map(t =>
          t.id === activeTabId ? { ...t, content, isDirty } : t
        );
        set({
          tabs: updatedTabs,
          activeTabId: id,
          content: target.content,
          isDirty: target.isDirty,
          lastSavedContent: target.content,
        });
      },

      // Rename a tab
      renameTab: (id: string, name: string) => {
        set({
          tabs: get().tabs.map(t =>
            t.id === id ? { ...t, name } : t
          ),
        });
      },

      // Update the active tab's database mode
      updateActiveTabDatabase: (database: DatabaseMode) => {
        const { tabs, activeTabId } = get();
        set({
          tabs: tabs.map(t =>
            t.id === activeTabId ? { ...t, database } : t
          ),
        });
      },
    }),
    {
      name: 'qp_editor',
      merge: (persistedState: unknown, currentState: EditorState): EditorState => {
        // Default shallow merge (persistedState only has data keys, no functions)
        const merged = { ...currentState, ...(persistedState as Partial<EditorState>) };

        // Migration: create initial tab if none exist (upgrading from pre-tabs version)
        if (!Array.isArray(merged.tabs) || merged.tabs.length === 0) {
          const tab: EditorTab = {
            id: 'tab-1',
            name: 'Query 1',
            content: typeof merged.content === 'string' ? merged.content : getDefaultQuery('postgresql'),
            database: 'postgresql' as DatabaseMode,
            isDirty: false,
          };
          merged.tabs = [tab];
          merged.activeTabId = 'tab-1';
          merged.tabCounter = 1;
        }

        return merged;
      },
    }
  )
);
