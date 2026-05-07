import { getHomePageSections } from '@/lib/cms/home-page.service';
import { HomePageClient } from '@/components/home/home-page-client';

export const revalidate = 0;

export default async function HomePage() {
  const sections = await getHomePageSections();
  return <HomePageClient sections={sections} />;
}
