/**
 * components/public/explanation-section.tsx
 *
 * "What is CampusAI?" section explaining the platform's purpose.
 * Server component — purely static content.
 */

import * as React from 'react';
import { ArrowRight, Layers } from 'lucide-react';

const BEFORE_TOOLS = [
  'Google Drive (notes)',
  'WhatsApp groups',
  'Separate ERP portal',
  'Manual attendance sheets',
  'External placement tools',
  'Email for assignments',
];

const AFTER_MODULES = [
  'Smart LMS',
  'AI Announcements',
  'Unified ERP',
  'Digital Attendance',
  'Placement Portal',
  'Assignment System',
];

export function ExplanationSection() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 mb-4">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wide uppercase">Overview</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            What is CampusAI?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A unified intelligent platform built for the modern college campus.
          </p>
        </div>

        {/* Two-column explanation */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 mb-16">
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Higher education institutions rely on a patchwork of disconnected systems — student
              portals for attendance, shared drives for lecture notes, messaging apps for
              announcements, spreadsheets for timetables, and a separate placement cell tool. The
              result is fragmented data, duplicated effort, and a poor experience for students,
              faculty, and administrators alike.
            </p>
            <p>
              <strong className="text-foreground">CampusAI</strong> changes that by consolidating
              College ERP, a full Learning Management System, Attendance tracking, Smart
              Timetabling, Placement Management, and AI-powered academic assistance into a single,
              role-aware platform that every member of the campus community uses every day.
            </p>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Every feature is built around four first-class personas — <strong className="text-foreground">Students</strong>{' '}
              who need to learn, track progress, and prepare for careers;{' '}
              <strong className="text-foreground">Faculty</strong> who need to teach, assess, and
              report; <strong className="text-foreground">Heads of Department</strong> who need
              visibility into their department&apos;s health; and{' '}
              <strong className="text-foreground">Administrators</strong> who need to manage the
              entire institution.
            </p>
            <p>
              The AI layer — powered by Google Gemini — is woven throughout: it analyzes resumes,
              generates mock interviews, creates personalized study plans, flags at-risk students,
              and provides academic guidance on demand.
            </p>
          </div>
        </div>

        {/* Before vs After diagram */}
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] items-center">
            {/* Before */}
            <div className="rounded-2xl border bg-background/80 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Before</p>
              <p className="text-sm font-semibold text-foreground mb-4">Disconnected Tools</p>
              <ul className="space-y-2">
                {BEFORE_TOOLS.map((tool) => (
                  <li key={tool} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive/60 flex-shrink-0" />
                    {tool}
                  </li>
                ))}
              </ul>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <ArrowRight className="h-6 w-6" />
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">After</p>
              <p className="text-sm font-semibold text-foreground mb-4">CampusAI — One Platform</p>
              <ul className="space-y-2">
                {AFTER_MODULES.map((mod) => (
                  <li key={mod} className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {mod}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
