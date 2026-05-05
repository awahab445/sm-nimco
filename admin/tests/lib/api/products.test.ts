import { beforeEach, describe, expect, it } from 'vitest';
import * as api from '@/lib/api/products';
import { expectLastFetch, installFetchMock, resJson } from '../../helpers/http';

const detail = {
  id: 'p1',
  sku: 'S',
  name: 'N',
  slug: 'n',
  type: 'simple',
  description: null,
  shortDescription: null,
  basePrice: '10',
  cost: null,
  weight: null,
  status: 'active',
  visibility: 'both',
  taxClassId: null,
  attributes: {},
  metaData: {},
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
  variants: [],
  images: [],
  categories: [],
};

describe('moneyToNumber', () => {
  it('parses string and number', () => {
    expect(api.moneyToNumber('12.5')).toBe(12.5);
    expect(api.moneyToNumber(3)).toBe(3);
  });

  it('handles null and invalid', () => {
    expect(api.moneyToNumber(null)).toBe(0);
    expect(api.moneyToNumber(undefined)).toBe(0);
    expect(api.moneyToNumber('x')).toBe(0);
  });
});

describe('products API', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  it('fetchAdminProducts builds query', async () => {
    fetchMock.mockResolvedValue(
      resJson({
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      }),
    );
    await api.fetchAdminProducts({
      page: 2,
      limit: 10,
      search: 'ab',
      status: 'active',
      category: 'c1',
    });
    expectLastFetch(fetchMock, {
      path: '/admin/products?page=2&limit=10&search=ab&status=active&category=c1',
    });
  });

  it('fetchAdminProduct GET', async () => {
    fetchMock.mockResolvedValue(resJson(detail));
    await api.fetchAdminProduct('p1');
    expectLastFetch(fetchMock, { path: '/admin/products/p1' });
  });

  it('createAdminProduct POST', async () => {
    const body = {
      sku: 'S',
      name: 'N',
      type: 'simple' as const,
      basePrice: 9.99,
    };
    fetchMock.mockResolvedValue(resJson(detail));
    await api.createAdminProduct(body);
    expectLastFetch(fetchMock, { path: '/admin/products', method: 'POST', body });
  });

  it('updateAdminProduct PATCH', async () => {
    const body = { name: 'N2' };
    fetchMock.mockResolvedValue(resJson({ ...detail, ...body }));
    await api.updateAdminProduct('p1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/products/p1',
      method: 'PATCH',
      body,
    });
  });

  it('deleteAdminProduct DELETE', async () => {
    fetchMock.mockResolvedValue(resJson({}));
    await api.deleteAdminProduct('p1');
    expectLastFetch(fetchMock, { path: '/admin/products/p1', method: 'DELETE' });
  });

  it('createVariant POST', async () => {
    const body = { sku: 'v', name: 'V', price: 1 };
    fetchMock.mockResolvedValue(resJson({}));
    await api.createVariant('p1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/products/p1/variants',
      method: 'POST',
      body,
    });
  });

  it('updateVariant PATCH', async () => {
    const body = { name: 'V2' };
    fetchMock.mockResolvedValue(resJson({}));
    await api.updateVariant('v1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/products/variants/v1',
      method: 'PATCH',
      body,
    });
  });

  it('deleteVariant DELETE', async () => {
    fetchMock.mockResolvedValue(resJson({}));
    await api.deleteVariant('v1');
    expectLastFetch(fetchMock, {
      path: '/admin/products/variants/v1',
      method: 'DELETE',
    });
  });

  it('createProductImage POST', async () => {
    const body = { url: 'https://x/img.png' };
    fetchMock.mockResolvedValue(resJson({}));
    await api.createProductImage('p1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/products/p1/images',
      method: 'POST',
      body,
    });
  });

  it('updateProductImage PATCH', async () => {
    const body = { altText: 'a' };
    fetchMock.mockResolvedValue(resJson({}));
    await api.updateProductImage('i1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/products/images/i1',
      method: 'PATCH',
      body,
    });
  });

  it('deleteProductImage DELETE', async () => {
    fetchMock.mockResolvedValue(resJson({}));
    await api.deleteProductImage('i1');
    expectLastFetch(fetchMock, {
      path: '/admin/products/images/i1',
      method: 'DELETE',
    });
  });

  it('uploadProductImage POST form data', async () => {
    fetchMock.mockResolvedValue(resJson({ url: 'http://test-api.test/uploads/products/a.png', filename: 'a.png' }));
    const file = new File(['abc'], 'a.png', { type: 'image/png' });
    await api.uploadProductImage(file);
    expectLastFetch(fetchMock, {
      path: '/admin/products/images/upload',
      method: 'POST',
    });
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [string, RequestInit];
    expect(init.body).toBeInstanceOf(FormData);
  });

  it('assignProductCategory POST without position', async () => {
    fetchMock.mockResolvedValue(resJson({}));
    await api.assignProductCategory('p1', 'c1');
    expectLastFetch(fetchMock, {
      path: '/admin/products/p1/categories',
      method: 'POST',
      body: { categoryId: 'c1' },
    });
  });

  it('assignProductCategory POST with position', async () => {
    fetchMock.mockResolvedValue(resJson({}));
    await api.assignProductCategory('p1', 'c1', 3);
    expectLastFetch(fetchMock, {
      path: '/admin/products/p1/categories',
      method: 'POST',
      body: { categoryId: 'c1', position: 3 },
    });
  });

  it('removeProductCategory DELETE', async () => {
    fetchMock.mockResolvedValue(resJson({}));
    await api.removeProductCategory('p1', 'c1');
    expectLastFetch(fetchMock, {
      path: '/admin/products/p1/categories/c1',
      method: 'DELETE',
    });
  });
});
