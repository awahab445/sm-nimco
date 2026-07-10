import type { Metadata } from 'next';
import { noIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = noIndexMetadata('Create account');

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
