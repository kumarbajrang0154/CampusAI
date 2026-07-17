'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BreadcrumbNav } from './breadcrumb-nav';

interface WizardStep {
  label: string;
  description?: string;
}

interface WizardLayoutProps {
  title: string;
  steps: WizardStep[];
  currentStepIndex: number;
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
}

export function WizardLayout({
  title,
  steps,
  currentStepIndex,
  children,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  isSubmitting = false,
}: WizardLayoutProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      {/* Header section with breadcrumbs */}
      <div className="space-y-1">
        <BreadcrumbNav />
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>

      {/* Step Indicator row */}
      <div className="border bg-card rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            
            return (
              <div key={step.label} className="flex-1 flex items-center w-full gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors border',
                      isCompleted
                        ? 'bg-success border-success text-success-foreground'
                        : isCurrent
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-muted border-border text-muted-foreground'
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="text-left">
                    <p className={cn('text-xs font-semibold', isCurrent ? 'text-foreground' : 'text-muted-foreground')}>
                      {step.label}
                    </p>
                    {step.description && !isCollapsed && (
                      <p className="text-[10px] text-muted-foreground hidden md:block">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      'hidden sm:block h-0.5 flex-1 min-w-[20px] transition-colors',
                      isCompleted ? 'bg-success' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content container */}
      <div className="border bg-card text-card-foreground rounded-xl shadow-xs p-6 min-h-[300px] flex flex-col justify-between space-y-6">
        <div className="flex-1 w-full">{children}</div>

        {/* Previous / Next buttons footer row */}
        <div className="border-t pt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isFirstStep || isSubmitting}
            size="sm"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={onNext}
            disabled={isSubmitting}
            size="sm"
            className={isLastStep ? 'bg-success hover:bg-success/90 text-success-foreground' : ''}
          >
            {isLastStep ? (isSubmitting ? 'Submitting...' : 'Finish') : 'Next'}
            {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Collapsible helper
const isCollapsed = false;
