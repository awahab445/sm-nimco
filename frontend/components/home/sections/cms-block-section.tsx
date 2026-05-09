'use client';

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

  return (
    <section
      className="cms-block-section prose prose-zinc mx-auto max-w-none dark:prose-invert"
      data-cms-block={blockIdentifier}
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
