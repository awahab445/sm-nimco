import { expect, vi } from 'vitest';

export const TEST_API_BASE = 'http://test-api.test';

export function installFetchMock() {
  const fn = vi.fn();
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

export function resJson(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 204 ? 'No Content' : 'OK',
    json: () => Promise.resolve(data),
  } as Response;
}

export function res204(): Response {
  return {
    ok: true,
    status: 204,
    statusText: 'No Content',
    json: () => Promise.reject(new Error('no body')),
  } as Response;
}

export function resError(status: number, body: object): Response {
  return {
    ok: false,
    status,
    statusText: 'Error',
    json: () => Promise.resolve(body),
  } as Response;
}

type ExpectFetchOpts = {
  path: string;
  method?: string;
  withAuth?: boolean;
  body?: unknown;
};

export function expectLastFetch(
  fetchMock: ReturnType<typeof vi.fn>,
  opts: ExpectFetchOpts,
) {
  const calls = fetchMock.mock.calls;
  const last = calls[calls.length - 1];
  expect(last).toBeDefined();
  const [url, init] = last as [string, RequestInit];
  expect(url).toBe(`${TEST_API_BASE}${opts.path}`);
  const headers = init.headers as Headers;
  const auth = opts.withAuth !== false;
  if (auth) {
    expect(headers.get('Authorization')).toBe('Bearer test-jwt-token');
  } else {
    expect(headers.get('Authorization')).toBeNull();
  }
  if (opts.method != null) {
    expect(init.method).toBe(opts.method);
  }
  if (opts.body !== undefined) {
    expect(headers.get('Content-Type')).toContain('application/json');
    expect(init.body).toBe(
      typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body),
    );
  }
}
