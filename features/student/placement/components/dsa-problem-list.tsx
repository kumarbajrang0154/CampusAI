'use client';

import * as React from 'react';
import { DSADifficulty, DSAPlatform, DSAProblemStatus } from '@prisma/client';
import { ExternalLink, Video, ChevronDown, ChevronUp, Code2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateDSAProblemProgressAction } from '../actions/student-placement.actions';

export interface StudentDSAProblemItem {
  id: string;
  title: string;
  difficulty: DSADifficulty;
  platform: DSAPlatform;
  problemUrl: string;
  solutionVideoUrl?: string | null;
  codeSolution?: string | null;
  dryRunExplanation?: string | null;
  order: number;
  userStatus: DSAProblemStatus;
}

interface DSAProblemListProps {
  problems: StudentDSAProblemItem[];
  onRefresh: () => void;
}

export function DSAProblemList({
  problems,
  onRefresh,
}: DSAProblemListProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const solvedCount = problems.filter((p) => p.userStatus === 'SOLVED').length;
  const inProgressCount = problems.filter((p) => p.userStatus === 'IN_PROGRESS').length;

  const handleStatusChange = async (problemId: string, status: DSAProblemStatus) => {
    setUpdatingId(problemId);
    try {
      const res = await updateDSAProblemProgressAction(problemId, status);
      if (res.success) {
        toast.success('Problem progress updated!');
        onRefresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getDifficultyBadge = (difficulty: DSADifficulty) => {
    switch (difficulty) {
      case 'EASY':
        return <Badge variant="outline" className="border-success text-success text-[11px]">EASY</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="border-warning text-warning text-[11px]">MEDIUM</Badge>;
      case 'HARD':
        return <Badge variant="destructive" className="text-[11px]">HARD</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  const getStatusBadge = (status: DSAProblemStatus) => {
    switch (status) {
      case 'SOLVED':
        return <Badge variant="default" className="bg-success text-success-foreground text-[11px]">SOLVED</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="border-warning text-warning text-[11px]">IN PROGRESS</Badge>;
      default:
        return <Badge variant="secondary" className="text-[11px]">NOT STARTED</Badge>;
    }
  };

  return (
    <Card className="shadow-xs border bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b">
        <div>
          <CardTitle className="text-lg">Curated DSA Problem Bank</CardTitle>
          <CardDescription className="text-xs">
            Practice handpicked LeetCode and HackerRank problems mapped to your target placement domain.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-1 text-success">
            <CheckCircle2 className="h-4 w-4" />
            <span>{solvedCount} Solved</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="text-warning">
            <span>{inProgressCount} In Progress</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="text-muted-foreground font-mono">
            <span>{problems.length} Total</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Problem Title</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Solution Video</TableHead>
              <TableHead>My Status</TableHead>
              <TableHead className="text-right">Walkthrough</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                  No DSA problems available in this domain yet. Admin will seed problems shortly.
                </TableCell>
              </TableRow>
            ) : (
              problems.map((prob) => {
                const isExpanded = expandedId === prob.id;
                const hasGuide = !!(prob.dryRunExplanation || prob.codeSolution);

                return (
                  <React.Fragment key={prob.id}>
                    <TableRow className={isExpanded ? 'bg-muted/30' : undefined}>
                      <TableCell className="font-mono text-xs text-muted-foreground font-semibold">
                        {prob.order}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <a
                            href={prob.problemUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-foreground text-sm hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            <span>{prob.title}</span>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </a>
                        </div>
                      </TableCell>

                      <TableCell>
                        {getDifficultyBadge(prob.difficulty)}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {prob.platform}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {prob.solutionVideoUrl ? (
                          <a
                            href={prob.solutionVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-destructive hover:underline font-medium"
                          >
                            <Video className="h-3.5 w-3.5" /> Watch Video
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Select
                          value={prob.userStatus}
                          onValueChange={(val) => val && handleStatusChange(prob.id, val as DSAProblemStatus)}
                          disabled={updatingId === prob.id}
                        >
                          <SelectTrigger className="h-8 text-xs w-[130px]">
                            <SelectValue>{getStatusBadge(prob.userStatus)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={DSAProblemStatus.NOT_STARTED}>NOT STARTED</SelectItem>
                            <SelectItem value={DSAProblemStatus.IN_PROGRESS}>IN PROGRESS</SelectItem>
                            <SelectItem value={DSAProblemStatus.SOLVED}>SOLVED</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="text-right">
                        {hasGuide ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs gap-1 text-primary"
                            onClick={() => setExpandedId(isExpanded ? null : prob.id)}
                          >
                            {isExpanded ? (
                              <>
                                Hide Guide <ChevronUp className="h-3.5 w-3.5" />
                              </>
                            ) : (
                              <>
                                Dry Run <ChevronDown className="h-3.5 w-3.5" />
                              </>
                            )}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">—</span>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expandable row for dry-run explanation and code solution */}
                    {isExpanded && hasGuide && (
                      <TableRow className="bg-muted/20 border-b">
                        <TableCell colSpan={7} className="p-4">
                          <div className="space-y-4 max-w-4xl mx-auto bg-card rounded-md p-4 border text-xs">
                            {prob.dryRunExplanation && (
                              <div className="space-y-1.5">
                                <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                                  <Code2 className="h-4 w-4 text-primary" /> Step-by-Step Approach & Dry Run
                                </h4>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line pl-5">
                                  {prob.dryRunExplanation}
                                </p>
                              </div>
                            )}

                            {prob.codeSolution && (
                              <div className="space-y-1.5">
                                <h4 className="font-bold text-foreground text-xs">Solution Code</h4>
                                <pre className="bg-muted/80 p-3 rounded border font-mono text-[11px] overflow-x-auto text-foreground">
                                  <code>{prob.codeSolution}</code>
                                </pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
