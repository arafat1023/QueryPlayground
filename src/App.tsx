import { useCallback, useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { usePostgres } from './hooks/usePostgres';
import { useMongoDB } from './hooks/useMongoDB';
import { useQueryExecution } from './hooks/useQueryExecution';
import { useInitialData } from './hooks/useInitialData';
import { useEditorStore } from './store/editorStore';
import { useUIStore } from './store/uiStore';
import { MainLayout } from './components/layout/MainLayout';
import { WelcomeModal } from './components/common/WelcomeModal';
import { ResetConfirmModal } from './components/common/ResetConfirmModal';
import type { QueryResult } from './types';
import type { DatabaseMode } from './types/editor';

function App() {
  const {
    isReady: pgReady,
    isLoading: pgLoading,
  } = usePostgres();

  const {
    isReady: mongoReady,
  } = useMongoDB();

  const { content, setDefaultQuery } = useEditorStore();
  const { activeDatabase, setActiveDatabase } = useUIStore();

  // Initial data management (first visit, default data loading)
  // Wait for PostgreSQL to be ready before loading default data
  const { showWelcome, dismissWelcome, resetToDefault } = useInitialData({
    isPostgresReady: pgReady,
  });

  // Reset confirmation modal state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Get current database status
  const isReady = activeDatabase === 'postgresql' ? pgReady : mongoReady;
  const isLoading = activeDatabase === 'postgresql' ? pgLoading : false;

  // Use the unified query execution hook
  const { executeQuery, isRunning, lastResult: result, clearResult } = useQueryExecution({
    onSuccess: (result: QueryResult) => {
      toast.success(`Query executed in ${result.executionTime.toFixed(2)}ms`);
    },
    onError: (error: string) => {
      toast.error(error);
    },
  });

  // Run query
  const runQuery = useCallback(async () => {
    if (!isReady) return;
    await executeQuery(content);
  }, [content, isReady, executeQuery]);

  // Handle database switch
  const handleDatabaseChange = useCallback(
    (db: DatabaseMode) => {
      setActiveDatabase(db);
      setDefaultQuery(db);
      clearResult();
    },
    [setActiveDatabase, setDefaultQuery, clearResult]
  );

  // Handle reset to default button click
  const handleResetToDefault = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  // Confirm and execute reset
  const confirmReset = useCallback(async () => {
    setIsResetting(true);
    try {
      await resetToDefault();
      toast.success('Data reset to default successfully');
      setShowResetConfirm(false);
      // Clear previous results and refresh schema
      clearResult();
      // Trigger schema refresh by setting a timestamp that useSchema can watch
      window.dispatchEvent(new CustomEvent('schema-refresh'));
    } catch (error) {
      toast.error('Failed to reset data');
      console.error('Reset error:', error);
    } finally {
      setIsResetting(false);
    }
  }, [resetToDefault, clearResult]);

  // Set default query on initial load based on active database
  useEffect(() => {
    setDefaultQuery(activeDatabase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <WelcomeModal isOpen={showWelcome} onClose={dismissWelcome} />
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
        isLoading={isResetting}
      />
      <MainLayout
        isRunning={isRunning}
        result={result}
        onRun={runQuery}
        onDatabaseChange={handleDatabaseChange}
        isReady={isReady}
        isLoading={isLoading}
        onResetToDefault={handleResetToDefault}
      />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />
    </>
  );
}

export default App;
