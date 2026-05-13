export type PlpBrowseTreeNode = {
  id: string;
  label: string;
  href: string;
  categoryId: string | null;
  sortOrder: number;
  children?: PlpBrowseTreeNode[];
};

export type PlpBrowsePayload = {
  label: string;
  tree: PlpBrowseTreeNode[];
};

function slugFromHref(href: string): string | null {
  const m = href.trim().match(/\/categories\/([^/?#]+)/i);
  return m?.[1] ?? null;
}

export function resolveBrowseNodeCategoryId(
  node: PlpBrowseTreeNode,
  categoryIdBySlug?: Map<string, string>,
): string | null {
  if (node.categoryId) return node.categoryId;
  const slug = slugFromHref(node.href);
  if (slug && categoryIdBySlug?.has(slug)) return categoryIdBySlug.get(slug)!;
  return null;
}

export function sortBrowseNodes<T extends { sortOrder?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/** Find path from root to the node whose category matches (deepest first). */
export function findBrowsePathByCategoryId(
  tree: PlpBrowseTreeNode[],
  categoryId: string | null | undefined,
  categoryIdBySlug?: Map<string, string>,
): PlpBrowseTreeNode[] {
  if (!categoryId) return [];
  const walk = (nodes: PlpBrowseTreeNode[], trail: PlpBrowseTreeNode[]): PlpBrowseTreeNode[] | null => {
    for (const node of sortBrowseNodes(nodes)) {
      const next = [...trail, node];
      if (resolveBrowseNodeCategoryId(node, categoryIdBySlug) === categoryId) return next;
      if (node.children?.length) {
        const found = walk(node.children, next);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(tree, []) ?? [];
}

export function findBrowseNodeLabel(
  tree: PlpBrowseTreeNode[],
  categoryId: string | null | undefined,
  categoryIdBySlug?: Map<string, string>,
): string | null {
  const path = findBrowsePathByCategoryId(tree, categoryId, categoryIdBySlug);
  return path.length ? path[path.length - 1]!.label : null;
}
