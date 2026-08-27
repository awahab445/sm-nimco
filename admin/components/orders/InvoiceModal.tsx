'use client';

import { useEffect } from 'react';
import type { Order, OrderAddressSnapshot } from '@/lib/api/orders';
import { formatPrice } from '@/lib/currency';

const COMPANY_NAME = 'M. ESSA CHEMICALS';
const WAREHOUSE_ADDRESS_LINES = [
  'Warehouse / Dispatch',
  'Commercial Area',
  'Karachi, Pakistan',
];

type InvoiceModalProps = {
  order: Order | null;
  /** When omitted, the modal is open whenever `order` is set. */
  open?: boolean;
  onClose: () => void;
};

function formatAddress(address: OrderAddressSnapshot | null | undefined): string[] {
  if (!address || typeof address !== 'object') return [];
  const lines: string[] = [];
  const name = [address.firstName, address.lastName].filter(Boolean).join(' ').trim();
  if (name) lines.push(name);
  if (address.company?.trim()) lines.push(address.company.trim());
  if (address.addressLine1?.trim()) lines.push(address.addressLine1.trim());
  if (address.addressLine2?.trim()) lines.push(address.addressLine2.trim());
  const cityLine = [address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(', ')
    .trim();
  if (cityLine) lines.push(cityLine);
  if (address.country?.trim()) lines.push(address.country.trim());
  if (address.phone?.trim()) lines.push(`Phone: ${address.phone.trim()}`);
  return lines;
}

export function InvoiceModal({ order, open, onClose }: InvoiceModalProps) {
  const isOpen = open ?? order != null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const shippingLines = formatAddress(order.shippingAddress);
  const customerName =
    order.customerName?.trim() ||
    [order.shippingAddress?.firstName, order.shippingAddress?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    '—';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-modal-root fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/50 p-4 sm:p-8">
      <button
        type="button"
        className="invoice-no-print absolute inset-0 cursor-default"
        aria-label="Close invoice"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-modal-title"
        className="invoice-dialog relative z-10 my-4 w-full max-w-[210mm] rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
      >
        <div className="invoice-no-print flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 id="invoice-modal-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Invoice — {order.orderNumber}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
            >
              Close
            </button>
          </div>
        </div>

        <div className="invoice-print-area px-6 py-6 text-zinc-900 sm:px-8 sm:py-8">
          <header className="invoice-header flex flex-wrap items-start justify-between gap-4 border-b border-zinc-900 pb-4">
            <div className="flex items-start gap-4">
              <img
                src="/brand-logo.png"
                alt={COMPANY_NAME}
                className="invoice-logo h-16 w-auto max-w-[160px] object-contain"
              />
              <div>
                <div className="text-lg font-bold tracking-wide uppercase">{COMPANY_NAME}</div>
                <div className="mt-1 text-xs leading-relaxed text-zinc-600">
                  {WAREHOUSE_ADDRESS_LINES.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Invoice
              </div>
              <div className="mt-1 text-base font-bold">Order #{order.orderNumber}</div>
              <div className="mt-0.5 text-zinc-600">
                {new Date(order.createdAt).toLocaleDateString('en-PK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </header>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Customer Details
              </h3>
              <div className="mt-2 space-y-0.5 text-sm">
                <div className="font-medium">{customerName}</div>
                <div>{order.customerEmail}</div>
                {order.shippingAddress?.phone?.trim() ? (
                  <div>Phone: {order.shippingAddress.phone.trim()}</div>
                ) : null}
              </div>
            </section>
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Shipping Address
              </h3>
              <div className="mt-2 space-y-0.5 text-sm">
                {shippingLines.length > 0 ? (
                  shippingLines.map((line) => <div key={line}>{line}</div>)
                ) : (
                  <div>—</div>
                )}
              </div>
            </section>
          </div>

          <table className="invoice-items mt-8 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-zinc-900 text-left">
                <th className="py-2 pr-2 font-semibold">Title</th>
                <th className="w-16 py-2 px-2 text-center font-semibold">Qty</th>
                <th className="w-28 py-2 px-2 text-right font-semibold">Unit Price</th>
                <th className="w-28 py-2 pl-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).map((item) => (
                <tr key={item.id} className="border-b border-zinc-200">
                  <td className="py-2.5 pr-2 align-top">
                    <div className="font-medium">{item.name}</div>
                    {item.sku ? (
                      <div className="text-xs text-zinc-500">SKU: {item.sku}</div>
                    ) : null}
                  </td>
                  <td className="py-2.5 px-2 text-center align-top tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-2 text-right align-top tabular-nums">
                    {formatPrice(item.unitPrice, order.currency)}
                  </td>
                  <td className="py-2.5 pl-2 text-right align-top font-medium tabular-nums">
                    {formatPrice(item.rowTotal, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <dl className="invoice-totals w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between gap-6">
                <dt className="text-zinc-600">Subtotal</dt>
                <dd className="tabular-nums font-medium">
                  {formatPrice(order.subtotal, order.currency)}
                </dd>
              </div>
              {Number.parseFloat(String(order.discountTotal)) > 0 ? (
                <div className="flex justify-between gap-6">
                  <dt className="text-zinc-600">Discount</dt>
                  <dd className="tabular-nums font-medium">
                    −{formatPrice(order.discountTotal, order.currency)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-6">
                <dt className="text-zinc-600">Shipping</dt>
                <dd className="tabular-nums font-medium">
                  {formatPrice(order.shippingTotal, order.currency)}
                </dd>
              </div>
              {Number.parseFloat(String(order.taxTotal)) > 0 ? (
                <div className="flex justify-between gap-6">
                  <dt className="text-zinc-600">Tax</dt>
                  <dd className="tabular-nums font-medium">
                    {formatPrice(order.taxTotal, order.currency)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-6 border-t-2 border-zinc-900 pt-2 text-base">
                <dt className="font-bold">Order Total</dt>
                <dd className="tabular-nums font-bold">
                  {formatPrice(order.grandTotal, order.currency)}
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-10 text-center text-xs text-zinc-500">
            Thank you for your business.
          </p>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
@media print {
  @page {
    size: A4;
    margin: 12mm;
  }

  html,
  body {
    background: #fff !important;
    color: #000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body * {
    visibility: hidden !important;
  }

  .invoice-print-area,
  .invoice-print-area * {
    visibility: visible !important;
  }

  .invoice-modal-root {
    position: static !important;
    inset: auto !important;
    display: block !important;
    overflow: visible !important;
    background: transparent !important;
    padding: 0 !important;
    z-index: auto !important;
  }

  .invoice-dialog {
    position: static !important;
    margin: 0 !important;
    max-width: none !important;
    width: 100% !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: #fff !important;
  }

  .invoice-no-print {
    display: none !important;
    visibility: hidden !important;
  }

  .invoice-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    padding: 0 !important;
    color: #000 !important;
  }

  .invoice-items th,
  .invoice-items td {
    color: #000 !important;
    border-color: #111 !important;
  }

  .invoice-header {
    border-color: #111 !important;
  }

  .invoice-totals {
    color: #000 !important;
  }
}
`,
        }}
      />
    </div>
  );
}
