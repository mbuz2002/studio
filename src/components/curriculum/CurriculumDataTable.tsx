
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
  onEdit?: (item: AnyCurriculumItem) => void; // Made optional
  onDelete?: (item: AnyCurriculumItem) => void; // Made optional
  canCreate?: boolean; // To control general create/import actions, though handled by parent
  canEdit: boolean;
  canDelete: boolean;
  itemTypeForExport?: 'RPP' | 'PROTA' | 'Promes'; // To guide export logic
}

export function CurriculumDataTable({ items, onView, onEdit, onDelete, canEdit, canDelete, itemTypeForExport }: CurriculumDataTableProps) {
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
      let fileName = `${item.title.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_')}_${item.type}.txt`;

      if (item.type === 'RPP') {
        const rppInput = item as LessonPlan;
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
      } else if (item.type === 'PROTA' || item.type === 'Promes') {
        // Generic export for PROTA and Promes, can be improved with specific flows
        let details = `Judul: ${item.title}\nMata Pelajaran: ${item.subject}\nJenjang/Kelas: ${item.gradeLevel}\n`;
        if (item.type === 'PROTA') {
          const prota = item as AnnualProgram;
          details += `Tahun Ajaran: ${prota.year}\n`;
          details += `\nSemester 1:\n`;
          prota.semester1Components.forEach(c => {
            details += `- Topik: ${c.topic}\n  Elemen CP: ${c.elemenCapaianPembelajaran?.join(', ') || '-'}\n  Alokasi Waktu: ${c.alokasiWaktu}\n`;
          });
          details += `\nSemester 2:\n`;
          prota.semester2Components.forEach(c => {
            details += `- Topik: ${c.topic}\n  Elemen CP: ${c.elemenCapaianPembelajaran?.join(', ') || '-'}\n  Alokasi Waktu: ${c.alokasiWaktu}\n`;
          });
          details += `\nFokus P5: ${prota.profilPelajarPancasilaFocus?.join(', ') || '-'}\n`;
        } else if (item.type === 'Promes') {
          const promes = item as SemesterProgram;
          details += `Tahun Ajaran: ${promes.year}\nSemester: ${promes.semester === '1' ? 'Ganjil' : 'Genap'}\n`;
          details += `CP Umum: ${promes.capaianPembelajaranUmum || '-'}\nAlokasi Total: ${promes.alokasiWaktuTotalSemester || '-'}\n`;
          details += `\nKomponen Mingguan:\n`;
          promes.komponenMingguan.forEach(w => {
            details += `Minggu ke-${w.mingguKe} (${w.bulan || ''}):\n`;
            details += `  Materi/TP: ${w.materiPokokAtauTujuanPembelajaran}\n  Alokasi: ${w.alokasiWaktu}\n`;
            details += `  Metode: ${w.metodeStrategi?.join(', ') || '-'}\n  Sumber: ${w.sumberBelajar?.join(', ') || '-'}\n`;
            details += `  Asesmen: ${w.rencanaAsesmen?.join(', ') || '-'}\n  P5: ${w.catatanIntegrasiP5 || '-'}\n\n`;
          });
        }
        documentContent = `Rincian untuk ${item.type}: ${item.title}\n\n${details}\n\n(Data diperbarui: ${format(new Date(item.updatedAt), "PPpp", { locale: indonesianLocale })})`;
         toast({
          title: "Ekspor Dasar Berhasil",
          description: `Ekspor detail untuk ${item.type} berupa teks. Untuk format lebih lanjut, fitur sedang dikembangkan.`,
        });
      }
       else {
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
            <TableHead className="min-w-[200px] w-2/5">Judul</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead className="min-w-[150px]">Mata Pelajaran</TableHead>
            <TableHead className="min-w-[150px]">Jenjang/Kelas</TableHead>
            <TableHead className="min-w-[180px]">Terakhir Diperbarui</TableHead>
            <TableHead className="text-right min-w-[100px]">Aksi</TableHead>
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
              <TableCell>{isClient ? format(new Date(item.updatedAt), "PPp", { locale: indonesianLocale }) : item.updatedAt}</TableCell>
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
                    {canEdit && onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <FilePenLine className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleExportToText(item)} disabled={isExporting[item.id] || !isClient}>
                      {isExporting[item.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} 
                      Ekspor ke Teks
                    </DropdownMenuItem>
                    {canDelete && onDelete && (
                      <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    )}
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
