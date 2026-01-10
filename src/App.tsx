import { usePostgres } from './hooks/usePostgres';
import { useState } from 'react';

function App() {
  const { isReady, isLoading, error, executeQuery } = usePostgres();
  const [sql, setSql] = useState('SELECT 1 + 1 AS result');
  const [result, setResult] = useState<string>('');

  const runTest = async () => {
    const queryResult = await executeQuery(sql);
    if (queryResult.success) {
      setResult(JSON.stringify(queryResult, null, 2));
    } else {
      setResult(`Error: ${queryResult.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          QueryPlayground - PGlite Test
        </h1>
        <p className="text-gray-600 mb-6">
          SQL & NoSQL query practice platform with AI assistance
        </p>

        {/* PGlite Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">PostgreSQL (PGlite) Status</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Status:</span>{' '}
              {isLoading ? (
                <span className="text-yellow-600">Loading WASM...</span>
              ) : isReady ? (
                <span className="text-green-600">✓ Ready</span>
              ) : (
                <span className="text-red-600">✗ Not Ready</span>
              )}
            </p>
            {error && (
              <p className="text-red-600">
                <span className="font-medium">Error:</span> {error}
              </p>
            )}
          </div>
        </div>

        {/* Query Test */}
        {isReady && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Query</h2>
            <div className="space-y-4">
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Enter SQL query..."
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
