'use client';

import * as React from 'react';
import { DSADifficulty, DSAPlatform } from '@prisma/client';
import { MoreHorizontal, Edit, Trash2, ExternalLink, Video, FileCode } from 'lucide-react';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface DSAProblemItem {
  id: string;
  title: string;
  domainId: string;
  difficulty: DSADifficulty;
  platform: DSAPlatform;
  problemUrl: string;
  solutionVideoUrl?: string | null;
  codeSolution?: string | null;
  dryRunExplanation?: string | null;
  order: number;
  domain?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface DSAProblemTableProps {
  data: DSAProblemItem[];
  onEdit: (problem: DSAProblemItem) => void;
  onDelete: (problem: DSAProblemItem) => void;
}

export function DSAProblemTable({
  data,
  onEdit,
  onDelete,
}: DSAProblemTableProps) {
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

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-[60px]">Order</TableHead>
            <TableHead>Problem Title</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Content Assets</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                No DSA problems in the content bank yet. Click "Add Problem" to seed real LeetCode or HackerRank challenges.
              </TableCell>
            </TableRow>
          ) : (
            data.map((prob) => (
              <TableRow key={prob.id}>
                <TableCell className="font-mono text-xs text-muted-foreground font-semibold">
                  #{prob.order}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{prob.title}</span>
                    <a
                      href={prob.problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                      title="Open Verified Problem Link"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {prob.domain?.name || 'General'}
                  </Badge>
                </TableCell>

                <TableCell>
                  {getDifficultyBadge(prob.difficulty)}
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className="text-xs font-mono">
                    {prob.platform}
                  </Badge>
                </TableCell>

                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {prob.solutionVideoUrl && (
                      <span className="flex items-center gap-1 text-destructive font-medium" title="Video Solution Present">
                        <Video className="h-3.5 w-3.5" /> Video
                      </span>
                    )}
                    {prob.dryRunExplanation && (
                      <span className="flex items-center gap-1 text-primary font-medium" title="Dry Run Explanation Present">
                        <FileCode className="h-3.5 w-3.5" /> Guide
                      </span>
                    )}
                    {!prob.solutionVideoUrl && !prob.dryRunExplanation && (
                      <span className="text-muted-foreground italic text-[11px]">Problem Link Only</span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(prob)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Problem
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(prob)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Problem
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
