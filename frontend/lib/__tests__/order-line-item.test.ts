import {
  getOrderItemProductName,
  getOrderItemVariantSubtitle,
} from '../order-line-item';

describe('order-line-item', () => {
  it('uses product name instead of legacy variant heading', () => {
    expect(
      getOrderItemProductName({
        name: 'Pack: 1Bottle',
        productName: '777 Sony Dish Wash Soap',
      }),
    ).toBe('777 Sony Dish Wash Soap');
  });

  it('formats variant options without raw object strings', () => {
    expect(
      getOrderItemVariantSubtitle({
        name: 'Pack: 1Bottle',
        productName: '777 Sony Dish Wash Soap',
        attributes: {
          optionValues: { pack: '1Bottle' },
          optionValueIds: { pack: 'uuid-here' },
        },
      }),
    ).toBe('Pack: 1Bottle');
  });

  it('falls back to legacy variant name when attributes are empty', () => {
    expect(
      getOrderItemVariantSubtitle({
        name: 'Pack: 1Bottle',
        productName: '777 Sony Dish Wash Soap',
        attributes: {},
      }),
    ).toBe('Pack: 1Bottle');
  });
});
