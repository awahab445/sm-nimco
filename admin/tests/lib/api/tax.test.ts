import { beforeEach, describe, expect, it } from 'vitest';
import * as api from '@/lib/api/tax';
import { expectLastFetch, installFetchMock, resJson, res204 } from '../../helpers/http';

const taxClass = {
  id: 'tc1',
  code: 'STD',
  name: 'Standard',
  description: null,
  metadata: {},
  createdAt: '',
  updatedAt: '',
};

const taxRate = {
  id: 'tr1',
  taxClassId: 'tc1',
  country: 'US',
  region: null,
  rate: 0.08,
  isInclusive: false,
  isActive: true,
  startDate: null,
  endDate: null,
  metadata: {},
  createdAt: '',
  updatedAt: '',
};

describe('tax API', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  it('fetchTaxClasses GET', async () => {
    fetchMock.mockResolvedValue(resJson([taxClass]));
    await api.fetchTaxClasses();
    expectLastFetch(fetchMock, { path: '/tax/classes' });
  });

  it('fetchTaxClass GET', async () => {
    fetchMock.mockResolvedValue(resJson(taxClass));
    await api.fetchTaxClass('tc1');
    expectLastFetch(fetchMock, { path: '/tax/classes/tc1' });
  });

  it('createTaxClass POST', async () => {
    const body = { code: 'R', name: 'Reduced' };
    fetchMock.mockResolvedValue(resJson({ ...taxClass, ...body }));
    await api.createTaxClass(body);
    expectLastFetch(fetchMock, { path: '/tax/classes', method: 'POST', body });
  });

  it('updateTaxClass PUT', async () => {
    const body = { name: 'X' };
    fetchMock.mockResolvedValue(resJson({ ...taxClass, ...body }));
    await api.updateTaxClass('tc1', body);
    expectLastFetch(fetchMock, {
      path: '/tax/classes/tc1',
      method: 'PUT',
      body,
    });
  });

  it('deleteTaxClass DELETE', async () => {
    fetchMock.mockResolvedValue(res204());
    await api.deleteTaxClass('tc1');
    expectLastFetch(fetchMock, { path: '/tax/classes/tc1', method: 'DELETE' });
  });

  it('fetchTaxRates GET', async () => {
    fetchMock.mockResolvedValue(resJson([taxRate]));
    await api.fetchTaxRates();
    expectLastFetch(fetchMock, { path: '/tax/taxes' });
  });

  it('fetchTaxRate GET', async () => {
    fetchMock.mockResolvedValue(resJson(taxRate));
    await api.fetchTaxRate('tr1');
    expectLastFetch(fetchMock, { path: '/tax/taxes/tr1' });
  });

  it('createTaxRate POST', async () => {
    const body = {
      taxClassId: 'tc1',
      country: 'US',
      rate: 0.1,
    };
    fetchMock.mockResolvedValue(resJson({ ...taxRate, ...body }));
    await api.createTaxRate(body);
    expectLastFetch(fetchMock, { path: '/tax/taxes', method: 'POST', body });
  });

  it('updateTaxRate PUT', async () => {
    const body = { rate: 0.09 };
    fetchMock.mockResolvedValue(resJson({ ...taxRate, ...body }));
    await api.updateTaxRate('tr1', body);
    expectLastFetch(fetchMock, {
      path: '/tax/taxes/tr1',
      method: 'PUT',
      body,
    });
  });

  it('deleteTaxRate DELETE', async () => {
    fetchMock.mockResolvedValue(res204());
    await api.deleteTaxRate('tr1');
    expectLastFetch(fetchMock, { path: '/tax/taxes/tr1', method: 'DELETE' });
  });
});
