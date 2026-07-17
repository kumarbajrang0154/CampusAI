'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  Bell,
  Search,
  Sun,
  Moon,
  Laptop,
  PlusCircle,
  LogOut,
  User,
  Settings,
  Sparkles,
  Menu,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSidebarStore, useNotificationStore } from '@/store';

// Role dashboard map
const ROLE_DASHBOARDS: Record<string, string> = {
  STUDENT: '/student/dashboard',
  FACULTY: '/faculty/dashboard',
  HOD: '/hod/dashboard',
  ADMIN: '/admin/dashboard',
};

// Search placeholders
const SEARCH_PLACEHOLDERS: Record<string, string> = {
  STUDENT: 'Search subjects, notes, assignments...',
  FACULTY: 'Search courses, roster, grading...',
  HOD: 'Search faculty, students, reports...',
  ADMIN: 'Search users, roles, audit logs...',
};

// Quick Actions
const QUICK_ACTIONS: Record<
  string,
  Array<{ label: string; href: string; icon: React.ComponentType<{ className?: string }> }>
> = {
  STUDENT: [
    { label: 'AI Study Plan', href: '/student/ai', icon: Sparkles },
    { label: 'View Assignments', href: '/student/assignments', icon: PlusCircle },
  ],
  FACULTY: [
    { label: 'Mark Attendance', href: '/faculty/attendance', icon: PlusCircle },
    { label: 'Create Quiz', href: '/faculty/quizzes', icon: PlusCircle },
  ],
  HOD: [
    { label: 'Department Analytics', href: '/hod/analytics', icon: PlusCircle },
    { label: 'Faculty List', href: '/hod/faculty', icon: PlusCircle },
  ],
  ADMIN: [
    { label: 'Add User', href: '/admin/users', icon: PlusCircle },
    { label: 'System Configuration', href: '/admin/settings', icon: PlusCircle },
  ],
};

// Mock notifications
const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'New assignment posted in Web Development', time: '10m ago' },
  { id: 2, text: 'AI placement readiness analysis updated', time: '1h ago' },
  { id: 3, text: 'Quiz score released for Software Engineering', time: '3h ago' },
];

export function Navbar() {
  const { data: session } = useSession();
  const { setTheme } = useTheme();
  const router = useRouter();
  const toggleSidebar = useSidebarStore((state) => state.toggle);
  const { isOpen: isNotifOpen, toggle: toggleNotif } = useNotificationStore();

  const role = (session?.user?.role as string) ?? 'STUDENT';
  const logoHref = ROLE_DASHBOARDS[role] ?? '/';
  const searchPlaceholder = SEARCH_PLACEHOLDERS[role] ?? 'Search...';
  const actions = QUICK_ACTIONS[role] ?? [];

  const userName = session?.user?.name ?? 'User';
  const userEmail = session?.user?.email ?? '';
  const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    // Clear cookie
    document.cookie = 'campusai-role=; path=/; max-age=0';
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 gap-4">
        {/* Logo and Mobile sidebar trigger */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="xl:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link href={logoHref} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xl">
              C
            </div>
            <span className="font-bold text-lg hidden sm:block tracking-tight">CampusAI</span>
          </Link>
        </div>

        {/* Search box */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder={searchPlaceholder} className="pl-9 w-full bg-muted/40" />
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2">
          {/* Quick Actions Dropdown */}
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button size="sm" className="gap-1.5 h-9">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Actions</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {actions.map((act) => (
                    <DropdownMenuItem key={act.label} onClick={() => router.push(act.href)}>
                      <act.icon className="mr-2 h-4 w-4" />
                      {act.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme toggler */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Laptop className="mr-2 h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notification bell popover */}
          <Popover open={isNotifOpen} onOpenChange={toggleNotif}>
            <PopoverTrigger
              render={
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                </Button>
              }
            />
            <PopoverContent className="w-80" align="end">
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <span className="font-semibold text-sm">Notifications</span>
                <span className="text-xs text-muted-foreground hover:underline cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="space-y-3">
                {MOCK_NOTIFICATIONS.map((notif) => (
                  <div key={notif.id} className="text-xs space-y-1 hover:bg-muted/50 p-1.5 rounded cursor-pointer transition-colors">
                    <p className="font-medium text-foreground/90">{notif.text}</p>
                    <span className="text-muted-foreground text-[10px]">{notif.time}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* User profile avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              }
            />
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/${role.toLowerCase()}/profile`)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${role.toLowerCase()}/settings`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
