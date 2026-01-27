import { create } from 'zustand';
import { getStorageItem, removeStorageItem, setStorageItem, STORAGE_KEYS } from '@/utils/storage';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface AIState {
  apiKey: string;
  model: string;
  connectionStatus: ConnectionStatus;
  lastError: string | null;
  setApiKey: (apiKey: string) => void;
  clearApiKey: () => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setLastError: (error: string | null) => void;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

function loadApiKey(): string {
  return getStorageItem(STORAGE_KEYS.GEMINI_API_KEY) ?? '';
}

export const useAIStore = create<AIState>((set) => ({
  apiKey: loadApiKey(),
  model: DEFAULT_MODEL,
  connectionStatus: 'disconnected',
  lastError: null,

  setApiKey: (apiKey: string) => {
    set({ apiKey, connectionStatus: 'disconnected', lastError: null });
    if (apiKey) {
      setStorageItem(STORAGE_KEYS.GEMINI_API_KEY, apiKey);
    } else {
      removeStorageItem(STORAGE_KEYS.GEMINI_API_KEY);
    }
  },

  clearApiKey: () => {
    removeStorageItem(STORAGE_KEYS.GEMINI_API_KEY);
    set({ apiKey: '', connectionStatus: 'disconnected', lastError: null });
  },

  setConnectionStatus: (status: ConnectionStatus) => {
    set({ connectionStatus: status });
  },

  setLastError: (error: string | null) => {
    set({ lastError: error });
  },
}));
