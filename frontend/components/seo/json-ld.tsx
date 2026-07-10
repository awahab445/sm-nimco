type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

/** Renders schema.org JSON-LD for crawlers. */
export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
