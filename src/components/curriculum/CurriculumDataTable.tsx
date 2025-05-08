
"use client";

import type { AnyCurriculumItem, LessonPlan, AnnualProgram, SemesterProgram, User, SchoolProfile, PrintOptions, CurriculumFramework } from "@/types";
import { defaultPrintOptions } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Eye, FilePenLine, MoreHorizontal, Trash2, Loader2, Printer, Settings2, User as UserIcon, BookCopy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale"; 
import { useState, useEffect } from "react";
import { exportRppToText, type ExportRppToTextInput } from "@/ai/flows/export-rpp-to-text";
import { useToast } from "@/hooks/use-toast";
import { PrintOptionsDialog } from "./PrintOptionsDialog";
import { useLog } from "@/contexts/LogContext"; 
import { useAuth } from "@/contexts/AuthContext"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CurriculumDataTableProps {
  items: AnyCurriculumItem[];
  onView: (item: AnyCurriculumItem) => void;
  onEdit?: (item: AnyCurriculumItem) => void;
  onDelete?: (item: AnyCurriculumItem) => void;
  canEdit: (item: AnyCurriculumItem) => boolean; 
  canDelete: (item: AnyCurriculumItem) => boolean; 
  itemTypeForExport?: 'RPP' | 'PROTA' | 'Promes';
}

export function CurriculumDataTable({ items, onView, onEdit, onDelete, canEdit, canDelete, itemTypeForExport }: CurriculumDataTableProps) {
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { addLog } = useLog();
  const { user: currentUser } = useAuth();
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [appUsers, setAppUsers] = useState<User[]>([]);

  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);
  const [itemToPrint, setItemToPrint] = useState<AnyCurriculumItem | null>(null);
  const [currentPrintOptions, setCurrentPrintOptions] = useState<PrintOptions>(defaultPrintOptions);


  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem("schoolProfile");
      if (storedProfile) {
        try {
            setSchoolProfile(JSON.parse(storedProfile));
        } catch (e) {
            console.error("Failed to parse school profile from localStorage", e);
            localStorage.removeItem("schoolProfile"); 
        }
      }
      const storedUsers = localStorage.getItem("appUsers");
      if (storedUsers) {
         try {
            setAppUsers(JSON.parse(storedUsers));
        } catch (e) {
            console.error("Failed to parse app users from localStorage", e);
            localStorage.removeItem("appUsers"); 
        }
      } else {
        if (currentUser) {
          setAppUsers([currentUser]);
        }
      }
    }
  }, [currentUser]);

  const getCreatorName = (userId?: string): string => {
    if (!userId) return 'Tidak diketahui';
    const user = appUsers.find(u => u.id === userId);
    return user ? user.name : userId; 
  };

  const getCreatorAvatar = (userId?: string): string | undefined => {
    if (!userId) return undefined;
    const user = appUsers.find(u => u.id === userId);
    return user?.avatarUrl;
  };
  
   const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }


 const generatePrintableHtml = (item: AnyCurriculumItem, options: PrintOptions): string => {
    const creatorUser = appUsers.find(u => u.id === item.createdByUserId);
    const creatorName = creatorUser ? creatorUser.name : item.createdByUserId || 'Tidak diketahui';
    const logSource = `CurriculumPrint-${item.type}`;
    addLog("INFO", `Mempersiapkan pratinjau cetak untuk ${item.type} "${item.title}" (ID: ${item.id}) oleh ${currentUser?.email}. Opsi: ${JSON.stringify(options)}`, logSource);


    let contentHtml = ``;

    if (options.showKopSurat && schoolProfile) {
      contentHtml += `
        <div class="kop-surat">
          ${schoolProfile.logoUrl ? `<img src="${schoolProfile.logoUrl}" alt="Logo Sekolah" class="logo-sekolah" data-ai-hint="school logo">` : '<div class="logo-placeholder">Logo Sekolah</div>'}
          <div class="kop-text">
            <h1>${schoolProfile.namaSekolah || 'Nama Sekolah Belum Diatur'}</h1>
            <p>${schoolProfile.alamat || 'Alamat Sekolah Belum Diatur'}</p>
            <p>
              ${schoolProfile.npsn ? `NPSN: ${schoolProfile.npsn}` : 'NPSN: Belum Diatur'}
              ${schoolProfile.nomorTelepon ? ` | Telp: ${schoolProfile.nomorTelepon}` : ''}
              ${schoolProfile.emailSekolah ? ` | Email: ${schoolProfile.emailSekolah}` : ''}
            </p>
          </div>
        </div>
      `;
    } else if (options.showKopSurat) {
        addLog("WARN", `Kop surat diminta untuk ${item.type} "${item.title}" tapi profil sekolah tidak lengkap/tidak ada.`, logSource);
        contentHtml += `
        <div class="kop-surat">
          <div class="logo-placeholder">Logo Sekolah</div>
          <div class="kop-text">
            <h1>Nama Sekolah Belum Diatur</h1>
            <p>Alamat Sekolah Belum Diatur</p>
            <p>NPSN: Belum Diatur</p>
          </div>
        </div>
      `;
    }
    
    contentHtml += `<div class="doc-info">
        <h2>${item.title} (${item.type})</h2>
        <table class="info-table">
            <tr><td>Kurikulum</td><td>: ${item.curriculumType}</td></tr>
            <tr><td>Mata Pelajaran</td><td>: ${item.subject}</td></tr>
            <tr><td>Jenjang/Fase/Kelas</td><td>: ${item.gradeLevel}</td></tr>
            <tr><td>Penyusun</td><td>: ${creatorName}</td></tr>
            <tr><td>Terakhir Diperbarui</td><td>: ${isClient ? format(new Date(item.updatedAt), "dd MMMM yyyy, HH:mm", { locale: indonesianLocale }) : item.updatedAt}</td></tr>
        </table>
    </div>
    <hr class="content-hr">
    `;

    if (item.type === 'RPP') {
        const rpp = item as LessonPlan;
        if (options.showRPPLearningObjectives) {
            contentHtml += `<h3>A. Tujuan Pembelajaran</h3><ul>`;
            rpp.learningObjectives.forEach(obj => contentHtml += `<li>${obj}</li>`);
            contentHtml += `</ul>`;
        }

        if (rpp.curriculumType === "Kurikulum Merdeka") {
            if (options.showRPPPemahamanBermakna && rpp.pemahamanBermakna && rpp.pemahamanBermakna.length > 0) {
                contentHtml += `<h3>B. Pemahaman Bermakna</h3><ul>`;
                rpp.pemahamanBermakna.forEach(pm => contentHtml += `<li>${pm}</li>`);
                contentHtml += `</ul>`;
            }
            if (options.showRPPPertanyaanPemantik && rpp.pertanyaanPemantik && rpp.pertanyaanPemantik.length > 0) {
                contentHtml += `<h3>C. Pertanyaan Pemantik</h3><ul>`;
                rpp.pertanyaanPemantik.forEach(pp => contentHtml += `<li>${pp}</li>`);
                contentHtml += `</ul>`;
            }
        } else { // KTSP or K-13
            if (options.showRPPSK && rpp.standarKompetensi && rpp.standarKompetensi.length > 0 && rpp.curriculumType === "KTSP 2006") {
                contentHtml += `<h3>B. Standar Kompetensi</h3><ul>`;
                rpp.standarKompetensi.forEach(sk => contentHtml += `<li>${sk}</li>`);
                contentHtml += `</ul>`;
            }
            if (options.showRPPKI && rpp.kompetensiInti && rpp.kompetensiInti.length > 0 && rpp.curriculumType === "K-13") {
                 contentHtml += `<h3>B. Kompetensi Inti</h3><ul>`;
                 rpp.kompetensiInti.forEach(ki => contentHtml += `<li>${ki}</li>`);
                 contentHtml += `</ul>`;
            }
            if (options.showRPPKD && rpp.kompetensiDasar && rpp.kompetensiDasar.length > 0) {
                 contentHtml += `<h3>C. Kompetensi Dasar</h3><ul>`;
                 rpp.kompetensiDasar.forEach(kd => contentHtml += `<li>${kd}</li>`);
                 contentHtml += `</ul>`;
            }
            if (options.showRPPIPK && rpp.indikatorPencapaianKompetensi && rpp.indikatorPencapaianKompetensi.length > 0) {
                contentHtml += `<h3>D. Indikator Pencapaian Kompetensi</h3><ul>`;
                rpp.indikatorPencapaianKompetensi.forEach(ipk => contentHtml += `<li>${ipk}</li>`);
                contentHtml += `</ul>`;
            }
             if (options.showRPPMetodePembelajaran && rpp.metodePembelajaran && rpp.metodePembelajaran.length > 0) {
                contentHtml += `<h3>E. Metode Pembelajaran</h3><ul>`;
                rpp.metodePembelajaran.forEach(metode => contentHtml += `<li>${metode}</li>`);
                contentHtml += `</ul>`;
            }
        }
        
        const langkahHeading = rpp.curriculumType === "Kurikulum Merdeka" ? "D" : "F";
        contentHtml += `<h3>${langkahHeading}. Langkah-langkah Pembelajaran</h3>`;
        if (options.showRPPLangkahPendahuluan) {
            contentHtml += `<h4>1. Pendahuluan:</h4><ul>`;
            rpp.langkahPembelajaran.pendahuluan.forEach(act => contentHtml += `<li>${act}</li>`);
            contentHtml += `</ul>`;
        }
        if (options.showRPPLangkahKegiatanInti) {
            contentHtml += `<h4>2. Kegiatan Inti:</h4><ul>`;
            rpp.langkahPembelajaran.kegiatanInti.forEach(act => contentHtml += `<li>${act}</li>`);
            contentHtml += `</ul>`;
        }
        if (options.showRPPLangkahPenutup) {
            contentHtml += `<h4>3. Penutup:</h4><ul>`;
            rpp.langkahPembelajaran.penutup.forEach(act => contentHtml += `<li>${act}</li>`);
            contentHtml += `</ul>`;
        }
        
        const asesmenHeading = rpp.curriculumType === "Kurikulum Merdeka" ? "E" : "G";
        if (options.showRPPAssessment) {
            contentHtml += `<h3>${asesmenHeading}. Asesmen/Penilaian</h3><p>${rpp.assessment}</p>`;
        }

        if (rpp.curriculumType === "Kurikulum Merdeka" && options.showRPPDifferentiationStrategies && rpp.differentiationStrategies && rpp.differentiationStrategies.length > 0) {
            contentHtml += `<h3>F. Strategi Diferensiasi</h3><ul>`;
            rpp.differentiationStrategies.forEach(strat => contentHtml += `<li>${strat}</li>`);
            contentHtml += `</ul>`;
        }

        const mediaHeading = rpp.curriculumType === "Kurikulum Merdeka" ? "G" : "H";
        if (options.showRPPMaterials && rpp.materials) {
            contentHtml += `<h3>${mediaHeading}. Media/Sumber Belajar</h3><p>${rpp.materials}</p>`;
        }
    } else if (item.type === 'PROTA') {
        const prota = item as AnnualProgram;
        contentHtml += `<p><strong>Tahun Ajaran:</strong> ${prota.year}</p>`;
        if (prota.curriculumType === "Kurikulum Merdeka" && options.showPROTAFokusP5 && prota.profilPelajarPancasilaFocus && prota.profilPelajarPancasilaFocus.length > 0) {
            contentHtml += `<p><strong>Fokus Profil Pelajar Pancasila:</strong> ${prota.profilPelajarPancasilaFocus.join(', ')}</p>`;
        }
        
        const elemenKdHeading = prota.curriculumType === "Kurikulum Merdeka" ? "Elemen Capaian Pembelajaran" : "Kompetensi Dasar";
        if (options.showPROTASemester1) {
            contentHtml += `<h3>Semester 1</h3>`;
            if (prota.semester1Components.length > 0) {
                contentHtml += `<table class="component-table"><thead><tr><th>Topik/Materi Pokok</th><th>${elemenKdHeading}</th><th>Alokasi Waktu</th></tr></thead><tbody>`;
                prota.semester1Components.forEach(c => {
                    contentHtml += `<tr><td>${c.topic}</td><td>${(c.elemenCapaianPembelajaran && c.elemenCapaianPembelajaran.length > 0) ? c.elemenCapaianPembelajaran.join(', ') : '-'}</td><td>${c.alokasiWaktu}</td></tr>`;
                });
                contentHtml += `</tbody></table>`;
            } else {
                contentHtml += `<p>Tidak ada komponen untuk semester 1.</p>`;
            }
        }
        
        if (options.showPROTASemester2) {
            contentHtml += `<h3>Semester 2</h3>`;
            if (prota.semester2Components.length > 0) {
                contentHtml += `<table class="component-table"><thead><tr><th>Topik/Materi Pokok</th><th>${elemenKdHeading}</th><th>Alokasi Waktu</th></tr></thead><tbody>`;
                prota.semester2Components.forEach(c => {
                    contentHtml += `<tr><td>${c.topic}</td><td>${(c.elemenCapaianPembelajaran && c.elemenCapaianPembelajaran.length > 0) ? c.elemenCapaianPembelajaran.join(', ') : '-'}</td><td>${c.alokasiWaktu}</td></tr>`;
                });
                contentHtml += `</tbody></table>`;
            } else {
                contentHtml += `<p>Tidak ada komponen untuk semester 2.</p>`;
            }
        }
    } else if (item.type === 'Promes') {
        const promes = item as SemesterProgram;
        contentHtml += `<p><strong>Tahun Ajaran:</strong> ${promes.year}, <strong>Semester:</strong> ${promes.semester === '1' ? 'Ganjil' : 'Genap'}</p>`;
        
        const cpSkKdHeading = promes.curriculumType === "Kurikulum Merdeka" ? "Capaian Pembelajaran Umum" : "Rangkuman SK/KD";
        if (options.showPromesCapaianUmum && promes.capaianPembelajaranUmum) {
            contentHtml += `<p><strong>${cpSkKdHeading}:</strong> ${promes.capaianPembelajaranUmum}</p>`;
        }
        if (options.showPromesAlokasiTotal && promes.alokasiWaktuTotalSemester) {
            contentHtml += `<p><strong>Alokasi Waktu Total:</strong> ${promes.alokasiWaktuTotalSemester}</p>`;
        }

        const materiTpHeading = promes.curriculumType === "Kurikulum Merdeka" ? "Tujuan Pembelajaran" : "Materi Pokok/Tema";
        if (options.showPromesKomponenMingguan) {
            contentHtml += `<h3>Rincian Mingguan</h3>`;
            if (promes.komponenMingguan.length > 0) {
                contentHtml += `<table class="component-table weekly-table">
                    <thead>
                        <tr>
                            <th>Minggu Ke</th>
                            <th>Bulan</th>
                            <th>${materiTpHeading}</th>
                            <th>Alokasi Waktu</th>
                            <th>Metode/Strategi</th>
                            <th>Sumber Belajar</th>
                            <th>Rencana Asesmen</th>
                            <th>Catatan Integrasi P5/Karakter</th>
                        </tr>
                    </thead>
                    <tbody>`;
                promes.komponenMingguan.forEach(w => {
                    contentHtml += `<tr>
                        <td>${w.mingguKe}</td>
                        <td>${w.bulan || '-'}</td>
                        <td>${w.materiPokokAtauTujuanPembelajaran}</td>
                        <td>${w.alokasiWaktu}</td>
                        <td>${(w.metodeStrategi && w.metodeStrategi.length > 0) ? w.metodeStrategi.join(', ') : '-'}</td>
                        <td>${(w.sumberBelajar && w.sumberBelajar.length > 0) ? w.sumberBelajar.join(', ') : '-'}</td>
                        <td>${(w.rencanaAsesmen && w.rencanaAsesmen.length > 0) ? w.rencanaAsesmen.join(', ') : '-'}</td>
                        <td>${w.catatanIntegrasiP5 || '-'}</td>
                    </tr>`;
                });
                contentHtml += `</tbody></table>`;
            } else {
                contentHtml += `<p>Tidak ada komponen mingguan.</p>`;
            }
        }
    }

    return `
      <html>
        <head>
          <title>Cetak: ${item.title}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; margin: 20px; line-height: 1.4; font-size: 12pt; }
            .kop-surat { display: flex; align-items: center; margin-bottom: 10px; border-bottom: 3px solid black; padding-bottom: 10px; }
            .logo-sekolah { max-height: 80px; max-width: 80px; margin-right: 20px; object-fit: contain; }
            .logo-placeholder { width: 80px; height: 80px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 10pt; color: #777; margin-right: 20px;}
            .kop-text { text-align: center; flex-grow: 1; }
            .kop-text h1 { font-size: 16pt; margin: 0; font-weight: bold; text-transform: uppercase; }
            .kop-text p { font-size: 10pt; margin: 2px 0; }
            .doc-info { margin-top: 20px; margin-bottom: 15px; }
            .doc-info h2 { font-size: 14pt; text-align: center; margin-bottom: 15px; font-weight: bold; text-transform: uppercase; }
            .info-table { width: auto; margin-bottom: 15px; font-size: 11pt;}
            .info-table td { padding: 2px 5px; vertical-align: top;}
            .info-table td:first-child { font-weight: normal; width: 180px; }
            .content-hr { border: 0; border-top: 1px solid #ccc; margin: 15px 0; }
            h3 { font-size: 13pt; margin-top: 20px; margin-bottom: 8px; font-weight: bold; }
            h4 { font-size: 12pt; margin-top: 15px; margin-bottom: 5px; font-weight: bold; }
            ul { padding-left: 20px; margin-top: 0; margin-bottom: 10px; }
            li { margin-bottom: 4px; }
            p { margin-bottom: 8px; }
            .component-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; font-size: 10pt;}
            .component-table th, .component-table td { border: 1px solid #333; padding: 6px; text-align: left; vertical-align: top; }
            .component-table th { background-color: #f0f0f0; font-weight: bold; }
            .weekly-table td, .weekly-table th { font-size: 9pt; } 
            .print-button-container { text-align: center; margin-top: 30px; }
            @media print {
              body { margin: 0.75in; } 
              .print-button-container { display: none; }
              .kop-surat { border-bottom: 3px solid black !important; } 
              h1, h2, h3, h4 { page-break-after: avoid; }
              table, div, ul, p { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${contentHtml}
          <div class="print-button-container">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 12pt; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Cetak Dokumen</button>
          </div>
        </body>
      </html>
    `;
  };

  const handlePreparePrint = (item: AnyCurriculumItem) => {
    if (!isClient) return;
    setItemToPrint(item);
    setCurrentPrintOptions(defaultPrintOptions); 
    setIsPrintOptionsOpen(true);
  };
  
  const handleFinalizePrint = (options: PrintOptions) => {
    if (!itemToPrint) return;
    const logSource = `CurriculumPrint-${itemToPrint.type}`; 
    const printableHtml = generatePrintableHtml(itemToPrint, options); 
    
    const printWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
    if (printWindow) {
      printWindow.document.write(printableHtml);
      printWindow.document.close();
      addLog("INFO", `Jendela cetak dibuka untuk ${itemToPrint.type} "${itemToPrint.title}".`, logSource);
      setTimeout(() => {
          if (printWindow && !printWindow.closed) { 
            // printWindow.print(); 
          }
      }, 500);
    } else {
      toast({ title: "Gagal Membuka Jendela Cetak", description: "Pastikan pop-up diizinkan untuk situs ini.", variant: "destructive" });
      addLog("ERROR", `Gagal membuka jendela cetak untuk ${itemToPrint.type} "${itemToPrint.title}". Kemungkinan pop-up diblokir.`, logSource);
    }
    setIsPrintOptionsOpen(false);
    setItemToPrint(null);
  };


  const handleExportToText = async (item: AnyCurriculumItem) => {
    if (!isClient) return;
    const logSource = `CurriculumExport-${item.type}`;
    addLog("INFO", `Memulai ekspor ke teks untuk ${item.type} "${item.title}" (ID: ${item.id}) oleh ${currentUser?.email}.`, logSource);
    
    setIsExporting(prev => ({ ...prev, [item.id]: true }));

    try {
      let documentContent = "";
      let fileName = `${item.title.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_')}_${item.type}.txt`;

      if (item.type === 'RPP') {
        const rppInput = item as LessonPlan;
        const inputForFlow: ExportRppToTextInput = {
          ...rppInput,
          learningObjectives: rppInput.learningObjectives || [],
          pemahamanBermakna: rppInput.pemahamanBermakna || [],
          pertanyaanPemantik: rppInput.pertanyaanPemantik || [],
          langkahPembelajaran: rppInput.langkahPembelajaran || { pendahuluan: [], kegiatanInti: [], penutup: [] },
          assessment: rppInput.assessment || "Belum dirinci",
          differentiationStrategies: rppInput.differentiationStrategies || [],
          materials: rppInput.materials || "", 
          // KTSP/K-13 fields need to be passed if they exist on rppInput
          standarKompetensi: rppInput.standarKompetensi,
          kompetensiInti: rppInput.kompetensiInti,
          kompetensiDasar: rppInput.kompetensiDasar,
          indikatorPencapaianKompetensi: rppInput.indikatorPencapaianKompetensi,
          metodePembelajaran: rppInput.metodePembelajaran,
        };
        addLog("INFO", `Memanggil alur Genkit 'exportRppToText' untuk RPP "${item.title}" (${item.curriculumType}).`, logSource);
        const result = await exportRppToText(inputForFlow); // Assuming exportRppToText is updated for new fields
        documentContent = result.documentContent;
        addLog("INFO", `Konten teks berhasil dibuat oleh Genkit untuk RPP "${item.title}".`, logSource);
      } else if (item.type === 'PROTA') {
        const prota = item as AnnualProgram;
        let protaText = `**PROGRAM TAHUNAN (PROTA)**\n\n`;
        protaText += `**Judul:** ${prota.title}\n`;
        protaText += `**Kurikulum:** ${prota.curriculumType}\n`;
        protaText += `**Mata Pelajaran:** ${prota.subject}\n`;
        protaText += `**Jenjang/Fase/Kelas:** ${prota.gradeLevel}\n`;
        protaText += `**Tahun Ajaran:** ${prota.year}\n`;
        if (prota.curriculumType === "Kurikulum Merdeka" && prota.profilPelajarPancasilaFocus && prota.profilPelajarPancasilaFocus.length > 0) {
            protaText += `**Fokus Profil Pelajar Pancasila:** ${prota.profilPelajarPancasilaFocus.join(', ')}\n`;
        }
        protaText += `\n---\n\n**SEMESTER 1**\n\n`;
        prota.semester1Components.forEach((c, i) => {
            protaText += `${i+1}. **Topik/Materi Pokok:** ${c.topic}\n`;
            if (c.elemenCapaianPembelajaran && c.elemenCapaianPembelajaran.length > 0) {
                 protaText += `   - ${prota.curriculumType === "Kurikulum Merdeka" ? "Elemen Capaian Pembelajaran" : "Kompetensi Dasar"}: ${c.elemenCapaianPembelajaran.join(', ')}\n`;
            }
            protaText += `   - Alokasi Waktu: ${c.alokasiWaktu}\n\n`;
        });
        protaText += `\n**SEMESTER 2**\n\n`;
        prota.semester2Components.forEach((c, i) => {
            protaText += `${i+1}. **Topik/Materi Pokok:** ${c.topic}\n`;
             if (c.elemenCapaianPembelajaran && c.elemenCapaianPembelajaran.length > 0) {
                protaText += `   - ${prota.curriculumType === "Kurikulum Merdeka" ? "Elemen Capaian Pembelajaran" : "Kompetensi Dasar"}: ${c.elemenCapaianPembelajaran.join(', ')}\n`;
            }
            protaText += `   - Alokasi Waktu: ${c.alokasiWaktu}\n\n`;
        });
        protaText += `\n\n*Dokumen ini terakhir diperbarui pada: ${format(new Date(prota.updatedAt), "PPpp", { locale: indonesianLocale })}*`;
        documentContent = protaText;
        addLog("INFO", `Konten teks berhasil dibuat secara manual untuk PROTA "${item.title}".`, logSource);

      } else if (item.type === 'Promes') {
        const promes = item as SemesterProgram;
        let promesText = `**PROGRAM SEMESTER (PROMES)**\n\n`;
        promesText += `**Judul:** ${promes.title}\n`;
        promesText += `**Kurikulum:** ${promes.curriculumType}\n`;
        promesText += `**Mata Pelajaran:** ${promes.subject}\n`;
        promesText += `**Jenjang/Fase/Kelas:** ${promes.gradeLevel}\n`;
        promesText += `**Semester:** ${promes.semester === '1' ? 'Ganjil' : 'Genap'}\n`;
        promesText += `**Tahun Ajaran:** ${promes.year}\n`;
        if (promes.capaianPembelajaranUmum) {
             promesText += `**${promes.curriculumType === "Kurikulum Merdeka" ? "Capaian Pembelajaran Umum" : "Rangkuman SK/KD"}:** ${promes.capaianPembelajaranUmum}\n`;
        }
        if (promes.alokasiWaktuTotalSemester) {
             promesText += `**Alokasi Waktu Total Semester:** ${promes.alokasiWaktuTotalSemester}\n`;
        }
        promesText += `\n---\n\n**RINCIAN MINGGUAN**\n\n`;
        promes.komponenMingguan.forEach(w => {
            promesText += `**Minggu ke-${w.mingguKe} ${w.bulan ? `(${w.bulan})` : ''}**\n`;
            promesText += `  - ${promes.curriculumType === "Kurikulum Merdeka" ? "Tujuan Pembelajaran" : "Materi Pokok/Tema"}: ${w.materiPokokAtauTujuanPembelajaran}\n`;
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
                promesText += `  - Catatan Integrasi P5/Karakter: ${w.catatanIntegrasiP5}\n`;
            }
            promesText += `\n`;
        });
        promesText += `\n\n*Dokumen ini terakhir diperbarui pada: ${format(new Date(promes.updatedAt), "PPpp", { locale: indonesianLocale })}*`;
        documentContent = promesText;
        addLog("INFO", `Konten teks berhasil dibuat secara manual untuk Promes "${item.title}".`, logSource);
      }
       else {
        documentContent = `Rincian untuk ${item.type}: ${item.title}\n\n(Fungsi ekspor detail untuk jenis ini belum diimplementasikan.)\n\n${JSON.stringify(item, null, 2)}`;
        toast({
          title: "Fitur Dalam Pengembangan",
          description: `Ekspor detail untuk ${item.type} belum tersedia. Unduhan berisi data JSON dasar.`,
        });
        addLog("WARN", `Ekspor detail untuk ${item.type} "${item.title}" belum diimplementasikan. Mengekspor data JSON mentah.`, logSource);
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
      addLog("INFO", `Ekspor ${item.type} "${item.title}" ke file ${fileName} berhasil.`, logSource);
    } catch (error) {
      console.error("Error exporting item:", error);
      toast({ title: "Ekspor Gagal", description: "Tidak dapat mengekspor item. Silakan coba lagi.", variant: "destructive" });
      addLog("ERROR", `Gagal mengekspor ${item.type} "${item.title}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, logSource);
    } finally {
      setIsExporting(prev => ({ ...prev, [item.id]: false }));
    }
  };
  
  const handleViewDetails = (item: AnyCurriculumItem) => {
    addLog("INFO", `Pengguna ${currentUser?.email} melihat detail ${item.type} "${item.title}" (ID: ${item.id}).`, `CurriculumView-${item.type}`);
    onView(item);
  };

  const getCurriculumBadgeVariant = (curriculumType: CurriculumFramework): "default" | "secondary" | "outline" => {
    switch (curriculumType) {
      case "Kurikulum Merdeka":
        return "default";
      case "K-13":
        return "secondary";
      case "KTSP 2006":
        return "outline";
      default:
        return "outline";
    }
  }


  return (
    <>
      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px] w-2/5 px-4 py-3">Judul</TableHead>
              <TableHead className="min-w-[100px] px-4 py-3">Jenis</TableHead>
              <TableHead className="min-w-[180px] px-4 py-3">Kurikulum</TableHead>
              <TableHead className="min-w-[150px] px-4 py-3">Mata Pelajaran</TableHead>
              <TableHead className="min-w-[180px] px-4 py-3">Jenjang/Kelas</TableHead>
              <TableHead className="min-w-[180px] px-4 py-3">Nama Guru/Pembuat</TableHead>
              <TableHead className="min-w-[180px] px-4 py-3">Terakhir Diperbarui</TableHead>
              <TableHead className="text-right min-w-[100px] px-4 py-3">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground px-4 py-3">
                  Tidak ada item ditemukan.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="font-medium px-4 py-3 align-top">{item.title}</TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <Badge variant={item.type === 'RPP' ? 'default' : item.type === 'PROTA' ? 'secondary' : 'outline'} className="text-xs">
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <Badge variant={getCurriculumBadgeVariant(item.curriculumType)} className="whitespace-nowrap text-xs">
                    <BookCopy className="mr-1.5 h-3 w-3"/>
                    {item.curriculumType}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 align-top">{item.subject}</TableCell>
                <TableCell className="px-4 py-3 align-top">{item.gradeLevel}</TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarImage src={getCreatorAvatar(item.createdByUserId)} alt={getCreatorName(item.createdByUserId)} data-ai-hint="user avatar" />
                        <AvatarFallback className="text-xs">
                            {getInitials(getCreatorName(item.createdByUserId))}
                        </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm max-w-[120px]">{getCreatorName(item.createdByUserId)}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 align-top text-xs">{isClient ? format(new Date(item.updatedAt), "PPp", { locale: indonesianLocale }) : item.updatedAt}</TableCell>
                <TableCell className="text-right px-4 py-3 align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Aksi</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                        <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                      </DropdownMenuItem>
                      {canEdit(item) && onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <FilePenLine className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handlePreparePrint(item)} disabled={!isClient}>
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
      {itemToPrint && (
        <PrintOptionsDialog
            isOpen={isPrintOptionsOpen}
            onOpenChange={setIsPrintOptionsOpen}
            itemType={itemToPrint.type}
            itemCurriculumType={itemToPrint.curriculumType} // Pass curriculum type of item
            defaultOptions={currentPrintOptions}
            onSubmit={handleFinalizePrint}
            hasSchoolProfile={!!schoolProfile} 
        />
      )}
    </>
  );
}
