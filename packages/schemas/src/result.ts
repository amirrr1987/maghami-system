/** Uniform HTTP JSON envelope for Nest API responses. */

export interface ApiResult<T = unknown> {
  status: number;
  message: string[];
  isSuccess: boolean;
  data?: T;
}

function normalizeMessages(
  messages?: string | readonly string[],
): string[] {
  if (messages === undefined) return [];
  if (typeof messages === 'string') {
    return messages.trim() === '' ? [] : [messages];
  }
  return [...messages].filter((m) => m.trim() !== '');
}

export function okResult<T>(
  data?: T,
  status = 200,
  messages?: string | readonly string[],
): ApiResult<T> {
  const result: ApiResult<T> = {
    status,
    message: normalizeMessages(messages),
    isSuccess: true,
  };
  if (data !== undefined) {
    result.data = data;
  }
  return result;
}

export function failResult(
  status: number,
  messages: string | readonly string[],
): ApiResult<never> {
  return {
    status,
    message: normalizeMessages(messages),
    isSuccess: false,
  };
}

/** True when value already looks like an ApiResult envelope. */
export function isApiResult(value: unknown): value is ApiResult {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.status === 'number' &&
    typeof record.isSuccess === 'boolean' &&
    Array.isArray(record.message)
  );
}
