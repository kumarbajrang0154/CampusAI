'use client';

import * as React from 'react';
import { DSADifficulty, DSAPlatform } from '@prisma/client';
import { Plus, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DSAProblemTable,
  DSAProblemItem,
} from '@/features/admin/placement-prep/components/dsa-problem-table';
import { DSAProblemFormDialog } from '@/features/admin/placement-prep/components/dsa-problem-form-dialog';
import { DeleteDSAProblemDialog } from '@/features/admin/placement-prep/components/delete-dsa-problem-dialog';
import {
  listDSAProblemsAction,
  listPlacementDomainsAction,
} from '@/features/admin/placement-prep/actions/dsa-problem.actions';

export default function AdminDSAProblemBankPage() {
  const [problems, setProblems] = React.useState<DSAProblemItem[]>([]);
  const [domains, setDomains] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [domainFilter, setDomainFilter] = React.useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>('ALL');
  const [platformFilter, setPlatformFilter] = React.useState<string>('ALL');

  // Modal states
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedProblem, setSelectedProblem] = React.useState<DSAProblemItem | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [resProbs, resDomains] = await Promise.all([
        listDSAProblemsAction({
          search: search || undefined,
          domainId: domainFilter !== 'ALL' ? domainFilter : undefined,
          difficulty: difficultyFilter !== 'ALL' ? (difficultyFilter as DSADifficulty) : undefined,
          platform: platformFilter !== 'ALL' ? (platformFilter as DSAPlatform) : undefined,
          limit: 200,
        }),
        listPlacementDomainsAction(),
      ]);

      if (resProbs.success && resProbs.data) {
        setProblems(resProbs.data.items as DSAProblemItem[]);
      } else {
        toast.error(resProbs.message || 'Failed to load DSA problems.');
      }

      if (resDomains.success && resDomains.data) {
        setDomains(resDomains.data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })));
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error loading DSA problem bank.');
    } finally {
      setLoading(false);
    }
  }, [search, domainFilter, difficultyFilter, platformFilter]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setSelectedProblem(null);
    setFormOpen(true);
  };

  const handleEdit = (problem: DSAProblemItem) => {
    setSelectedProblem(problem);
    setFormOpen(true);
  };

  const handleDelete = (problem: DSAProblemItem) => {
    setSelectedProblem(problem);
    setDeleteOpen(true);
  };

  return (
    <DataTableLayout
      title="DSA Problem Bank Management"
      description="Manage verified LeetCode and HackerRank challenges mapped to placement preparation tracks."
      action={
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Problem
        </Button>
      }
    >
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select value={domainFilter} onValueChange={(val) => val && setDomainFilter(val)}>
            <SelectTrigger className="h-9 text-xs w-[160px]">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Domains</SelectItem>
              {domains.map((dom) => (
                <SelectItem key={dom.id} value={dom.id}>
                  {dom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={(val) => val && setDifficultyFilter(val)}>
            <SelectTrigger className="h-9 text-xs w-[130px]">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Difficulties</SelectItem>
              <SelectItem value={DSADifficulty.EASY}>EASY</SelectItem>
              <SelectItem value={DSADifficulty.MEDIUM}>MEDIUM</SelectItem>
              <SelectItem value={DSADifficulty.HARD}>HARD</SelectItem>
            </SelectContent>
          </Select>

          <Select value={platformFilter} onValueChange={(val) => val && setPlatformFilter(val)}>
            <SelectTrigger className="h-9 text-xs w-[130px]">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Platforms</SelectItem>
              <SelectItem value={DSAPlatform.LEETCODE}>LeetCode</SelectItem>
              <SelectItem value={DSAPlatform.HACKERRANK}>HackerRank</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={loadData}>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-xs text-muted-foreground border rounded-md bg-card">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" /> Loading DSA problem bank...
        </div>
      ) : (
        <DSAProblemTable
          data={problems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Dialogs */}
      <DSAProblemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        domains={domains}
        problemToEdit={selectedProblem}
        onSuccess={loadData}
      />

      <DeleteDSAProblemDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        problem={selectedProblem}
        onSuccess={loadData}
      />
    </DataTableLayout>
  );
}
