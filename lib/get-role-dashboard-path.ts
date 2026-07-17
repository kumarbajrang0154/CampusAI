/**
 * lib/get-role-dashboard-path.ts
 * Maps a UserRole string to its role-specific dashboard path.
 * Used for server-side redirects and client-side navigation.
 */

export function getRoleDashboardPath(role?: string | null): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'FACULTY':
      return '/faculty/dashboard';
    case 'HOD':
      return '/hod/dashboard';
    case 'STUDENT':
    default:
      return '/student/dashboard';
  }
}
