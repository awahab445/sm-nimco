import { AdminHeader } from '@/components/admin-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminHeader />
      <main className="flex-1 overflow-auto bg-zinc-50 p-6 dark:bg-black">{children}</main>
    </div>
  );
}
