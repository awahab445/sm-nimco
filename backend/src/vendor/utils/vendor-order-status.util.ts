/** Mobile app statuses (uppercase) mapped to persisted order.status values. */
export const VENDOR_ORDER_STATUSES = [
  'PROCESSING',
  'READY_FOR_PICKUP',
] as const;

export type VendorOrderStatus = (typeof VENDOR_ORDER_STATUSES)[number];

const VENDOR_TO_DB_STATUS: Record<VendorOrderStatus, string> = {
  PROCESSING: 'processing',
  READY_FOR_PICKUP: 'ready_for_pickup',
};

const DB_TO_VENDOR_STATUS: Record<string, VendorOrderStatus> = {
  processing: 'PROCESSING',
  ready_for_pickup: 'READY_FOR_PICKUP',
};

export function vendorStatusToDb(status: VendorOrderStatus): string {
  return VENDOR_TO_DB_STATUS[status];
}

export function dbStatusToVendor(status: string): VendorOrderStatus | null {
  return DB_TO_VENDOR_STATUS[status] ?? null;
}
