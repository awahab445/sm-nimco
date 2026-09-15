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
  recentOrders: DashboardRecentOrder[];
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return fetchApi<DashboardStats>('/admin/dashboard/stats');
}
