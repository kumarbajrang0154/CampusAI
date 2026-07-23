'use client';

import * as React from 'react';
import { AcademicEventType } from '@prisma/client';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, Calendar as CalendarIcon, Eye, EyeOff } from 'lucide-react';

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

export interface CalendarItem {
  id: string;
  title: string;
  description?: string | null;
  eventType: AcademicEventType;
  startDate: string | Date;
  endDate?: string | Date | null;
  isPublished: boolean;
  semesterId?: string | null;
  semester?: {
    id: string;
    name: string;
    academicYear: string;
    isCurrent: boolean;
  } | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface AcademicCalendarTableProps {
  data: CalendarItem[];
  onEdit: (entry: CalendarItem) => void;
  onTogglePublish: (entry: CalendarItem) => void;
  onDelete: (entry: CalendarItem) => void;
}

export function AcademicCalendarTable({
  data,
  onEdit,
  onTogglePublish,
  onDelete,
}: AcademicCalendarTableProps) {
  // Group events by Month (e.g., "August 2025")
  const groupedEvents = React.useMemo(() => {
    const map = new Map<string, CalendarItem[]>();

    data.forEach((item) => {
      const monthKey = format(new Date(item.startDate), 'MMMM yyyy');
      if (!map.has(monthKey)) {
        map.set(monthKey, []);
      }
      map.get(monthKey)!.push(item);
    });

    return Array.from(map.entries());
  }, [data]);

  const getEventTypeBadge = (eventType: AcademicEventType) => {
    switch (eventType) {
      case 'HOLIDAY':
        return <Badge variant="destructive" className="text-[11px]">HOLIDAY</Badge>;
      case 'EXAM':
        return <Badge variant="default" className="text-[11px] bg-primary">EXAM</Badge>;
      case 'REGISTRATION':
        return <Badge variant="outline" className="text-[11px] border-primary text-primary">REGISTRATION</Badge>;
      case 'ORIENTATION':
        return <Badge variant="secondary" className="text-[11px]">ORIENTATION</Badge>;
      case 'RESULT':
        return <Badge variant="outline" className="text-[11px] border-success text-success">RESULT</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px]">{eventType}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {groupedEvents.length === 0 ? (
        <div className="rounded-md border bg-card p-12 text-center text-muted-foreground text-xs">
          <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="font-semibold text-foreground">No academic calendar events found</p>
          <p className="text-muted-foreground mt-1">Click "Add Event" to add holidays, exams, or key academic dates.</p>
        </div>
      ) : (
        groupedEvents.map(([month, events]) => (
          <div key={month} className="rounded-md border bg-card overflow-hidden">
            <div className="bg-muted/60 px-4 py-2.5 border-b flex items-center justify-between">
              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                {month}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {events.length} event{events.length > 1 ? 's' : ''}
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="w-[180px]">Date Range</TableHead>
                  <TableHead>Event Title & Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Semester / Dept</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const startFormatted = format(new Date(event.startDate), 'MMM dd, yyyy');
                  const endFormatted = event.endDate
                    ? format(new Date(event.endDate), 'MMM dd, yyyy')
                    : null;

                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {endFormatted && endFormatted !== startFormatted ? (
                          <span>{startFormatted} – {endFormatted}</span>
                        ) : (
                          <span>{startFormatted}</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{event.title}</p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {getEventTypeBadge(event.eventType)}
                      </TableCell>

                      <TableCell className="text-xs">
                        {event.semester ? (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground">{event.semester.name}</span>
                            {event.semester.isCurrent && (
                              <Badge variant="outline" className="text-[9px] py-0 px-1 border-success text-success">
                                Current
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">All Semesters</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {event.isPublished ? (
                          <span className="text-xs font-semibold text-success flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5 text-success" /> Published
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> Draft
                          </span>
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
                            <DropdownMenuItem onClick={() => onEdit(event)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onTogglePublish(event)}>
                              {event.isPublished ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" /> Unpublish
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" /> Publish Event
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(event)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ))
      )}
    </div>
  );
}
