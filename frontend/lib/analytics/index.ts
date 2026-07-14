export type { Ga4PublicConfig, Ga4Item } from './types';
export { setAnalyticsConfig, getAnalyticsConfig, isAnalyticsActive, canTrack } from './gtag';
export * from './events';
export {
  cartItemToGa4Item,
  checkoutItemToGa4Item,
  productToGa4Item,
  catalogRetailerId,
} from './mappers';
