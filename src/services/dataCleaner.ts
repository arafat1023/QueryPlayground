/**
 * Data cleanup service
 * Handles clearing all user data while preserving preferences
 */

import { STORAGE_KEYS } from '@/utils/storage';
import { resetPostgresDatabase } from '@/db/postgres/client';
import { clearAllCollections } from '@/db/mongodb/queryExecutor';
import { loadDefaultPostgresData } from '@/db/postgres/defaultData';
import { loadDefaultMongoData } from '@/db/mongodb/defaultData';

interface ClearOptions {
  preserveTheme?: boolean;
  preservePreferences?: boolean;
  reloadAfter?: boolean;
}

export class DataCleaner {
  /**
   * Clear all QueryPlayground data from storage
   * @param options - What to preserve
   */
  async clearAllData(options: ClearOptions = {}): Promise<void> {
    const {
      preserveTheme = true,
      preservePreferences = true,
      reloadAfter = true,
    } = options;

    // Store preferences to restore
    const savedTheme = preserveTheme ? localStorage.getItem(STORAGE_KEYS.THEME) : null;
    const savedActiveDB = preservePreferences ? localStorage.getItem(STORAGE_KEYS.ACTIVE_DB) : null;
    // 'qp_ui' is the zustand persist store name containing theme, active DB, and panel sizes
    const savedPanelSizes = preservePreferences ? localStorage.getItem('qp_ui') : null;

    // Clear all QueryPlayground localStorage keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('qp_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear IndexedDB (PostgreSQL) - clear only, don't reload
    try {
      await resetPostgresDatabase();
    } catch (error) {
      console.error('Failed to clear PostgreSQL data:', error);
      throw error;
    }

    // Clear MongoDB collections - clear only, don't reload
    try {
      clearAllCollections();
    } catch (error) {
      console.error('Failed to clear MongoDB data:', error);
      throw error;
    }

    // Reload default data for both databases
    try {
      await Promise.all([
        loadDefaultPostgresData(),
        Promise.resolve(loadDefaultMongoData()),
      ]);
    } catch (error) {
      console.error('Failed to load default data after clearing:', error);
      throw error;
    }

    // Restore preferences if requested
    // Note: We restore both individual keys and the zustand persist store
    if (savedTheme) {
      localStorage.setItem(STORAGE_KEYS.THEME, savedTheme);
    }
    if (savedActiveDB) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DB, savedActiveDB);
    }
    if (savedPanelSizes) {
      // 'qp_ui' is the zustand persist store name
      localStorage.setItem('qp_ui', savedPanelSizes);
    }

    // Mark user as having visited - don't show welcome modal again
    // User is explicitly using "Clear All Data", so they're not a first-time visitor
    localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true');

    // Reload to reset all state
    if (reloadAfter) {
      window.location.reload();
    }
  }

  /**
   * Clear only database data, preserve UI state
   */
  async clearDatabaseData(): Promise<void> {
    return this.clearAllData({
      preserveTheme: true,
      preservePreferences: true,
    });
  }

  /**
   * Start fresh - clear all data WITHOUT loading default data
   * User wants to create their own tables from scratch
   */
  async startFresh(options: ClearOptions = {}): Promise<void> {
    const {
      preserveTheme = true,
      preservePreferences = true,
    } = options;

    // Store preferences to restore
    const savedTheme = preserveTheme ? localStorage.getItem(STORAGE_KEYS.THEME) : null;
    const savedActiveDB = preservePreferences ? localStorage.getItem(STORAGE_KEYS.ACTIVE_DB) : null;
    const savedPanelSizes = preservePreferences ? localStorage.getItem('qp_ui') : null;

    // Clear all QueryPlayground localStorage keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('qp_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear IndexedDB (PostgreSQL) - clear only
    try {
      await resetPostgresDatabase();
    } catch (error) {
      console.error('Failed to clear PostgreSQL data:', error);
      throw error;
    }

    // Clear MongoDB collections - clear only
    try {
      clearAllCollections();
    } catch (error) {
      console.error('Failed to clear MongoDB data:', error);
      throw error;
    }

    // Restore preferences if requested
    // Note: We restore both individual keys and the zustand persist store
    if (savedTheme) {
      localStorage.setItem(STORAGE_KEYS.THEME, savedTheme);
    }
    if (savedActiveDB) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DB, savedActiveDB);
    }
    if (savedPanelSizes) {
      // 'qp_ui' is the zustand persist store name
      localStorage.setItem('qp_ui', savedPanelSizes);
    }

    // Mark user as having visited - don't show welcome modal again
    localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true');

    // Reload to reset all state
    window.location.reload();
  }

  /**
   * Get storage size breakdown
   */
  async getStorageBreakdown(): Promise<Record<string, number>> {
    const breakdown: Record<string, number> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('qp_')) {
        const value = localStorage.getItem(key);
        breakdown[key] = (key.length + (value?.length || 0)) * 2;
      }
    }

    return breakdown;
  }
}

export const dataCleaner = new DataCleaner();
