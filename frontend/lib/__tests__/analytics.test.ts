import { productToGa4Item, sumItemValue } from '../analytics/mappers';
import { markOnce, hasDedupeKey, setDedupeKey } from '../analytics/dedupe';

describe('analytics mappers', () => {
  it('maps product to GA4 item', () => {
    const item = productToGa4Item(
      {
        id: 'p1',
        sku: 'SOAP-001',
        name: 'Industrial Soap',
        basePrice: 450,
        categories: [{ id: 'c1', name: 'Soaps' }],
      },
      { quantity: 2, price: 450 },
    );
    expect(item.item_id).toBe('SOAP-001');
    expect(item.item_name).toBe('Industrial Soap');
    expect(item.item_category).toBe('Soaps');
    expect(item.quantity).toBe(2);
    expect(sumItemValue([item])).toBe(900);
  });
});

describe('analytics dedupe', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('marks keys once', () => {
    expect(markOnce('purchase_ORD-1')).toBe(true);
    expect(markOnce('purchase_ORD-1')).toBe(false);
    expect(hasDedupeKey('purchase_ORD-1')).toBe(true);
    setDedupeKey('purchase_ORD-2');
    expect(hasDedupeKey('purchase_ORD-2')).toBe(true);
  });
});
