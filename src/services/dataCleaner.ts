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
   * Internal helper to save and restore preferences during data clearing
   */
  private async clearAndRestorePreferences(
    shouldReloadDefaults: boolean,
    options: ClearOptions = {}
  ): Promise<void> {
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

    // Clear IndexedDB (PostgreSQL)
    try {
      await resetPostgresDatabase();
    } catch (error) {
      console.error('Failed to clear PostgreSQL data:', error);
      throw error;
    }

    // Clear MongoDB collections
    try {
      clearAllCollections();
    } catch (error) {
      console.error('Failed to clear MongoDB data:', error);
      throw error;
    }

    // Reload default data if requested
    if (shouldReloadDefaults) {
      try {
        await Promise.all([
          loadDefaultPostgresData(),
          Promise.resolve(loadDefaultMongoData()),
        ]);
      } catch (error) {
        console.error('Failed to load default data after clearing:', error);
        throw error;
      }
    }

    // Restore preferences if requested
    if (savedTheme) {
      localStorage.setItem(STORAGE_KEYS.THEME, savedTheme);
    }
    if (savedActiveDB) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DB, savedActiveDB);
    }
    if (savedPanelSizes) {
      localStorage.setItem('qp_ui', savedPanelSizes);
    }

    // Mark user as having visited - don't show welcome modal again
    localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true');

    // Reload to reset all state
    window.location.reload();
  }

  /**
   * Clear all QueryPlayground data from storage and reload default data
   * @param options - What to preserve
   */
  async clearAllData(options: ClearOptions = {}): Promise<void> {
    return this.clearAndRestorePreferences(true, options);
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
    return this.clearAndRestorePreferences(false, options);
  }

  /**
   * Get storage size breakdown
   */
  getStorageBreakdown(): Record<string, number> {
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
