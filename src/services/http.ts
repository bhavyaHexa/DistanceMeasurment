import axios, { type AxiosProgressEvent } from 'axios';

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'https://9r3vxkr8-8000.inc1.devtunnels.ms/api/v1';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ValidationIssue {
  loc?: (string | number)[];
  msg?: string;
}

/** The backend sends `detail` as a string for business errors, or a list for validation errors. */
function errorMessageFrom(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return (detail as ValidationIssue[])
      .map((issue) => `${issue.loc?.at(-1) ?? 'field'}: ${issue.msg ?? 'invalid value'}`)
      .join(', ');
  }
  return fallback;
}

const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isCancel(error)) return Promise.reject(error);
  if (axios.isAxiosError(error) && error.response) {
    const { status, statusText, data } = error.response;
    return Promise.reject(new ApiError(status, errorMessageFrom(data, statusText || `Request failed (${status})`)));
  }
  return Promise.reject(
    new ApiError(0, `Cannot reach the server at ${API_BASE_URL}. Check that the backend is running.`),
  );
});

interface RequestOptions {
  params?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
  onUploadProgress?: (percent: number) => void;
  /** 0 disables the timeout (conversion can take minutes). */
  timeout?: number;
}

export async function get<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await client.get<T>(path, { params: options.params, signal: options.signal });
  return response.data;
}

export async function post<T>(path: string, body: unknown, options: RequestOptions = {}): Promise<T> {
  const { onUploadProgress } = options;
  const response = await client.post<T>(path, body, {
    signal: options.signal,
    timeout: options.timeout,
    onUploadProgress: onUploadProgress
      ? (event: AxiosProgressEvent) => {
          if (event.total) onUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      : undefined,
  });
  return response.data;
}

export function isAbortError(error: unknown): boolean {
  return axios.isCancel(error);
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
