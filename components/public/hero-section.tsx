'use client';

/**
 * components/public/hero-section.tsx
 *
 * Above-the-fold hero section. Two-column split layout:
 * - Left: pitch copy + trust indicators
 * - Right: embedded login form card
 *
 * On mobile: login card first (order-first), pitch below.
 */

import * as React from 'react';
import { Suspense } from 'react';
import { Shield, Brain, Users, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoginForm } from '@/features/auth/components/login-form';

const TRUST_ITEMS = [
  { icon: Users, label: '4 User Roles' },
  { icon: Brain, label: '12+ AI Features' },
  { icon: Shield, label: 'RBAC-Protected' },
  { icon: GraduationCap, label: 'Campus-First' },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-ai/5" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-ai/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[55%_45%] lg:gap-16 items-center">

          {/* ── LEFT COLUMN: Pitch ─────────────────────────────────────────── */}
          <div className="order-2 lg:order-1 flex flex-col gap-6">
            {/* Eyebrow */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-bold text-foreground dark:text-gold tracking-wider uppercase">
                AI-Powered Smart Campus Platform
              </span>
            </div>

            {/* H1 Headline */}
            <h1 className="font-serif-heading text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl xl:text-[3.5rem] xl:leading-[1.1]">
              One platform for academics,{' '}
              <span className="bg-gradient-to-r from-primary via-primary-600 to-gold bg-clip-text text-transparent">
                learning & placement
              </span>
            </h1>

            {/* Supporting paragraph */}
            <p className="text-base text-muted-foreground leading-relaxed max-w-xl lg:text-lg">
              Most colleges juggle a dozen disconnected tools — Google Drive for notes, WhatsApp for
              announcements, separate portals for timetable and attendance. CampusAI replaces all of
              them with a unified ERP, LMS, Placement Portal, and AI advisor in one secure platform.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4 pt-2">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-md border border-border/80 bg-card px-3.5 py-2 shadow-xs transition-all hover:border-gold/30"
                >
                  <Icon className="h-4 w-4 text-gold" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Login Card ────────────────────────────────────── */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <Card className="w-full max-w-sm shadow-xl border border-gold/30 bg-card/95 backdrop-blur-sm relative overflow-hidden academic-card">
              <CardHeader className="text-center pb-2">
                {/* Small logo mark inside card */}
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-2xl shadow-md border border-gold/40">
                  C
                </div>
                <CardTitle className="text-xl font-serif-heading font-bold">Welcome Back</CardTitle>
                <CardDescription>Sign in with your institutional Google account</CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
                  <LoginForm />
                </Suspense>

                <p className="mt-5 text-center text-xs text-muted-foreground">
                  Having trouble?{' '}
                  <span className="font-medium text-foreground/70">
                    Contact your institution admin
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
