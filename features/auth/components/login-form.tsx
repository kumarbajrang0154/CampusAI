'use client';

/**
 * features/auth/components/login-form.tsx
 *
 * Reusable login form component used by:
 *  - app/(auth)/login/page.tsx  (standalone full-page login)
 *  - app/(public)/page.tsx      (embedded in the home page hero section)
 *
 * Accepts an optional `compact` prop for the embedded variant — when true
 * the surrounding card and heading are hidden so the parent can provide
 * its own card shell.
 */

import * as React from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

import { setRoleCookie } from '@/lib/utils';
import { getRoleDashboardPath } from '@/lib/get-role-dashboard-path';
import { loginSchema, type LoginInput } from '@/features/auth/schemas/login.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ---------------------------------------------------------------------------
// Error code → User-friendly message
// ---------------------------------------------------------------------------

function getErrorMessage(error: string | null): string | null {
  if (!error) return null;
  switch (error) {
    case 'ACCOUNT_INACTIVE':
      return 'Your account is inactive. Please contact your administrator.';
    case 'ACCOUNT_LOCKED':
      return 'Your account is temporarily locked due to too many failed login attempts. Please try again in 15 minutes.';
    case 'CredentialsSignin':
    default:
      return 'Invalid email or password. Please check your credentials and try again.';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface LoginFormProps {
  /** When true, suppresses the Card/heading wrapper so parent controls the shell */
  compact?: boolean;
  /** Override callback URL after login */
  callbackUrlOverride?: string;
}

export function LoginForm({ callbackUrlOverride }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = callbackUrlOverride ?? searchParams.get('callbackUrl') ?? '';
  const errorParam = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result) {
        setSubmitError('An unexpected error occurred. Please try again.');
        return;
      }
      if (result.error) {
        setSubmitError(getErrorMessage(result.error) ?? 'Login failed.');
        return;
      }

      // Fetch session to get role for redirect + role cookie
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const role = session?.user?.role as string | undefined;

      if (role) setRoleCookie(role);

      if (callbackUrl && callbackUrl.startsWith('/')) {
        router.push(callbackUrl);
      } else {
        router.push(getRoleDashboardPath(role));
      }

      router.refresh();
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const urlError = errorParam ? getErrorMessage(errorParam) : null;
  const displayError = submitError ?? urlError;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {displayError && (
          <Alert variant="destructive">
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@university.edu"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-10" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Form>
  );
}
