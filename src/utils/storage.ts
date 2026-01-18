/**
 * Centralized localStorage key constants and data version tracking
 */

export const STORAGE_KEYS = {
  FIRST_VISIT: 'qp_first_visit',
  DATA_VERSION: 'qp_data_version',
  GEMINI_API_KEY: 'qp_gemini_key',
  ACTIVE_DB: 'qp_active_db',
  THEME: 'qp_theme',
  QUERY_HISTORY: 'qp_query_history',
  PG_TABLES: 'qp_pg_tables',
  MONGO_COLLECTIONS: 'qp_mongo_collections',
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
 */
export function setStorageItem(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
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
