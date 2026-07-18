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
      className="cms-block-section prose prose-sm max-w-none text-foreground md:prose-base [&_a]:text-muted-foreground [&_a]:no-underline [&_a:hover]:text-primary-hover"
      data-cms-block={blockIdentifier}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
