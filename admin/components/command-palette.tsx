'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminOrders } from '@/lib/api/orders';
import { fetchAdminCustomers } from '@/lib/api/customers';
import { fetchAdminProducts } from '@/lib/api/products';
import { formatApiError } from '@/lib/api/error-message';
import { formatPrice } from '@/lib/currency';

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type OrderHit = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  trackingNumber?: string | null;
};

type CustomerHit = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

type ProductHit = {
  id: string;
  name: string;
  sku: string;
  price: string | number;
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderHit[]>([]);
  const [customers, setCustomers] = useState<CustomerHit[]>([]);
  const [products, setProducts] = useState<ProductHit[]>([]);

  const close = useCallback(() => {
    onOpenChange(false);
    setQuery('');
    setOrders([]);
    setCustomers([]);
    setProducts([]);
    setError(null);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const [ordersRes, customersRes, productsRes] = await Promise.all([
            fetchAdminOrders(
              { search: q, limit: 5, page: 1 },
              { signal: controller.signal },
            ),
            fetchAdminCustomers({ search: q }),
            fetchAdminProducts({ search: q, limit: 5, page: 1 }),
          ]);
          if (controller.signal.aborted) return;

          setOrders(
            ordersRes.data.map((o) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              customerEmail: o.customerEmail,
              trackingNumber: o.shipping?.trackingNumber ?? null,
            })),
          );
          setCustomers(
            customersRes.slice(0, 5).map((c) => ({
              id: c.id,
              name:
                [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email,
              email: c.email,
              phone: c.phone,
            })),
          );
          setProducts(
            productsRes.data.map((p) => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              price: p.basePrice,
            })),
          );
        } catch (e) {
          if (controller.signal.aborted) return;
          if (e instanceof DOMException && e.name === 'AbortError') return;
          setError(formatApiError(e));
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      })();
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query]);

  const navigate = (href: string) => {
    close();
    router.push(href);
  };

  if (!open) return null;

  const hasQuery = query.trim().length >= 2;
  const shownOrders = hasQuery ? orders : [];
  const shownCustomers = hasQuery ? customers : [];
  const shownProducts = hasQuery ? products : [];
  const empty =
    hasQuery &&
    !loading &&
    !error &&
    shownOrders.length === 0 &&
    shownCustomers.length === 0 &&
    shownProducts.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
          <h2 id="command-palette-title" className="sr-only">
            Global search
          </h2>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, customers, products…"
            className="w-full bg-transparent px-2 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
            aria-label="Search orders, customers, and products"
          />
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {!hasQuery ? (
            <p className="px-2 py-6 text-center text-sm text-zinc-500">
              Type at least 2 characters. Search by ORD ID, tracking CN, name,
              email, phone, title, or SKU.
            </p>
          ) : null}

          {loading ? (
            <p className="px-2 py-4 text-sm text-zinc-500">Searching…</p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : null}

          {empty ? (
            <p className="px-2 py-6 text-center text-sm text-zinc-500">
              No matches for “{query.trim()}”.
            </p>
          ) : null}

          {shownOrders.length > 0 ? (
            <ResultSection title="Orders">
              {shownOrders.map((o) => (
                <ResultRow
                  key={o.id}
                  onClick={() => navigate(`/orders/${o.id}`)}
                  primary={
                    <span className="font-mono text-xs tracking-tight">
                      {o.orderNumber}
                    </span>
                  }
                  secondary={
                    o.trackingNumber
                      ? `${o.customerEmail} · CN ${o.trackingNumber}`
                      : o.customerEmail
                  }
                />
              ))}
            </ResultSection>
          ) : null}

          {shownCustomers.length > 0 ? (
            <ResultSection title="Customers">
              {shownCustomers.map((c) => (
                <ResultRow
                  key={c.id}
                  onClick={() => navigate(`/customers/${c.id}`)}
                  primary={c.name}
                  secondary={[c.email, c.phone].filter(Boolean).join(' · ')}
                />
              ))}
            </ResultSection>
          ) : null}

          {shownProducts.length > 0 ? (
            <ResultSection title="Products">
              {shownProducts.map((p) => (
                <ResultRow
                  key={p.id}
                  onClick={() => navigate(`/products/${p.id}`)}
                  primary={p.name}
                  secondary={`${p.sku} · ${formatPrice(p.price)}`}
                />
              ))}
            </ResultSection>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2 text-[11px] text-zinc-500 dark:border-zinc-800">
          <span>Navigate with click · Esc to close</span>
          <kbd className="rounded border border-zinc-300 px-1.5 py-0.5 font-mono dark:border-zinc-600">
            ⌘K / Ctrl+K
          </kbd>
        </div>
      </div>
    </div>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-2">
      <h3 className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h3>
      <ul className="space-y-0.5">{children}</ul>
    </section>
  );
}

function ResultRow({
  primary,
  secondary,
  onClick,
}: {
  primary: React.ReactNode;
  secondary: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full flex-col rounded-lg px-2 py-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {primary}
        </span>
        <span className="truncate text-xs text-zinc-500">{secondary}</span>
      </button>
    </li>
  );
}
