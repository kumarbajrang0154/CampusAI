'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Loader2, Coffee } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PeriodTemplateInput } from '../schemas/timetable.schema';
import { getPeriodTemplatesAction, savePeriodTemplatesAction } from '../actions/timetable.actions';

interface PeriodSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PeriodSettingsDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: PeriodSettingsDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [periods, setPeriods] = useState<PeriodTemplateInput[]>([]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await getPeriodTemplatesAction();
        if (res.success && res.data) {
          setPeriods(
            res.data.map((p: any) => ({
              periodNumber: p.periodNumber,
              startTime: p.startTime,
              endTime: p.endTime,
              isBreak: p.isBreak,
              breakLabel: p.breakLabel || '',
            }))
          );
        }
      } catch {
        toast.error('Failed to load period configurations.');
      } finally {
        setIsLoading(false);
      }
    }
    if (isOpen) {
      load();
    }
  }, [isOpen]);

  const handleAddPeriod = () => {
    const nextNum = periods.length > 0 ? Math.max(...periods.map((p) => p.periodNumber)) + 1 : 1;
    setPeriods([
      ...periods,
      {
        periodNumber: nextNum,
        startTime: '09:00',
        endTime: '10:00',
        isBreak: false,
        breakLabel: '',
      },
    ]);
  };

  const handleRemovePeriod = (index: number) => {
    const updated = periods.filter((_, i) => i !== index);
    // Re-index period numbers
    const reindexed = updated.map((p, i) => ({ ...p, periodNumber: i + 1 }));
    setPeriods(reindexed);
  };

  const handleUpdatePeriod = (index: number, field: keyof PeriodTemplateInput, value: any) => {
    const updated = [...periods];
    updated[index] = { ...updated[index], [field]: value };
    setPeriods(updated);
  };

  const handleSave = async () => {
    setIsPending(true);
    try {
      const res = await savePeriodTemplatesAction(periods);
      if (res.success) {
        toast.success('Period configuration saved.');
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.message || 'Failed to save configuration.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!isPending) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Configure Period & Break Structure
          </DialogTitle>
          <DialogDescription>
            Configure daily period times and break slots (Tea Break, Lunch Break) for all timetables.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              {periods.map((period, index) => (
                <div
                  key={index}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border transition-colors ${
                    period.isBreak ? 'bg-amber-500/5 border-amber-500/20' : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-[90px]">
                    <span className="font-semibold text-xs text-muted-foreground">
                      #{period.periodNumber}
                    </span>
                    {period.isBreak ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                        <Coffee className="h-3.5 w-3.5" />
                        Break
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-foreground">Lecture</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                    <Input
                      type="time"
                      value={period.startTime}
                      onChange={(e) => handleUpdatePeriod(index, 'startTime', e.target.value)}
                      className="h-8 text-xs w-[110px]"
                      disabled={isPending}
                    />
                    <Input
                      type="time"
                      value={period.endTime}
                      onChange={(e) => handleUpdatePeriod(index, 'endTime', e.target.value)}
                      className="h-8 text-xs w-[110px]"
                      disabled={isPending}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`break-${index}`}
                      checked={period.isBreak}
                      onCheckedChange={(checked) => handleUpdatePeriod(index, 'isBreak', Boolean(checked))}
                      disabled={isPending}
                    />
                    <label htmlFor={`break-${index}`} className="text-xs text-muted-foreground cursor-pointer">
                      Is Break?
                    </label>
                  </div>

                  {period.isBreak && (
                    <Input
                      placeholder="e.g. Lunch Break"
                      value={period.breakLabel || ''}
                      onChange={(e) => handleUpdatePeriod(index, 'breakLabel', e.target.value)}
                      className="h-8 text-xs flex-1 min-w-[120px]"
                      disabled={isPending}
                    />
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 ml-auto"
                    disabled={isPending || periods.length <= 1}
                    onClick={() => handleRemovePeriod(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={handleAddPeriod}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add Period / Break
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="button" size="sm" disabled={isPending} onClick={handleSave}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
