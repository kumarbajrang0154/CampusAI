import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { BreadcrumbNav } from './breadcrumb-nav';

interface AiWorkspaceLayoutProps {
  title: string;
  description?: string;
  inputSection: React.ReactNode;
  optionsSection?: React.ReactNode;
  statusSection?: React.ReactNode;
  outputSection?: React.ReactNode;
}

export function AiWorkspaceLayout({
  title,
  description,
  inputSection,
  optionsSection,
  statusSection,
  outputSection,
}: AiWorkspaceLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Dynamic breadcrumb trail */}
      <div className="space-y-1">
        <BreadcrumbNav />
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-ai fill-ai" />
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Grid container layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left side: upload/input + options */}
        <div className="xl:col-span-1 space-y-6">
          <div className="border bg-card text-card-foreground rounded-xl p-5 space-y-6">
            <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
              Workspace Settings
            </h2>
            <div className="space-y-4">
              {inputSection}
            </div>
            {optionsSection && (
              <div className="border-t pt-5 space-y-4">
                {optionsSection}
              </div>
            )}
          </div>
        </div>

        {/* Right side: processing status & AI output results */}
        <div className="xl:col-span-2 space-y-6">
          {statusSection && <div className="w-full">{statusSection}</div>}
          
          {outputSection ? (
            <div className="w-full">{outputSection}</div>
          ) : (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-muted/10">
              <Sparkles className="h-10 w-10 text-muted/80 mb-4 stroke-1" />
              <p className="text-sm font-medium">Ready for AI generation</p>
              <p className="text-xs text-muted-foreground mt-1">Configure inputs and settings on the left to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
