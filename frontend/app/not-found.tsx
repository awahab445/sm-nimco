import Link from 'next/link';
import { storefrontUi } from '@/lib/storefront-ui';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-brand-text">Page not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link href="/" className={`mt-8 inline-flex items-center ${storefrontUi.btnPrimary}`}>
        Back to home
      </Link>
    </div>
  );
}
