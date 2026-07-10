import type { Metadata } from 'next';
import { noIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = noIndexMetadata('Create password');

export default function CreatePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
