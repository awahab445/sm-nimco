import { StaffUserEditForm } from '@/components/staff/staff-user-edit-form';

export default async function StaffUserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-2xl">
      <StaffUserEditForm userId={id} />
    </div>
  );
}
