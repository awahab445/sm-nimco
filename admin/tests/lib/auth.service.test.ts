import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '@/lib/auth.service';
import { expectLastFetch, installFetchMock, resJson, res204 } from '../helpers/http';
import { mockClearToken } from '../setup';

describe('authService', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
    mockClearToken.mockClear();
  });

  it('login POST /admin/auth/login without auth header', async () => {
    const payload = { access_token: 'tok', user: { id: '1' } };
    fetchMock.mockResolvedValue(resJson(payload));
    const out = await authService.login({ email: 'a@b.c', password: 'p' });
    expect(out).toEqual(payload);
    expectLastFetch(fetchMock, {
      path: '/admin/auth/login',
      method: 'POST',
      withAuth: false,
      body: { email: 'a@b.c', password: 'p' },
    });
  });

  it('getMe GET /admin/auth/me with auth', async () => {
    fetchMock.mockResolvedValue(resJson({ id: 'u1', email: 'a@b.c', isActive: true, typ: 'admin', roles: [], permissions: [], createdAt: '', updatedAt: '' }));
    await authService.getMe();
    expectLastFetch(fetchMock, {
      path: '/admin/auth/me',
      method: 'GET',
      withAuth: true,
    });
  });

  it('logout POST /admin/auth/logout then clears token', () => {
    fetchMock.mockResolvedValue(resJson({ message: 'ok' }));
    authService.logout();
    expectLastFetch(fetchMock, {
      path: '/admin/auth/logout',
      method: 'POST',
      withAuth: true,
    });
    expect(mockClearToken).toHaveBeenCalled();
  });

  it('logout still clears token when fetch fails', () => {
    fetchMock.mockRejectedValue(new Error('network'));
    authService.logout();
    expect(mockClearToken).toHaveBeenCalled();
  });
});
