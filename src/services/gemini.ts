export type GeminiErrorType =
  | 'invalid_key'
  | 'rate_limit'
  | 'quota'
  | 'timeout'
  | 'network'
  | 'bad_request'
  | 'unknown';

export interface GeminiErrorDetails {
  type: GeminiErrorType;
  message: string;
  status?: number;
}

export interface GeminiGenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GeminiRequestOptions {
  timeoutMs?: number;
  generationConfig?: GeminiGenerationConfig;
}

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const DEFAULT_TIMEOUT_MS = 30000;
const MIN_REQUEST_INTERVAL_MS = 6000; // 10 requests/min

class GeminiServiceError extends Error {
  type: GeminiErrorType;
  status?: number;

  constructor(details: GeminiErrorDetails) {
    super(details.message);
    this.name = 'GeminiServiceError';
    this.type = details.type;
    this.status = details.status;
  }
}

class GeminiService {
  private apiKey: string;
  private lastRequestTime = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string, options: GeminiRequestOptions = {}): Promise<string> {
    await this.throttle();

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(this.apiKey)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.generationConfig?.temperature ?? 0.7,
            maxOutputTokens: options.generationConfig?.maxOutputTokens ?? 2048,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const details = await parseErrorResponse(response);
        throw new GeminiServiceError(details);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new GeminiServiceError({
          type: 'unknown',
          message: 'Gemini returned an empty response.',
          status: response.status,
        });
      }

      return text;
    } catch (error) {
      if (error instanceof GeminiServiceError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new GeminiServiceError({
          type: 'timeout',
          message: 'Request timed out. Please try again.',
        });
      }

      throw new GeminiServiceError({
        type: 'network',
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  /** Generate content with lower temperature for deterministic JSON output */
  async generateJSON(prompt: string, options: Omit<GeminiRequestOptions, 'generationConfig'> = {}): Promise<string> {
    return this.generateContent(prompt, {
      ...options,
      generationConfig: { temperature: 0, maxOutputTokens: 4096 },
    });
  }

  async testConnection(): Promise<void> {
    await this.generateContent('Reply with OK.', {
      generationConfig: { temperature: 0, maxOutputTokens: 5 },
      timeoutMs: DEFAULT_TIMEOUT_MS,
    });
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed));
    }
    this.lastRequestTime = Date.now();
  }
}

const serviceCache = new Map<string, GeminiService>();

export function getGeminiService(apiKey: string): GeminiService {
  const cached = serviceCache.get(apiKey);
  if (cached) return cached;
  const service = new GeminiService(apiKey);
  serviceCache.set(apiKey, service);
  return service;
}

export function isGeminiServiceError(error: unknown): error is GeminiServiceError {
  return error instanceof GeminiServiceError;
}

async function parseErrorResponse(response: Response): Promise<GeminiErrorDetails> {
  let message = response.statusText || 'Gemini API error.';
  let apiMessage: string | undefined;

  try {
    const data = await response.json();
    apiMessage = data?.error?.message;
    if (apiMessage) {
      message = apiMessage;
    }
  } catch {
    // Ignore JSON parse errors
  }

  const type = mapErrorType(response.status, message);
  return { type, message: formatErrorMessage(type, message), status: response.status };
}

function mapErrorType(status: number, message: string): GeminiErrorType {
  const lowerMessage = message.toLowerCase();

  if (status === 401 || status === 403) return 'invalid_key';
  if (status === 429) return lowerMessage.includes('quota') ? 'quota' : 'rate_limit';
  if (status === 400) return 'bad_request';
  if (status >= 500) return 'network';

  if (lowerMessage.includes('quota')) return 'quota';

  return 'unknown';
}

function formatErrorMessage(type: GeminiErrorType, fallback: string): string {
  switch (type) {
    case 'invalid_key':
      return 'Invalid API key. Please check your key and try again.';
    case 'rate_limit':
      return 'Rate limit exceeded. Please wait a moment and try again.';
    case 'quota':
      return 'Quota exceeded for this API key.';
    case 'timeout':
      return 'Request timed out. Please try again.';
    case 'network':
      return 'Network error. Please check your connection and try again.';
    case 'bad_request':
      return 'Request rejected by the API. Please try again.';
    default:
      return fallback || 'Unexpected API error.';
  }
}
