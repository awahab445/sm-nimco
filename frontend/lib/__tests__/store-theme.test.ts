import { STORE_THEME_IDS, getStoreThemeId, type StoreThemeId } from '../store-theme';

describe('store-theme', () => {
  it('exposes a fixed set of theme ids', () => {
    expect(STORE_THEME_IDS).toEqual(['default', 'ocean', 'ember', 'mehfil_shereen']);
  });

  it('getStoreThemeId returns a valid id', () => {
    const id = getStoreThemeId();
    expect(STORE_THEME_IDS).toContain(id);
  });

  it('StoreThemeId matches the id list', () => {
    const _check: StoreThemeId = STORE_THEME_IDS[0];
    expect(_check).toBeDefined();
  });
});
