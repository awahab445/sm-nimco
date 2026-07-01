# GA4 Enhanced Ecommerce — QA Checklist

Use this checklist after deploying analytics settings or changing event wiring.

## Prerequisites

1. GA4 property with a **Web** data stream.
2. Admin → **Analytics**: set Measurement ID (`G-XXXXXXXXXX`), enable **Debug mode**, save, then **Enable tracking**.
3. Restart storefront if env/config was cached.

## DebugView walkthrough

Open GA4 → **Admin** → **DebugView**. Complete this journey in order:

| Step | Action | Expected event |
|------|--------|----------------|
| 1 | Visit `/products` | `view_item_list` |
| 2 | Open a product PDP | `view_item` |
| 3 | Add to cart | `add_to_cart` |
| 4 | Open `/cart` | `view_cart` |
| 5 | Start checkout | `begin_checkout` |
| 6 | Select shipping + place order | `add_shipping_info`, `add_payment_info` |
| 7 | Land on `/checkout/success` | `purchase` with `transaction_id` = order number |
| 8 | Refresh success page | No duplicate `purchase` |
| 9 | Submit **Track order** form | `track_order_submit` |

## Realtime verification

GA4 → **Reports** → **Realtime**. Confirm event names appear within ~30 seconds (disable debug mode for production-like traffic).

## Production checklist

- [ ] `isEnabled=true` only on production GA4 property
- [ ] `debugMode=false` in production
- [ ] CSP allows `googletagmanager.com` and `google-analytics.com`
- [ ] View page source: no GA script when tracking disabled
- [ ] `purchase` dedupe: refresh success page does not double-count
- [ ] Compare GA4 revenue vs order DB for a sample day

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No events | Admin enabled? Valid `G-` ID? Browser ad-blocker? |
| 401 on config | Backend running; `/storefront/analytics-config` returns 200 |
| CSP errors in console | `frontend/next.config.ts` script/connect-src |
| Duplicate purchases | `sessionStorage` key `ga4_dedupe_purchase_*` |
