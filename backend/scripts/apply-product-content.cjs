/**
 * Apply backend/scripts/sm-nimco-product-content.json to live products via the admin API.
 *
 *   node backend/scripts/apply-product-content.cjs            # dry run: shows what would change, writes nothing
 *   node backend/scripts/apply-product-content.cjs --apply    # PATCHes each changed product, then re-reads it to verify
 *
 * Env: SMNIMCO_ADMIN_TOKEN (required for --apply), SMNIMCO_API_URL (default https://api.smnimco.com)
 * Optional: --only=slug1,slug2 to limit to some products.
 * Rollback: backups/live-products-before-content-fix-2026-11-25.json holds the previous values.
 */
const path = require('path');

const API = (process.env.SMNIMCO_API_URL || 'https://api.smnimco.com').replace(/\/$/, '');
const TOKEN = process.env.SMNIMCO_ADMIN_TOKEN;
const APPLY = process.argv.includes('--apply');
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const ONLY = onlyArg ? new Set(onlyArg.slice(7).split(',')) : null;

const FIELDS = [
  'shortDescription', 'description', 'seoTitle', 'metaDescription', 'tasteProfile', 'ingredients',
  'servingSuggestions', 'storageInstructions', 'dietaryHighlights', 'spiceLevel', 'focusKeywords',
  'productTags', 'faqs',
];
const SPICE = ['Mild', 'Medium', 'Hot', 'Extra Hot'];

const content = require(path.join(__dirname, 'sm-nimco-product-content.json')).products;

function validate(p) {
  const errs = [];
  for (const f of FIELDS) if (typeof p[f] !== 'string' || !p[f].trim()) errs.push(`${f} empty`);
  if (p.spiceLevel && !SPICE.includes(p.spiceLevel)) errs.push(`spiceLevel "${p.spiceLevel}" not in admin dropdown`);
  for (const line of (p.faqs || '').split('\n')) if (line.split('|').length !== 2) errs.push(`bad FAQ line: ${line}`);
  return errs;
}

async function api(method, url, body) {
  const res = await fetch(API + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

const short = (v) => (v == null ? '∅' : String(v).replace(/\n/g, ' / ').slice(0, 70));

async function main() {
  if (APPLY && !TOKEN) throw new Error('Set SMNIMCO_ADMIN_TOKEN to apply changes.');

  // shortcut: public list caps at 100 per page; catalog has 44, paginate if it ever exceeds 100.
  const live = (await api('GET', '/products?limit=100')).data;
  const byId = new Map(live.map((p) => [p.id, p]));

  const plan = [];
  let invalid = 0;
  for (const p of content) {
    if (ONLY && !ONLY.has(p.slug)) continue;
    const cur = byId.get(p.id);
    // Refuse to write if the id no longer points at the product we wrote content for.
    if (!cur) { console.log(`✗ ${p.name}: id ${p.id} not found live, skipped`); invalid++; continue; }
    if (cur.name !== p.name || cur.slug !== p.slug) {
      console.log(`✗ ${p.name}: live is now "${cur.name}" (${cur.slug}), skipped`); invalid++; continue;
    }
    const errs = validate(p);
    if (errs.length) { console.log(`✗ ${p.name}: ${errs.join('; ')}`); invalid++; continue; }

    const patch = {};
    for (const f of FIELDS) if ((cur[f] ?? '') !== p[f]) patch[f] = p[f];
    if (Object.keys(patch).length) plan.push({ p, cur, patch });
  }

  for (const { p, cur, patch } of plan) {
    console.log(`\n● ${p.name} (${p.slug}) — ${Object.keys(patch).length} field(s)`);
    for (const f of Object.keys(patch)) console.log(`   ${f}:\n     - ${short(cur[f])}\n     + ${short(patch[f])}`);
  }
  console.log(`\n${plan.length} product(s) to update, ${invalid} skipped as invalid.`);

  if (!APPLY) { console.log('Dry run only. Re-run with --apply to write.'); return; }

  let ok = 0, failed = 0;
  for (const { p, patch } of plan) {
    try {
      await api('PATCH', `/admin/products/${p.id}`, patch);
      const after = await api('GET', `/admin/products/${p.id}`);
      const wrong = Object.keys(patch).filter((f) => after[f] !== patch[f]);
      if (wrong.length) throw new Error(`verify failed for ${wrong.join(', ')}`);
      console.log(`✓ ${p.name}`); ok++;
    } catch (e) {
      console.log(`✗ ${p.name}: ${e.message}`); failed++;
    }
  }
  console.log(`\nDone: ${ok} updated, ${failed} failed.`);
  if (failed) process.exitCode = 1;
}

main().catch((e) => { console.error(e.message); process.exit(1); });
