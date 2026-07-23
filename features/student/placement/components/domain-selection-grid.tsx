'use client';

import * as React from 'react';
import { Briefcase, ArrowRight, Loader2, Sparkles } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface PlacementDomainItem {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface DomainSelectionGridProps {
  domains: PlacementDomainItem[];
  onSelectDomain: (domainId: string) => void;
  loadingDomainId?: string | null;
}

export function DomainSelectionGrid({
  domains,
  onSelectDomain,
  loadingDomainId,
}: DomainSelectionGridProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" /> AI-Powered Placement Prep
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Choose Your Target Placement Domain
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Select your target career track to receive a personalized, AI-generated preparation roadmap and tailored DSA problem bank.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {domains.map((domain) => {
          const isLoading = loadingDomainId === domain.id;

          return (
            <Card
              key={domain.id}
              className="flex flex-col justify-between hover:border-primary/50 transition-all duration-200 shadow-xs group"
            >
              <CardHeader className="space-y-2">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit group-hover:scale-105 transition-transform">
                  <Briefcase className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">
                  {domain.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-3 leading-relaxed">
                  {domain.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  className="w-full justify-between gap-2"
                  onClick={() => onSelectDomain(domain.id)}
                  disabled={!!loadingDomainId}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating AI Roadmap...
                    </>
                  ) : (
                    <>
                      Select Track <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
