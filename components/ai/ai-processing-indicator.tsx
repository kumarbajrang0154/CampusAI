import * as React from 'react';
import { Brain } from 'lucide-react';

interface AiProcessingIndicatorProps {
  message?: string;
}

export function AiProcessingIndicator({ message = 'AI is thinking...' }: AiProcessingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 rounded-lg bg-ai/5 border border-ai/20 text-center animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-ai/10 text-ai">
        {/* Pulsing ring animation */}
        <div className="absolute inset-0 rounded-full bg-ai/20 animate-ping opacity-75" />
        <Brain className="h-6 w-6 relative animate-pulse" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ai">{message}</p>
        <p className="text-xs text-muted-foreground">This may take a few seconds</p>
      </div>
      {/* Animated dots indicator */}
      <div className="flex space-x-1.5 justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-ai animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2.5 h-2.5 rounded-full bg-ai animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2.5 h-2.5 rounded-full bg-ai animate-bounce" />
      </div>
    </div>
  );
}
