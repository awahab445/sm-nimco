import sanitizeHtml from 'sanitize-html';

const CMS_ALLOWED_TAGS = sanitizeHtml.defaults.allowedTags.concat([
  'img',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
]);

/** Strip dangerous markup from CMS HTML before persistence or render. */
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
