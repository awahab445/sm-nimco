'use client';

import { sanitizeCmsHtml } from '@/lib/sanitize-html';

interface CmsBlockSectionProps {
  blockIdentifier: string;
  contentHtml?: string | null;
}

/**
 * Renders a CMS block fetched by identifier for the homepage layout.
 * Content is authored in Admin → CMS → Blocks (HTML).
 */
export function CmsBlockSection({ blockIdentifier, contentHtml }: CmsBlockSectionProps) {
  if (!contentHtml?.trim()) {
    return null;
  }

  const safeHtml = sanitizeCmsHtml(contentHtml);

  return (
    <section
      className="cms-block-section promo-banner-chrome rounded-2xl border p-8 md:p-10"
      data-cms-block={blockIdentifier}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
