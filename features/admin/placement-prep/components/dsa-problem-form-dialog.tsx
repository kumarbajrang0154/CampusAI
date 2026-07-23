'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DSADifficulty, DSAPlatform } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dsaProblemSchema, DSAProblemFormValues } from '../schemas/dsa-problem.schema';
import { createDSAProblemAction, updateDSAProblemAction } from '../actions/dsa-problem.actions';

interface DSAProblemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domains: Array<{ id: string; name: string }>;
  problemToEdit?: {
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
  } | null;
  onSuccess: () => void;
}

export function DSAProblemFormDialog({
  open,
  onOpenChange,
  domains,
  problemToEdit,
  onSuccess,
}: DSAProblemFormDialogProps) {
  const isEditing = !!problemToEdit;
  const [loading, setLoading] = React.useState(false);

  const form = useForm<DSAProblemFormValues>({
    resolver: zodResolver(dsaProblemSchema),
    defaultValues: {
      title: '',
      domainId: domains[0]?.id || '',
      difficulty: DSADifficulty.EASY,
      platform: DSAPlatform.LEETCODE,
      problemUrl: '',
      solutionVideoUrl: '',
      codeSolution: '',
      dryRunExplanation: '',
      order: 1,
    },
  });

  React.useEffect(() => {
    if (problemToEdit) {
      form.reset({
        title: problemToEdit.title,
        domainId: problemToEdit.domainId,
        difficulty: problemToEdit.difficulty,
        platform: problemToEdit.platform,
        problemUrl: problemToEdit.problemUrl,
        solutionVideoUrl: problemToEdit.solutionVideoUrl || '',
        codeSolution: problemToEdit.codeSolution || '',
        dryRunExplanation: problemToEdit.dryRunExplanation || '',
        order: problemToEdit.order || 1,
      });
    } else {
      form.reset({
        title: '',
        domainId: domains[0]?.id || '',
        difficulty: DSADifficulty.EASY,
        platform: DSAPlatform.LEETCODE,
        problemUrl: '',
        solutionVideoUrl: '',
        codeSolution: '',
        dryRunExplanation: '',
        order: 1,
      });
    }
  }, [problemToEdit, form, open, domains]);

  const onSubmit = async (values: DSAProblemFormValues) => {
    setLoading(true);
    try {
      let res;
      if (isEditing && problemToEdit) {
        res = await updateDSAProblemAction(problemToEdit.id, values);
      } else {
        res = await createDSAProblemAction(values);
      }

      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit DSA Problem' : 'Add DSA Problem to Content Bank'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update problem links, solution details, or difficulty rating.'
              : 'Add a verified coding problem to student placement preparation lists.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Problem Title</Label>
            <Input
              id="title"
              placeholder="e.g. Two Sum"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="domainId">Primary Domain</Label>
              <Select
                value={form.watch('domainId')}
                onValueChange={(val) => val && form.setValue('domainId', val)}
              >
                <SelectTrigger id="domainId">
                  <SelectValue placeholder="Select Domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((dom) => (
                    <SelectItem key={dom.id} value={dom.id}>
                      {dom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={form.watch('difficulty')}
                onValueChange={(val) => val && form.setValue('difficulty', val as DSADifficulty)}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DSADifficulty.EASY}>EASY</SelectItem>
                  <SelectItem value={DSADifficulty.MEDIUM}>MEDIUM</SelectItem>
                  <SelectItem value={DSADifficulty.HARD}>HARD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={form.watch('platform')}
                onValueChange={(val) => val && form.setValue('platform', val as DSAPlatform)}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DSAPlatform.LEETCODE}>LeetCode</SelectItem>
                  <SelectItem value={DSAPlatform.HACKERRANK}>HackerRank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min={1}
                {...form.register('order', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="problemUrl">Verified Problem URL</Label>
            <Input
              id="problemUrl"
              placeholder="https://leetcode.com/problems/two-sum/"
              {...form.register('problemUrl')}
            />
            {form.formState.errors.problemUrl && (
              <p className="text-xs text-destructive">{form.formState.errors.problemUrl.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="solutionVideoUrl">Solution Video URL (Optional YouTube link)</Label>
            <Input
              id="solutionVideoUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              {...form.register('solutionVideoUrl')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dryRunExplanation">Step-by-Step Dry Run / Approach (Optional)</Label>
            <Textarea
              id="dryRunExplanation"
              placeholder="Explain the optimal approach, time complexity O(N), and space complexity..."
              rows={3}
              {...form.register('dryRunExplanation')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="codeSolution">Code Solution Snippet (Optional)</Label>
            <Textarea
              id="codeSolution"
              placeholder="// Clean solution code..."
              rows={4}
              className="font-mono text-xs"
              {...form.register('codeSolution')}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Problem'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
