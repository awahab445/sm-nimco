import { fetchApi } from '../api-client';

export type OrderSummaryReportRow = {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string;
  orderNumber: string;
  totalItemsCount: number;
  orderTotal: number;
  orderStatus: string;
  paymentStatus: string;
  completionStatus: string;
  currency: string;
  createdAt: string;
};

export type ItemBreakdownReportRow = {
  orderNumber: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  rowTotal: number;
  orderTotal: number;
  currency: string;
  createdAt: string;
};

export type ReportDateRange = {
  startDate?: string;
  endDate?: string;
};

function toQuery(range?: ReportDateRange): string {
  const sp = new URLSearchParams();
  if (range?.startDate) sp.set('startDate', range.startDate);
  if (range?.endDate) sp.set('endDate', range.endDate);
  const q = sp.toString();
  return q ? `?${q}` : '';
}

export async function fetchOrderSummaryReport(
  range?: ReportDateRange,
): Promise<OrderSummaryReportRow[]> {
  return fetchApi<OrderSummaryReportRow[]>(
    `/admin/reports/order-summary${toQuery(range)}`,
  );
}

export async function fetchItemBreakdownReport(
  range?: ReportDateRange,
): Promise<ItemBreakdownReportRow[]> {
  return fetchApi<ItemBreakdownReportRow[]>(
    `/admin/reports/item-breakdown${toQuery(range)}`,
  );
}

/** UTF-8 BOM CSV download for Excel-friendly reports. */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
): void {
  const escape = (value: string | number | null | undefined): string => {
    const raw = value == null ? '' : String(value);
    if (/[",\n\r]/.test(raw)) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ];
  const bom = '\uFEFF';
  const blob = new Blob([bom + lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
