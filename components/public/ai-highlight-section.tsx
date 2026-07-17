/**
 * components/public/ai-highlight-section.tsx
 *
 * AI Spotlight section — shows 4 flagship AI features with mock output card.
 * Server component — static content. Uses the existing AiResponseCard component.
 */

import * as React from 'react';
import { Sparkles, ScanSearch, MessageSquare, CalendarClock, BookMarked } from 'lucide-react';
import { AiResponseCard } from '@/components/ai/ai-response-card';

const AI_FEATURES = [
  {
    icon: ScanSearch,
    title: 'Resume Analyzer',
    description: 'ATS keyword scoring, gap analysis, and rewrite suggestions tailored to job descriptions.',
  },
  {
    icon: MessageSquare,
    title: 'Mock Interview Coach',
    description: 'Role-specific interview questions with real-time AI follow-ups and structured feedback.',
  },
  {
    icon: CalendarClock,
    title: 'Study Planner',
    description: 'Personalized daily schedules based on exam dates, weak subjects, and available hours.',
  },
  {
    icon: BookMarked,
    title: 'Academic Advisor',
    description: 'Detects at-risk students from attendance and grades, and suggests targeted interventions.',
  },
];

export function AiHighlightSection() {
  return (
    <section id="ai" className="py-20 lg:py-28 bg-gradient-to-b from-ai/5 via-ai/3 to-transparent relative overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-ai/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-xl text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-ai/30 bg-ai/10 px-3 py-1 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-ai" />
            <span className="text-xs font-semibold text-ai tracking-wide uppercase">Powered by Gemini</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">
            AI That Actually Helps
          </h2>
          <p className="text-muted-foreground">
            Not a chatbot bolted on — AI woven into every workflow students and faculty care about.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-start">
          {/* Feature list */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {AI_FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-ai/20 bg-ai/5 p-5 transition-all duration-200 hover:border-ai/40 hover:bg-ai/10"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ai/15">
                  <Icon className="h-5 w-5 text-ai" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          {/* Mock AI output card */}
          <div className="flex flex-col gap-4">
            <AiResponseCard title="Resume Analysis — Sample Output">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ai uppercase tracking-wide">ATS Score</span>
                  <span className="text-lg font-bold text-foreground">72 / 100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-ai/10 overflow-hidden">
                  <div className="h-full w-[72%] rounded-full bg-ai transition-all" />
                </div>
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-medium text-foreground">Keyword Gaps Detected</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Docker', 'REST APIs', 'CI/CD', 'PostgreSQL'].map((kw) => (
                      <span
                        key={kw}
                        className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs text-destructive font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-medium text-foreground">Suggested Improvements</p>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <span className="mt-1 h-1 w-1 rounded-full bg-ai flex-shrink-0" />
                      Quantify your internship impact with metrics (e.g., &ldquo;reduced load time by 40%&rdquo;)
                    </li>
                    <li className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <span className="mt-1 h-1 w-1 rounded-full bg-ai flex-shrink-0" />
                      Add a &ldquo;Skills&rdquo; section with the missing keywords above
                    </li>
                  </ul>
                </div>
              </div>
            </AiResponseCard>
            <p className="text-center text-xs text-muted-foreground italic">
              Sample AI output — actual results are personalized to your resume and target role.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
