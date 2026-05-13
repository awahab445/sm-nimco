'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchFilterBrowseTree,
  syncFilterBrowseTreeFromNavigation,
  updateFilterBrowseTreeNode,
  reorderFilterBrowseTree,
  type FilterBrowseTreeNodeRow,
} from '@/lib/api/store-filters';
import { formatApiError } from '@/lib/api/error-message';

type TreeNode = FilterBrowseTreeNodeRow & { children: TreeNode[] };

function buildTree(flat: FilterBrowseTreeNodeRow[]): TreeNode[] {
  const byParent = new Map<string | null, FilterBrowseTreeNodeRow[]>();
  for (const row of flat) {
    const key = row.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(row);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const walk = (parentId: string | null): TreeNode[] =>
    (byParent.get(parentId) ?? []).map((row) => ({ ...row, children: walk(row.id) }));
  return walk(null);
}

function flattenWithDepth(nodes: TreeNode[], depth = 0): Array<{ node: TreeNode; depth: number }> {
  const out: Array<{ node: TreeNode; depth: number }> = [];
  for (const n of nodes) {
    out.push({ node: n, depth });
    out.push(...flattenWithDepth(n.children, depth + 1));
  }
  return out;
}

type Props = {
  filterId: string;
  filterName: string;
};

export function StoreFilterBrowseTree({ filterId, filterName }: Props) {
  const [rows, setRows] = useState<FilterBrowseTreeNodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchFilterBrowseTree(filterId));
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterId]);

  useEffect(() => {
    void load();
  }, [load]);

  const tree = useMemo(() => buildTree(rows), [rows]);
  const flat = useMemo(() => flattenWithDepth(tree), [tree]);

  async function handleSync() {
    setSyncing(true);
    setError(null);
    try {
      setRows(await syncFilterBrowseTreeFromNavigation(filterId));
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSyncing(false);
    }
  }

  async function toggleActive(node: TreeNode) {
    try {
      await updateFilterBrowseTreeNode(node.id, { isActive: !node.isActive });
      await load();
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  async function moveNode(node: TreeNode, direction: -1 | 1) {
    const siblings = rows
      .filter((r) => r.parentId === node.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = siblings.findIndex((s) => s.id === node.id);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= siblings.length) return;
    const a = siblings[idx]!;
    const b = siblings[swapIdx]!;
    try {
      await reorderFilterBrowseTree([
        { id: a.id, parentId: a.parentId, sortOrder: b.sortOrder },
        { id: b.id, parentId: b.parentId, sortOrder: a.sortOrder },
      ]);
      await load();
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">PLP browse tree — {filterName}</p>
          <p className="mt-1 max-w-2xl text-xs text-zinc-600 dark:text-zinc-400">
            Side navigation on the products page. Sync from <strong>Store navigation</strong> (mega menu) to mirror
            hierarchy, then enable/disable or reorder items here without changing the header menu.
          </p>
        </div>
        <button
          type="button"
          disabled={syncing}
          onClick={() => void handleSync()}
          className="shrink-0 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium dark:border-zinc-600 dark:bg-zinc-950"
        >
          {syncing ? 'Syncing…' : 'Sync from Store navigation'}
        </button>
      </div>

      {error ? <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p> : null}

      {loading ? (
        <p className="mt-4 text-xs text-zinc-500">Loading browse tree…</p>
      ) : flat.length === 0 ? (
        <p className="mt-4 text-xs text-zinc-500">
          No browse items yet. Configure the mega menu under Store navigation, then click Sync.
        </p>
      ) : (
        <ul className="mt-4 space-y-1">
          {flat.map(({ node, depth }) => {
            const label = node.navLink?.label ?? '—';
            const slug = node.navLink?.category?.slug;
            return (
              <li
                key={node.id}
                className="flex flex-wrap items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-zinc-200 dark:hover:border-zinc-700"
                style={{ paddingLeft: `${8 + depth * 16}px` }}
              >
                <span className="min-w-0 flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {label}
                  {slug ? (
                    <span className="ml-2 font-normal text-zinc-500">/categories/{slug}</span>
                  ) : null}
                </span>
                <span
                  className={
                    node.isActive
                      ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                      : 'rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                  }
                >
                  {node.isActive ? 'Visible' : 'Hidden'}
                </span>
                <button type="button" className="text-xs underline" onClick={() => void moveNode(node, -1)}>
                  ↑
                </button>
                <button type="button" className="text-xs underline" onClick={() => void moveNode(node, 1)}>
                  ↓
                </button>
                <button type="button" className="text-xs underline" onClick={() => void toggleActive(node)}>
                  {node.isActive ? 'Hide' : 'Show'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
