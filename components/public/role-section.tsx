/**
 * components/public/role-section.tsx
 *
 * "Built for Every Role on Campus" — 4-card grid, one per user persona.
 * Server component — static content.
 */

import * as React from 'react';
import { GraduationCap, Presentation, Users, ShieldCheck } from 'lucide-react';

const ROLES = [
  {
    icon: GraduationCap,
    role: 'Student',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    points: [
      'Track attendance and get shortage alerts',
      'Access notes, assignments, and AI study tools',
      'Prepare for placement with resume & mock interviews',
    ],
  },
  {
    icon: Presentation,
    role: 'Faculty',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    points: [
      'Mark attendance digitally in seconds',
      'Upload course materials and create quizzes',
      'Track student performance with analytics',
    ],
  },
  {
    icon: Users,
    role: 'Head of Department',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    points: [
      'Monitor department-wide attendance and outcomes',
      'Oversee faculty workload and course coverage',
      'Access placement statistics and AI insights',
    ],
  },
  {
    icon: ShieldCheck,
    role: 'Administrator',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    points: [
      'Manage all users, roles, and permissions',
      'Configure departments, courses, and semesters',
      'Review audit logs and system security events',
    ],
  },
];

export function RoleSection() {
  return (
    <section id="roles" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-xl text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">
            Built for Every Role on Campus
          </h2>
          <p className="text-muted-foreground">
            Four personas, one platform — each with a tailored experience.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {ROLES.map(({ icon: Icon, role, color, bg, border, points }) => (
            <div
              key={role}
              className={`rounded-2xl border ${border} bg-background/80 p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-3">{role}</h3>
              <ul className="space-y-2">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${color.replace('text-', 'bg-')}`} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
