'use client';

/**
 * components/public/hero-section.tsx
 *
 * Modern SaaS Hero Section — Clean Light Identity with Confident Blue Accent:
 * - Centered headline + concrete value proposition
 * - Surrounded by floating interactive CampusAI cards (Timetable, Assignment, Placement Drive, AI Advisor, Role Cluster)
 * - Embedded institutional login card
 */

import * as React from 'react';
import { Suspense } from 'react';
import {
  Calendar,
  BookOpen,
  Briefcase,
  Sparkles,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoginForm } from '@/features/auth/components/login-form';
import { CampusLogoMark } from '@/components/shared/campus-logo-mark';

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-background bg-dot-grid py-12 lg:py-20">
      {/* Background Soft Ambient Light Spheres */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[450px] w-[700px] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[52%_48%] lg:gap-12 items-center">

          {/* ── LEFT COLUMN: Pitch + Floating Cards Demo Container ───────────────────────── */}
          <div className="flex flex-col gap-6 relative">
            
            {/* Top Eyebrow Pill */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Smart Campus & Placement Platform</span>
            </div>

            {/* H1 Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl xl:text-6xl leading-[1.1]">
              Unify academics, learning &{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                placement intelligence
              </span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base text-muted-foreground leading-relaxed max-w-xl sm:text-lg">
              CampusAI replaces fragmented spreadsheets, messaging groups, and disconnected portals with a single platform for attendance, timetables, course materials, placement drives, and AI career guidance.
            </p>

            {/* 4 Campus Roles Cluster Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">
                Purpose-built for:
              </span>
              {['Students', 'Faculty', 'HODs', 'Admins'].map((role) => (
                <Badge key={role} variant="secondary" className="px-3 py-1 text-xs font-medium bg-muted/80 border border-border/60">
                  {role}
                </Badge>
              ))}
            </div>

            {/* ── FLOATING CAMPUS CARDS (Modern SaaS Hero Feature Cards) ────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
              
              {/* Card 1: Today's Timetable */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-card shadow-xs hover:shadow-md transition-all hover:border-primary/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Today&apos;s Timetable</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-success/10 text-success border-success/30 font-semibold">
                    10:00 AM
                  </Badge>
                </div>
                <p className="text-xs font-medium text-foreground truncate">CS202 — Object Oriented Prog.</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Classroom 302 &middot; Prof. Sharma</p>
              </div>

              {/* Card 2: Assignment Due */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-card shadow-xs hover:shadow-md transition-all hover:border-primary/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-warning/15 text-warning">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Assignment Alert</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-warning/15 text-warning border-warning/30 font-semibold">
                    Due Tomorrow
                  </Badge>
                </div>
                <p className="text-xs font-medium text-foreground truncate">Data Structures Lab 4</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">85% Students Submitted</p>
              </div>

              {/* Card 3: Placement Drive */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-card shadow-xs hover:shadow-md transition-all hover:border-primary/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-success/15 text-success">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Placement Drive</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-primary/30 font-semibold">
                    Applied
                  </Badge>
                </div>
                <p className="text-xs font-medium text-foreground truncate">Google — Software Engineer</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">$145,000 / yr &middot; Interview Phase</p>
              </div>

              {/* Card 4: AI Career Assistant */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-card shadow-xs hover:shadow-md transition-all hover:border-ai/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-ai/15 text-ai">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">AI Career Advisor</span>
                  </div>
                  <span className="text-[10px] font-bold text-ai">9.0 Target</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">Resume ATS Score: 92%</p>
                <div className="w-full bg-muted h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-[92%]" />
                </div>
              </div>

            </div>

          </div>

          {/* ── RIGHT COLUMN: Embedded Institutional Login Card ───────────────────── */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-sm shadow-xl border border-border/80 bg-card/95 backdrop-blur-sm rounded-2xl relative overflow-hidden">
              <CardHeader className="text-center pb-2">
                {/* Logo Mark */}
                <div className="mx-auto mb-3">
                  <CampusLogoMark size="lg" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">Sign In to CampusAI</CardTitle>
                <CardDescription className="text-xs">
                  Access your institutional dashboard with Single Sign-On
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
                  <LoginForm />
                </Suspense>

                <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground/80">Institutional Single Sign-On Supported</p>
                  <p className="text-[11px] text-muted-foreground">
                    Secured with Role-Based Access Control (RBAC)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
}
