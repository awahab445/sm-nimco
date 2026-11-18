# Settings & Analytics

Site config (logo, announcement, WhatsApp widget, social links), store settings (theme, order/shipping thresholds), and analytics (GA4, GTM, Meta Pixel + CAPI, TikTok Pixel + Events API).

## Code

| App | Location |
|-----|----------|
| Backend | `backend/src/site-config/` (`site-config.service.ts`, `social-links.service.ts`), `backend/src/store-settings/` (`store-settings.service.ts`, `constants/themes.ts`), `backend/src/analytics/` (`analytics-settings.service.ts`), `common/services/{capi,tiktok-events}.service.ts`, `common/utils/{capi-request,meta-capi-client}.util.ts` |
| Admin | `app/(app)/settings/{site-config,store,theme}/`, `app/(app)/analytics/`, `components/settings/` (`site-config-form.tsx`, `social-links-form.tsx`, `store-order-settings-form.tsx`, `theme-selector.tsx`), `components/analytics/ga4-settings-form.tsx`, `lib/api/{site-config,social-links,store-settings,theme,analytics}.ts` |
| Storefront | `components/layout/{header,footer,announcement-bar}.tsx`, `components/whatsapp-widget.tsx`, `components/themes/`, `lib/theme/`, `lib/store-theme.ts`, `styles/store-themes.css`, `components/analytics/` (`meta-pixel.tsx`, `tiktok-pixel.tsx`, …), `lib/analytics/` (`gtag.ts`, `fbq.ts`, `ttq.ts`, `meta-capi-client.ts`, `events.ts`, `dedupe.ts`), `lib/storefront-events.ts` |
| Docs | `docs/analytics-ga4-qa.md` (GA4 QA checklist), `docs/UI-UX-Standards.md` |

## API

| Route | Auth |
|-------|------|
| `GET /settings/site-config`, `/settings/social-links`, `/settings/store`, `/settings/theme` | public |
| `GET/PATCH /admin/settings/site-config`, `GET/PUT /admin/settings/social-links`, `GET/PATCH /admin/settings/store` | `settings.manage` |
| `PATCH /settings/theme` | `settings.manage` |
| `GET /storefront/analytics-config`, `POST /storefront/analytics/pageview` | public |
| `GET/PATCH /admin/analytics/ga4`, `POST toggle` | `analytics.manage` |

## Data

Singleton rows with `id = 'default'`: `site_config`, `store_settings` (`current_theme`, `minimum_order_amount` default 800, `free_delivery_threshold` default 2000, `shipping_gst_percentage` default 18, `shipping_zone_config`), `analytics_ga4_settings` (incl. `meta_pixel_id/enabled`, `tiktok_pixel_id/enabled`). Plus `social_links`.

## Gotchas

- Store settings are read by checkout (minimum order) and shipping (free delivery, GST, zone config). Changing them affects totals immediately.
- Storefront caches theme/analytics for 60s (tags `theme`, `analytics`).
- **TikTok Pixel (browser)** fires `ViewContent`, `AddToCart`, `InitiateCheckout`, `AddPaymentInfo`, `CompletePayment`, `Search`, `CompleteRegistration` and SPA `page()` next to the matching Meta events. It reuses Meta's `event_id`s (`atc_…`, `begin_checkout_…`, `purchase_…`) and the same per-category event toggles as GA4/Meta. `ttq.identify` sends email, phone (E.164; local `03xx` becomes `+92…`) and external_id, **SHA-256 hashed in the browser** (`hashTikTokIdentify`), as TikTok requires. Plain values trigger the "Email address is invalid" diagnostic, and without SubtleCrypto (non-HTTPS) identify is skipped, never sent as plain text. CSP allows `analytics.tiktok.com` (`frontend/next.config.ts`).
- **TikTok Events API (server)**: `TikTokEventsService` posts to `business-api.tiktok.com/open_api/v1.3/event/track/`. `CapiService.enqueue` forwards every Meta CAPI event to it, so cart add (`AddToCart`), checkout start (`InitiateCheckout`) and checkout confirm (`CompletePayment`) go to both platforms with the same `event_id`, and TikTok dedupes them against the pixel. PageView is **not** sent server-side, because `ttq.page()` has no event_id to dedupe against. It needs the admin TikTok Pixel enabled plus env `TIKTOK_EVENTS_API_ACCESS_TOKEN`; it is silently skipped when the token is unset. Optional `TIKTOK_EVENTS_API_TEST_EVENT_CODE` routes events to Events Manager → Test Events. Email/phone/external_id are SHA-256 hashed server-side. IP/UA come from the request. `ttp` (`_ttp` cookie) and `ttclid` (captured from the landing URL into a first-party `ttclid` cookie, 30 days) come from the cart/checkout body (`ttp`, `ttclid` DTO fields), falling back to request cookies.
- **TikTok catalog**: TikTok Catalog Manager uses a scheduled data feed at `GET /tiktok-catalog.xml` ([catalog.md](./catalog.md)), so its SKU IDs match the pixel/Events API `content_id`.
- Brand colour tokens live only in `frontend/tailwind.config.ts` (see `.cursorrules`).

## Tests

None.
