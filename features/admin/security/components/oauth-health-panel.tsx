'use client';

import * as React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOAuthHealthCheckAction } from '../actions/security.actions';

export interface OAuthHealthData {
  provider: string;
  isHealthy: boolean;
  hasGoogleId: boolean;
  hasGoogleSecret: boolean;
  hasNextAuthSecret: boolean;
  googleIdSnippet: string;
  callbackUrl: string;
}

export function OAuthHealthPanel() {
  const [health, setHealth] = React.useState<OAuthHealthData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getOAuthHealthCheckAction().then((res) => {
      if (res.success && res.data) {
        setHealth(res.data as OAuthHealthData);
      }
      setLoading(false);
    });
  }, []);

  return (
    <Card className="shadow-none border">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" /> Single Sign-On (Google OAuth 2.0 Health Check)
          </CardTitle>
          {loading ? (
            <Badge variant="outline">Checking...</Badge>
          ) : health?.isHealthy ? (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 text-[11px]">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> OAuth Healthy
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1 text-[11px]">
              <AlertTriangle className="h-3 w-3" /> Configuration Action Required
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-xs">
        {/* Status Summary Banner */}
        <div
          className={`p-3 rounded-lg border flex items-start gap-2.5 ${
            health?.isHealthy
              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/50 border-amber-200 text-amber-900'
          }`}
        >
          <ShieldCheck
            className={`h-5 w-5 shrink-0 mt-0.5 ${
              health?.isHealthy ? 'text-emerald-600' : 'text-amber-600'
            }`}
          />
          <div>
            <p className="font-semibold text-xs">
              {health?.isHealthy
                ? 'Google OAuth Provider Status: Fully Operational'
                : 'Google OAuth Provider Status: Missing Required Environment Variables'}
            </p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Google OAuth is the sole authentication provider for CampusAI. Credentials are safe-guarded via Vercel/.env environment variables.
            </p>
          </div>
        </div>

        {/* Config Parameter Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-2.5 rounded border bg-muted/30">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              GOOGLE_CLIENT_ID
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xs truncate max-w-[150px]">
                {health?.googleIdSnippet || 'Not Set'}
              </span>
              {health?.hasGoogleId ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
            </div>
          </div>

          <div className="p-2.5 rounded border bg-muted/30">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              GOOGLE_CLIENT_SECRET
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xs">
                {health?.hasGoogleSecret ? '••••••••••••' : 'Not Set'}
              </span>
              {health?.hasGoogleSecret ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
            </div>
          </div>

          <div className="p-2.5 rounded border bg-muted/30">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              NEXTAUTH_SECRET
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xs">
                {health?.hasNextAuthSecret ? '••••••••••••' : 'Not Set'}
              </span>
              {health?.hasNextAuthSecret ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Callback URI Display */}
        <div className="p-3 rounded border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-foreground">Authorized Redirect Callback URI</span>
            <p className="font-mono text-[11px] text-primary truncate">
              {health?.callbackUrl || 'http://localhost:3000/api/auth/callback/google'}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground italic shrink-0">
            Configured in Google Cloud Console
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
