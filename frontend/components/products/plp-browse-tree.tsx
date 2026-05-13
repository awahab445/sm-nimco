'use client';

import {
  findBrowsePathByCategoryId,
  resolveBrowseNodeCategoryId,
  sortBrowseNodes,
  type PlpBrowseTreeNode,
} from '@/lib/plp-browse-tree';

function slugFromHref(href: string): string | null {
  const m = href.trim().match(/\/categories\/([^/?#]+)/i);
  return m?.[1] ?? null;
}

function resolveNodeCategoryId(
  node: PlpBrowseTreeNode,
  categoryIdBySlug: Map<string, string>,
): string | null {
  return resolveBrowseNodeCategoryId(node, categoryIdBySlug);
}

type Props = {
  label: string;
  tree: PlpBrowseTreeNode[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  categoryIdBySlug?: Map<string, string>;
};

function BrowseNode({
  node,
  depth,
  selectedCategoryId,
  onSelectCategory,
  categoryIdBySlug,
}: {
  node: PlpBrowseTreeNode;
  depth: 0 | 1 | 2;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  categoryIdBySlug: Map<string, string>;
}) {
  const children = sortBrowseNodes(node.children ?? []);
  const filterCategoryId = resolveNodeCategoryId(node, categoryIdBySlug);
  const isActive = filterCategoryId != null && filterCategoryId === selectedCategoryId;

  const handleSelect = () => {
    if (filterCategoryId) onSelectCategory(filterCategoryId);
  };

  if (depth === 0) {
    return (
      <li className="min-w-0">
        <button
          type="button"
          disabled={!filterCategoryId}
          onClick={handleSelect}
          className={`mega-menu-nav-heading w-full text-left disabled:cursor-default disabled:opacity-70${
            isActive ? ' mega-menu-nav-heading--active' : ''
          }`}
        >
          {node.label}
        </button>
        {children.length > 0 ? (
          <ul className="mt-2 space-y-0.5">
            {children.map((ch) => (
              <BrowseNode
                key={ch.id}
                node={ch}
                depth={1}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={onSelectCategory}
                categoryIdBySlug={categoryIdBySlug}
              />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  if (depth === 1) {
    return (
      <li>
        <button
          type="button"
          disabled={!filterCategoryId}
          onClick={handleSelect}
          className={`mega-menu-nav-link mega-menu-nav-link--l2 w-full text-left disabled:cursor-default disabled:opacity-70${
            isActive ? ' mega-menu-nav-link--active' : ''
          }`}
        >
          <span>{node.label}</span>
        </button>
        {children.length > 0 ? (
          <ul className="mega-menu-nav-nested space-y-0.5">
            {children.map((gc) => (
              <BrowseNode
                key={gc.id}
                node={gc}
                depth={2}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={onSelectCategory}
                categoryIdBySlug={categoryIdBySlug}
              />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        disabled={!filterCategoryId}
        onClick={handleSelect}
        className={`mega-menu-nav-link mega-menu-nav-link--l3 w-full text-left disabled:cursor-default disabled:opacity-70${
          isActive ? ' mega-menu-nav-link--active' : ''
        }`}
      >
        <span>{node.label}</span>
      </button>
    </li>
  );
}

export function PlpBrowseTree({
  label,
  tree,
  selectedCategoryId,
  onSelectCategory,
  categoryIdBySlug = new Map(),
}: Props) {
  const roots = sortBrowseNodes(tree);
  const allActive = selectedCategoryId == null;

  return (
    <nav aria-label={label} className="plp-browse-tree rounded-xl border border-border bg-card p-3 shadow-sm">
      <h2 className="header-nav-categories-label px-1 pb-2 text-xs font-semibold uppercase tracking-wide">
        {label}
      </h2>
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={`mega-menu-nav-link mega-menu-nav-link--l2 mb-1 w-full text-left${
          allActive ? ' mega-menu-nav-link--active' : ''
        }`}
      >
        All products
      </button>
      {roots.length === 0 ? (
        <p className="px-1 py-2 text-xs text-muted-foreground">
          No browse categories configured. Sync under Admin → Store filters → Browse tree.
        </p>
      ) : (
        <ul className="space-y-2">
          {roots.map((root) => (
            <BrowseNode
              key={root.id}
              node={root}
              depth={0}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={onSelectCategory}
              categoryIdBySlug={categoryIdBySlug}
            />
          ))}
        </ul>
      )}
    </nav>
  );
}

type BreadcrumbProps = {
  tree: PlpBrowseTreeNode[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  categoryIdBySlug?: Map<string, string>;
};

export function PlpBrowseBreadcrumbs({
  tree,
  selectedCategoryId,
  onSelectCategory,
  categoryIdBySlug = new Map(),
}: BreadcrumbProps) {
  if (!selectedCategoryId) return null;

  const path = findBrowsePathByCategoryId(tree, selectedCategoryId, categoryIdBySlug);
  if (path.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => onSelectCategory(null)}
          >
            Products
          </button>
        </li>
        {path.map((node, i) => {
          const isLast = i === path.length - 1;
          return (
            <li key={node.id} className="flex items-center gap-1.5">
              <span aria-hidden className="text-border">
                /
              </span>
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {node.label}
                </span>
              ) : (
                <button
                  type="button"
                  disabled={!resolveNodeCategoryId(node, categoryIdBySlug)}
                  className="font-medium text-primary hover:underline disabled:text-muted-foreground"
                  onClick={() => {
                    const id = resolveNodeCategoryId(node, categoryIdBySlug);
                    if (id) onSelectCategory(id);
                  }}
                >
                  {node.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
