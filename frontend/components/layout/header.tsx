'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth.store';
import { useCartStore } from '@/lib/cart.store';
import { STORE_NAME, getStoreLogoSrc } from '@/lib/config';
import { SearchBar } from '@/components/search/search-bar';
import { CategoryMegaNav } from '@/components/layout/category-mega-nav';

export function Header() {
  const { isAuthenticated } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const cartItemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const logoSrc = getStoreLogoSrc();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex min-h-14 w-full max-w-[100rem] items-center justify-between gap-3 py-1.5 sm:gap-4 sm:px-8 lg:px-12 xl:px-16 px-4">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center bg-transparent text-lg font-semibold tracking-tight text-foreground outline-none ring-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={STORE_NAME}
              width={112}
              height={112}
              className="h-11 w-auto max-h-12 max-w-[10.5rem] bg-transparent object-contain object-left sm:h-12 sm:max-w-[12rem]"
              priority
              unoptimized={logoSrc.startsWith('http')}
            />
          ) : (
            STORE_NAME
          )}
        </Link>

        <div className="flex min-w-0 flex-1 justify-center">
          <SearchBar />
        </div>

        <nav className="flex shrink-0 items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Products
          </Link>
          <Link
            href="/track-order"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Track order
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cart
            {cartItemCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <Link
              href="/account"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Account
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
      <CategoryMegaNav />
    </header>
  );
}
