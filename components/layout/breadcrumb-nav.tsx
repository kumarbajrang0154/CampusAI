'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Friendly names mapping for common path segments
const SEGMENT_NAME_MAP: Record<string, string> = {
  student: 'Dashboard',
  faculty: 'Dashboard',
  hod: 'Dashboard',
  admin: 'Dashboard',
  attendance: 'Attendance',
  timetable: 'Timetable',
  resources: 'Learning Resources',
  assignments: 'Assignments',
  quizzes: 'Quizzes',
  placement: 'Placement Center',
  ai: 'AI Insights',
  profile: 'My Profile',
  settings: 'Settings',
  courses: 'Courses',
  department: 'Department',
  users: 'User Management',
  roles: 'Role Configuration',
  audit: 'Audit Logs',
  security: 'Security System',
};

export function BreadcrumbNav() {
  const pathname = usePathname();

  const breadcrumbs = React.useMemo(() => {
    if (!pathname) return [];
    
    const segments = pathname.split('/').filter(Boolean);
    const trail: Array<{ label: string; href: string; isLast: boolean }> = [];
    
    let currentHref = '';
    segments.forEach((segment, idx) => {
      currentHref += `/${segment}`;
      
      // Determine label: map to friendly name or capitalize segment
      const label =
        SEGMENT_NAME_MAP[segment] ??
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        
      trail.push({
        label,
        href: currentHref,
        isLast: idx === segments.length - 1,
      });
    });
    
    return trail;
  }, [pathname]);

  if (breadcrumbs.length <= 1) return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((crumb) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={crumb.href} />}>
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isLast && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
