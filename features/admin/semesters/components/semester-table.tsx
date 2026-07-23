'use client';

import * as React from 'react';
import { SemesterTerm, SemesterStatus } from '@prisma/client';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, CheckCircle2, Star, Calendar } from 'lucide-react';

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

export interface SemesterItem {
  id: string;
  name: string;
  academicYear: string;
  term: SemesterTerm;
  startDate: string | Date;
  endDate: string | Date;
  status: SemesterStatus;
  isCurrent: boolean;
  _count?: {
    academicCalendars: number;
  };
}

interface SemesterTableProps {
  data: SemesterItem[];
  onEdit: (semester: SemesterItem) => void;
  onSetCurrent: (semester: SemesterItem) => void;
  onDelete: (semester: SemesterItem) => void;
}

export function SemesterTable({
  data,
  onEdit,
  onSetCurrent,
  onDelete,
}: SemesterTableProps) {
  const getStatusBadge = (status: SemesterStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-success text-success-foreground">ACTIVE</Badge>;
      case 'UPCOMING':
        return <Badge variant="outline" className="text-primary border-primary/30">UPCOMING</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary">COMPLETED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Semester Name</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                No semesters found. Click "Add Semester" to create one.
              </TableCell>
            </TableRow>
          ) : (
            data.map((sem) => {
              const startFormatted = format(new Date(sem.startDate), 'MMM dd, yyyy');
              const endFormatted = format(new Date(sem.endDate), 'MMM dd, yyyy');

              return (
                <TableRow key={sem.id} className={sem.isCurrent ? 'bg-primary/5' : undefined}>
                  <TableCell className="font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{sem.name}</span>
                      {sem.isCurrent && (
                        <Badge variant="brand" className="text-[10px] py-0 px-1.5 gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" /> Active Current
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs font-medium">
                    {sem.academicYear}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-xs uppercase font-semibold">
                      {sem.term}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{startFormatted} – {endFormatted}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(sem.status)}
                  </TableCell>

                  <TableCell>
                    {sem.isCurrent ? (
                      <span className="text-xs font-semibold text-success flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Current
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-primary"
                        onClick={() => onSetCurrent(sem)}
                      >
                        Set Current
                      </Button>
                    )}
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
                        <DropdownMenuItem onClick={() => onEdit(sem)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        {!sem.isCurrent && (
                          <DropdownMenuItem onClick={() => onSetCurrent(sem)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Set as Current
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(sem)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Semester
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
