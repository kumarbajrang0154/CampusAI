/**
 * components/public/features-section.tsx
 *
 * 3x3 feature grid — "Everything Your Campus Needs"
 * Server component — static content.
 */

import * as React from 'react';
import {
  CalendarCheck,
  Calendar,
  BookOpen,
  ListChecks,
  Briefcase,
  ScanSearch,
  CalendarClock,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Attendance Management',
    description: 'Real-time digital attendance with analytics, shortage alerts, and faculty reports.',
  },
  {
    icon: Calendar,
    title: 'Smart Timetable',
    description: 'Conflict-free timetable generation and live schedule access for all roles.',
  },
  {
    icon: BookOpen,
    title: 'Learning Management System',
    description: 'Course materials, lecture notes, and resources organized by subject and semester.',
  },
  {
    icon: ListChecks,
    title: 'Assignments & Quizzes',
    description: 'Create, submit, and grade assignments and AI-generated quizzes in one place.',
  },
  {
    icon: Briefcase,
    title: 'Placement Portal',
    description: 'Track job opportunities, manage applications, and monitor student placement progress.',
  },
  {
    icon: ScanSearch,
    title: 'AI Resume Analyzer',
    description: 'ATS-scoring, keyword gap analysis, and actionable improvement suggestions.',
  },
  {
    icon: CalendarClock,
    title: 'AI Study Planner',
    description: 'Personalized study schedules based on exam dates, weak subjects, and available time.',
  },
  {
    icon: MessageSquare,
    title: 'AI Mock Interviews',
    description: 'Role-specific practice interviews with AI-generated follow-ups and feedback.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Department-level dashboards, at-risk student detection, and institutional KPIs.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-xl text-center mb-14">
          <h2 className="font-serif-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-3">
            Everything Your Campus Needs
          </h2>
          <p className="text-muted-foreground text-base">
            Nine core modules, all connected, all in one place.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative rounded-lg border border-border/80 bg-card p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-gold/40 hover:-translate-y-0.5 academic-card"
            >
              <div className="relative">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-gold/15 group-hover:text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif-heading text-base font-bold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
