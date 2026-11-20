import type { Product } from '../api-client';
import { isOwnBrandName, listBrands } from '../brands/brand-config';
import { STORE_NAME } from '../config';
import { buildBrandLd, buildProductLd } from '../seo/schemas';

const product = (brand?: string): Product =>
  ({
    id: 'p1',
    sku: 'SKU1',
    name: 'Test',
    slug: 'test',
    type: 'simple',
    basePrice: 100,
    status: 'active',
    attributes: brand ? { brand, size: '1L' } : {},
  }) as Product;

describe('own vs third-party brands', () => {
  it('recognises the own range regardless of case/punctuation', () => {
    expect(isOwnBrandName('M. ESSA CHEMICALS')).toBe(true);
    expect(isOwnBrandName('m essa chemicals')).toBe(true);
    expect(isOwnBrandName('Viva')).toBe(false);
    expect(isOwnBrandName('')).toBe(false);
  });

  it('third-party brand pages never match store-name products', () => {
    for (const brand of listBrands().filter((b) => !b.ownBrand)) {
      expect(brand.filterValues).not.toContain(STORE_NAME);
    }
  });

  it('claims manufacturer only for own products', () => {
    const own = buildProductLd(product('M. Essa Chemicals'));
    expect(own.manufacturer).toBeDefined();
    expect(own.additionalProperty).toEqual([{ '@type': 'PropertyValue', name: 'size', value: '1L' }]);

    const viva = buildProductLd(product('Viva'));
    expect(viva.brand).toEqual({ '@type': 'Brand', name: 'Viva' });
    expect(viva.manufacturer).toBeUndefined();

    const untagged = buildProductLd(product());
    expect(untagged.manufacturer).toBeUndefined();
    expect(untagged.brand).toBeUndefined();
  });

  it('brand pages link a parent organization only for the own range', () => {
    expect(buildBrandLd({ name: 'Viva', slug: 'viva' }).parentOrganization).toBeUndefined();
    expect(buildBrandLd({ name: 'Own', slug: 'own', ownBrand: true }).parentOrganization).toBeDefined();
  });
});
