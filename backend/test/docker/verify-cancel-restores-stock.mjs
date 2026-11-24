// End-to-end check: cancelling an order restores stock exactly once.
// Usage: bash deploy/docker/bugtest.sh up && bash deploy/docker/bugtest.sh run backend/test/docker/verify-cancel-restores-stock.mjs
const API = process.env.API ?? 'http://127.0.0.1:3200';
let token = '';
let failures = 0;

async function call(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

async function must(method, path, body) {
  const r = await call(method, path, body);
  if (r.status >= 300) throw new Error(`${method} ${path} -> ${r.status} ${JSON.stringify(r.json)}`);
  return r.json;
}

function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
}

const address = {
  firstName: 'Bug', lastName: 'Test', addressLine1: '1 Test Street', city: 'Karachi',
  state: 'Sindh', postalCode: '75000', country: 'PK', phone: '03001234567',
};

async function main() {
  const login = await must('POST', '/admin/auth/login', {
    email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD,
  });
  token = login.access_token;

  const run = Date.now();
  const product = await must('POST', '/admin/products', {
    sku: `BUGTEST-${run}`, name: `Bug test product ${run}`, type: 'configurable',
    basePrice: 500, status: 'active',
  });
  const variant = await must('POST', `/admin/products/${product.id}/variants`, {
    sku: `BUGTEST-${run}-V1`, name: 'Variant 1', price: 500,
  });
  await must('POST', '/admin/inventory/adjust', { variantId: variant.id, quantity: 10, reason: 'bugtest' });

  const stock = async () => {
    const s = await must('GET', `/admin/inventory/status?variantId=${variant.id}&warehouseId=default-warehouse`);
    return (s.data ?? s).quantity;
  };
  const createOrder = (qty) => must('POST', '/admin/orders/manual', {
    items: [
      { productId: product.id, variantId: variant.id, quantity: qty },
      { isCustom: true, title: 'Custom line', unitPrice: 100, quantity: 5 },
    ],
    customerEmail: 'bugtest@example.com', customerName: 'Bug Test',
    billingAddress: address, shippingAddress: address,
  });
  const setStatus = (id, status) => call('PUT', `/admin/orders/${id}/status`, { status });

  console.log(`stock at start: ${await stock()}`);

  // 1. Single cancel restores stock; custom line does not touch stock
  const o1 = await createOrder(3);
  check('order deducts stock', (await stock()) === 7, `stock=${await stock()}`);
  const c1 = await setStatus(o1.id, 'cancelled');
  check('cancel returns 200', c1.status === 200, `status=${c1.status}`);
  check('cancel restores stock to 10', (await stock()) === 10, `stock=${await stock()}`);

  // 2. Cancelling again does not restore twice
  await setStatus(o1.id, 'cancelled');
  check('second cancel does not double-restore', (await stock()) === 10, `stock=${await stock()}`);

  // 3. Reopening a cancelled order is blocked
  const reopen = await setStatus(o1.id, 'pending');
  check('reopen cancelled order rejected (400)', reopen.status === 400, `status=${reopen.status} ${JSON.stringify(reopen.json?.message)}`);
  check('stock unchanged after rejected reopen', (await stock()) === 10, `stock=${await stock()}`);

  // 4. Two simultaneous cancels restore once
  const o2 = await createOrder(2);
  check('second order deducts stock', (await stock()) === 8, `stock=${await stock()}`);
  const [a, b] = await Promise.all([setStatus(o2.id, 'cancelled'), setStatus(o2.id, 'cancelled')]);
  check('concurrent cancels restore once', (await stock()) === 10, `stock=${await stock()} responses=${a.status},${b.status}`);

  // 5. Non-cancel status changes still work
  const o3 = await createOrder(1);
  const p = await setStatus(o3.id, 'processing');
  check('normal status change still works', p.status === 200 && (await stock()) === 9, `status=${p.status} stock=${await stock()}`);

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error('ERROR', e.message); process.exit(2); });
