import { SiteConfigForm } from '@/components/settings/site-config-form';
import { SocialLinksForm } from '@/components/settings/social-links-form';

export default function SiteConfigPage() {
  return (
    <div className="space-y-8">
      <SiteConfigForm />
      <div className="mx-auto max-w-3xl">
        <SocialLinksForm />
      </div>
    </div>
  );
}
