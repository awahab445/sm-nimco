import { PolicyPagesForm } from '@/components/settings/policy-pages-form';

export const metadata = {
  title: 'Policy pages',
  description: 'Manage shipping, privacy, and terms content for the storefront.',
};

export default function PolicyPagesSettingsPage() {
  return <PolicyPagesForm />;
}
