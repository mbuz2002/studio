"use client";

import type { AnyCurriculumItem, LessonPlan, AnnualProgram, SemesterProgram } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Eye, FilePenLine, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface CurriculumDataTableProps {
  items: AnyCurriculumItem[];
  onView: (item: AnyCurriculumItem) => void;
  onEdit: (item: AnyCurriculumItem) => void;
  onDelete: (item: AnyCurriculumItem) => void;
  // onExport: (item: AnyCurriculumItem, format: 'pdf' | 'excel' | 'word') => void; // Full export functionality is complex
}

function getItemTypeDisplay(item: AnyCurriculumItem): string {
  if ('topic' in item) return 'Lesson Plan (RPP)';
  if ('year' in item && 'semester1Topics' in item) return 'Annual Program (PROTA)';
  if ('semester' in item) return 'Semester Program (Promes)';
  return 'Unknown';
}

export function CurriculumDataTable({ items, onView, onEdit, onDelete }: CurriculumDataTableProps) {
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No items found.
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>
                <Badge variant={item.type === 'RPP' ? 'default' : item.type === 'PROTA' ? 'secondary' : 'outline'}>
                  {item.type}
                </Badge>
              </TableCell>
              <TableCell>{item.subject}</TableCell>
              <TableCell>{item.gradeLevel}</TableCell>
              <TableCell>{format(new Date(item.updatedAt), "PPp")}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(item)}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <FilePenLine className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => alert('Export PDF clicked for ' + item.title)}>
                      <Download className="mr-2 h-4 w-4" /> Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert('Export Word clicked for ' + item.title)}>
                      <Download className="mr-2 h-4 w-4" /> Export Word
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert('Export Excel clicked for ' + item.title)}>
                      <Download className="mr-2 h-4 w-4" /> Export Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
