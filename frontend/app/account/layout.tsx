import { AccountLayout } from '@/components/account/account-layout';
import { getServerUser } from '@/lib/auth.server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AccountLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR-safe authentication check
  const user = await getServerUser();

  if (!user) {
    redirect('/login?redirect=/account');
  }

  return <AccountLayout user={user}>{children}</AccountLayout>;
}

