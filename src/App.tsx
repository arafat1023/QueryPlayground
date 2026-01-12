import { useState, useCallback, useEffect } from 'react';
import { Toaster } from 'sonner';
import { usePostgres } from './hooks/usePostgres';
import { useMongoDB } from './hooks/useMongoDB';
import { useEditorStore } from './store/editorStore';
import { useUIStore } from './store/uiStore';
import { MainLayout } from './components/layout/MainLayout';
import type { QueryResult } from './types';
import type { DatabaseMode } from './types/editor';

function App() {
  const {
    isReady: pgReady,
    isLoading: pgLoading,
    executeQuery: executePgQuery,
  } = usePostgres();

  const {
    isReady: mongoReady,
    executeQuery: executeMongoQuery,
  } = useMongoDB();

  const { content, setDefaultQuery } = useEditorStore();
  const { activeDatabase, setActiveDatabase } = useUIStore();

  const [result, setResult] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Get current database status
  const isReady = activeDatabase === 'postgresql' ? pgReady : mongoReady;
  const isLoading = activeDatabase === 'postgresql' ? pgLoading : false;

  // Run query
  const runQuery = useCallback(async () => {
    if (!isReady || isRunning) return;

    setIsRunning(true);
    try {
      const queryResult =
        activeDatabase === 'postgresql'
          ? await executePgQuery(content)
          : await executeMongoQuery(content);

      setResult(queryResult);
    } finally {
      setIsRunning(false);
    }
  }, [activeDatabase, content, executePgQuery, executeMongoQuery, isReady, isRunning]);

  // Handle database switch
  const handleDatabaseChange = useCallback(
    (db: DatabaseMode) => {
      setActiveDatabase(db);
      setDefaultQuery(db);
      setResult(null);
    },
    [setActiveDatabase, setDefaultQuery]
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
