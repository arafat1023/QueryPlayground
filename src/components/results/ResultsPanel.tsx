import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { ResultsToolbar } from './ResultsToolbar';
import { TableView } from './TableView';
import { JsonView } from './JsonView';
import { ErrorDisplay } from './ErrorDisplay';
import { EmptyState } from './EmptyState';
import type { QueryResult } from '@/types';

interface ResultsPanelProps {
  result: QueryResult | null;
  isRunning: boolean;
}

type ViewMode = 'table' | 'json';

/**
 * ResultsPanel component
 * Main container for displaying query results
 * Supports table view, JSON view, export, and pagination
 */
export function ResultsPanel({ result, isRunning }: ResultsPanelProps) {
  const { activeDatabase } = useUIStore();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [dismissedError, setDismissedError] = useState(false);

  // Reset view mode when database changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewMode('table');
    setDismissedError(false);
  }, [activeDatabase]);

  // Handle loading state
  if (isRunning) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
        <EmptyState type="loading" databaseType={activeDatabase} />
      </div>
    );
  }

  // Handle no result state
  if (!result) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
        <EmptyState type="no-query" databaseType={activeDatabase} />
      </div>
    );
  }

  // Handle error state
  if (!result.success && result.error) {
    if (dismissedError) {
      return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
          <EmptyState type="no-query" databaseType={activeDatabase} />
        </div>
      );
    }
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-red-600 dark:text-red-400">Error</span>
        </div>
        <ErrorDisplay error={result.error} onDismiss={() => setDismissedError(true)} />
      </div>
    );
  }

  // Handle empty results
  const rows = result.rows || [];
  if (rows.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
        <ResultsToolbar
          rowCount={0}
          executionTime={result.executionTime}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          rows={rows}
          isMongoDB={activeDatabase === 'mongodb'}
        />
        <EmptyState type="no-results" databaseType={activeDatabase} />
      </div>
    );
  }

  // Handle successful results
  const isMongoDB = activeDatabase === 'mongodb';

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Toolbar */}
      <ResultsToolbar
        rowCount={result.rowCount || rows.length}
        executionTime={result.executionTime}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        rows={rows}
        isMongoDB={isMongoDB}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isMongoDB || viewMode === 'json' ? (
          <JsonView data={rows} />
        ) : (
          <TableView rows={rows} />
        )}
      </div>
    </div>
  );
}
