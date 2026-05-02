import { AccountLayout } from '@/components/account/account-layout';
import { getServerUser } from '@/lib/auth.server';
import { redirect } from 'next/navigation';

export default async function AddressesLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR-safe authentication check
  const user = await getServerUser();

  if (!user) {
    redirect('/login?redirect=/addresses');
  }

  return <AccountLayout user={user}>{children}</AccountLayout>;
}

