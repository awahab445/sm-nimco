import { fetchApi } from '../api-client';

export type DashboardRecentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  grandTotal: number;
  currency: string;
  status: string;
  paymentStatus: string | null;
  createdAt: string;
};

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  pendingRevenue: number;
  pendingCount: number;
  processingCount: number;
  shippedCount: number;
  completedCount: number;
  cancelledCount: number;
  lowStockCount: number;
  /** Courier RTO / delivery failures (optional; also available via courier-performance). */
  rtoCount?: number;
  recentOrders: DashboardRecentOrder[];
};

export type SalesTrendPeriod = 'daily' | 'weekly' | 'monthly';

export type SalesTrendPoint = {
  label: string;
  periodStart: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
};

export type SalesTrends = {
  period: SalesTrendPeriod;
  points: SalesTrendPoint[];
};

export type CourierPerformance = {
  courier: string;
  total: number;
  delivered: number;
  inTransit: number;
  rto: number;
  pending: number;
  deliveredRate: number;
  inTransitRate: number;
  rtoRate: number;
  pendingRate: number;
};

export type TopSellingProduct = {
  productId: string;
  sku: string;
  name: string;
  unitsSold: number;
  revenue: number;
  availableQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return fetchApi<DashboardStats>('/admin/dashboard/stats');
}

export async function fetchSalesTrends(
  period: SalesTrendPeriod = 'daily',
): Promise<SalesTrends> {
  return fetchApi<SalesTrends>(
    `/admin/dashboard/sales-trends?period=${encodeURIComponent(period)}`,
  );
}

export async function fetchCourierPerformance(): Promise<CourierPerformance> {
  return fetchApi<CourierPerformance>('/admin/dashboard/courier-performance');
}

export async function fetchTopSellingProducts(
  limit = 5,
): Promise<TopSellingProduct[]> {
  return fetchApi<TopSellingProduct[]>(
    `/admin/dashboard/top-products?limit=${encodeURIComponent(String(limit))}`,
  );
}
