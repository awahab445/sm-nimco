import type { Metadata } from 'next';
import { AccountLayout } from '@/components/account/account-layout';
import { getServerUser } from '@/lib/auth.server';
import { redirect } from 'next/navigation';
import { noIndexMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = noIndexMetadata('Account');

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

