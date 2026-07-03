import { BundleDealForm } from '@/components/bundle-deals/bundle-deal-form';

type Props = { params: Promise<{ id: string }> };

export default async function EditBundleDealPage({ params }: Props) {
  const { id } = await params;
  return <BundleDealForm dealId={id} />;
}
