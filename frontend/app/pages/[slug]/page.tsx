import { permanentRedirect } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

/** Legacy `/pages/:slug` → canonical `/:slug` (CMS pages from admin). */
export default async function LegacyPagesSlugRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/${encodeURIComponent(slug)}`);
}
