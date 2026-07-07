import type { PolicyPageContent } from '@/lib/cms/policy-pages';
import { sanitizeCmsHtml } from '@/lib/sanitize-html';

export function PolicyPageView({ page }: { page: PolicyPageContent }) {
  const safeHtml = sanitizeCmsHtml(page.contentHtml || '');

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-text">{page.title}</h1>
      {page.excerpt ? (
        <p className="mt-3 text-brand-text/75">{page.excerpt}</p>
      ) : null}
      <article
        className="prose prose-slate mt-8 max-w-none prose-headings:text-brand-text prose-p:text-brand-text/90 prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </div>
  );
}
