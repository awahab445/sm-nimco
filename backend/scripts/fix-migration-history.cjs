#!/usr/bin/env node
/**
 * Fix Prisma P3009 / migration drift on local dev databases.
 *
 * Usage:
 *   cd backend && npm run prisma:fix-migrations
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const MIGRATIONS_DIR = path.join(BACKEND_ROOT, 'prisma', 'migrations');
const ENV_PATH = path.join(BACKEND_ROOT, '.env');

function run(cmd, args, { ignoreError = false } = {}) {
  const result = spawnSync(cmd, args, {
    cwd: BACKEND_ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  if (result.status !== 0 && !ignoreError) {
    process.exit(result.status ?? 1);
  }
  return result.status === 0;
}

function prisma(args, options) {
  return run('npx', ['prisma', ...args], options);
}

function loadDatabaseUrl() {
  if (!fs.existsSync(ENV_PATH)) return null;
  const text = fs.readFileSync(ENV_PATH, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^DATABASE_URL=(.*)$/);
    if (!match) continue;
    let value = match[1].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }
  return null;
}

function listFailedMigrations(databaseUrl) {
  const result = spawnSync(
    'psql',
    [databaseUrl, '-tAc', 'SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NULL AND rolled_back_at IS NULL;'],
    { cwd: BACKEND_ROOT, encoding: 'utf8', shell: process.platform === 'win32' },
  );
  if (result.status !== 0 || !result.stdout) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

if (!fs.existsSync(ENV_PATH)) {
  console.error('Missing backend/.env — copy from .env.example first.');
  process.exit(1);
}

console.log('=== migrate status (before) ===');
prisma(['migrate', 'status'], { ignoreError: true });

console.log('\n=== Step 1: Resolve failed migrations ===');
prisma(
  ['migrate', 'resolve', '--rolled-back', '20250308000000_add_customer_password_hash'],
  { ignoreError: true },
);

const databaseUrl = loadDatabaseUrl();
if (databaseUrl) {
  const failed = listFailedMigrations(databaseUrl);
  for (const name of failed) {
    console.log(`  rolled back: ${name}`);
    prisma(['migrate', 'resolve', '--rolled-back', name], { ignoreError: true });
  }
}

console.log('\n=== Step 2: Baseline repo migrations as applied ===');
console.log('(Use when tables/columns already exist — e.g. after restore or db push.)');
if (fs.existsSync(MIGRATIONS_DIR)) {
  for (const name of fs.readdirSync(MIGRATIONS_DIR).sort()) {
    const dir = path.join(MIGRATIONS_DIR, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    const ok = prisma(['migrate', 'resolve', '--applied', name], { ignoreError: true });
    console.log(ok ? `  applied: ${name}` : `  skip: ${name}`);
  }
}

console.log('\n=== Step 3: Sync schema drift ===');
prisma(['db', 'push', '--accept-data-loss']);

console.log('\n=== migrate status (after) ===');
prisma(['migrate', 'status'], { ignoreError: true });

console.log('\nDone. Start backend: npm run start:dev');
