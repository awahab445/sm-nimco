import { headers } from 'next/headers';
import { AccountLayout } from '@/components/account/account-layout';
import { getServerUser } from '@/lib/auth.server';
import { redirect } from 'next/navigation';

export default async function OrdersLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Order detail (/orders/[id]) is public for guest track-order; only list (/orders) requires auth
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isOrderList = pathname === '/orders' || pathname === '/orders/';

  if (isOrderList) {
    const user = await getServerUser();
    if (!user) {
      redirect('/login?redirect=/orders');
    }
    return <AccountLayout user={user}>{children}</AccountLayout>;
  }

  // Order detail: no auth required (guests can view after track-order lookup)
  return <>{children}</>;
}

