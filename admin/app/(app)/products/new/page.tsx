'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/product-form';

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/products" className="text-sm text-zinc-600 underline dark:text-zinc-400">
        ← Products
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New product
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Save as draft, then add variants, images, and categories on the next screen.
      </p>
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <ProductForm
          mode="create"
          onSaved={(p) => router.push(`/products/${p.id}`)}
          onCancel={() => router.push('/products')}
        />
      </div>
    </div>
  );
}
