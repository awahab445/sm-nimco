/**
 * Persisted order.status values (lowercase strings in Prisma).
 */
export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ORDER_STATUS_VALUES: OrderStatus[] = Object.values(OrderStatus);
