'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, LayoutDashboard, User, Bell } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Navbar } from './navbar/navbar';
import { Sidebar } from './sidebar/sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useSidebarStore, useNotificationStore } from '@/store';
import { useBreakpoint } from '@/hooks/use-breakpoint';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'STUDENT' | 'FACULTY' | 'HOD' | 'ADMIN';
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const breakpoint = useBreakpoint();
  
  // Zustand States
  const isMobileMenuOpen = useSidebarStore((state) => state.isCollapsed);
  const setMobileMenuOpen = useSidebarStore((state) => state.setCollapsed);
  const toggleNotifications = useNotificationStore((state) => state.toggle);

  const showDrawer = breakpoint === 'mobile' || breakpoint === 'tablet';

  // Ensure correct mobile sidebar state on window resize
  React.useEffect(() => {
    if (breakpoint === 'laptop' || breakpoint === 'desktop') {
      // Force collapse to false on desktop
      setMobileMenuOpen(false);
    }
  }, [breakpoint, setMobileMenuOpen]);

  // Bottom Navigation Config
  const bottomNavItems = React.useMemo(() => {
    const rolePrefix = `/${role.toLowerCase()}`;
    return [
      { label: 'Home', icon: LayoutDashboard, onClick: () => router.push(`${rolePrefix}/dashboard`), active: pathname === `${rolePrefix}/dashboard` },
      { label: 'AI Center', icon: Sparkles, onClick: () => router.push(`${rolePrefix}/ai`), active: pathname === `${rolePrefix}/ai` },
      { label: 'Alerts', icon: Bell, onClick: () => toggleNotifications(), active: false },
      { label: 'Profile', icon: User, onClick: () => router.push(`${rolePrefix}/profile`), active: pathname === `${rolePrefix}/profile` },
    ];
  }, [role, pathname, router, toggleNotifications]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <Navbar />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Desktop Sidebar navigation */}
        <Sidebar role={role} className="hidden lg:flex" />

        {/* Mobile Slide Drawer Sidebar navigation */}
        <Sheet open={showDrawer && isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-[260px] bg-card border-r">
            <div className="flex h-16 items-center px-6 border-b">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xl mr-2">
                C
              </div>
              <span className="font-bold text-lg tracking-tight">CampusAI</span>
            </div>
            <Sidebar role={role} className="w-full border-r-0 h-[calc(100vh-4rem)]" />
          </SheetContent>
        </Sheet>

        {/* Scrollable Main Area */}
        <main className="flex-1 flex flex-col overflow-y-auto pb-16 md:pb-0">
          <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on screens below lg breakpoint) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-card flex items-center justify-around lg:hidden px-2 shadow-lg">
        {bottomNavItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium gap-0.5 transition-colors',
              item.active
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className={cn('h-5 w-5', item.active ? 'stroke-[2.5px]' : 'stroke-[1.8px]')} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
