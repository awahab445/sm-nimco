// End-to-end check: TikTok Pixel settings + Events API wiring.
// - migration applied & admin can save/validate the TikTok pixel id
// - public storefront config exposes tiktokPixelId/Enabled
// - cart add + checkout start accept the new `ttp` / `ttclid` body fields
//   (ValidationPipe uses forbidNonWhitelisted, so a missing DTO field would 400)
// Usage: bash deploy/docker/bugtest.sh up && bash deploy/docker/bugtest.sh run backend/test/docker/verify-tiktok-pixel-events-api.mjs
const API = process.env.API ?? 'http://127.0.0.1:3200';
let token = '';
let failures = 0;

async function call(method, path, body, auth = true) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

async function must(method, path, body, auth) {
  const r = await call(method, path, body, auth);
  if (r.status >= 300) throw new Error(`${method} ${path} -> ${r.status} ${JSON.stringify(r.json)}`);
  return r.json;
}

function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
}

const PIXEL = 'C4A1B2C3D4E5F6G7H8I9';

async function main() {
  const login = await must('POST', '/admin/auth/login', {
    email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD,
  });
  token = login.access_token;

  const bad = await call('PATCH', '/admin/analytics/ga4', { tiktokPixelId: 'bad id!' });
  check('invalid TikTok pixel id rejected', bad.status === 400, `status ${bad.status}`);

  const noId = await call('PATCH', '/admin/analytics/ga4', { tiktokPixelId: null, tiktokPixelEnabled: true });
  check('cannot enable TikTok without an id', noId.status === 400, `status ${noId.status}`);

  const saved = await must('PATCH', '/admin/analytics/ga4', {
    tiktokPixelId: PIXEL, tiktokPixelEnabled: true,
  });
  const s = saved.data ?? saved;
  check('admin saves TikTok pixel', s.tiktokPixelId === PIXEL && s.tiktokPixelEnabled === true);

  const pub = await must('GET', '/storefront/analytics-config', undefined, false);
  const c = pub.data ?? pub;
  check('public config exposes TikTok pixel', c.tiktokPixelId === PIXEL && c.tiktokPixelEnabled === true);

  // Fixtures for cart/checkout (fresh DB has no default customer group).
  const run = Date.now();
  await call('POST', '/admin/customer-groups', { name: `Default ${run}`, isDefault: true });
  const product = await must('POST', '/admin/products', {
    sku: `TTTEST-${run}`, name: `TikTok test ${run}`, type: 'configurable', basePrice: 500, status: 'active',
  });
  const variant = await must('POST', `/admin/products/${product.id}/variants`, {
    sku: `TTTEST-${run}-V1`, name: 'Variant 1', price: 500,
  });
  await must('POST', '/admin/inventory/adjust', { variantId: variant.id, quantity: 10, reason: 'tiktok-test' });

  const cart = await must('POST', '/cart', {}, false);
  const cartId = cart.id ?? cart.cartId ?? cart.data?.id;
  const tracking = { ttp: 'ttp.test-cookie', ttclid: 'E.C.P.test-click' };

  const atc = await call('POST', `/cart/${cartId}/items`, {
    productId: product.id, variantId: variant.id, quantity: 2, // min order is Rs. 800
    eventId:`atc_${cartId}_${variant.id}_${run}`, ...tracking,
  }, false);
  check('add-to-cart accepts ttp/ttclid', atc.status < 300, `status ${atc.status} ${atc.status >= 300 ? JSON.stringify(atc.json) : ''}`);

  const start = await call('POST', '/checkout/start', {
    cartId, customerEmail: 'tiktok-test@bugtest.dev', ...tracking,
  }, false);
  check('checkout start accepts ttp/ttclid', start.status < 300, `status ${start.status} ${start.status >= 300 ? JSON.stringify(start.json) : ''}`);

  const unknown = await call('POST', `/cart/${cartId}/items`, {
    productId: product.id, variantId: variant.id, quantity: 1, notAField: 'x',
  }, false);
  check('unknown body fields still rejected (whitelist intact)', unknown.status === 400, `status ${unknown.status}`);

  // Leave tracking off so the throwaway stack never posts to TikTok.
  await must('PATCH', '/admin/analytics/ga4', { tiktokPixelEnabled: false });

  console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
