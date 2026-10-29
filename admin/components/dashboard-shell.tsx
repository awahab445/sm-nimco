'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin-header';
import { AppSidebar } from '@/components/app-sidebar';
import { CommandPalette } from '@/components/command-palette';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileNavOpen(false), []);
  const openMobile = useCallback(() => setMobileNavOpen(true), []);
  const openCommand = useCallback(() => setCommandOpen(true), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar mobileOpen={mobileNavOpen} onMobileClose={closeMobile} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-background">
        <AdminHeader onMenuOpen={openMobile} onSearchOpen={openCommand} />
        <main className="flex-1 overflow-auto bg-background p-4 text-foreground sm:p-6">
          {children}
        </main>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
