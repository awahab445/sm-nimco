import { vi } from 'vitest';

process.env.NEXT_PUBLIC_API_URL = 'http://test-api.test';

const { mockClearToken } = vi.hoisted(() => ({
  mockClearToken: vi.fn(),
}));

vi.mock('../lib/auth-token', () => ({
  getToken: () => 'test-jwt-token',
  setToken: vi.fn(),
  clearToken: (...args: unknown[]) => mockClearToken(...args),
}));

export { mockClearToken };
