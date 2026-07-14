import {
  catalogRetailerId,
  productToGa4Item,
  cartItemToGa4Item,
  checkoutItemToGa4Item,
  sumItemValue,
} from '../analytics/mappers';
import { markOnce, hasDedupeKey, setDedupeKey } from '../analytics/dedupe';

describe('analytics mappers', () => {
  it('maps product to GA4 item using product SKU', () => {
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

  it('prefers variant SKU over product SKU for catalog matching', () => {
    const item = productToGa4Item(
      {
        id: 'uuid-product',
        sku: 'PARENT-SKU',
        name: 'Configurable',
        basePrice: 100,
      },
      { variantSku: 'VARIANT-SKU', quantity: 1 },
    );
    expect(item.item_id).toBe('VARIANT-SKU');
  });

  it('maps cart items to catalog SKU not UUID', () => {
    const item = cartItemToGa4Item({
      variantId: 'uuid-variant',
      productId: 'uuid-product',
      quantity: 1,
      price: 200,
      currency: 'PKR',
      attributes: {},
      reservationId: 'r1',
      addedAt: new Date().toISOString(),
      sku: 'CART-SKU',
      productSku: 'PARENT-SKU',
      productName: 'Cart Product',
    });
    expect(item.item_id).toBe('CART-SKU');
  });

  it('maps checkout items to catalog SKU', () => {
    const item = checkoutItemToGa4Item({
      variantId: 'uuid-variant',
      productId: 'uuid-product',
      quantity: 2,
      price: 150,
      currency: 'PKR',
      attributes: {},
      reservationId: 'r1',
      sku: 'CHECKOUT-SKU',
      productName: 'Checkout Product',
    });
    expect(item.item_id).toBe('CHECKOUT-SKU');
  });

  it('catalogRetailerId never prefers empty strings', () => {
    expect(
      catalogRetailerId({
        variantSku: '  ',
        productSku: 'PROD',
        fallbackId: 'uuid',
      }),
    ).toBe('PROD');
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
