import type { CmsStorefrontPage } from '@/lib/cms/cms-page.service';

export function StaticPage({ page }: { page: CmsStorefrontPage }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {page.title}
      </h1>
      {page.excerpt ? (
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">{page.excerpt}</p>
      ) : null}
      <article
        className="prose prose-zinc mt-8 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: page.contentHtml || '' }}
      />
    </div>
  );
}
