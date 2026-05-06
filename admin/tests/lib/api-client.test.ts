import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchApi } from '@/lib/api-client';
import {
  expectLastFetch,
  installFetchMock,
  resError,
  resJson,
  res204,
} from '../helpers/http';
import { mockClearToken } from '../setup';

describe('fetchApi', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
    mockClearToken.mockClear();
  });

  it('returns parsed JSON on 200', async () => {
    fetchMock.mockResolvedValue(resJson({ hello: 1 }));
    const out = await fetchApi<{ hello: number }>('/x');
    expect(out).toEqual({ hello: 1 });
    expectLastFetch(fetchMock, { path: '/x' });
  });

  it('sends Authorization when withAuth is true and token exists', async () => {
    fetchMock.mockResolvedValue(resJson({}));
    await fetchApi('/admin/me');
    expectLastFetch(fetchMock, { path: '/admin/me', withAuth: true });
  });

  it('omits Authorization when withAuth is false', async () => {
    fetchMock.mockResolvedValue(resJson({ access_token: 't', user: {} }));
    await fetchApi('/admin/auth/login', { method: 'POST', body: '{}' }, false);
    expectLastFetch(fetchMock, {
      path: '/admin/auth/login',
      method: 'POST',
      withAuth: false,
      body: '{}',
    });
  });

  it('sets Content-Type for JSON body', async () => {
    fetchMock.mockResolvedValue(resJson({}));
    await fetchApi('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.c', password: 'x' }),
    }, false);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get('Content-Type')).toContain('application/json');
  });

  it('returns undefined on 204', async () => {
    fetchMock.mockResolvedValue(res204());
    const out = await fetchApi<void>('/r', { method: 'DELETE' });
    expect(out).toBeUndefined();
  });

  it('on 401 with auth clears token and throws ApiError', async () => {
    fetchMock.mockResolvedValue(resError(401, { message: 'Unauthorized' }));
    await expect(fetchApi('/admin/x')).rejects.toThrow(ApiError);
    expect(mockClearToken).toHaveBeenCalled();
  });

  it('on 401 without auth does not clear token', async () => {
    fetchMock.mockResolvedValue(resError(401, { message: 'bad' }));
    await expect(
      fetchApi('/admin/auth/login', { method: 'POST', body: '{}' }, false),
    ).rejects.toThrow(ApiError);
    expect(mockClearToken).not.toHaveBeenCalled();
  });

  it('maps error JSON message to ApiError', async () => {
    fetchMock.mockResolvedValue(resError(400, { message: 'Invalid' }));
    try {
      await fetchApi('/x');
      expect.fail('should throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).message).toBe('Invalid');
      expect((e as ApiError).status).toBe(400);
    }
  });
});

describe('ApiError', () => {
  it('stores status and data', () => {
    const err = new ApiError('m', 422, { foo: 1 });
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('m');
    expect(err.status).toBe(422);
    expect(err.data).toEqual({ foo: 1 });
  });
});
