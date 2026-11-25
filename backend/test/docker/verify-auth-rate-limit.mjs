// End-to-end check: auth brute-force cap uses the real client IP.
// The bugtest API is reached from the Docker gateway (a private, trusted hop),
// so X-Forwarded-For plays the role Nginx plays in production.
// Usage: bash deploy/docker/bugtest.sh up && bash deploy/docker/bugtest.sh run backend/test/docker/verify-auth-rate-limit.mjs
const API = process.env.API ?? 'http://127.0.0.1:3200';
let failures = 0;

function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
}

const post = (path, xff, body) =>
  fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': xff },
    body: JSON.stringify(body),
  }).then((r) => r.status);

const bad = { email: 'nobody@example.com', password: 'wrong-password-1' };

async function main() {
  const a = '203.0.113.10';
  const first = [];
  for (let i = 0; i < 5; i++) first.push(await post('/admin/auth/login', a, bad));
  check('admin login: first 5 wrong attempts get 401', first.every((s) => s === 401), first.join(','));
  check('admin login: 6th attempt from same IP gets 429', (await post('/admin/auth/login', a, bad)) === 429);
  check('admin login: another IP is not blocked', (await post('/admin/auth/login', '203.0.113.20', bad)) === 401);
  check(
    'spoofed X-Forwarded-For cannot dodge the limit',
    (await post('/admin/auth/login', `198.51.100.7, ${a}`, bad)) === 429,
  );

  const c = '203.0.113.30';
  const cust = [];
  for (let i = 0; i < 6; i++) cust.push(await post('/auth/login', c, bad));
  check('customer login: 6th attempt gets 429', cust[5] === 429 && cust.slice(0, 5).every((s) => s !== 429), cust.join(','));

  const browse = await fetch(`${API}/products`, { headers: { 'X-Forwarded-For': a } }).then((r) => r.status);
  check('blocked IP can still browse the shop', browse === 200, `status ${browse}`);
}

main()
  .catch((e) => { console.error(e); failures++; })
  .finally(() => {
    console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
    process.exit(failures ? 1 : 0);
  });
