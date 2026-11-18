// End-to-end check: TikTok catalog scheduled data feed.
// - GET /tiktok-catalog.xml is public, XML, and identical to /meta-catalog.xml
// - an active variant with an image appears keyed by its SKU
// Usage: bash deploy/docker/bugtest.sh up && bash deploy/docker/bugtest.sh run backend/test/docker/verify-tiktok-catalog-feed.mjs
const API = process.env.API ?? 'http://127.0.0.1:3200';
let failures = 0;

function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
}

async function main() {
  const login = await fetch(`${API}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
  }).then((r) => r.json());
  const admin = async (path, body) => {
    const res = await fetch(API + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.access_token}` },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (res.status >= 300) throw new Error(`POST ${path} -> ${res.status} ${JSON.stringify(json)}`);
    return json;
  };

  const run = Date.now();
  const sku = `TTCAT-${run}-V1`;
  const product = await admin('/admin/products', {
    sku: `TTCAT-${run}`, name: `TikTok feed test ${run}`, type: 'configurable', basePrice: 250, status: 'active',
  });
  const variant = await admin(`/admin/products/${product.id}/variants`, { sku, name: '1 Ltr', price: 250 });
  await admin(`/admin/products/${product.id}/images`, { url: '/uploads/tt-test.jpg', isPrimary: true });
  await admin('/admin/inventory/adjust', { variantId: variant.id, quantity: 5, reason: 'tiktok-feed-test' });

  const tt = await fetch(`${API}/tiktok-catalog.xml`);
  const ttBody = await tt.text();
  const meta = await fetch(`${API}/meta-catalog.xml`).then((r) => r.text());

  check('tiktok feed is public 200', tt.status === 200, `status ${tt.status}`);
  check('tiktok feed is XML', (tt.headers.get('content-type') ?? '').includes('application/xml'));
  check('variant appears keyed by SKU', ttBody.includes(`<g:id>${sku}</g:id>`));
  check('in stock + PKR price', ttBody.includes('<g:availability>in stock</g:availability>') && ttBody.includes('<g:price>250.00 PKR</g:price>'));
  check('identical to Meta feed', ttBody === meta);
}

main()
  .catch((e) => { console.error(e); failures++; })
  .finally(() => {
    console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
    process.exit(failures ? 1 : 0);
  });
