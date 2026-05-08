import { fetchApi } from '../api-client';

export type BillingCycle = 'MONTHLY' | 'YEARLY';

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  billingCycle: BillingCycle;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSubscriptionPlanBody = {
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  isActive?: boolean;
};

export type UpdateSubscriptionPlanBody = Partial<CreateSubscriptionPlanBody>;

export function fetchAdminSubscriptionPlans() {
  return fetchApi<SubscriptionPlan[]>('/admin/subscription/plans');
}

export function createAdminSubscriptionPlan(body: CreateSubscriptionPlanBody) {
  return fetchApi<SubscriptionPlan>('/admin/subscription/plans', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAdminSubscriptionPlan(id: string, body: UpdateSubscriptionPlanBody) {
  return fetchApi<SubscriptionPlan>(`/admin/subscription/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteAdminSubscriptionPlan(id: string) {
  return fetchApi<void>(`/admin/subscription/plans/${id}`, {
    method: 'DELETE',
  });
}
