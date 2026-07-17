'use client';

/**
 * app/(auth)/login/page.tsx — Standalone Login Page
 *
 * Thin shell that renders the shared LoginForm inside a centered card.
 * All form logic lives in features/auth/components/login-form.tsx
 */

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/features/auth/components/login-form';

function LoginPageContent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl">
            C
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your CampusAI account</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Having trouble?{' '}
            <span className="font-medium text-foreground/70">Contact your institution admin</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
