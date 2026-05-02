import { AccountLayout } from '@/components/account/account-layout';
import { getServerUser } from '@/lib/auth.server';
import { redirect } from 'next/navigation';

export default async function ProfileLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR-safe authentication check
  const user = await getServerUser();

  if (!user) {
    redirect('/login?redirect=/profile');
  }

  return <AccountLayout user={user}>{children}</AccountLayout>;
}

