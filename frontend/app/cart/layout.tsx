import type { Metadata } from 'next';
import { noIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = noIndexMetadata('Cart', 'Your shopping cart.');

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
