import type { Metadata } from 'next';
import { noIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = noIndexMetadata('Sign in');

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
