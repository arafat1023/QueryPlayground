import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, setStorageItem, getStorageItem } from '@/utils/storage';
import { loadDefaultPostgresData, resetPostgresData } from '@/db/postgres/defaultData';
import { loadDefaultMongoData, resetMongoData } from '@/db/mongodb/defaultData';

interface UseInitialDataOptions {
  isPostgresReady: boolean;
}

interface UseInitialDataReturn {
  isFirstVisit: boolean;
  isLoading: boolean;
  showWelcome: boolean;
  dismissWelcome: () => void;
  resetToDefault: () => Promise<void>;
}

/**
 * Hook for managing initial data loading on first visit
 * - Detects first visit from localStorage
 * - Loads default data asynchronously on first visit
 * - Manages welcome modal display
 * - Provides reset to default functionality
 */
export function useInitialData({ isPostgresReady }: UseInitialDataOptions): UseInitialDataReturn {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Dismiss the welcome modal
   */
  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
  }, []);

  /**
   * Reset all data to default
   * This clears user data and reloads default sample data
   */
  const resetToDefault = useCallback(async () => {
    setIsLoading(true);
    try {
      // Reset both databases in parallel
      await Promise.all([
        resetPostgresData(),
        Promise.resolve(resetMongoData()),
      ]);
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load default data on first visit
   * Waits for PostgreSQL to be ready before loading
   */
  useEffect(() => {
    const initializeData = async () => {
      try {
        const hasVisited = getStorageItem(STORAGE_KEYS.FIRST_VISIT);

        if (!hasVisited) {
          // First visit - show welcome immediately
          setIsFirstVisit(true);
          setShowWelcome(true);

          // Wait for PostgreSQL to be ready before loading data
          if (!isPostgresReady) {
            return; // Will retry when isPostgresReady changes
          }

          // Load data asynchronously (don't block UI)
          Promise.all([
            loadDefaultPostgresData(),
            Promise.resolve(loadDefaultMongoData()),
          ]).then(() => {
            // Mark as visited after data loads
            setStorageItem(STORAGE_KEYS.FIRST_VISIT, 'true');
            console.log('Default data loaded successfully');
          }).catch((error) => {
            console.error('Failed to load default data:', error);
            // Still mark as visited even if loading failed
            setStorageItem(STORAGE_KEYS.FIRST_VISIT, 'true');
          });
        }
      } catch (error) {
        console.error('Error checking first visit status:', error);
        // Silently fail - localStorage might be unavailable
      }
    };

    initializeData();
  }, [isPostgresReady]);

  return {
    isFirstVisit,
    isLoading,
    showWelcome,
    dismissWelcome,
    resetToDefault,
  };
}
