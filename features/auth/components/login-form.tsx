'use client';

/**
 * features/auth/components/login-form.tsx
 *
 * Reusable login form component. Now converted to Google OAuth only.
 * Gated by a pre-provisioning check in NextAuth.
 */

import * as React from 'react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ---------------------------------------------------------------------------
// Error code → User-friendly message
// ---------------------------------------------------------------------------

function getErrorMessage(error: string | null): string | null {
  if (!error) return null;
  switch (error) {
    case 'AccessDenied':
      return 'No account found for this email. Please contact your institution administrator to get access.';
    case 'Verification':
      return 'Verification link has expired or has already been used.';
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
    case 'EmailCreateAccount':
    case 'Callback':
    case 'OAuthAccountNotLinked':
    case 'EmailSignin':
    case 'CredentialsSignin':
    default:
      return 'Sign-in failed. Please try again or contact support.';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch {
      setIsLoading(false);
    }
  }

  const displayError = getErrorMessage(errorParam);

  return (
    <div className="space-y-4">
      {displayError && (
        <Alert variant="destructive">
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 flex items-center justify-center gap-3 font-semibold text-sm border-muted-foreground/20 hover:bg-muted/50 transition-colors animate-fade-in"
        disabled={isLoading}
        onClick={handleGoogleLogin}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            Redirecting to Google…
          </>
        ) : (
          <>
            {/* Google official multicolour G mark SVG */}
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </>
        )}
      </Button>
    </div>
  );
}
