import sanitizeHtml from 'sanitize-html';

const CMS_ALLOWED_TAGS = Array.from(
  new Set([
    ...sanitizeHtml.defaults.allowedTags,
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'p',
    'br',
    'blockquote',
    'span',
    'div',
  ]),
);

/** Max plain-text length for a bold-only paragraph to be treated as a section title. */
const SECTION_TITLE_MAX_CHARS = 80;

/**
 * Promote editor "fake headings" to real ones:
 * `<p><strong>Our Mission</strong></p>` → `<h2>Our Mission</h2>`
 * Also short standalone bold lines with optional trailing <br>.
 */
export function promoteCmsSectionTitles(html: string): string {
  if (!html) return html;

  return html.replace(
    // Inner may not cross a paragraph boundary, or one bold line would swallow the paragraphs after it.
    /<p(?:\s[^>]*)?>\s*<(strong|b)(?:\s[^>]*)?>((?:(?!<\/?p[\s>])[\s\S])*?)<\/\1>\s*(?:<br\s*\/?>\s*)*<\/p>/gi,
    (full, _tag: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (!text || text.length > SECTION_TITLE_MAX_CHARS) {
        return full;
      }
      // Skip sentence-like body copy that happens to be fully bold.
      if (text.length > 48 && /[.!?]$/.test(text)) {
        return full;
      }
      // Inner HTML was already sanitized; unwrap bold into a real heading.
      const titleHtml = inner.trim();
      return `<h2>${titleHtml}</h2>`;
    },
  );
}

/**
 * Sanitize CMS HTML for storefront rendering.
 * Inline `style` attributes are stripped so editor-injected font sizes / italics
 * cannot override the shared `.cms-content-wrapper` typography.
 * Bold-only paragraphs are promoted to `<h2>` for visual hierarchy.
 */
export function sanitizeCmsHtml(html: string | null | undefined): string {
  if (!html?.trim()) {
    return '';
  }
  return sanitizeHtml(html, {
    allowedTags: CMS_ALLOWED_TAGS,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['alt', 'src', 'width', 'height', 'title'],
      a: ['href', 'name', 'target', 'rel'],
      '*': ['class', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  });
}
