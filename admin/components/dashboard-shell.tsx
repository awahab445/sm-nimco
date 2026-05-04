'use client';

import { useCallback, useState } from 'react';
import { AdminHeader } from '@/components/admin-header';
import { AppSidebar } from '@/components/app-sidebar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileNavOpen(false), []);
  const openMobile = useCallback(() => setMobileNavOpen(true), []);

  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <AppSidebar mobileOpen={mobileNavOpen} onMobileClose={closeMobile} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader onMenuOpen={openMobile} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 dark:bg-black">{children}</main>
      </div>
    </div>
  );
}
