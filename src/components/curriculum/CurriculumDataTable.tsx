
"use client";

import type { AnyCurriculumItem, LessonPlan, AnnualProgram, SemesterProgram } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Eye, FilePenLine, MoreHorizontal, Trash2, Loader2, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale"; 
import { useState, useEffect } from "react";
import { exportRppToText, type ExportRppToTextInput } from "@/ai/flows/export-rpp-to-text";
import { useToast } from "@/hooks/use-toast";

interface CurriculumDataTableProps {
  items: AnyCurriculumItem[];
  onView: (item: AnyCurriculumItem) => void;
  onEdit?: (item: AnyCurriculumItem) => void;
  onDelete?: (item: AnyCurriculumItem) => void;
  canEdit: (item: AnyCurriculumItem) => boolean; // Now a function
  canDelete: (item: AnyCurriculumItem) => boolean; // Now a function
  itemTypeForExport?: 'RPP' | 'PROTA' | 'Promes';
}

export function CurriculumDataTable({ items, onView, onEdit, onDelete, canEdit, canDelete, itemTypeForExport }: CurriculumDataTableProps) {
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

 const generatePrintableHtml = (item: AnyCurriculumItem): string => {
    let contentHtml = `<h1>${item.title} (${item.type})</h1>`;
    contentHtml += `<p><strong>Mata Pelajaran:</strong> ${item.subject}</p>`;
    contentHtml += `<p><strong>Jenjang/Fase/Kelas:</strong> ${item.gradeLevel}</p>`;
    contentHtml += `<p><strong>Terakhir Diperbarui:</strong> ${isClient ? format(new Date(item.updatedAt), "PPpp", { locale: indonesianLocale }) : item.updatedAt}</p>`;
    contentHtml += `<hr>`;

    if (item.type === 'RPP') {
        const rpp = item as LessonPlan;
        contentHtml += `<h2>A. Tujuan Pembelajaran</h2><ul>`;
        rpp.learningObjectives.forEach(obj => contentHtml += `<li>${obj}</li>`);
        contentHtml += `</ul>`;

        if (rpp.pemahamanBermakna && rpp.pemahamanBermakna.length > 0) {
            contentHtml += `<h2>B. Pemahaman Bermakna</h2><ul>`;
            rpp.pemahamanBermakna.forEach(pm => contentHtml += `<li>${pm}</li>`);
            contentHtml += `</ul>`;
        }
        if (rpp.pertanyaanPemantik && rpp.pertanyaanPemantik.length > 0) {
            contentHtml += `<h2>C. Pertanyaan Pemantik</h2><ul>`;
            rpp.pertanyaanPemantik.forEach(pp => contentHtml += `<li>${pp}</li>`);
            contentHtml += `</ul>`;
        }

        contentHtml += `<h2>D. Langkah-langkah Pembelajaran</h2>`;
        contentHtml += `<h3>1. Pendahuluan</h3><ul>`;
        rpp.langkahPembelajaran.pendahuluan.forEach(act => contentHtml += `<li>${act}</li>`);
        contentHtml += `</ul>`;
        contentHtml += `<h3>2. Kegiatan Inti</h3><ul>`;
        rpp.langkahPembelajaran.kegiatanInti.forEach(act => contentHtml += `<li>${act}</li>`);
        contentHtml += `</ul>`;
        contentHtml += `<h3>3. Penutup</h3><ul>`;
        rpp.langkahPembelajaran.penutup.forEach(act => contentHtml += `<li>${act}</li>`);
        contentHtml += `</ul>`;
        
        contentHtml += `<h2>E. Asesmen/Penilaian</h2><p>${rpp.assessment}</p>`;

        if (rpp.differentiationStrategies && rpp.differentiationStrategies.length > 0) {
            contentHtml += `<h2>F. Strategi Diferensiasi</h2><ul>`;
            rpp.differentiationStrategies.forEach(strat => contentHtml += `<li>${strat}</li>`);
            contentHtml += `</ul>`;
        }
        if (rpp.materials) {
            contentHtml += `<h2>G. Media/Sumber Belajar</h2><p>${rpp.materials}</p>`;
        }
    } else if (item.type === 'PROTA') {
        const prota = item as AnnualProgram;
        contentHtml += `<p><strong>Tahun Ajaran:</strong> ${prota.year}</p>`;
        if (prota.profilPelajarPancasilaFocus && prota.profilPelajarPancasilaFocus.length > 0) {
            contentHtml += `<p><strong>Fokus Profil Pelajar Pancasila:</strong> ${prota.profilPelajarPancasilaFocus.join(', ')}</p>`;
        }
        contentHtml += `<h2>Semester 1</h2>`;
        prota.semester1Components.forEach(c => {
            contentHtml += `<div><h4>Topik: ${c.topic}</h4>`;
            if (c.elemenCapaianPembelajaran && c.elemenCapaianPembelajaran.length > 0) {
                contentHtml += `<p>Elemen CP: ${c.elemenCapaianPembelajaran.join(', ')}</p>`;
            }
            contentHtml += `<p>Alokasi Waktu: ${c.alokasiWaktu}</p></div>`;
        });
        contentHtml += `<h2>Semester 2</h2>`;
        prota.semester2Components.forEach(c => {
            contentHtml += `<div><h4>Topik: ${c.topic}</h4>`;
            if (c.elemenCapaianPembelajaran && c.elemenCapaianPembelajaran.length > 0) {
                contentHtml += `<p>Elemen CP: ${c.elemenCapaianPembelajaran.join(', ')}</p>`;
            }
            contentHtml += `<p>Alokasi Waktu: ${c.alokasiWaktu}</p></div>`;
        });
    } else if (item.type === 'Promes') {
        const promes = item as SemesterProgram;
        contentHtml += `<p><strong>Tahun Ajaran:</strong> ${promes.year}, <strong>Semester:</strong> ${promes.semester === '1' ? 'Ganjil' : 'Genap'}</p>`;
        if (promes.capaianPembelajaranUmum) {
            contentHtml += `<p><strong>Capaian Pembelajaran Umum:</strong> ${promes.capaianPembelajaranUmum}</p>`;
        }
        if (promes.alokasiWaktuTotalSemester) {
            contentHtml += `<p><strong>Alokasi Waktu Total:</strong> ${promes.alokasiWaktuTotalSemester}</p>`;
        }
        contentHtml += `<h2>Komponen Mingguan</h2>`;
        promes.komponenMingguan.forEach(w => {
            contentHtml += `<div style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee;">
                <h4>Minggu ke-${w.mingguKe} ${w.bulan ? `(${w.bulan})` : ''}</h4>
                <p><strong>Materi Pokok/Tujuan Pembelajaran:</strong> ${w.materiPokokAtauTujuanPembelajaran}</p>
                <p><strong>Alokasi Waktu:</strong> ${w.alokasiWaktu}</p>`;
            if (w.metodeStrategi && w.metodeStrategi.length > 0) {
                 contentHtml += `<p><strong>Metode/Strategi:</strong> ${w.metodeStrategi.join(', ')}</p>`;
            }
            if (w.sumberBelajar && w.sumberBelajar.length > 0) {
                 contentHtml += `<p><strong>Sumber Belajar:</strong> ${w.sumberBelajar.join(', ')}</p>`;
            }
            if (w.rencanaAsesmen && w.rencanaAsesmen.length > 0) {
                 contentHtml += `<p><strong>Rencana Asesmen:</strong> ${w.rencanaAsesmen.join(', ')}</p>`;
            }
            if (w.catatanIntegrasiP5) {
                 contentHtml += `<p><strong>Catatan Integrasi P5:</strong> ${w.catatanIntegrasiP5}</p>`;
            }
            contentHtml += `</div>`;
        });
    }

    return `
      <html>
        <head>
          <title>Cetak: ${item.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1, h2, h3, h4 { color: #333; }
            h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            h2 { font-size: 20px; margin-top: 30px; margin-bottom: 10px; color: #555; border-bottom: 1px dashed #ccc; padding-bottom: 5px;}
            h3 { font-size: 16px; margin-top: 20px; margin-bottom: 5px; color: #666;}
            h4 { font-size: 14px; margin-top: 15px; margin-bottom: 5px; color: #777;}
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
            p { margin-bottom: 10px; }
            hr { border: 0; border-top: 1px solid #ccc; margin: 20px 0; }
            div { margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print {
              body { margin: 0.5in; }
              h1, h2, h3, h4 { page-break-after: avoid; }
              table, div { page-break-inside: avoid; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${contentHtml}
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Cetak Dokumen</button>
        </body>
      </html>
    `;
  };

  const handlePrint = (item: AnyCurriculumItem) => {
    if (!isClient) return;
    const printableHtml = generatePrintableHtml(item);
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (printWindow) {
      printWindow.document.write(printableHtml);
      printWindow.document.close(); // Important for some browsers
      // printWindow.print(); // Optional: directly trigger print dialog
    } else {
      toast({ title: "Gagal Membuka Jendela Cetak", description: "Pastikan pop-up diizinkan untuk situs ini.", variant: "destructive" });
    }
  };


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
      } else if (item.type === 'PROTA') {
        const prota = item as AnnualProgram;
        let protaText = `**PROGRAM TAHUNAN (PROTA)**\n\n`;
        protaText += `**Judul:** ${prota.title}\n`;
        protaText += `**Mata Pelajaran:** ${prota.subject}\n`;
        protaText += `**Jenjang/Fase/Kelas:** ${prota.gradeLevel}\n`;
        protaText += `**Tahun Ajaran:** ${prota.year}\n`;
        if (prota.profilPelajarPancasilaFocus && prota.profilPelajarPancasilaFocus.length > 0) {
            protaText += `**Fokus Profil Pelajar Pancasila:** ${prota.profilPelajarPancasilaFocus.join(', ')}\n`;
        }
        protaText += `\n---\n\n**SEMESTER 1**\n\n`;
        prota.semester1Components.forEach((c, i) => {
            protaText += `${i+1}. **Topik:** ${c.topic}\n`;
            if (c.elemenCapaianPembelajaran && c.elemenCapaianPembelajaran.length > 0) {
                 protaText += `   - Elemen Capaian Pembelajaran: ${c.elemenCapaianPembelajaran.join(', ')}\n`;
            }
            protaText += `   - Alokasi Waktu: ${c.alokasiWaktu}\n\n`;
        });
        protaText += `\n**SEMESTER 2**\n\n`;
        prota.semester2Components.forEach((c, i) => {
            protaText += `${i+1}. **Topik:** ${c.topic}\n`;
             if (c.elemenCapaianPembelajaran && c.elemenCapaianPembelajaran.length > 0) {
                protaText += `   - Elemen Capaian Pembelajaran: ${c.elemenCapaianPembelajaran.join(', ')}\n`;
            }
            protaText += `   - Alokasi Waktu: ${c.alokasiWaktu}\n\n`;
        });
        protaText += `\n\n*Dokumen ini dibuat pada: ${format(new Date(prota.updatedAt), "PPpp", { locale: indonesianLocale })} (Data terakhir diperbarui)*`;
        documentContent = protaText;

      } else if (item.type === 'Promes') {
        const promes = item as SemesterProgram;
        let promesText = `**PROGRAM SEMESTER (PROMES)**\n\n`;
        promesText += `**Judul:** ${promes.title}\n`;
        promesText += `**Mata Pelajaran:** ${promes.subject}\n`;
        promesText += `**Jenjang/Fase/Kelas:** ${promes.gradeLevel}\n`;
        promesText += `**Semester:** ${promes.semester === '1' ? 'Ganjil' : 'Genap'}\n`;
        promesText += `**Tahun Ajaran:** ${promes.year}\n`;
        if (promes.capaianPembelajaranUmum) {
             promesText += `**Capaian Pembelajaran Umum:** ${promes.capaianPembelajaranUmum}\n`;
        }
        if (promes.alokasiWaktuTotalSemester) {
             promesText += `**Alokasi Waktu Total Semester:** ${promes.alokasiWaktuTotalSemester}\n`;
        }
        promesText += `\n---\n\n**RINCIAN MINGGUAN**\n\n`;
        promes.komponenMingguan.forEach(w => {
            promesText += `**Minggu ke-${w.mingguKe} ${w.bulan ? `(${w.bulan})` : ''}**\n`;
            promesText += `  - Materi Pokok/Tujuan Pembelajaran: ${w.materiPokokAtauTujuanPembelajaran}\n`;
            promesText += `  - Alokasi Waktu: ${w.alokasiWaktu}\n`;
            if (w.metodeStrategi && w.metodeStrategi.length > 0) {
                promesText += `  - Metode/Strategi: ${w.metodeStrategi.join(', ')}\n`;
            }
            if (w.sumberBelajar && w.sumberBelajar.length > 0) {
                promesText += `  - Sumber Belajar: ${w.sumberBelajar.join(', ')}\n`;
            }
            if (w.rencanaAsesmen && w.rencanaAsesmen.length > 0) {
                promesText += `  - Rencana Asesmen: ${w.rencanaAsesmen.join(', ')}\n`;
            }
            if (w.catatanIntegrasiP5) {
                promesText += `  - Catatan Integrasi P5: ${w.catatanIntegrasiP5}\n`;
            }
            promesText += `\n`;
        });
        promesText += `\n\n*Dokumen ini dibuat pada: ${format(new Date(promes.updatedAt), "PPpp", { locale: indonesianLocale })} (Data terakhir diperbarui)*`;
        documentContent = promesText;
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
            {/* <TableHead className="min-w-[120px]">Dibuat Oleh</TableHead> */}
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
              {/* <TableCell>{item.createdByUserId || 'N/A'}</TableCell> */}
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
                    {canEdit(item) && onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <FilePenLine className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handlePrint(item)} disabled={!isClient}>
                      <Printer className="mr-2 h-4 w-4" /> Cetak / PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportToText(item)} disabled={isExporting[item.id] || !isClient}>
                      {isExporting[item.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} 
                      Ekspor ke Teks
                    </DropdownMenuItem>
                    {canDelete(item) && onDelete && (
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
