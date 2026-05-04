import { ApiError } from '../api-client';

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError && err.data && typeof err.data === 'object') {
    const msg = (err.data as { message?: string | string[] }).message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
