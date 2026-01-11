import { usePostgres } from './hooks/usePostgres';
import { useMongoDB } from './hooks/useMongoDB';
import { useState } from 'react';
import { QueryEditor } from './components/editor/QueryEditor';
import { EditorToolbar } from './components/editor/EditorToolbar';
import { useEditorStore } from './store/editorStore';

function App() {
  const { isReady: pgReady, isLoading: pgLoading, error: pgError, executeQuery: executePgQuery } =
    usePostgres();
  const { isReady: mongoReady, error: mongoError, executeQuery: executeMongoQuery } = useMongoDB();

  const { content, setContent, setDefaultQuery } = useEditorStore();
  const [activeDb, setActiveDb] = useState<'postgresql' | 'mongodb'>('postgresql');
  const [result, setResult] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async () => {
    setIsRunning(true);
    try {
      const queryResult =
        activeDb === 'postgresql' ? await executePgQuery(content) : await executeMongoQuery(content);
      if (queryResult.success) {
        setResult(JSON.stringify(queryResult, null, 2));
      } else {
        setResult(`Error: ${queryResult.error}`);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleDbSwitch = (db: 'postgresql' | 'mongodb') => {
    setActiveDb(db);
    setDefaultQuery(db);
    setResult('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">QueryPlayground - Database Test</h1>
        <p className="text-gray-600 mb-6">SQL & NoSQL query practice platform with AI assistance</p>

        {/* Database Switcher */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Database</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleDbSwitch('postgresql')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeDb === 'postgresql'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              PostgreSQL (PGlite)
            </button>
            <button
              onClick={() => handleDbSwitch('mongodb')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeDb === 'mongodb'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              MongoDB (Mingo)
            </button>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {activeDb === 'postgresql' ? 'PostgreSQL (PGlite)' : 'MongoDB (Mingo)'} Status
          </h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Status:</span>{' '}
              {activeDb === 'postgresql' ? (
                pgLoading ? (
                  <span className="text-yellow-600">Loading WASM...</span>
                ) : pgReady ? (
                  <span className="text-green-600">✓ Ready</span>
                ) : (
                  <span className="text-red-600">✗ Not Ready</span>
                )
              ) : mongoReady ? (
                <span className="text-green-600">✓ Ready</span>
              ) : (
                <span className="text-red-600">✗ Not Ready</span>
              )}
            </p>
            {(activeDb === 'postgresql' ? pgError : mongoError) && (
              <p className="text-red-600">
                <span className="font-medium">Error:</span>{' '}
                {activeDb === 'postgresql' ? pgError : mongoError}
              </p>
            )}
          </div>
        </div>

        {/* Query Test */}
        {(activeDb === 'postgresql' ? pgReady : mongoReady) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Query Editor</h2>
            <div className="space-y-4">
              <QueryEditor
                mode={activeDb}
                value={content}
                onChange={setContent}
                onRun={runTest}
                readOnly={isRunning}
                height="300px"
              />
              <EditorToolbar
                onRun={runTest}
                onClear={() => setContent('')}
                mode={activeDb}
                isRunning={isRunning}
              />
              {result && (
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm">
                  {result}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
