/**
 * Centralized localStorage key constants and data version tracking
 *
 * Notes on missing keys from spec:
 * - PG_STATE: Not needed - PGlite manages its own IndexedDB storage
 * - MONGO_STATE: Not needed - MongoDB is in-memory, persisted via PGlite wrapper
 * - EDITOR_CONTENT: Stored in 'qp_editor' by zustand persist middleware
 * - SAVED_QUERIES: Will be added in Branch 12 (Query History)
 */
export const STORAGE_KEYS = {
  // Meta
  FIRST_VISIT: 'qp_first_visit',
  DATA_VERSION: 'qp_data_version',
  VERSION: 'qp_version',

  // Editor (managed by zustand persist)
  EDITOR_CONTENT: 'qp_editor_content',

  // Database schema metadata (actual data stored in IndexedDB by PGlite)
  PG_TABLES: 'qp_pg_tables',
  MONGO_COLLECTIONS: 'qp_mongo_collections',

  // UI State (managed by zustand persist in 'qp_ui' store)
  ACTIVE_DB: 'qp_active_db',
  THEME: 'qp_theme',
  PANEL_SIZES: 'qp_panel_sizes',

  // AI
  GEMINI_API_KEY: 'qp_gemini_key',

  // Query History (Branch 12)
  QUERY_HISTORY: 'qp_query_history',
  SAVED_QUERIES: 'qp_saved_queries',
} as const;

/**
 * Current data version for future migration support
 */
export const DATA_VERSION = '1.0.0';

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely get an item from localStorage
 */
export function getStorageItem(key: string): string | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely set an item in localStorage
 * Handles QuotaExceededError with helpful logging
 */
export function setStorageItem(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    // Log specific error type for debugging
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error(`[Storage] Quota exceeded while saving "${key}". Try clearing data in settings.`);
      } else {
        console.error(`[Storage] Failed to save "${key}":`, error.message);
      }
    }
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
