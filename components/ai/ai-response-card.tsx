'use client';

import * as React from 'react';
import { Sparkles, Copy, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AiResponseCardProps {
  title?: string;
  children: React.ReactNode;
  onRegenerate?: () => void;
  onCopy?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
}

export function AiResponseCard({
  title = 'AI Insights',
  children,
  onRegenerate,
  onCopy,
  onExport,
  isLoading = false,
}: AiResponseCardProps) {
  const handleCopyStub = () => {
    if (onCopy) {
      onCopy();
    } else {
      alert('Content copied to clipboard! (Stubbed)');
    }
  };

  const handleExportStub = () => {
    if (onExport) {
      onExport();
    } else {
      alert('Content exported! (Stubbed)');
    }
  };

  return (
    <Card className="border-l-4 border-l-ai bg-gradient-to-r from-ai/5 via-background to-primary/5 dark:from-ai/10 dark:via-card dark:to-primary/10 border-t border-r border-b shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border/40">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-ai">
          <span className="p-1 rounded bg-ai/15 text-ai">
            <Sparkles className="h-3.5 w-3.5 fill-ai" />
          </span>
          {title}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-ai hover:bg-ai/10" onClick={handleCopyStub}>
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-ai hover:bg-ai/10" onClick={handleExportStub}>
            <Download className="h-4 w-4" />
            <span className="sr-only">Export</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-foreground/90 space-y-2 leading-relaxed pt-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-full bg-ai/10 animate-pulse rounded" />
            <div className="h-4 w-[90%] bg-ai/10 animate-pulse rounded" />
            <div className="h-4 w-[80%] bg-ai/10 animate-pulse rounded" />
          </div>
        ) : (
          children
        )}
      </CardContent>
      {onRegenerate && !isLoading && (
        <CardFooter className="pt-2 flex justify-end">
          <Button variant="ghost" size="sm" className="text-ai hover:text-ai/80 hover:bg-ai/10 gap-2" onClick={onRegenerate}>
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
