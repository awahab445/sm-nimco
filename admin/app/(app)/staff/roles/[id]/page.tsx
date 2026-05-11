import { StaffRoleEditForm } from '@/components/staff/staff-role-edit-form';

export default async function StaffRoleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <StaffRoleEditForm roleId={id} />
    </div>
  );
}
