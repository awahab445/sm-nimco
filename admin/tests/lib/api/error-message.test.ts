import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api-client';
import { formatApiError } from '@/lib/api/error-message';

describe('formatApiError', () => {
  it('joins array message from ApiError data', () => {
    const err = new ApiError('x', 400, { message: ['a', 'b'] });
    expect(formatApiError(err)).toBe('a, b');
  });

  it('uses string message from ApiError data', () => {
    const err = new ApiError('x', 400, { message: 'Detail' });
    expect(formatApiError(err)).toBe('Detail');
  });

  it('falls back to Error.message', () => {
    expect(formatApiError(new Error('plain'))).toBe('plain');
  });

  it('returns generic for unknown', () => {
    expect(formatApiError(123)).toBe('Something went wrong');
  });

  it('uses ApiError.message when data has no message field', () => {
    const err = new ApiError('top', 500, {});
    expect(formatApiError(err)).toBe('top');
  });
});
