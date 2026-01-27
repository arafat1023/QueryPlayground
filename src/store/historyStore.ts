import { create } from 'zustand';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/utils/storage';
import type { DatabaseMode, QueryHistoryItem, SavedQuery, NewHistoryEntry } from '@/types/editor';

interface HistoryState {
  history: QueryHistoryItem[];
  savedQueries: SavedQuery[];
  addHistory: (entry: NewHistoryEntry) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  addSavedQuery: (entry: { name: string; query: string; database: DatabaseMode }) => void;
  updateSavedQueryName: (id: string, name: string) => void;
  removeSavedQuery: (id: string) => void;
}

const MAX_HISTORY_ITEMS = 50;
const HISTORY_KEY = STORAGE_KEYS.QUERY_HISTORY;
const SAVED_KEY = STORAGE_KEYS.SAVED_QUERIES;

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const loadFromStorage = <T>(key: string): T[] => {
  const raw = getStorageItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadHistory = (): QueryHistoryItem[] => loadFromStorage<QueryHistoryItem>(HISTORY_KEY);

const loadSavedQueries = (): SavedQuery[] => loadFromStorage<SavedQuery>(SAVED_KEY);

const persistHistory = (history: QueryHistoryItem[]) => {
  setStorageItem(HISTORY_KEY, JSON.stringify(history));
};

const persistSavedQueries = (savedQueries: SavedQuery[]) => {
  setStorageItem(SAVED_KEY, JSON.stringify(savedQueries));
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: loadHistory(),
  savedQueries: loadSavedQueries(),

  addHistory: (entry) => {
    const newEntry: QueryHistoryItem = {
      id: generateId(),
      query: entry.query,
      database: entry.database,
      timestamp: entry.timestamp ?? Date.now(),
      success: entry.success,
    };

    const nextHistory = [newEntry, ...get().history].slice(0, MAX_HISTORY_ITEMS);
    set({ history: nextHistory });
    persistHistory(nextHistory);
  },

  removeHistory: (id) => {
    const nextHistory = get().history.filter((item) => item.id !== id);
    set({ history: nextHistory });
    persistHistory(nextHistory);
  },

  clearHistory: () => {
    set({ history: [] });
    persistHistory([]);
  },

  addSavedQuery: ({ name, query, database }) => {
    const now = Date.now();
    const nextSaved = [
      {
        id: generateId(),
        name,
        query,
        database,
        createdAt: now,
        updatedAt: now,
      },
      ...get().savedQueries,
    ];
    set({ savedQueries: nextSaved });
    persistSavedQueries(nextSaved);
  },

  updateSavedQueryName: (id, name) => {
    const nextSaved = get().savedQueries.map((item) =>
      item.id === id ? { ...item, name, updatedAt: Date.now() } : item
    );
    set({ savedQueries: nextSaved });
    persistSavedQueries(nextSaved);
  },

  removeSavedQuery: (id) => {
    const nextSaved = get().savedQueries.filter((item) => item.id !== id);
    set({ savedQueries: nextSaved });
    persistSavedQueries(nextSaved);
  },
}));
