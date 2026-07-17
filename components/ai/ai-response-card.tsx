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
    <Card className="border-l-4 border-l-ai bg-ai/5 dark:bg-ai/10 transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-ai">
          <Sparkles className="h-4 w-4 fill-ai" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-ai" onClick={handleCopyStub}>
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-ai" onClick={handleExportStub}>
            <Download className="h-4 w-4" />
            <span className="sr-only">Export</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-foreground/90 space-y-2 leading-relaxed">
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
