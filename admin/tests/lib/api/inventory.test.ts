import { beforeEach, describe, expect, it } from 'vitest';
import * as api from '@/lib/api/inventory';
import { expectLastFetch, installFetchMock, resJson } from '../../helpers/http';

describe('inventory API', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  it('fetchInventoryStatus GET with variantId only', async () => {
    fetchMock.mockResolvedValue(
      resJson({
        success: true,
        data: {
          variantId: 'v1',
          warehouseId: 'w1',
          quantity: 1,
          reservedQuantity: 0,
          availableQuantity: 1,
          lowStockThreshold: 0,
          isLowStock: false,
          isInStock: true,
        },
      }),
    );
    await api.fetchInventoryStatus('v1');
    expectLastFetch(fetchMock, {
      path: '/admin/inventory/status?variantId=v1',
    });
  });

  it('fetchInventoryStatus adds warehouseId', async () => {
    fetchMock.mockResolvedValue(
      resJson({
        success: true,
        data: {
          variantId: 'v1',
          warehouseId: 'w2',
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          lowStockThreshold: 0,
          isLowStock: true,
          isInStock: false,
        },
      }),
    );
    await api.fetchInventoryStatus('v1', 'w2');
    expectLastFetch(fetchMock, {
      path: '/admin/inventory/status?variantId=v1&warehouseId=w2',
    });
  });

  it('adjustInventoryStock POST', async () => {
    const body = { variantId: 'v1', quantity: 5, reason: 'count' };
    fetchMock.mockResolvedValue(
      resJson({
        success: true,
        data: {
          inventoryItemId: 'i1',
          variantId: 'v1',
          warehouseId: 'w1',
          previousQuantity: 0,
          newQuantity: 5,
          availableQuantity: 5,
          reservedQuantity: 0,
        },
      }),
    );
    await api.adjustInventoryStock(body);
    expectLastFetch(fetchMock, {
      path: '/admin/inventory/adjust',
      method: 'POST',
      body,
    });
  });
});
