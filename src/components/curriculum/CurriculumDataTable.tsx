"use client";

import type { AnyCurriculumItem, LessonPlan, AnnualProgram, SemesterProgram } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Eye, FilePenLine, MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale"; 
import { useState, useEffect } from "react";
import { exportRppToText, type ExportRppToTextInput } from "@/ai/flows/export-rpp-to-text";
import { useToast } from "@/hooks/use-toast";

interface CurriculumDataTableProps {
  items: AnyCurriculumItem[];
  onView: (item: AnyCurriculumItem) => void;
  onEdit: (item: AnyCurriculumItem) => void;
  onDelete: (item: AnyCurriculumItem) => void;
}

export function CurriculumDataTable({ items, onView, onEdit, onDelete }: CurriculumDataTableProps) {
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExportToText = async (item: AnyCurriculumItem) => {
    if (!isClient) return;
    
    setIsExporting(prev => ({ ...prev, [item.id]: true }));

    try {
      let documentContent = "";
      let fileName = `${item.title.replace(/\s+/g, '_')}_${item.type}.txt`;

      if (item.type === 'RPP') {
        // Ensure the RPP item matches the expected structure for the export flow
        const rppInput = item as LessonPlan;
        // The flow expects specific fields, ensure they exist even if empty from older data
        const inputForFlow: ExportRppToTextInput = {
          ...rppInput,
          pemahamanBermakna: rppInput.pemahamanBermakna || [],
          pertanyaanPemantik: rppInput.pertanyaanPemantik || [],
          langkahPembelajaran: rppInput.langkahPembelajaran || { pendahuluan: [], kegiatanInti: [], penutup: []},
          assessment: rppInput.assessment || "Belum dirinci",
          differentiationStrategies: rppInput.differentiationStrategies || [],
          materials: rppInput.materials || "Tidak ada",
        };
        const result = await exportRppToText(inputForFlow);
        documentContent = result.documentContent;
      } else {
        // Placeholder for other types or implement specific export flows
        documentContent = `Rincian untuk ${item.type}: ${item.title}\n\n(Fungsi ekspor detail untuk jenis ini belum diimplementasikan.)\n\n${JSON.stringify(item, null, 2)}`;
        toast({
          title: "Fitur Dalam Pengembangan",
          description: `Ekspor detail untuk ${item.type} belum tersedia. Unduhan berisi data JSON dasar.`,
        });
      }

      const blob = new Blob([documentContent], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ title: "Ekspor Berhasil", description: `${item.title} telah diekspor sebagai ${fileName}` });
    } catch (error) {
      console.error("Error exporting item:", error);
      toast({ title: "Ekspor Gagal", description: "Tidak dapat mengekspor item. Silakan coba lagi.", variant: "destructive" });
    } finally {
      setIsExporting(prev => ({ ...prev, [item.id]: false }));
    }
  };


  return (
    <div className="rounded-lg border shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Judul</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Mata Pelajaran</TableHead>
            <TableHead>Jenjang/Kelas</TableHead>
            <TableHead className="min-w-[150px]">Terakhir Diperbarui</TableHead>
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
                    <DropdownMenuItem onClick={() => handleExportToText(item)} disabled={isExporting[item.id] || !isClient}>
                      {isExporting[item.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} 
                      Ekspor ke Teks
                    </DropdownMenuItem>
                    {/* Example: Keep other specific export options or remove if not needed
                    <DropdownMenuItem onClick={() => alert('Ekspor PDF diklik untuk ' + item.title)}>
                      <Download className="mr-2 h-4 w-4" /> Ekspor PDF
                    </DropdownMenuItem>
                    */}
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
