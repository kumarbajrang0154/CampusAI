import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  BookOpen,
  FileText,
  ListChecks,
  Briefcase,
  Brain,
  User,
  Settings,
  Users,
  Shield,
  Building,
  GraduationCap,
  FolderTree,
  BookOpenCheck,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

export const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
  { label: 'Attendance', icon: CalendarCheck, href: '/student/attendance' },
  { label: 'Timetable', icon: Calendar, href: '/student/timetable' },
  { label: 'Learning', icon: BookOpen, href: '/student/resources' },
  { label: 'Assignments', icon: FileText, href: '/student/assignments' },
  { label: 'Quiz', icon: ListChecks, href: '/student/quizzes' },
  { label: 'Placement', icon: Briefcase, href: '/student/placement' },
  { label: 'AI Center', icon: Brain, href: '/student/ai' },
  { label: 'Profile', icon: User, href: '/student/profile' },
  { label: 'Settings', icon: Settings, href: '/student/settings' },
];

export const FACULTY_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/faculty/dashboard' },
  { label: 'Courses', icon: BookOpenCheck, href: '/faculty/courses' },
  { label: 'Timetable', icon: Calendar, href: '/faculty/timetable' },
  { label: 'Resources', icon: BookOpen, href: '/faculty/resources' },
  { label: 'Assignments', icon: FileText, href: '/faculty/assignments' },
  { label: 'Quizzes', icon: ListChecks, href: '/faculty/quizzes' },
  { label: 'Analytics', icon: Activity, href: '/faculty/analytics' },
  { label: 'AI Insights', icon: Brain, href: '/faculty/ai' },
  { label: 'Profile', icon: User, href: '/faculty/profile' },
  { label: 'Settings', icon: Settings, href: '/faculty/settings' },
];

export const HOD_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/hod/dashboard' },
  { label: 'Department', icon: Building, href: '/hod/department' },
  { label: 'Faculty', icon: Users, href: '/hod/faculty' },
  { label: 'Students', icon: GraduationCap, href: '/hod/students' },
  { label: 'Attendance', icon: CalendarCheck, href: '/hod/attendance' },
  { label: 'Analytics', icon: Activity, href: '/hod/analytics' },
  { label: 'Placement', icon: Briefcase, href: '/hod/placement' },
  { label: 'Profile', icon: User, href: '/hod/profile' },
  { label: 'Settings', icon: Settings, href: '/hod/settings' },
];

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Roles', icon: Shield, href: '/admin/roles' },
  { label: 'Departments', icon: Building, href: '/admin/departments' },
  { label: 'Courses', icon: BookOpenCheck, href: '/admin/courses' },
  { label: 'Subjects', icon: BookOpen, href: '/admin/subjects' },
  { label: 'Semesters', icon: FolderTree, href: '/admin/semesters' },
  { label: 'Timetable', icon: Calendar, href: '/admin/timetable' },
  { label: 'Academics', icon: GraduationCap, href: '/admin/academics' },
  { label: 'AI Center', icon: Brain, href: '/admin/ai' },
  { label: 'Placement', icon: Briefcase, href: '/admin/placement' },
  { label: 'Audit Logs', icon: Activity, href: '/admin/audit' },
  { label: 'Security', icon: ShieldAlert, href: '/admin/security' },
  { label: 'Profile', icon: User, href: '/admin/profile' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export const ROLE_NAV_MAP = {
  STUDENT: STUDENT_NAV,
  FACULTY: FACULTY_NAV,
  HOD: HOD_NAV,
  ADMIN: ADMIN_NAV,
} as const;
