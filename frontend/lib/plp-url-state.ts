/**
 * PLP filter state ↔ URLSearchParams (shareable, back-button friendly).
 */

import type { ProductListQuery } from './api-client';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PlpFilterState = {
  page: number;
  search?: string;
  categoryIds: string[];
  /** Selected values per attribute filter code (e.g. brand, size, color). */
  facetAttr: Record<string, string[]>;
  minPrice?: number;
  maxPrice?: number;
};

function splitComma(s: string | null | undefined): string[] {
  if (!s?.trim()) return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseAttrJson(raw: string | null): Record<string, string[]> {
  if (!raw?.trim()) return {};
  try {
    const decoded = raw.includes('%') ? decodeURIComponent(raw) : raw;
    const o = JSON.parse(decoded) as unknown;
    if (!o || typeof o !== 'object' || Array.isArray(o)) return {};
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (!/^[a-z][a-z0-9_]{0,62}$/.test(k)) continue;
      if (Array.isArray(v)) out[k] = v.map(String).map((x) => x.trim()).filter(Boolean);
      else if (typeof v === 'string' && v.trim()) out[k] = splitComma(v);
    }
    return out;
  } catch {
    return {};
  }
}

export function parsePlpFilters(sp: URLSearchParams): PlpFilterState {
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
  const searchRaw = sp.get('search')?.trim();
  const search = searchRaw && searchRaw.length >= 2 ? searchRaw : undefined;
  const categoryIds = splitComma(sp.get('category')).filter((id) => UUID_RE.test(id));

  let facetAttr = parseAttrJson(sp.get('attr'));
  const legacyBrand = splitComma(sp.get('brand'));
  const legacySize = splitComma(sp.get('size'));
  if (legacyBrand.length) {
    facetAttr = { ...facetAttr, brand: [...new Set([...(facetAttr.brand ?? []), ...legacyBrand])] };
  }
  if (legacySize.length) {
    facetAttr = { ...facetAttr, size: [...new Set([...(facetAttr.size ?? []), ...legacySize])] };
  }

  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  const minS = sp.get('minPrice');
  const maxS = sp.get('maxPrice');
  if (minS != null && minS !== '') {
    const n = parseFloat(minS);
    if (Number.isFinite(n)) minPrice = n;
  }
  if (maxS != null && maxS !== '') {
    const n = parseFloat(maxS);
    if (Number.isFinite(n)) maxPrice = n;
  }

  return { page, search, categoryIds, facetAttr, minPrice, maxPrice };
}

export function serializePlpFilters(f: PlpFilterState): string {
  const p = new URLSearchParams();
  if (f.page > 1) p.set('page', String(f.page));
  if (f.search) p.set('search', f.search);
  if (f.categoryIds.length) p.set('category', f.categoryIds.join(','));
  const attrKeys = Object.keys(f.facetAttr).filter((k) => (f.facetAttr[k]?.length ?? 0) > 0);
  if (attrKeys.length > 0) {
    const slim: Record<string, string[]> = {};
    for (const k of attrKeys) slim[k] = f.facetAttr[k]!;
    p.set('attr', JSON.stringify(slim));
  }
  if (f.minPrice != null && Number.isFinite(f.minPrice)) p.set('minPrice', String(f.minPrice));
  if (f.maxPrice != null && Number.isFinite(f.maxPrice)) p.set('maxPrice', String(f.maxPrice));
  return p.toString();
}

export function plpStateToListQuery(f: PlpFilterState, limit = 12): ProductListQuery {
  const q: ProductListQuery = {
    page: f.page,
    limit,
    search: f.search,
  };
  if (f.categoryIds.length === 1) q.category = f.categoryIds[0];
  else if (f.categoryIds.length > 1) q.category = f.categoryIds.join(',');

  const attrKeys = Object.keys(f.facetAttr).filter((k) => (f.facetAttr[k]?.length ?? 0) > 0);
  if (attrKeys.length > 0) {
    const slim: Record<string, string[]> = {};
    for (const k of attrKeys) slim[k] = f.facetAttr[k]!;
    q.attr = JSON.stringify(slim);
  }

  if (f.minPrice != null && Number.isFinite(f.minPrice)) {
    q.minPrice = f.minPrice;
  }
  if (f.maxPrice != null && Number.isFinite(f.maxPrice)) {
    q.maxPrice = f.maxPrice;
  }
  if (q.minPrice != null && q.maxPrice != null) {
    const lo = Math.min(q.minPrice, q.maxPrice);
    const hi = Math.max(q.minPrice, q.maxPrice);
    q.minPrice = lo;
    q.maxPrice = hi;
  }
  return q;
}

export function plpStateToFacetQuery(f: PlpFilterState): ProductListQuery {
  return plpStateToListQuery({ ...f, page: 1 }, 12);
}

export function clonePlpFilters(f: PlpFilterState): PlpFilterState {
  const facetAttr: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(f.facetAttr)) {
    facetAttr[k] = [...v];
  }
  return {
    page: f.page,
    search: f.search,
    categoryIds: [...f.categoryIds],
    facetAttr,
    minPrice: f.minPrice,
    maxPrice: f.maxPrice,
  };
}
