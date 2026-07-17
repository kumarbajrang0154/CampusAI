'use client';

import * as React from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PromptInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Ask CampusAI anything...',
  disabled = false,
  isLoading = false,
}: PromptInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(value);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="relative flex items-end gap-2 border rounded-lg bg-background p-2 focus-within:ring-2 focus-within:ring-ai/50 focus-within:border-ai transition-all">
      <div className="flex-1">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[44px] max-h-[160px] w-full resize-none border-0 bg-transparent p-2 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm shadow-none"
          disabled={disabled || isLoading}
          rows={1}
        />
      </div>
      <Button
        type="submit"
        size="icon"
        className="bg-ai hover:bg-ai/90 text-ai-foreground shrink-0 h-9 w-9"
        disabled={disabled || isLoading || !value.trim()}
      >
        {isLoading ? (
          <Sparkles className="h-4 w-4 animate-pulse" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send Prompt</span>
      </Button>
    </form>
  );
}
