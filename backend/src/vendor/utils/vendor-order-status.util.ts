import { OrderStatus } from '../../order/enums/order-status.enum';

/**
 * Mobile app statuses (uppercase) mapped to persisted order.status values.
 *
 * READY_FOR_PICKUP ("Mark as Ready") → order.status = ready_for_pickup
 * and fulfillment_status = fulfilled.
 */
export const VENDOR_ORDER_STATUSES = [
  'PROCESSING',
  'READY_FOR_PICKUP',
] as const;

export type VendorOrderStatus = (typeof VENDOR_ORDER_STATUSES)[number];

const VENDOR_TO_DB_STATUS: Record<VendorOrderStatus, OrderStatus> = {
  PROCESSING: OrderStatus.PROCESSING,
  READY_FOR_PICKUP: OrderStatus.READY_FOR_PICKUP,
};

const DB_TO_VENDOR_STATUS: Record<string, VendorOrderStatus> = {
  [OrderStatus.PROCESSING]: 'PROCESSING',
  [OrderStatus.READY_FOR_PICKUP]: 'READY_FOR_PICKUP',
};

export function vendorStatusToDb(status: VendorOrderStatus): OrderStatus {
  const mapped = VENDOR_TO_DB_STATUS[status];
  if (!mapped) {
    throw new Error(`Unsupported vendor order status: ${status}`);
  }
  return mapped;
}

export function dbStatusToVendor(status: string): VendorOrderStatus | null {
  return DB_TO_VENDOR_STATUS[status] ?? null;
}

/** Fulfillment status applied when the store marks an order ready for pickup. */
export function vendorFulfillmentStatusFor(
  status: VendorOrderStatus,
): 'fulfilled' | undefined {
  if (status === 'READY_FOR_PICKUP') {
    return 'fulfilled';
  }
  return undefined;
}
