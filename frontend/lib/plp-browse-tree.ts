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

export function sortBrowseNodes<T extends { sortOrder?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/** Find path from root to the node whose categoryId matches (deepest first). */
export function findBrowsePathByCategoryId(
  tree: PlpBrowseTreeNode[],
  categoryId: string | null | undefined,
): PlpBrowseTreeNode[] {
  if (!categoryId) return [];
  const walk = (nodes: PlpBrowseTreeNode[], trail: PlpBrowseTreeNode[]): PlpBrowseTreeNode[] | null => {
    for (const node of sortBrowseNodes(nodes)) {
      const next = [...trail, node];
      if (node.categoryId === categoryId) return next;
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
): string | null {
  const path = findBrowsePathByCategoryId(tree, categoryId);
  return path.length ? path[path.length - 1]!.label : null;
}
