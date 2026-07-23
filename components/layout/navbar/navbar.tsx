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
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
import { Badge } from '@/components/ui/badge';
import { useSidebarStore, useNotificationStore } from '@/store';
import {
  getUserNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from '@/features/admin/notifications/actions/notification.actions';

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
    { label: 'Create Assignment', href: '/faculty/assignments', icon: PlusCircle },
  ],
  HOD: [
    { label: 'Department Analytics', href: '/hod/reports', icon: Sparkles },
    { label: 'Manage Faculty', href: '/hod/faculty', icon: User },
  ],
  ADMIN: [
    { label: 'Manage Users', href: '/admin/users', icon: User },
    { label: 'Timetable Builder', href: '/admin/timetable', icon: PlusCircle },
  ],
};

interface UserNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string | Date;
}

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

  // Notification State
  const [notifications, setNotifications] = React.useState<UserNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);
  const [loadingNotifs, setLoadingNotifs] = React.useState<boolean>(false);

  // Fetch notifications on mount and popover toggle
  const loadNotifications = React.useCallback(async () => {
    if (!session?.user?.id) return;
    setLoadingNotifs(true);
    try {
      const res = await getUserNotificationsAction(10);
      if (res.success && res.data) {
        setNotifications(res.data.notifications as UserNotificationItem[]);
        setUnreadCount(res.data.unreadCount);
      }
    } finally {
      setLoadingNotifs(false);
    }
  }, [session?.user?.id]);

  React.useEffect(() => {
    if (session?.user?.id) {
      loadNotifications();
    }
  }, [session?.user?.id, loadNotifications]);

  const handleTogglePopover = (open: boolean) => {
    toggleNotif();
    if (open) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (notifId: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await markNotificationAsReadAction(notifId);
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    await markAllNotificationsAsReadAction();
  };

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
          <Link href={logoHref} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xl border border-gold/40 shadow-sm group-hover:border-gold transition-colors">
              C
            </div>
            <span className="font-serif-heading font-extrabold text-xl hidden sm:block tracking-tight text-foreground">
              Campus<span className="text-gold">AI</span>
            </span>
          </Link>
        </div>

        {/* Search box */}
        <div className="hidden md:flex flex-1 max-w-md items-center relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9 pr-4 h-9 text-sm bg-muted/40 focus:bg-background transition-colors"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 h-9 text-xs">
                  <PlusCircle className="h-4 w-4" />
                  <span>Quick Actions</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              {actions.map((act) => (
                <DropdownMenuItem key={act.label} onClick={() => router.push(act.href)}>
                  <act.icon className="mr-2 h-4 w-4" />
                  <span>{act.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme switcher */}
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
          <Popover open={isNotifOpen} onOpenChange={handleTogglePopover}>
            <PopoverTrigger
              render={
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 animate-pulse shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>
              }
            />
            <PopoverContent className="w-80 sm:w-96 p-0" align="end">
              <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              </div>

              <div className="max-h-[360px] overflow-y-auto divide-y">
                {loadingNotifs ? (
                  <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" /> Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <Bell className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1" />
                    <p className="font-medium text-foreground/80">No notifications yet</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      You will see alerts here when announcements or updates arrive.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                      className={`p-3 text-xs space-y-1 hover:bg-muted/50 cursor-pointer transition-colors relative ${
                        !notif.isRead ? 'bg-primary/[0.03]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                          <p className="font-semibold text-foreground/90 leading-tight">
                            {notif.title}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono uppercase shrink-0">
                          {notif.type}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground line-clamp-2 text-[11px] pl-3.5">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pl-3.5 pt-0.5">
                        <span className="text-muted-foreground/80 text-[10px]">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                        {!notif.isRead && (
                          <span className="text-[10px] text-primary hover:underline">
                            Mark as read
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
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
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${role.toLowerCase()}/settings`)}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
