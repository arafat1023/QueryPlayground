import { useCallback, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { usePostgres } from './hooks/usePostgres';
import { useMongoDB } from './hooks/useMongoDB';
import { useQueryExecution } from './hooks/useQueryExecution';
import { useEditorStore } from './store/editorStore';
import { useUIStore } from './store/uiStore';
import { MainLayout } from './components/layout/MainLayout';
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

  // Set default query on initial load based on active database
  useEffect(() => {
    setDefaultQuery(activeDatabase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <MainLayout
        isRunning={isRunning}
        result={result}
        onRun={runQuery}
        onDatabaseChange={handleDatabaseChange}
        isReady={isReady}
        isLoading={isLoading}
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
