import { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, RefreshCw, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAIStore } from '@/store/aiStore';
import { useGemini } from '@/hooks/useGemini';

export function ApiKeyInput() {
  const apiKey = useAIStore((state) => state.apiKey);
  const setApiKey = useAIStore((state) => state.setApiKey);
  const clearApiKey = useAIStore((state) => state.clearApiKey);

  const { connectionStatus, lastError, testConnection } = useGemini();

  const [inputValue, setInputValue] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setInputValue(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(inputValue.trim());
  };

  const handleClear = () => {
    clearApiKey();
    setInputValue('');
  };

  const handleTest = async () => {
    setIsTesting(true);
    await testConnection();
    setIsTesting(false);
  };

  const statusBadge = () => {
    if (connectionStatus === 'connected') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
          <CheckCircle className="w-3.5 h-3.5" />
          Connected
        </span>
      );
    }
    if (connectionStatus === 'connecting') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Testing
        </span>
      );
    }
    if (connectionStatus === 'error') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
        <AlertTriangle className="w-3.5 h-3.5" />
        Not connected
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Gemini API Key
          </h3>
        </div>
        {statusBadge()}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Enter your Gemini API key"
            className="w-full pr-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowKey((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-xs text-amber-600 dark:text-amber-400">
          Your API key is stored in your browser localStorage. Use a personal key and avoid shared devices.
        </p>
      </div>

      {lastError && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
          {lastError}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={!inputValue.trim()}
        >
          Save Key
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleTest}
          isLoading={isTesting}
          disabled={!apiKey}
        >
          Test Connection
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          leftIcon={<Trash2 className="w-4 h-4" />}
          disabled={!apiKey}
        >
          Remove Key
        </Button>
      </div>
    </div>
  );
}
