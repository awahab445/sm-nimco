'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { STORE_NAME } from '@/lib/config';
import { categoryApi, type CategoryTreeItem } from '@/lib/api-client';
import { ShoppingBagIcon } from '@/components/icons/shopping-bag-icon';

const IS_MEHFIL_THEME =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_STORE_THEME?.trim().toLowerCase() === 'mehfil_shereen';

function sortByPosition<T extends { position?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export function Footer() {
  const [categoryLinks, setCategoryLinks] = useState<CategoryTreeItem[]>([]);

  useEffect(() => {
    categoryApi
      .getCategories({ tree: true })
      .then((res) => {
        const tree = Array.isArray(res) ? res : [];
        setCategoryLinks(sortByPosition(tree as CategoryTreeItem[]).slice(0, 10));
      })
      .catch(() => setCategoryLinks([]));
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer
      className={
        IS_MEHFIL_THEME
          ? 'border-t border-primary/25 bg-secondary text-secondary-foreground'
          : 'border-t border-border bg-brand-bg'
      }
    >
      <div className="mx-auto w-full max-w-[100rem] px-4 py-12 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-14">
          <div className="col-span-2 md:col-span-1">
            <p
              className={
                IS_MEHFIL_THEME
                  ? 'text-sm font-semibold text-secondary-foreground'
                  : 'text-sm font-semibold text-brand-text'
              }
            >
              {STORE_NAME}
            </p>
            <p
              className={
                IS_MEHFIL_THEME
                  ? 'mt-3 max-w-xs text-sm text-secondary-foreground/85'
                  : 'mt-3 max-w-xs text-sm text-muted-foreground'
              }
            >
              Curated products, secure checkout, and order tracking — built for how people shop today.
            </p>
          </div>
          <div>
            <h3
              className={
                IS_MEHFIL_THEME
                  ? 'text-xs font-semibold uppercase tracking-wider text-secondary-foreground'
                  : 'text-xs font-semibold uppercase tracking-wider text-foreground'
              }
            >
              Shop
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/products"
                  className={
                    IS_MEHFIL_THEME
                      ? 'text-sm text-secondary-foreground/80 transition-colors hover:text-secondary-foreground'
                      : 'text-sm text-muted-foreground transition-colors hover:text-foreground'
                  }
                >
                  All products
                </Link>
              </li>
              {categoryLinks.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className={
                      IS_MEHFIL_THEME
                        ? 'text-sm text-secondary-foreground/80 transition-colors hover:text-secondary-foreground'
                        : 'text-sm text-muted-foreground transition-colors hover:text-foreground'
                    }
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3
              className={
                IS_MEHFIL_THEME
                  ? 'text-xs font-semibold uppercase tracking-wider text-secondary-foreground'
                  : 'text-xs font-semibold uppercase tracking-wider text-foreground'
              }
            >
              Customer care
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/track-order"
                  className={
                    IS_MEHFIL_THEME
                      ? 'text-sm text-secondary-foreground/80 transition-colors hover:text-secondary-foreground'
                      : 'text-sm text-muted-foreground transition-colors hover:text-foreground'
                  }
                >
                  Track order
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className={
                    IS_MEHFIL_THEME
                      ? 'inline-flex items-center gap-2 text-sm text-secondary-foreground/80 transition-colors hover:text-secondary-foreground'
                      : 'inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
                  }
                >
                  <ShoppingBagIcon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  Shopping cart
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className={
                    IS_MEHFIL_THEME
                      ? 'text-sm text-secondary-foreground/80 transition-colors hover:text-secondary-foreground'
                      : 'text-sm text-muted-foreground transition-colors hover:text-foreground'
                  }
                >
                  Order help
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className={
                IS_MEHFIL_THEME
                  ? 'text-xs font-semibold uppercase tracking-wider text-secondary-foreground'
                  : 'text-xs font-semibold uppercase tracking-wider text-foreground'
              }
            >
              Account
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/login"
                  className={
                    IS_MEHFIL_THEME
                      ? 'text-sm text-secondary-foreground/80 transition-colors hover:text-secondary-foreground'
                      : 'text-sm text-muted-foreground transition-colors hover:text-foreground'
                  }
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className={
                    IS_MEHFIL_THEME
                      ? 'text-sm text-secondary-foreground/80 transition-colors hover:text-secondary-foreground'
                      : 'text-sm text-muted-foreground transition-colors hover:text-foreground'
                  }
                >
                  Create account
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className={
                    IS_MEHFIL_THEME
                      ? 'text-sm text-secondary-foreground/80 transition-colors hover:text-secondary-foreground'
                      : 'text-sm text-muted-foreground transition-colors hover:text-foreground'
                  }
                >
                  My account
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className={
                    IS_MEHFIL_THEME
                      ? 'text-sm text-secondary-foreground/80 transition-colors hover:text-secondary-foreground'
                      : 'text-sm text-muted-foreground transition-colors hover:text-foreground'
                  }
                >
                  My orders
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={
            IS_MEHFIL_THEME
              ? 'mt-12 flex flex-col gap-6 border-t border-primary/20 pt-8 sm:flex-row sm:items-center sm:justify-between'
              : 'mt-12 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between'
          }
        >
          <p
            className={
              IS_MEHFIL_THEME
                ? 'text-sm text-secondary-foreground/75'
                : 'text-sm text-muted-foreground'
            }
          >
            © {year} {STORE_NAME}. All rights reserved.
          </p>
          <div
            className={
              IS_MEHFIL_THEME
                ? 'flex flex-wrap gap-x-6 gap-y-2 text-sm text-secondary-foreground/75'
                : 'flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground'
            }
          >
            <Link
              href="/products"
              className={
                IS_MEHFIL_THEME
                  ? 'transition-colors hover:text-secondary-foreground'
                  : 'transition-colors hover:text-foreground'
              }
            >
              Shipping &amp; returns
            </Link>
            <Link
              href="/products"
              className={
                IS_MEHFIL_THEME
                  ? 'transition-colors hover:text-secondary-foreground'
                  : 'transition-colors hover:text-foreground'
              }
            >
              Privacy
            </Link>
            <Link
              href="/products"
              className={
                IS_MEHFIL_THEME
                  ? 'transition-colors hover:text-secondary-foreground'
                  : 'transition-colors hover:text-foreground'
              }
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
