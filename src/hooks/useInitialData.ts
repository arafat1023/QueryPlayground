import { useState, useEffect, useCallback, useRef } from 'react';
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
 * - Loads default data when user clicks "Get Started"
 * - Manages welcome modal display
 * - Provides reset to default functionality
 */
export function useInitialData({ isPostgresReady }: UseInitialDataOptions): UseInitialDataReturn {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Use ref to track if data should be loaded on dismiss
  const shouldLoadDataOnDismiss = useRef<boolean>(false);

  /**
   * Load default data
   * Called when user clicks "Get Started" or when resetting
   */
  const loadData = useCallback(async () => {
    if (!isPostgresReady) {
      console.log('PostgreSQL not ready, waiting...');
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all([
        loadDefaultPostgresData(),
        Promise.resolve(loadDefaultMongoData()),
      ]);
      // Mark as visited after data loads successfully
      setStorageItem(STORAGE_KEYS.FIRST_VISIT, 'true');
      console.log('Default data loaded successfully');
    } catch (error) {
      console.error('Failed to load default data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isPostgresReady]);

  /**
   * Dismiss the welcome modal and load data if on first visit
   */
  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    // Load data when user clicks "Get Started" (using ref to avoid closure issues)
    if (shouldLoadDataOnDismiss.current) {
      loadData();
      shouldLoadDataOnDismiss.current = false;
    }
  }, [loadData]);

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
   * Check for first visit and show welcome modal
   * Does NOT load data automatically - only when user clicks "Get Started"
   */
  useEffect(() => {
    const checkFirstVisit = () => {
      try {
        const hasVisited = getStorageItem(STORAGE_KEYS.FIRST_VISIT);

        if (!hasVisited) {
          // First visit - show welcome modal
          setIsFirstVisit(true);
          setShowWelcome(true);
          shouldLoadDataOnDismiss.current = true;
        }
      } catch (error) {
        console.error('Error checking first visit status:', error);
        // Silently fail - localStorage might be unavailable
      }
    };

    checkFirstVisit();
  }, []);

  return {
    isFirstVisit,
    isLoading,
    showWelcome,
    dismissWelcome,
    resetToDefault,
  };
}
