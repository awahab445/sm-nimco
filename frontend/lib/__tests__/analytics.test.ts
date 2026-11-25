import {
  catalogRetailerId,
  isCatalogUuid,
  productToGa4Item,
  cartItemToGa4Item,
  checkoutItemToGa4Item,
  orderLineToGa4Item,
  sumItemValue,
} from '../analytics/mappers';
import { markOnce, hasDedupeKey, setDedupeKey } from '../analytics/dedupe';
import { hashTikTokIdentify, toTikTokIdentify, ttContentFromItems } from '../analytics/ttq';
import {
  metaMatchUserToPixelData,
  resolveMetaMatchUser,
} from '../analytics/meta-capi-client';
import {
  setGuestMatchPhone,
  setGuestOrderEmail,
} from '../guest-order-session';

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

  it('never falls back to product UUID when SKU is missing', () => {
    const item = productToGa4Item(
      {
        id: 'fdf241e4-b0d0-456e-8da6-eef5c1124666',
        sku: '',
        name: 'No SKU Product',
        basePrice: 10,
      },
      { quantity: 1 },
    );
    expect(item.item_id).toBe('');
    expect(isCatalogUuid('fdf241e4-b0d0-456e-8da6-eef5c1124666')).toBe(true);
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

  it('maps cart items without sku to empty id (not productId UUID)', () => {
    const item = cartItemToGa4Item({
      variantId: 'fdf241e4-b0d0-456e-8da6-eef5c1124666',
      productId: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
      quantity: 1,
      price: 200,
      currency: 'PKR',
      attributes: {},
      reservationId: 'r1',
      addedAt: new Date().toISOString(),
      productName: 'Cart Product',
    });
    expect(item.item_id).toBe('');
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

  it('maps order lines with Decimal-like unitPrice and SKU', () => {
    const item = orderLineToGa4Item({
      sku: 'SKU-019-LONG-BAR',
      name: 'Long Bar',
      unitPrice: { toNumber: () => 1850 },
      quantity: 2,
    });
    expect(item.item_id).toBe('SKU-019-LONG-BAR');
    expect(item.price).toBe(1850);
    expect(sumItemValue([item])).toBe(3700);
  });

  it('derives unit price from rowTotal when unitPrice is missing', () => {
    const item = orderLineToGa4Item({
      sku: 'SKU-014-1BOTTLE',
      name: 'Bottle',
      rowTotal: '300.00',
      quantity: 2,
    });
    expect(item.price).toBe(150);
  });

  it('catalogRetailerId never prefers empty strings or UUIDs', () => {
    expect(
      catalogRetailerId({
        variantSku: '  ',
        productSku: 'PROD',
        fallbackId: 'fdf241e4-b0d0-456e-8da6-eef5c1124666',
      }),
    ).toBe('PROD');
    expect(
      catalogRetailerId({
        variantSku: 'fdf241e4-b0d0-456e-8da6-eef5c1124666',
        productSku: 'SKU-014-1BOTTLE',
      }),
    ).toBe('SKU-014-1BOTTLE');
  });
});

describe('meta match user', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('maps logged-in profile fields for Pixel Advanced Matching', () => {
    const user = resolveMetaMatchUser({
      id: 'cust-1',
      email: 'Ali@Example.com',
      phone: '+92 300 1234567',
      firstName: 'Ali',
      lastName: 'Khan',
    });
    expect(metaMatchUserToPixelData(user)).toEqual({
      em: 'ali@example.com',
      ph: '923001234567',
      fn: 'ali',
      ln: 'khan',
      external_id: 'cust-1',
    });
  });

  it('falls back to persisted guest email and phone', () => {
    setGuestOrderEmail('guest@example.com');
    setGuestMatchPhone('03001234567');
    expect(resolveMetaMatchUser(null)).toEqual({
      email: 'guest@example.com',
      phone: '03001234567',
    });
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

describe('tiktok pixel payloads', () => {
  it('maps match data to ttq.identify fields', () => {
    expect(
      toTikTokIdentify({ em: ' Ali@Example.com ', ph: '+92 300 1234567', external_id: 'cust-1', fn: 'ali' }),
    ).toEqual({ email: 'ali@example.com', phone_number: '+923001234567', external_id: 'cust-1' });
    expect(toTikTokIdentify({})).toBeNull();
    expect(toTikTokIdentify({ ph: '0300-1234567' })).toEqual({ phone_number: '+923001234567' });
  });

  it('SHA-256 hashes identify fields client-side (TikTok requirement)', async () => {
    // jsdom lacks Web Crypto; browsers on HTTPS provide it natively.
    const { webcrypto } = await import('node:crypto');
    const { TextEncoder } = await import('node:util');
    Object.assign(globalThis, { TextEncoder });
    Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
    const hashed = await hashTikTokIdentify({ em: ' Ali@Example.com ', ph: '03001234567' });
    // sha256('ali@example.com') / sha256('+923001234567')
    expect(hashed).toEqual({
      email: '9d86ec2b59bb107bf110722c28601160b33aee06109ad44a5404231287b5fd29',
      phone_number: 'e422fcdcdca08ddd52cb07d33fae3617e5dc5f0ea6bcbfac1506754d045678fc',
    });
  });

  it('builds contents from SKUs only and sums value', () => {
    const payload = ttContentFromItems(
      [
        { item_id: 'SKU-1', item_name: 'Soap', price: 100, quantity: 2 },
        { item_id: 'fdf241e4-b0d0-456e-8da6-eef5c1124666', item_name: 'X', price: 50, quantity: 1 },
      ],
      'PKR',
    );
    expect(payload.contents).toEqual([
      { content_id: 'SKU-1', content_type: 'product', content_name: 'Soap', quantity: 2, price: 100 },
    ]);
    expect(payload.value).toBe(200);
    expect(payload.currency).toBe('PKR');
  });
});
