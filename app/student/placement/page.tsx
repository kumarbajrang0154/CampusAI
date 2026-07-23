'use client';

import * as React from 'react';
import { Briefcase, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
  DomainSelectionGrid,
  PlacementDomainItem,
} from '@/features/student/placement/components/domain-selection-grid';
import {
  RoadmapTimeline,
  RoadmapStageItem,
} from '@/features/student/placement/components/roadmap-timeline';
import {
  DSAProblemList,
  StudentDSAProblemItem,
} from '@/features/student/placement/components/dsa-problem-list';
import {
  getStudentPlacementProfileInfoAction,
  selectDomainAndGenerateRoadmapAction,
  getDomainDSAProblemsAction,
  listPlacementDomainsPublicAction,
} from '@/features/student/placement/actions/student-placement.actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StudentPlacementProfileData {
  id: string;
  studentId: string;
  domainId?: string | null;
  domain?: PlacementDomainItem | null;
  roadmapStages: RoadmapStageItem[];
}

export default function StudentPlacementPage() {
  const [profile, setProfile] = React.useState<StudentPlacementProfileData | null>(null);
  const [domains, setDomains] = React.useState<PlacementDomainItem[]>([]);
  const [dsaProblems, setDsaProblems] = React.useState<StudentDSAProblemItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generatingDomainId, setGeneratingDomainId] = React.useState<string | null>(null);
  const [changeTrackOpen, setChangeTrackOpen] = React.useState(false);

  const loadProfileAndProblems = React.useCallback(async () => {
    setLoading(true);
    try {
      const [resProfile, resDomains] = await Promise.all([
        getStudentPlacementProfileInfoAction(),
        listPlacementDomainsPublicAction(),
      ]);

      if (resDomains.success && resDomains.data) {
        setDomains(resDomains.data as PlacementDomainItem[]);
      }

      if (resProfile.success && resProfile.data) {
        setProfile(resProfile.data);

        // Fetch DSA problems if domain chosen
        if (resProfile.data.domainId) {
          const resProbs = await getDomainDSAProblemsAction(resProfile.data.domainId);
          if (resProbs.success && resProbs.data) {
            setDsaProblems(resProbs.data as StudentDSAProblemItem[]);
          }
        }
      } else if (!resProfile.success) {
        toast.error(resProfile.message || 'Failed to load student placement profile.');
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error loading placement center.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProfileAndProblems();
  }, [loadProfileAndProblems]);

  const handleSelectDomain = async (domainId: string) => {
    setGeneratingDomainId(domainId);
    try {
      const res = await selectDomainAndGenerateRoadmapAction(domainId);
      if (res.success && res.data) {
        toast.success('AI Roadmap generated successfully!');
        setProfile(res.data);
        setChangeTrackOpen(false);

        // Load problems for new domain
        const resProbs = await getDomainDSAProblemsAction(domainId);
        if (resProbs.success && resProbs.data) {
          setDsaProblems(resProbs.data as StudentDSAProblemItem[]);
        }
      } else {
        toast.error(res.message || 'Failed to generate placement roadmap.');
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error generating roadmap.');
    } finally {
      setGeneratingDomainId(null);
    }
  };

  const hasDomainChosen = !!(profile && profile.domainId && profile.domain);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="border-b pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" /> Placement Preparation Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalized AI career roadmaps, curated LeetCode/HackerRank problem bank, and progress tracking.
          </p>
        </div>

        {hasDomainChosen && (
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => setChangeTrackOpen(true)}>
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Switch Target Domain
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-xs text-muted-foreground border rounded-lg bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" /> Loading placement prep data...
        </div>
      ) : !hasDomainChosen ? (
        /* Domain Selection Screen */
        <DomainSelectionGrid
          domains={domains}
          onSelectDomain={handleSelectDomain}
          loadingDomainId={generatingDomainId}
        />
      ) : (
        /* Chosen Domain Roadmap & DSA Problem Bank View */
        <div className="space-y-8">
          <RoadmapTimeline
            stages={profile.roadmapStages as RoadmapStageItem[]}
            domainName={profile.domain?.name || 'Target Track'}
            onChangeDomain={() => setChangeTrackOpen(true)}
            onRefresh={loadProfileAndProblems}
          />

          <DSAProblemList
            problems={dsaProblems}
            onRefresh={loadProfileAndProblems}
          />
        </div>
      )}

      {/* Switch Domain Confirmation Modal */}
      <Dialog open={changeTrackOpen} onOpenChange={setChangeTrackOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertCircle className="h-5 w-5 text-warning" />
              Switch Target Domain Track?
            </DialogTitle>
            <DialogDescription>
              Switching your target domain will request a new AI roadmap generation for that track.
            </DialogDescription>
          </DialogHeader>

          <p className="text-xs text-muted-foreground py-2">
            Existing progress on DSA problems will be preserved. Select a new placement prep track:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {domains.map((dom) => (
              <div
                key={dom.id}
                className="flex items-center justify-between p-3 rounded-md border bg-muted/20 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-xs text-foreground">{dom.name}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{dom.description}</p>
                </div>
                <Button
                  size="sm"
                  variant={dom.id === profile?.domainId ? 'secondary' : 'default'}
                  className="h-7 text-xs"
                  onClick={() => handleSelectDomain(dom.id)}
                  disabled={dom.id === profile?.domainId || !!generatingDomainId}
                >
                  {generatingDomainId === dom.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : dom.id === profile?.domainId ? (
                    'Current'
                  ) : (
                    'Select'
                  )}
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setChangeTrackOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
