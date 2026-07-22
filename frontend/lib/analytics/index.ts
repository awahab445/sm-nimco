export type { Ga4PublicConfig, Ga4Item } from './types';
export { setAnalyticsConfig, getAnalyticsConfig, isAnalyticsActive, canTrack } from './gtag';
export * from './events';
export {
  cartItemToGa4Item,
  checkoutItemToGa4Item,
  productToGa4Item,
  catalogRetailerId,
  isCatalogUuid,
} from './mappers';
export {
  metaCapiClientFields,
  addToCartEventId,
  beginCheckoutEventId,
  purchaseEventId,
  metaMatchUserToPixelData,
} from './meta-capi-client';
export type { MetaMatchUser, MetaPixelUserData } from './meta-capi-client';
