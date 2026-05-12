import { fetchApi } from '../api-client';

export type SubscriptionSubscriberRow = {
  id: string;
  email: string;
  source: string | null;
  createdAt: string;
};

export function fetchSubscriptionSubscribers() {
  return fetchApi<SubscriptionSubscriberRow[]>('/admin/subscription/subscribers');
}
