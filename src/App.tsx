import { usePostgres } from './hooks/usePostgres';
import { useMongoDB } from './hooks/useMongoDB';
import { useState } from 'react';

function App() {
  const { isReady: pgReady, isLoading: pgLoading, error: pgError, executeQuery: executePgQuery } =
    usePostgres();
  const { isReady: mongoReady, error: mongoError, executeQuery: executeMongoQuery } = useMongoDB();

  const [activeDb, setActiveDb] = useState<'postgresql' | 'mongodb'>('postgresql');
  const [query, setQuery] = useState(
    activeDb === 'postgresql' ? 'SELECT 1 + 1 AS result' : 'db.users.find({})'
  );
  const [result, setResult] = useState<string>('');

  const runTest = async () => {
    const queryResult =
      activeDb === 'postgresql' ? await executePgQuery(query) : await executeMongoQuery(query);
    if (queryResult.success) {
      setResult(JSON.stringify(queryResult, null, 2));
    } else {
      setResult(`Error: ${queryResult.error}`);
    }
  };

  const handleDbSwitch = (db: 'postgresql' | 'mongodb') => {
    setActiveDb(db);
    setQuery(db === 'postgresql' ? 'SELECT 1 + 1 AS result' : 'db.users.find({})');
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
            <h2 className="text-xl font-semibold mb-4">Test Query</h2>
            <div className="space-y-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder={
                  activeDb === 'postgresql' ? 'Enter SQL query...' : 'Enter MongoDB query...'
                }
              />
              <button
                onClick={runTest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Run Query
              </button>
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
