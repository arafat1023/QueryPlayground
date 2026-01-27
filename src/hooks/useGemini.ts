import { useMemo, useCallback } from 'react';
import { getGeminiService, isGeminiServiceError } from '@/services/gemini';
import { useAIStore } from '@/store/aiStore';

export function useGemini() {
  const apiKey = useAIStore((state) => state.apiKey);
  const connectionStatus = useAIStore((state) => state.connectionStatus);
  const lastError = useAIStore((state) => state.lastError);
  const setConnectionStatus = useAIStore((state) => state.setConnectionStatus);
  const setLastError = useAIStore((state) => state.setLastError);

  const service = useMemo(() => {
    if (!apiKey) return null;
    return getGeminiService(apiKey);
  }, [apiKey]);

  const testConnection = useCallback(async () => {
    if (!service) {
      setConnectionStatus('error');
      setLastError('Please enter an API key first.');
      return false;
    }

    setConnectionStatus('connecting');
    setLastError(null);

    try {
      await service.testConnection();
      setConnectionStatus('connected');
      return true;
    } catch (error) {
      const message =
        isGeminiServiceError(error) ? error.message : 'Failed to connect to Gemini.';
      setConnectionStatus('error');
      setLastError(message);
      return false;
    }
  }, [service, setConnectionStatus, setLastError]);

  const generateContent = useCallback(
    async (prompt: string) => {
      if (!service) {
        throw new Error('Missing API key.');
      }
      return service.generateContent(prompt);
    },
    [service]
  );

  return {
    apiKey,
    connectionStatus,
    lastError,
    testConnection,
    generateContent,
  };
}
