"use client";

import type { AnyCurriculumItem, LessonPlan, AnnualProgram, SemesterProgram } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Eye, FilePenLine, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale"; // Import Indonesian locale

interface CurriculumDataTableProps {
  items: AnyCurriculumItem[];
  onView: (item: AnyCurriculumItem) => void;
  onEdit: (item: AnyCurriculumItem) => void;
  onDelete: (item: AnyCurriculumItem) => void;
  // onExport: (item: AnyCurriculumItem, format: 'pdf' | 'excel' | 'word') => void; // Full export functionality is complex
}

export function CurriculumDataTable({ items, onView, onEdit, onDelete }: CurriculumDataTableProps) {
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Mata Pelajaran</TableHead>
            <TableHead>Jenjang/Kelas</TableHead>
            <TableHead>Terakhir Diperbarui</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                Tidak ada item ditemukan.
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
              <TableCell>{format(new Date(item.updatedAt), "PPp", { locale: indonesianLocale })}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Aksi</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(item)}>
                      <Eye className="mr-2 h-4 w-4" /> Lihat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <FilePenLine className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => alert('Ekspor PDF diklik untuk ' + item.title)}>
                      <Download className="mr-2 h-4 w-4" /> Ekspor PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert('Ekspor Word diklik untuk ' + item.title)}>
                      <Download className="mr-2 h-4 w-4" /> Ekspor Word
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert('Ekspor Excel diklik untuk ' + item.title)}>
                      <Download className="mr-2 h-4 w-4" /> Ekspor Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Hapus
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
