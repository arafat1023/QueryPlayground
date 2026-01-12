import {Panel, Group, Separator} from 'react-resizable-panels';
import {Play, Loader2, Clock, Table2, Code} from 'lucide-react';
import {QueryEditor} from '@/components/editor/QueryEditor';
import {EditorToolbar} from '@/components/editor/EditorToolbar';
import {useEditorStore} from '@/store/editorStore';
import {useUIStore} from '@/store/uiStore';
import type {QueryResult} from '@/types';

interface ContentAreaProps {
  isRunning: boolean;
  result: QueryResult | null;
  onRun: () => void;
  isReady: boolean;
  isLoading?: boolean;
}

// Generate a stable key from row data for React list rendering
function getRowKey(row: Record<string, unknown>, columns: string[], index: number): string {
  // Try to find a unique ID field first
  const idField = ['id', '_id', 'ID', 'Id'].find((field) => field in row);
  if (idField && row[idField]) {
    return String(row[idField]);
  }

  // Fallback: hash the row values for a stable key
  const hash = columns
    .map((col) => {
      const v = row[col];
      return v === null ? 'NULL' : v === undefined ? 'UNDEF' : typeof v === 'object' ? JSON.stringify(v) : String(v);
    })
    .join('|');

  // Include index as last resort to ensure uniqueness
  return `${hash.substring(0, 50)}-${index}`;
}

export function ContentArea({isRunning, result, onRun, isReady, isLoading}: ContentAreaProps) {
  const {content, setContent} = useEditorStore();
  const {activeDatabase, panelSizes, setPanelSizes} = useUIStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePanelResize = (layout: any) => {
    const editorSize = layout['editor'];
    if (editorSize !== undefined) {
      setPanelSizes({editor: editorSize});
    }
  };

  return (
    <Group
      orientation="vertical"
      onLayoutChange={handlePanelResize}
      style={{height: '100%', width: '100%'}}
    >
      {/* Editor Panel */}
      <Panel
        id="editor"
        defaultSize={'' + panelSizes.editor}
        minSize="20"
      >
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
          {/* Editor Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Query Editor
              </span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${activeDatabase === 'postgresql'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}
              >
                {activeDatabase === 'postgresql' ? 'PostgreSQL' : 'MongoDB'}
              </span>
            </div>

            {!isReady && (
              <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isLoading ? 'Loading...' : 'Connecting...'}</span>
              </div>
            )}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <QueryEditor
              mode={activeDatabase}
              value={content}
              onChange={setContent}
              onRun={onRun}
              readOnly={isRunning || !isReady}
              height="100%"
            />
          </div>

          {/* Editor Toolbar */}
          <div className="flex-shrink-0">
            <EditorToolbar
              onRun={onRun}
              onClear={() => setContent('')}
              mode={activeDatabase}
              isRunning={isRunning}
            />
          </div>
        </div>
      </Panel>

      {/* Resize Handle */}
      <Separator
        style={{
          height: '4px',
          backgroundColor: '#e5e7eb',
          cursor: 'row-resize',
        }}
      />

      {/* Results Panel */}
      <Panel id="results" minSize="15">
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
          {/* Results Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Results
              </span>
            </div>

            {result && (
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                {result.success && result.rowCount !== undefined && (
                  <span>{result.rowCount} row{result.rowCount !== 1 ? 's' : ''}</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {result.executionTime.toFixed(0)}ms
                </span>
              </div>
            )}
          </div>

          {/* Results Content */}
          <div className="flex-1 overflow-auto p-2">
            {isRunning ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Running query...</span>
                </div>
              </div>
            ) : result ? (
              result.success ? (
                <ResultsTable result={result} />
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400 font-mono">
                    {result.error}
                  </p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <Play className="w-10 h-10 mb-2" />
                <p className="text-sm">Run a query to see results</p>
                <p className="text-xs mt-1">Press Ctrl+Enter or click Run</p>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </Group>
  );
}

function ResultsTable({result}: {result: QueryResult}) {
  const rows = result.rows || [];

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <p className="text-sm">Query executed successfully. No rows returned.</p>
      </div>
    );
  }

  const columns = Object.keys(rows[0] as object);

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={getRowKey(row as Record<string, unknown>, columns, i)}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800"
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 font-mono text-xs"
                >
                  {formatCellValue((row as Record<string, unknown>)[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null) return 'NULL';
  if (value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
