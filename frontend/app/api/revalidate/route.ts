import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { DEPLOY_CACHE_TAGS } from '@/lib/cache-tags';

export const dynamic = 'force-dynamic';

function isAuthorized(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ') && header.slice(7) === secret) {
    return true;
  }

  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  return querySecret === secret;
}

async function flushStorefrontCache() {
  for (const tag of DEPLOY_CACHE_TAGS) {
    // Immediate expire so the first post-deploy request is fresh (not SWR-stale).
    revalidateTag(tag, { expire: 0 });
  }
  // Invalidate the full App Router tree (pages + shared layout).
  revalidatePath('/', 'layout');
  revalidatePath('/sitemap.xml');
}

/**
 * On-demand cache flush used by deploy scripts after a new release.
 * POST /api/revalidate  Authorization: Bearer $REVALIDATE_SECRET
 */
export async function POST(request: Request) {
  if (!process.env.REVALIDATE_SECRET?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'REVALIDATE_SECRET is not configured' },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  await flushStorefrontCache();

  return NextResponse.json({
    ok: true,
    flushedAt: new Date().toISOString(),
    tags: DEPLOY_CACHE_TAGS,
    paths: ['/', '/sitemap.xml'],
  });
}

export async function GET(request: Request) {
  return POST(request);
}
