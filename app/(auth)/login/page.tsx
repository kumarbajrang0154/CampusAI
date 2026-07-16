'use client';

/**
 * app/(auth)/login/page.tsx — Login Page
 *
 * Functional login form with:
 * - react-hook-form + Zod v4 validation
 * - NextAuth signIn("credentials") submission
 * - Role-based dashboard redirect on success
 * - Generic error messages (never reveal which field was wrong)
 * - Distinct "account locked" messaging
 */

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';

import { setRoleCookie } from '@/lib/utils';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ---------------------------------------------------------------------------
// Role → Dashboard mapping (client-side redirect after login)
// ---------------------------------------------------------------------------

const ROLE_DASHBOARD: Record<string, string> = {
  STUDENT: '/student/dashboard',
  FACULTY: '/faculty/dashboard',
  HOD: '/hod/dashboard',
  ADMIN: '/admin/dashboard',
};

// ---------------------------------------------------------------------------
// Error code → User-friendly message
// ---------------------------------------------------------------------------

function getErrorMessage(error: string | null): string | null {
  if (!error) return null;

  // NextAuth error codes come through the `error` URL param
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
// Page Component
// ---------------------------------------------------------------------------

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '';
  const errorParam = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false, // Handle redirect manually for role-based routing
      });

      if (!result) {
        setSubmitError('An unexpected error occurred. Please try again.');
        return;
      }

      if (result.error) {
        setSubmitError(getErrorMessage(result.error) ?? 'Login failed.');
        return;
      }

      // Fetch session to determine role for redirect and set role cookie for proxy
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const role = session?.user?.role as string | undefined;

      if (role) {
        // Set the lightweight role cookie (valid for 30 days)
        setRoleCookie(role);
      }

      if (callbackUrl && callbackUrl.startsWith('/')) {
        router.push(callbackUrl);
      } else {
        const dashboard = (role && ROLE_DASHBOARD[role]) ?? '/';
        router.push(dashboard);
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your CampusAI account</CardDescription>
        </CardHeader>

        <CardContent>
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
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
                        className="text-sm text-muted-foreground hover:underline"
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
