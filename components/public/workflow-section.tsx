/**
 * components/public/workflow-section.tsx
 *
 * "How It Works" section — static 4-step numbered sequence.
 * Server component.
 */

import * as React from 'react';
import { LogIn, LayoutDashboard, Brain, TrendingUp } from 'lucide-react';

const STEPS = [
  {
    icon: LogIn,
    title: 'Log In',
    description: 'Secure, role-based access for Students, Faculty, Heads of Department, and Administrators.',
  },
  {
    icon: LayoutDashboard,
    title: 'Access Your Dashboard',
    description: 'A personalized view of your attendance, classes, assignments, notifications, and analytics.',
  },
  {
    icon: Brain,
    title: 'Use AI Tools',
    description: 'Get AI-powered resume analysis, personalized study plans, quiz generation, and academic guidance.',
  },
  {
    icon: TrendingUp,
    title: 'Track & Improve',
    description: 'Analytics and insights help students, faculty, and administrators make better decisions every day.',
  },
];

export function WorkflowSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            From first login to measurable outcomes — four simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="absolute top-10 left-0 right-0 hidden lg:block">
            <div className="mx-auto h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" style={{ maxWidth: '72%', marginLeft: '14%' }} />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, idx) => (
              <div key={step.title} className="flex flex-col items-center text-center relative">
                {/* Step number circle + icon */}
                <div className="relative mb-5 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 shadow-lg ring-4 ring-background transition-transform hover:scale-105">
                  <step.icon className="h-8 w-8 text-primary" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow">
                    {idx + 1}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
