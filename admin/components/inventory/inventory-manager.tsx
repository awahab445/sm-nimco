'use client';

import { useState } from 'react';
import { DEFAULT_WAREHOUSE_ID } from '@/lib/api/inventory';
import { InventoryBulkImportPanel } from '@/components/inventory/inventory-bulk-import-panel';
import { InventorySingleLookupPanel } from '@/components/inventory/inventory-single-lookup-panel';
import { InventoryVariantGridPanel } from '@/components/inventory/inventory-variant-grid-panel';

type InventoryTab = 'grid' | 'single' | 'import';

const TABS: Array<{ id: InventoryTab; label: string }> = [
  { id: 'grid', label: 'Variant grid' },
  { id: 'single', label: 'Single SKU lookup' },
  { id: 'import', label: 'Bulk import' },
];

export function InventoryManager() {
  const [activeTab, setActiveTab] = useState<InventoryTab>('grid');

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Inventory
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Manage stock by product variant grid, single-SKU lookup, or CSV/Excel bulk import. Default
          warehouse:{' '}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">
            {DEFAULT_WAREHOUSE_ID}
          </code>
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'grid' ? <InventoryVariantGridPanel /> : null}
      {activeTab === 'single' ? <InventorySingleLookupPanel /> : null}
      {activeTab === 'import' ? <InventoryBulkImportPanel /> : null}
    </div>
  );
}
