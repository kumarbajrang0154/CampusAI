'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ROLE_NAV_MAP, NavItem } from '@/constants/navigation';
import { useSidebarStore } from '@/store';

interface SidebarProps {
  role: 'STUDENT' | 'FACULTY' | 'HOD' | 'ADMIN';
  className?: string;
}

export function Sidebar({ role, className }: SidebarProps) {
  const pathname = usePathname();
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleCollapse = useSidebarStore((state) => state.toggle);

  const navItems = ROLE_NAV_MAP[role] ?? [];

  return (
    <aside
      className={cn(
        'group/sidebar relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out select-none',
        isCollapsed ? 'w-[72px]' : 'w-[260px]',
        className
      )}
    >
      {/* Sidebar Items navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item: NavItem) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Sidebar footer section */}
      <div className="border-t p-3 space-y-1">
        <Link
          href={`/${role.toLowerCase()}/help`}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all'
          )}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Help & Support</span>}
        </Link>

        {/* Desktop Collapse Trigger button */}
        <div className="hidden xl:flex justify-end pt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-7 w-7 rounded-md border bg-background shadow-xs hover:bg-secondary"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
