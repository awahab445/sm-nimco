import { beforeEach, describe, expect, it } from 'vitest';
import * as api from '@/lib/api/categories';
import { expectLastFetch, installFetchMock, resJson } from '../../helpers/http';

describe('categories API', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  it('fetchAdminCategories GET and unwraps data', async () => {
    const rows = [{ id: '1', name: 'A', slug: 'a', description: null, parentId: null, position: 0, isActive: true, productCount: 0 }];
    fetchMock.mockResolvedValue(resJson({ data: rows }));
    const out = await api.fetchAdminCategories();
    expect(out).toEqual(rows);
    expectLastFetch(fetchMock, { path: '/admin/categories' });
  });

  it('fetchAdminCategory GET by id', async () => {
    fetchMock.mockResolvedValue(resJson({ id: '1', name: 'A', slug: 'a', description: null, parentId: null, position: 0, isActive: true, createdAt: '', updatedAt: '' }));
    await api.fetchAdminCategory('1');
    expectLastFetch(fetchMock, { path: '/admin/categories/1' });
  });

  it('createAdminCategory POST', async () => {
    const body = { name: 'N', slug: 'n' };
    fetchMock.mockResolvedValue(resJson({ ...body, id: '1', description: null, parentId: null, position: 0, isActive: true, createdAt: '', updatedAt: '' }));
    await api.createAdminCategory(body);
    expectLastFetch(fetchMock, {
      path: '/admin/categories',
      method: 'POST',
      body,
    });
  });

  it('updateAdminCategory PATCH', async () => {
    const body = { name: 'X' };
    fetchMock.mockResolvedValue(resJson({ id: '1', name: 'X', slug: 'x', description: null, parentId: null, position: 0, isActive: true, createdAt: '', updatedAt: '' }));
    await api.updateAdminCategory('1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/categories/1',
      method: 'PATCH',
      body,
    });
  });

  it('deleteAdminCategory DELETE', async () => {
    fetchMock.mockResolvedValue(resJson({}));
    await api.deleteAdminCategory('1');
    expectLastFetch(fetchMock, { path: '/admin/categories/1', method: 'DELETE' });
  });
});
