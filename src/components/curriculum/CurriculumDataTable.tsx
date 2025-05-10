
"use client";

import type { AnyCurriculumItem, LessonPlan, AnnualProgram, SemesterProgram, User, SchoolProfile, PrintOptions, CurriculumFramework, ModulAjar, PrintOptionsModulAjar } from "@/types";
import { defaultPrintOptions, defaultPrintOptionsModulAjar } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Eye, FilePenLine, MoreHorizontal, Trash2, Loader2, Printer, Settings2, User as UserIcon, BookCopy, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale"; 
import React, { useState, useEffect, useCallback, useMemo } from "react"; 
import { exportRppToText, type ExportRppToTextInput } from "@/ai/flows/export-rpp-to-text";
import { useToast } from "@/hooks/use-toast";
import { PrintOptionsDialog } from "./PrintOptionsDialog";
import { PrintOptionsModulAjarDialog } from "./PrintOptionsModulAjarDialog";
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
  itemTypeForExport?: 'RPP' | 'PROTA' | 'Promes' | 'ModulAjar'; 
}

export const CurriculumDataTable = React.memo(function CurriculumDataTable({ items, onView, onEdit, onDelete, canEdit, canDelete, itemTypeForExport }: CurriculumDataTableProps) {
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { addLog } = useLog();
  const { user: currentUser } = useAuth(); 
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [appUsers, setAppUsers] = useState<User[]>([]);

  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);
  const [isModulAjarPrintOptionsOpen, setIsModulAjarPrintOptionsOpen] = useState(false);
  const [itemToPrint, setItemToPrint] = useState<AnyCurriculumItem | null>(null);
  const [currentPrintOptions, setCurrentPrintOptions] = useState<PrintOptions>(defaultPrintOptions);
  const [currentModulAjarPrintOptions, setCurrentModulAjarPrintOptions] = useState<PrintOptionsModulAjar>(defaultPrintOptionsModulAjar);


  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem("schoolProfile");
      if (storedProfile) {
        try {
            setSchoolProfile(JSON.parse(storedProfile));
        } catch (e) {
            console.error("Failed to parse school profile from localStorage", e);
            addLog("ERROR", `Gagal memuat profil sekolah dari penyimpanan lokal untuk cetak: ${e instanceof Error ? e.message : String(e)}`, "CurriculumDataTable");
            localStorage.removeItem("schoolProfile"); 
        }
      }
      const storedUsers = localStorage.getItem("appUsers");
      if (storedUsers) {
         try {
            setAppUsers(JSON.parse(storedUsers));
        } catch (e) {
            console.error("Failed to parse app users from localStorage", e);
            addLog("ERROR", `Gagal memuat data pengguna dari penyimpanan lokal: ${e instanceof Error ? e.message : String(e)}`, "CurriculumDataTable");
            localStorage.removeItem("appUsers"); 
        }
      } else {
        if (currentUser) { 
          setAppUsers([currentUser]); 
        }
      }
    }
  }, [currentUser, addLog]);

  const getCreatorName = useCallback((userId?: string): string => {
    if (!userId) return 'Tidak diketahui';
    const user = appUsers.find(u => u.id === userId);
    return user ? user.name : userId; 
  }, [appUsers]);

  const getCreatorAvatar = useCallback((userId?: string): string | undefined => {
    if (!userId) return undefined;
    const user = appUsers.find(u => u.id === userId);
    if (user && !user.avatarUrl && user.name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&font-size=0.45`;
    }
    return user?.avatarUrl;
  }, [appUsers]);
  
   const getInitials = useCallback((name: string) => {
    if (!name || typeof name !== 'string') return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }, [])


 const generatePrintableHtml = useCallback((item: AnyCurriculumItem, options: PrintOptions | PrintOptionsModulAjar): string => {
    const creatorUser = appUsers.find(u => u.id === item.createdByUserId);
    const creatorName = creatorUser ? creatorUser.name : item.createdByUserId || 'Tidak diketahui';
    let documentTypeDisplay = item.type.toUpperCase();
    if (item.type === 'RPP') {
        documentTypeDisplay = item.curriculumType === "Kurikulum Merdeka" ? "ALUR TUJUAN PEMBELAJARAN (ATP)" : "RENCANA PELAKSANAAN PEMBELAJARAN (RPP)";
    } else if (item.type === 'ModulAjar') {
        documentTypeDisplay = "MODUL AJAR";
    }

    const logSource = `CurriculumPrint-${item.type}`;
    addLog("INFO", `Mempersiapkan pratinjau cetak untuk ${documentTypeDisplay} "${item.title}" (ID: ${item.id}) oleh ${currentUser?.email}. Opsi: ${JSON.stringify(options)}`, logSource);

    let contentHtml = ``;
    
    if (options.showKopSurat) {
        if (schoolProfile) {
            contentHtml += `
                <div class="kop-surat">
                  ${schoolProfile.logoUrl ? `<img src="${schoolProfile.logoUrl}" alt="Logo Sekolah" class="logo-sekolah" data-ai-hint="school logo">` : '<div class="logo-placeholder">Logo Sekolah</div>'}
                  <div class="kop-text">
                    <h1>${schoolProfile.namaSekolah || 'Nama Sekolah Belum Diatur'}</h1>
                    <p class="kop-address">${schoolProfile.alamat || 'Alamat Sekolah Belum Diatur'}</p>
                    <p class="kop-contact">
                      ${schoolProfile.npsn ? `NPSN: ${schoolProfile.npsn}` : ''}
                      ${schoolProfile.nomorTelepon ? `${schoolProfile.npsn ? ' | ' : ''}Telp: ${schoolProfile.nomorTelepon}` : ''}
                      ${schoolProfile.emailSekolah ? `${(schoolProfile.npsn || schoolProfile.nomorTelepon) ? ' | ' : ''}Email: ${schoolProfile.emailSekolah}` : ''}
                    </p>
                  </div>
                </div>
            `;
        } else { 
            addLog("WARN", `Kop surat diminta untuk ${documentTypeDisplay} "${item.title}" tapi profil sekolah tidak lengkap/tidak ada.`, logSource);
            // Basic fallback kop
            contentHtml += `
                <div class="kop-surat">
                  <div class="logo-placeholder">Logo Sekolah</div>
                  <div class="kop-text">
                    <h1>Nama Sekolah Belum Diatur</h1>
                    <p class="kop-address">Alamat Sekolah Belum Diatur</p>
                  </div>
                </div>
            `;
        }
    }
    
    if (item.type === 'ModulAjar') {
        const ma = item as ModulAjar;
        const maOptions = options as PrintOptionsModulAjar;
        contentHtml += `<h2 class="modul-main-title">${ma.judulModul}</h2>`;
        
        let sectionCounter = 0;
        const nextLetter = () => String.fromCharCode(65 + sectionCounter++);

        if (maOptions.showMAIdentitas) {
            sectionCounter = 0; 
            contentHtml += `<h3>${nextLetter()}. INFORMASI UMUM</h3>`;
            contentHtml += `<table class="info-table">
                <tr><td>Nama Penyusun</td><td>: ${ma.identitasModul.namaPenyusun}</td></tr>
                <tr><td>Institusi</td><td>: ${ma.identitasModul.institusi}</td></tr>
                <tr><td>Tahun Ajar</td><td>: ${ma.identitasModul.tahunAjar}</td></tr>
                <tr><td>Jenjang Sekolah</td><td>: ${ma.identitasModul.jenjangSekolah}</td></tr>
                <tr><td>Fase</td><td>: ${ma.identitasModul.fase}</td></tr>
                <tr><td>Kelas/Semester</td><td>: ${ma.identitasModul.kelasSemester}</td></tr>
                <tr><td>Alokasi Waktu</td><td>: ${ma.identitasModul.alokasiWaktu}</td></tr>
                <tr><td>Mata Pelajaran</td><td>: ${ma.identitasModul.mataPelajaran}</td></tr>
                ${ma.identitasModul.elemenCapaianPembelajaran && ma.identitasModul.elemenCapaianPembelajaran.length > 0 ? `<tr><td>Elemen Capaian Pembelajaran</td><td>: ${ma.identitasModul.elemenCapaianPembelajaran.join(', ')}</td></tr>` : ''}
            </table>`;
        }
        if (maOptions.showMAKompetensiAwal && ma.kompetensiAwal && ma.kompetensiAwal.length > 0) contentHtml += `<h3>${nextLetter()}. KOMPETENSI AWAL</h3><ul>${ma.kompetensiAwal.map(k => `<li>${k}</li>`).join('')}</ul>`;
        if (maOptions.showMAProfilPelajarPancasila && ma.profilPelajarPancasila.length > 0) contentHtml += `<h3>${nextLetter()}. PROFIL PELAJAR PANCASILA</h3><ul>${ma.profilPelajarPancasila.map(p => `<li>${p}</li>`).join('')}</ul>`;
        if (maOptions.showMASaranaPrasarana && ma.saranaPrasarana.length > 0) contentHtml += `<h3>${nextLetter()}. SARANA DAN PRASARANA</h3><ul>${ma.saranaPrasarana.map(s => `<li>${s}</li>`).join('')}</ul>`;
        if (maOptions.showMATargetPesertaDidik) contentHtml += `<h3>${nextLetter()}. TARGET PESERTA DIDIK</h3><p>${ma.targetPesertaDidik}</p>`;
        if (maOptions.showMAModelPembelajaran) contentHtml += `<h3>${nextLetter()}. MODEL PEMBELAJARAN</h3><p>${ma.modelPembelajaran}</p>`;

        sectionCounter = 0; 
        contentHtml += `<hr class="content-hr"><h3>KOMPONEN INTI</h3>`;
        const ki = ma.komponenInti;
        
        if (maOptions.showMAKomponenInti_TujuanPembelajaran && ki.tujuanPembelajaran.length > 0) contentHtml += `<h4>${nextLetter()}. Tujuan Pembelajaran</h4><ol>${ki.tujuanPembelajaran.map(tp => `<li>${tp}</li>`).join('')}</ol>`;
        if (maOptions.showMAKomponenInti_PemahamanBermakna && ki.pemahamanBermakna.length > 0) contentHtml += `<h4>${nextLetter()}. Pemahaman Bermakna</h4><ul>${ki.pemahamanBermakna.map(pb => `<li>${pb}</li>`).join('')}</ul>`;
        if (maOptions.showMAKomponenInti_PertanyaanPemantik && ki.pertanyaanPemantik.length > 0) contentHtml += `<h4>${nextLetter()}. Pertanyaan Pemantik</h4><ul>${ki.pertanyaanPemantik.map(pp => `<li>${pp}</li>`).join('')}</ul>`;
        
        if (maOptions.showMAKomponenInti_KegiatanPembelajaran) {
            contentHtml += `<h4>${nextLetter()}. Kegiatan Pembelajaran</h4>`;
            if (maOptions.showMAKomponenInti_Kegiatan_Pendahuluan && ki.kegiatanPembelajaran.pendahuluan.length > 0) contentHtml += `<h5>1. Pendahuluan</h5><ul>${ki.kegiatanPembelajaran.pendahuluan.map(p => `<li>${p}</li>`).join('')}</ul>`;
            if (maOptions.showMAKomponenInti_Kegiatan_Inti && ki.kegiatanPembelajaran.inti.length > 0) contentHtml += `<h5>2. Kegiatan Inti</h5><ol class="kegiatan-inti-list">${ki.kegiatanPembelajaran.inti.map(k => `<li><strong>${k.langkah}</strong><ul>${k.detailAktivitas.map(d => `<li>${d}</li>`).join('')}</ul></li>`).join('')}</ol>`;
            if (maOptions.showMAKomponenInti_Kegiatan_Penutup && ki.kegiatanPembelajaran.penutup.length > 0) contentHtml += `<h5>3. Penutup</h5><ul>${ki.kegiatanPembelajaran.penutup.map(p => `<li>${p}</li>`).join('')}</ul>`;
        }
        
        if (maOptions.showMAKomponenInti_Asesmen) {
            contentHtml += `<h4>${nextLetter()}. Asesmen</h4>`;
            if (maOptions.showMAKomponenInti_Asesmen_Diagnostik && ki.asesmen.diagnostik) contentHtml += `<p><strong>Diagnostik:</strong> ${ki.asesmen.diagnostik}</p>`;
            if (maOptions.showMAKomponenInti_Asesmen_Formatif && ki.asesmen.formatif) contentHtml += `<p><strong>Formatif:</strong> ${ki.asesmen.formatif}</p>`;
            if (maOptions.showMAKomponenInti_Asesmen_Sumatif && ki.asesmen.sumatif) contentHtml += `<p><strong>Sumatif:</strong> ${ki.asesmen.sumatif}</p>`;
        }
        if (maOptions.showMAKomponenInti_PengayaanRemedial && ki.pengayaanRemedial) contentHtml += `<h4>${nextLetter()}. Pengayaan dan Remedial</h4><p><strong>Pengayaan:</strong> ${ki.pengayaanRemedial.pengayaan}</p><p><strong>Remedial:</strong> ${ki.pengayaanRemedial.remedial}</p>`;
        if (maOptions.showMAKomponenInti_Refleksi && ki.refleksiPesertaDidikGuru) contentHtml += `<h4>${nextLetter()}. Refleksi Peserta Didik dan Guru</h4><p><strong>Refleksi Peserta Didik:</strong> ${ki.refleksiPesertaDidikGuru.refleksiPesertaDidik}</p><p><strong>Refleksi Guru:</strong> ${ki.refleksiPesertaDidikGuru.refleksiGuru}</p>`;

        if (ma.lampiran) {
            let lampiranSectionCounter = 0;
            const nextLampiranLetter = () => String.fromCharCode(65 + lampiranSectionCounter++);
            let lampiranHeaderAdded = false;
            const addLampiranHeader = () => { if (!lampiranHeaderAdded) {contentHtml += `<hr class="content-hr"><h3>LAMPIRAN</h3>`; lampiranHeaderAdded = true;}};

            if (maOptions.showMALampiran_LKPD && ma.lampiran.lembarKerjaPesertaDidik) { addLampiranHeader(); contentHtml += `<h4>${nextLampiranLetter()}. Lembar Kerja Peserta Didik (LKPD)</h4><div>${ma.lampiran.lembarKerjaPesertaDidik.replace(/\n/g, '<br>')}</div>`; }
            if (maOptions.showMALampiran_BahanBacaan && ma.lampiran.bahanBacaanGuruSiswa && ma.lampiran.bahanBacaanGuruSiswa.length > 0) { addLampiranHeader(); contentHtml += `<h4>${nextLampiranLetter()}. Bahan Bacaan Guru dan Peserta Didik</h4><ul>${ma.lampiran.bahanBacaanGuruSiswa.map(b => `<li>${b.includes('http') ? `<a href="${b}" target="_blank" rel="noopener noreferrer">${b}</a>` : b}</li>`).join('')}</ul>`; }
            if (maOptions.showMALampiran_Glosarium && ma.lampiran.glosarium && ma.lampiran.glosarium.length > 0) { addLampiranHeader(); contentHtml += `<h4>${nextLampiranLetter()}. Glosarium</h4><ul>${ma.lampiran.glosarium.map(g => `<li><strong>${g.istilah}:</strong> ${g.penjelasan}</li>`).join('')}</ul>`; }
            if (maOptions.showMALampiran_DaftarPustaka && ma.lampiran.daftarPustaka && ma.lampiran.daftarPustaka.length > 0) { addLampiranHeader(); contentHtml += `<h4>${nextLampiranLetter()}. Daftar Pustaka</h4><ul>${ma.lampiran.daftarPustaka.map(dp => `<li>${dp.includes('http') ? `<a href="${dp}" target="_blank" rel="noopener noreferrer">${dp}</a>` : dp}</li>`).join('')}</ul>`; }
        }
    }
     else if (item.type === 'RPP' && item.curriculumType === "Kurikulum Merdeka") {
      const atp = item as LessonPlan;
      const rppOptions = options as PrintOptions;
      contentHtml += `<div class="doc-info atp-header">
        <h2 class="atp-main-title">${atp.title}</h2>
      </div>`;
      contentHtml += `<table class="info-table atp-info-table">`;
      if (rppOptions.showRPPBidangKeahlian && atp.bidangKeahlian) contentHtml += `<tr><td>BIDANG KEAHLIAN</td><td>: ${atp.bidangKeahlian.toUpperCase()}</td></tr>`;
      if (rppOptions.showRPPProgramKeahlian && atp.programKeahlian) contentHtml += `<tr><td>PROGRAM KEAHLIAN</td><td>: ${atp.programKeahlian.toUpperCase()}</td></tr>`;
      contentHtml += `<tr><td>MATA PELAJARAN</td><td>: ${atp.subject.toUpperCase()}</td></tr>
                      <tr><td>FASE</td><td>: ${atp.gradeLevel.toUpperCase()}</td></tr>
                      ${atp.alokasiWaktuJP && rppOptions.showRPPAlokasiWaktu ? `<tr><td>ALOKASI WAKTU</td><td>: ${atp.alokasiWaktuJP}</td></tr>` : ''}
                      <tr><td>NAMA PENYUSUN</td><td>: ${creatorName.toUpperCase()}</td></tr>
                      <tr><td>INSTANSI</td><td>: ${(schoolProfile?.namaSekolah || 'Belum Diatur').toUpperCase()}</td></tr>
                      <tr><td>TAHUN PENYUSUNAN</td><td>: ${new Date(atp.createdAt).getFullYear()}</td></tr>
                      </table><hr class="content-hr">`;
        let sectionCounter = 0;
        const nextLetter = () => String.fromCharCode(65 + sectionCounter++);
        if (rppOptions.showRPPCapaianPembelajaran && atp.capaianPembelajaran && atp.capaianPembelajaran.length > 0) {
            contentHtml += `<h3>${nextLetter()}. CAPAIAN PEMBELAJARAN (CP)</h3><ul>`;
            atp.capaianPembelajaran.forEach(cp => contentHtml += `<li>${cp}</li>`);
            contentHtml += `</ul>`;
        }
         if (rppOptions.showRPPLearningObjectives && atp.learningObjectives && atp.learningObjectives.length > 0) {
            contentHtml += `<h3>${nextLetter()}. TUJUAN PEMBELAJARAN (TP)</h3><ol class="tp-list">`;
            atp.learningObjectives.forEach(tp => contentHtml += `<li>${tp}</li>`);
            contentHtml += `</ol>`;
        }
        if (rppOptions.showRPPProfilPelajarPancasila && atp.profilPelajarPancasilaFocus && atp.profilPelajarPancasilaFocus.length > 0) {
            contentHtml += `<h3>${nextLetter()}. PROFIL PELAJAR PANCASILA</h3><ul>`;
            atp.profilPelajarPancasilaFocus.forEach(p5 => contentHtml += `<li>${p5}</li>`);
            contentHtml += `</ul>`;
        }
        if (rppOptions.showRPPPemahamanBermakna && atp.pemahamanBermakna && atp.pemahamanBermakna.length > 0) {
            contentHtml += `<h3>${nextLetter()}. PEMAHAMAN BERMAKNA</h3><ul>`;
            atp.pemahamanBermakna.forEach(pm => contentHtml += `<li>${pm}</li>`);
            contentHtml += `</ul>`;
        }
        if (rppOptions.showRPPPertanyaanPemantik && atp.pertanyaanPemantik && atp.pertanyaanPemantik.length > 0) {
            contentHtml += `<h3>${nextLetter()}. PERTANYAAN PEMANTIK</h3><ul>`;
            atp.pertanyaanPemantik.forEach(pp => contentHtml += `<li>${pp}</li>`);
            contentHtml += `</ul>`;
        }
        if (rppOptions.showRPPLangkahPendahuluan || rppOptions.showRPPLangkahKegiatanInti || rppOptions.showRPPLangkahPenutup) {
             if ((atp.langkahPembelajaran?.pendahuluan && atp.langkahPembelajaran.pendahuluan.length > 0) || 
                 (atp.langkahPembelajaran?.kegiatanInti && atp.langkahPembelajaran.kegiatanInti.length > 0) ||
                 (atp.langkahPembelajaran?.penutup && atp.langkahPembelajaran.penutup.length > 0)) {
                contentHtml += `<h3>${nextLetter()}. LANGKAH-LANGKAH PEMBELAJARAN (MODUL AJAR)</h3>`;
                if (rppOptions.showRPPLangkahPendahuluan && atp.langkahPembelajaran?.pendahuluan?.length > 0) {
                    contentHtml += `<h4>1. Pendahuluan:</h4><ul>`;
                    atp.langkahPembelajaran.pendahuluan.forEach(act => contentHtml += `<li>${act}</li>`);
                    contentHtml += `</ul>`;
                }
                if (rppOptions.showRPPLangkahKegiatanInti && atp.langkahPembelajaran?.kegiatanInti?.length > 0) {
                    contentHtml += `<h4>2. Kegiatan Inti:</h4><ul>`;
                    atp.langkahPembelajaran.kegiatanInti.forEach(act => contentHtml += `<li>${act}</li>`);
                    contentHtml += `</ul>`;
                }
                if (rppOptions.showRPPLangkahPenutup && atp.langkahPembelajaran?.penutup?.length > 0) {
                    contentHtml += `<h4>3. Penutup:</h4><ul>`;
                    atp.langkahPembelajaran.penutup.forEach(act => contentHtml += `<li>${act}</li>`);
                    contentHtml += `</ul>`;
                }
            }
        }
        if (rppOptions.showRPPAssessment && atp.assessment) contentHtml += `<h3>${nextLetter()}. ASESMEN/PENILAIAN</h3><div>${atp.assessment.replace(/\n/g, '<br>')}</div>`;
        if (rppOptions.showRPPDifferentiationStrategies && atp.differentiationStrategies && atp.differentiationStrategies.length > 0) {
            contentHtml += `<h3>${nextLetter()}. STRATEGI DIFERENSIASI</h3><ul>`;
            atp.differentiationStrategies.forEach(strat => contentHtml += `<li>${strat}</li>`);
            contentHtml += `</ul>`;
        }
        if (rppOptions.showRPPMaterials && atp.materials) contentHtml += `<h3>${nextLetter()}. MEDIA/SUMBER BELAJAR</h3><div>${atp.materials.replace(/\n/g, '<br>')}</div>`;
    }
    else if (item.type === 'RPP') { // K13 or KTSP RPP
        const rpp = item as LessonPlan;
        const rppOptions = options as PrintOptions;
        contentHtml += `<div class="doc-info">
            <h2 class="rpp-main-title">${rpp.title}</h2>
            <p class="doc-subtitle">${documentTypeDisplay}</p>
             <table class="info-table">
                <tr><td>Kurikulum</td><td>: ${rpp.curriculumType}</td></tr>
                <tr><td>Mata Pelajaran</td><td>: ${rpp.subject}</td></tr>
                <tr><td>Jenjang/Kelas</td><td>: ${rpp.gradeLevel}</td></tr>
                ${rpp.alokasiWaktuJP && rppOptions.showRPPAlokasiWaktu ? `<tr><td>Alokasi Waktu</td><td>: ${rpp.alokasiWaktuJP}</td></tr>` : ''}
                <tr><td>Penyusun</td><td>: ${creatorName}</td></tr>
                <tr><td>Terakhir Diperbarui</td><td>: ${isClient ? format(new Date(rpp.updatedAt), "dd MMMM yyyy, HH:mm", { locale: indonesianLocale }) : rpp.updatedAt}</td></tr>
            </table>
        </div>
        <hr class="content-hr">`;
        let sectionCounter = 0;
        const nextLetter = () => String.fromCharCode(65 + sectionCounter++);

        if (rppOptions.showRPPLearningObjectives && rpp.learningObjectives && rpp.learningObjectives.length > 0) {
            contentHtml += `<h3>${nextLetter()}. TUJUAN PEMBELAJARAN</h3><ul>`;
            rpp.learningObjectives.forEach(obj => contentHtml += `<li>${obj}</li>`);
            contentHtml += `</ul>`;
        }
        if (rppOptions.showRPPSK && rpp.standarKompetensi && rpp.standarKompetensi.length > 0 && rpp.curriculumType === "KTSP 2006") {
            contentHtml += `<h3>${nextLetter()}. STANDAR KOMPETENSI (SK)</h3><ul>`;
            rpp.standarKompetensi.forEach(sk => contentHtml += `<li>${sk}</li>`);
            contentHtml += `</ul>`;
        }
        if (rppOptions.showRPPKI && rpp.kompetensiInti && rpp.kompetensiInti.length > 0 && rpp.curriculumType === "K-13") {
             contentHtml += `<h3>${nextLetter()}. KOMPETENSI INTI (KI)</h3><ul>`;
             rpp.kompetensiInti.forEach(ki => contentHtml += `<li>${ki}</li>`);
             contentHtml += `</ul>`;
        }
        if (rppOptions.showRPPKD && rpp.kompetensiDasar && rpp.kompetensiDasar.length > 0) {
             contentHtml += `<h3>${nextLetter()}. KOMPETENSI DASAR (KD)</h3><ul>`;
             rpp.kompetensiDasar.forEach(kd => contentHtml += `<li>${kd}</li>`);
             contentHtml += `</ul>`;
        }
        if (rppOptions.showRPPIPK && rpp.indikatorPencapaianKompetensi && rpp.indikatorPencapaianKompetensi.length > 0) {
            contentHtml += `<h3>${nextLetter()}. INDIKATOR PENCAPAIAN KOMPETENSI (IPK)</h3><ul>`;
            rpp.indikatorPencapaianKompetensi.forEach(ipk => contentHtml += `<li>${ipk}</li>`);
            contentHtml += `</ul>`;
        }
         if (rppOptions.showRPPMetodePembelajaran && rpp.metodePembelajaran && rpp.metodePembelajaran.length > 0) {
            contentHtml += `<h3>${nextLetter()}. METODE PEMBELAJARAN</h3><ul>`;
            rpp.metodePembelajaran.forEach(metode => contentHtml += `<li>${metode}</li>`);
            contentHtml += `</ul>`;
        }
        if (rppOptions.showRPPLangkahPendahuluan || rppOptions.showRPPLangkahKegiatanInti || rppOptions.showRPPLangkahPenutup) {
            contentHtml += `<h3>${nextLetter()}. LANGKAH-LANGKAH PEMBELAJARAN</h3>`;
            if (rppOptions.showRPPLangkahPendahuluan && rpp.langkahPembelajaran?.pendahuluan?.length > 0) {
                contentHtml += `<h4>1. Pendahuluan:</h4><ul>`;
                rpp.langkahPembelajaran.pendahuluan.forEach(act => contentHtml += `<li>${act}</li>`);
                contentHtml += `</ul>`;
            }
            if (rppOptions.showRPPLangkahKegiatanInti && rpp.langkahPembelajaran?.kegiatanInti?.length > 0) {
                contentHtml += `<h4>2. Kegiatan Inti:</h4><ul>`;
                rpp.langkahPembelajaran.kegiatanInti.forEach(act => contentHtml += `<li>${act}</li>`);
                contentHtml += `</ul>`;
            }
            if (rppOptions.showRPPLangkahPenutup && rpp.langkahPembelajaran?.penutup?.length > 0) {
                contentHtml += `<h4>3. Penutup:</h4><ul>`;
                rpp.langkahPembelajaran.penutup.forEach(act => contentHtml += `<li>${act}</li>`);
                contentHtml += `</ul>`;
            }
        }
        if (rppOptions.showRPPAssessment && rpp.assessment) contentHtml += `<h3>${nextLetter()}. ASESMEN/PENILAIAN</h3><div>${rpp.assessment.replace(/\n/g, '<br>')}</div>`;
        if (rppOptions.showRPPMaterials && rpp.materials) contentHtml += `<h3>${nextLetter()}. MEDIA/SUMBER BELAJAR</h3><div>${rpp.materials.replace(/\n/g, '<br>')}</div>`;
    } else if (item.type === 'PROTA') {
        const prota = item as AnnualProgram;
        const protaOptions = options as PrintOptions;
        contentHtml += `<div class="doc-info"><h2 class="rpp-main-title">${prota.title}</h2><p class="doc-subtitle">${documentTypeDisplay}</p></div>`;
        contentHtml += `<table class="info-table">
                <tr><td>Kurikulum</td><td>: ${prota.curriculumType}</td></tr>
                <tr><td>Mata Pelajaran</td><td>: ${prota.subject}</td></tr>
                <tr><td>Jenjang/Fase/Kelas</td><td>: ${prota.gradeLevel}</td></tr>
                <tr><td>Tahun Ajaran</td><td>: ${prota.year}</td></tr>
                <tr><td>Penyusun</td><td>: ${creatorName}</td></tr>
                <tr><td>Terakhir Diperbarui</td><td>: ${isClient ? format(new Date(prota.updatedAt), "dd MMMM yyyy, HH:mm", { locale: indonesianLocale }) : prota.updatedAt}</td></tr>
        </table><hr class="content-hr">`;
        if (prota.curriculumType === "Kurikulum Merdeka" && protaOptions.showPROTACapaianPembelajaran && prota.capaianPembelajaran && prota.capaianPembelajaran.length > 0) {
             contentHtml += `<h3>A. CAPAIAN PEMBELAJARAN (CP) UMUM TAHUNAN</h3><ul>`;
             prota.capaianPembelajaran.forEach(cp => contentHtml += `<li>${cp}</li>`);
             contentHtml += `</ul>`;
        }
        if (prota.curriculumType === "Kurikulum Merdeka" && protaOptions.showPROTAFokusP5 && prota.profilPelajarPancasilaFocus && prota.profilPelajarPancasilaFocus.length > 0) {
            contentHtml += `<h3>B. FOKUS PROFIL PELAJAR PANCASILA</h3><p>${prota.profilPelajarPancasilaFocus.join(', ')}</p>`;
        }
        
        const elemenKdHeading = prota.curriculumType === "Kurikulum Merdeka" ? "ELEMEN CAPAIAN PEMBELAJARAN" : "KOMPETENSI DASAR";
        if (protaOptions.showPROTASemester1) {
            contentHtml += `<h3>${prota.curriculumType === "Kurikulum Merdeka" && (protaOptions.showPROTACapaianPembelajaran || protaOptions.showPROTAFokusP5) ? 'C' : 'A'}. ALOKASI WAKTU SEMESTER 1</h3>`;
            if (prota.semester1Components.length > 0) {
                contentHtml += `<table class="component-table"><thead><tr><th>NO</th><th>TOPIK/MATERI POKOK</th><th>${elemenKdHeading}</th><th>ALOKASI WAKTU</th></tr></thead><tbody>`;
                prota.semester1Components.forEach((c, index) => {
                    contentHtml += `<tr><td>${index+1}</td><td>${c.topic}</td><td>${(c.elemenCapaianPembelajaran && c.elemenCapaianPembelajaran.length > 0) ? c.elemenCapaianPembelajaran.join('<br>') : '-'}</td><td>${c.alokasiWaktu}</td></tr>`;
                });
                contentHtml += `</tbody></table>`;
            } else {
                contentHtml += `<p>Tidak ada komponen untuk semester 1.</p>`;
            }
        }
        
        if (protaOptions.showPROTASemester2) {
            contentHtml += `<h3>${prota.curriculumType === "Kurikulum Merdeka" && (protaOptions.showPROTACapaianPembelajaran || protaOptions.showPROTAFokusP5 || protaOptions.showPROTASemester1) ? 'D' : (protaOptions.showPROTASemester1 ? 'B' : 'A')}. ALOKASI WAKTU SEMESTER 2</h3>`;
            if (prota.semester2Components.length > 0) {
                contentHtml += `<table class="component-table"><thead><tr><th>NO</th><th>TOPIK/MATERI POKOK</th><th>${elemenKdHeading}</th><th>ALOKASI WAKTU</th></tr></thead><tbody>`;
                prota.semester2Components.forEach((c, index) => {
                    contentHtml += `<tr><td>${index+1}</td><td>${c.topic}</td><td>${(c.elemenCapaianPembelajaran && c.elemenCapaianPembelajaran.length > 0) ? c.elemenCapaianPembelajaran.join('<br>') : '-'}</td><td>${c.alokasiWaktu}</td></tr>`;
                });
                contentHtml += `</tbody></table>`;
            } else {
                contentHtml += `<p>Tidak ada komponen untuk semester 2.</p>`;
            }
        }
    } else if (item.type === 'Promes') {
        const promes = item as SemesterProgram;
        const promesOptions = options as PrintOptions;
         contentHtml += `<div class="doc-info"><h2 class="rpp-main-title">${promes.title}</h2><p class="doc-subtitle">${documentTypeDisplay}</p></div>`;
        contentHtml += `<table class="info-table">
                <tr><td>Kurikulum</td><td>: ${promes.curriculumType}</td></tr>
                <tr><td>Mata Pelajaran</td><td>: ${promes.subject}</td></tr>
                <tr><td>Jenjang/Fase/Kelas</td><td>: ${promes.gradeLevel}</td></tr>
                <tr><td>Tahun Ajaran</td><td>: ${promes.year}, <strong>SEMESTER:</strong> ${promes.semester === '1' ? 'GANJIL' : 'GENAP'}</td></tr>
                <tr><td>Penyusun</td><td>: ${creatorName}</td></tr>
                <tr><td>Terakhir Diperbarui</td><td>: ${isClient ? format(new Date(promes.updatedAt), "dd MMMM yyyy, HH:mm", { locale: indonesianLocale }) : promes.updatedAt}</td></tr>
        </table><hr class="content-hr">`;
        
        const cpSkKdHeading = promes.curriculumType === "Kurikulum Merdeka" ? "CAPAIAN PEMBELAJARAN UMUM" : "RANGKUMAN SK/KD";
        if (promesOptions.showPromesCapaianUmum && promes.capaianPembelajaranUmum) {
            contentHtml += `<h3>A. ${cpSkKdHeading}</h3><p>${promes.capaianPembelajaranUmum}</p>`;
        }
        if (promesOptions.showPromesAlokasiTotal && promes.alokasiWaktuTotalSemester) {
            contentHtml += `<h3>B. ALOKASI WAKTU TOTAL</h3><p>${promes.alokasiWaktuTotalSemester}</p>`;
        }

        const materiTpHeading = promes.curriculumType === "Kurikulum Merdeka" ? "TUJUAN PEMBELAJARAN" : "MATERI POKOK/TEMA";
        if (promesOptions.showPromesKomponenMingguan) {
            contentHtml += `<h3>C. RINCIAN MINGGUAN</h3>`;
            if (promes.komponenMingguan.length > 0) {
                contentHtml += `<table class="component-table weekly-table">
                    <thead>
                        <tr>
                            <th>MINGGU KE</th>
                            <th>BULAN</th>
                            <th>${materiTpHeading}</th>
                            <th>ALOKASI WAKTU</th>
                            <th>METODE/STRATEGI</th>
                            <th>SUMBER BELAJAR</th>
                            <th>RENCANA ASESMEN</th>
                            <th>${promes.curriculumType === "Kurikulum Merdeka" ? "CATATAN INTEGRASI P5" : "CATATAN KARAKTER"}</th>
                        </tr>
                    </thead>
                    <tbody>`;
                promes.komponenMingguan.forEach(w => {
                    contentHtml += `<tr>
                        <td>${w.mingguKe}</td>
                        <td>${w.bulan || '-'}</td>
                        <td>${w.materiPokokAtauTujuanPembelajaran}</td>
                        <td>${w.alokasiWaktu}</td>
                        <td>${(w.metodeStrategi && w.metodeStrategi.length > 0) ? w.metodeStrategi.join('<br>') : '-'}</td>
                        <td>${(w.sumberBelajar && w.sumberBelajar.length > 0) ? w.sumberBelajar.join('<br>') : '-'}</td>
                        <td>${(w.rencanaAsesmen && w.rencanaAsesmen.length > 0) ? w.rencanaAsesmen.join('<br>') : '-'}</td>
                        <td>${w.catatanIntegrasiP5 || '-'}</td>
                    </tr>`;
                });
                contentHtml += `</tbody></table>`;
            } else {
                contentHtml += `<p>Tidak ada komponen mingguan.</p>`;
            }
        }
    }

    // Common Signature Section
    contentHtml += `
      <div class="signature-section">
        <div class="signature-block">
          <p>Mengetahui,</p>
          <p>Kepala Sekolah</p>
          <br><br><br>
          <p class="signature-name">${(schoolProfile?.namaKepalaSekolah || '(.........................................)')}</p>
          ${schoolProfile?.npsn ? `<p class="signature-nip">NIP/NPSN: ${schoolProfile.npsn}</p>` : ''}
        </div>
        <div class="signature-block">
          <p>${schoolProfile?.kotaSekolah || "Kota"}, ${isClient ? format(new Date(), "dd MMMM yyyy", { locale: indonesianLocale }) : new Date().toLocaleDateString()}</p>
          <p>Guru Mata Pelajaran</p>
          <br><br><br>
          <p class="signature-name">${creatorName || '(.........................................)'}</p>
           ${creatorUser && creatorUser.role === 'Guru' ? `<p class="signature-nip">NIP: (NIP Guru Jika Ada)</p>` : ''}
        </div>
      </div>
    `;


    return `
      <html>
        <head>
          <title>Cetak: ${item.title}</title>
          <style>
            @page { 
              size: 21cm 33cm; /* F4 Paper Size */
              margin: 0.75in; 
            }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              margin: 0; 
              line-height: 1.4; 
              font-size: 11pt; 
              color: #333;
            }
            .kop-surat { display: flex; align-items: center; margin-bottom: 15px; border-bottom: 4px double black; padding-bottom: 10px; min-height: 80px; }
            .logo-sekolah { max-height: 75px; max-width: 75px; margin-right: 15px; object-fit: contain; }
            .logo-placeholder { width: 75px; height: 75px; border: 1px dashed #999; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9pt; color: #666; margin-right: 15px;}
            .kop-text { text-align: center; flex-grow: 1; }
            .kop-text h1 { font-size: 16pt; margin: 0 0 2px 0; font-weight: bold; text-transform: uppercase; }
            .kop-text p { font-size: 10pt; margin: 1px 0; }
            .kop-text .kop-address { font-size: 9pt; }
            .kop-text .kop-contact { font-size: 9pt; }

            .doc-info { margin-top: 15px; margin-bottom: 10px; text-align: center; }
            .rpp-main-title, .atp-main-title, .modul-main-title { font-size: 14pt; margin-bottom: 5px; font-weight: bold; text-transform: uppercase; }
            .atp-main-title, .modul-main-title { margin-bottom: 15px; } 
            .doc-info .doc-subtitle { font-size: 12pt; margin-bottom: 15px; font-weight: bold; text-transform: uppercase; }
            
            .info-table { width: auto; margin: 0 auto 15px auto; font-size: 11pt; border-collapse: collapse;}
            .info-table td { padding: 3px 8px; vertical-align: top;}
            .info-table td:first-child { font-weight: normal; width: 180px; text-align: left; }
            .info-table td:nth-child(2) { font-weight: normal; text-align: left; }

            .atp-header { text-align: center; margin-bottom: 15px; }
            .atp-info-table td { padding: 4px 8px; vertical-align: top;}
            .atp-info-table td:first-child { font-weight: bold; width: 30%; }
            
            .content-hr { border: 0; border-top: 1.5px solid #888; margin: 20px 0; }
            
            h3 { font-size: 12pt; margin-top: 18px; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; }
            h4 { font-size: 11pt; margin-top: 12px; margin-bottom: 6px; font-weight: bold; }
            h5 { font-size: 11pt; margin-top: 8px; margin-bottom: 4px; font-weight: bold; }
            
            ul, ol { padding-left: 25px; margin-top: 5px; margin-bottom: 12px; }
            ol.tp-list, ol.kegiatan-inti-list { list-style-type: decimal; }
            ol.kegiatan-inti-list { padding-left: 20px; }
            ol.kegiatan-inti-list > li > ul { padding-left: 20px; list-style-type: disc; }
            li { margin-bottom: 5px; text-align: justify; }
            
            p { margin-bottom: 10px; text-align: justify; }
            div > p { margin-bottom: 0; } 
            div > ul > li, div > ol > li { margin-bottom: 3px; } 
            
            .component-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; font-size: 10pt;}
            .component-table th, .component-table td { border: 1px solid #555; padding: 5px 8px; text-align: left; vertical-align: top; }
            .component-table th { background-color: #e9e9e9; font-weight: bold; text-align: center; }
            .component-table td:first-child { text-align: center; width: 30px; } 
            
            .weekly-table td, .weekly-table th { font-size: 9.5pt; } 
            .signature-section { margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .signature-block { width: 45%; text-align: center; }
            .signature-name { font-weight: bold; text-decoration: underline; }
            .signature-nip { font-size: 10pt; }
            .print-button-container { text-align: center; margin-top: 30px; }
            
            @media print {
              body { margin: 0.75in; font-size: 11pt; } 
              .print-button-container { display: none; }
              .kop-surat { border-bottom: 4px double black !important; } 
              h1, h2, h3, h4, h5, table, ul, ol, p, div { page-break-inside: avoid; }
              h3, h4, h5 { page-break-after: avoid; }
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
  }, [isClient, appUsers, addLog, currentUser, schoolProfile]);

  const handlePreparePrint = useCallback((item: AnyCurriculumItem) => {
    if (!isClient) return;
    setItemToPrint(item);
    if (item.type === 'ModulAjar') {
        setCurrentModulAjarPrintOptions(defaultPrintOptionsModulAjar);
        setIsModulAjarPrintOptionsOpen(true);
    } else {
        setCurrentPrintOptions(defaultPrintOptions); 
        setIsPrintOptionsOpen(true);
    }
  }, [isClient]);
  
  const handleFinalizePrint = useCallback((options: PrintOptions | PrintOptionsModulAjar) => {
    if (!itemToPrint) return;
    const logSource = `CurriculumPrint-${itemToPrint.type}`; 
    const printableHtml = generatePrintableHtml(itemToPrint, options); 
    
    const printWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
    if (printWindow) {
      printWindow.document.write(printableHtml);
      printWindow.document.close();
      addLog("INFO", `Jendela cetak dibuka untuk ${itemToPrint.type === 'RPP' && itemToPrint.curriculumType === 'Kurikulum Merdeka' ? 'ATP' : itemToPrint.type} "${itemToPrint.title}".`, logSource);
    } else {
      toast({ title: "Gagal Membuka Jendela Cetak", description: "Pastikan pop-up diizinkan untuk situs ini.", variant: "destructive" });
      addLog("ERROR", `Gagal membuka jendela cetak. Kemungkinan pop-up diblokir.`, logSource);
    }
    setIsPrintOptionsOpen(false);
    setIsModulAjarPrintOptionsOpen(false);
    setItemToPrint(null);
  }, [itemToPrint, generatePrintableHtml, addLog, toast]);


  const handleExportToText = useCallback(async (item: AnyCurriculumItem) => {
    if (!isClient) return;
    let docTypeDisplay = item.type === 'RPP' ? (item.curriculumType === "Kurikulum Merdeka" ? "ATP" : "RPP") : item.type;
    if (item.type === 'ModulAjar') docTypeDisplay = "ModulAjar";

    const logSource = `CurriculumExport-${docTypeDisplay}`;
    addLog("INFO", `Memulai ekspor ke teks untuk ${docTypeDisplay} "${item.title}" (ID: ${item.id}) oleh ${currentUser?.email}.`, logSource);
    
    setIsExporting(prev => ({ ...prev, [item.id]: true }));

    try {
      let documentContent = "";
      let fileName = `${item.title.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_')}_${docTypeDisplay}.txt`;

      if (item.type === 'RPP' && (itemTypeForExport === 'RPP' || itemTypeForExport === undefined)) { 
        const rppInput = item as LessonPlan;
        const inputForFlow: ExportRppToTextInput = { ...rppInput };
        addLog("INFO", `Memanggil alur Genkit 'exportRppToText' untuk ${docTypeDisplay} "${item.title}" (${item.curriculumType}).`, logSource);
        const result = await exportRppToText(inputForFlow); 
        documentContent = result.documentContent;
        addLog("INFO", `Konten teks berhasil dibuat oleh Genkit untuk ${docTypeDisplay} "${item.title}".`, logSource);
      } else if (item.type === 'ModulAjar' && itemTypeForExport === 'ModulAjar') {
        // Manual export for ModulAjar if needed, or use a specific flow
        const ma = item as ModulAjar;
        let maText = `**MODUL AJAR**\n\n`;
        maText += `**Judul Modul:** ${ma.judulModul}\n\n`;
        maText += `**A. INFORMASI UMUM**\n`;
        maText += `   Nama Penyusun: ${ma.identitasModul.namaPenyusun}\n`;
        maText += `   Institusi: ${ma.identitasModul.institusi}\n`;
        // ... (add all fields from ModulAjar) ...
        maText += `\n\n*Dokumen ini terakhir diperbarui pada: ${isClient ? format(new Date(ma.updatedAt), "PPpp", { locale: indonesianLocale }) : ma.updatedAt}*`;
        documentContent = maText;
        addLog("INFO", `Konten teks berhasil dibuat secara manual untuk Modul Ajar "${item.title}".`, logSource);
      }
      // ... (PROTA and Promes export logic remains the same)
      else if (item.type === 'PROTA' && itemTypeForExport === 'PROTA') {
        const prota = item as AnnualProgram;
        let protaText = `**PROGRAM TAHUNAN (PROTA)**\n\n`;
        protaText += `**Judul:** ${prota.title}\n`;
        protaText += `**Kurikulum:** ${prota.curriculumType}\n`;
        protaText += `**Mata Pelajaran:** ${prota.subject}\n`;
        protaText += `**Jenjang/Fase/Kelas:** ${prota.gradeLevel}\n`;
        protaText += `**Tahun Ajaran:** ${prota.year}\n`;
        if (prota.curriculumType === "Kurikulum Merdeka" && prota.capaianPembelajaran && prota.capaianPembelajaran.length > 0) {
            protaText += `**Capaian Pembelajaran Umum Tahunan:**\n`;
            prota.capaianPembelajaran.forEach(cp => protaText += `- ${cp}\n`);
        }
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
        protaText += `\n\n*Dokumen ini terakhir diperbarui pada: ${isClient ? format(new Date(prota.updatedAt), "PPpp", { locale: indonesianLocale }) : prota.updatedAt}*`;
        documentContent = protaText;
        addLog("INFO", `Konten teks berhasil dibuat secara manual untuk PROTA "${item.title}".`, logSource);

      } else if (item.type === 'Promes' && itemTypeForExport === 'Promes') {
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
        promesText += `\n\n*Dokumen ini terakhir diperbarui pada: ${isClient ? format(new Date(promes.updatedAt), "PPpp", { locale: indonesianLocale }) : promes.updatedAt}*`;
        documentContent = promesText;
        addLog("INFO", `Konten teks berhasil dibuat secara manual untuk Promes "${item.title}".`, logSource);
      }
       else {
        documentContent = `Rincian untuk ${docTypeDisplay}: ${item.title}\n\n(Fungsi ekspor detail untuk jenis ini belum diimplementasikan atau itemTypeForExport tidak cocok.)\n\n${JSON.stringify(item, null, 2)}`;
        toast({
          title: "Fitur Dalam Pengembangan/Kesalahan Tipe",
          description: `Ekspor detail untuk ${docTypeDisplay} belum tersedia atau tipe item tidak cocok. Unduhan berisi data JSON dasar.`,
        });
        addLog("WARN", `Ekspor detail untuk ${docTypeDisplay} "${item.title}" belum diimplementasikan atau itemTypeForExport (${itemTypeForExport}) tidak cocok dengan item.type (${item.type}). Mengekspor data JSON mentah.`, logSource);
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
      addLog("INFO", `Ekspor ${docTypeDisplay} "${item.title}" ke file ${fileName} berhasil.`, logSource);
    } catch (error) {
      console.error("Error exporting item:", error);
      toast({ title: "Ekspor Gagal", description: "Tidak dapat mengekspor item. Silakan coba lagi.", variant: "destructive" });
      addLog("ERROR", `Gagal mengekspor ${docTypeDisplay} "${item.title}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, logSource);
    } finally {
      setIsExporting(prev => ({ ...prev, [item.id]: false }));
    }
  }, [isClient, itemTypeForExport, toast, addLog, currentUser]);
  
  const handleViewDetails = useCallback((item: AnyCurriculumItem) => {
    const docTypeDisplay = item.type === 'RPP' ? (item.curriculumType === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP") : item.type;
    addLog("INFO", `Pengguna ${currentUser?.email} melihat detail ${docTypeDisplay} "${item.title}" (ID: ${item.id}).`, `CurriculumView-${item.type}`);
    onView(item);
  }, [currentUser, addLog, onView]);

  const getCurriculumBadgeVariant = useCallback((curriculumType: CurriculumFramework): "default" | "secondary" | "outline" => {
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
  }, []);


  return (
    <>
      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] sm:min-w-[250px] w-2/5 px-3 sm:px-4 py-3 text-sm">Judul</TableHead>
              <TableHead className="min-w-[120px] px-3 sm:px-4 py-3 text-sm hidden md:table-cell">Jenis Dokumen</TableHead>
              <TableHead className="min-w-[140px] sm:min-w-[160px] px-3 sm:px-4 py-3 text-sm">Kurikulum</TableHead>
              <TableHead className="min-w-[150px] sm:min-w-[180px] px-3 sm:px-4 py-3 text-sm hidden md:table-cell">Jenjang/Fase/Kelas</TableHead>
              <TableHead className="min-w-[150px] sm:min-w-[180px] px-3 sm:px-4 py-3 text-sm">Penyusun</TableHead>
              <TableHead className="min-w-[150px] sm:min-w-[180px] px-3 sm:px-4 py-3 text-sm hidden lg:table-cell">Terakhir Diperbarui</TableHead>
              <TableHead className="text-right min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 py-3 text-sm">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground px-3 sm:px-4 py-3 text-base">
                  Tidak ada item ditemukan.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => {
              let docTypeDisplay = item.type === 'RPP' 
                ? (item.curriculumType === "Kurikulum Merdeka" ? "ATP/Modul Ajar (Umum)" : "RPP") 
                : item.type;
              if (item.type === 'ModulAjar') {
                docTypeDisplay = "Modul Ajar (KM)";
              }
              
              let gradeLevelDisplay = item.gradeLevel;
              if (item.type === 'ModulAjar') {
                 const maItem = item as ModulAjar;
                 gradeLevelDisplay = maItem.identitasModul.fase || maItem.identitasModul.kelasSemester;
              }

              return (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="font-medium px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">
                  <span className="block break-words max-w-xs">{item.title}</span>
                  <div className="md:hidden text-xs text-muted-foreground mt-1">
                    {docTypeDisplay} - {gradeLevelDisplay}
                  </div>
                   <div className="lg:hidden text-xs text-muted-foreground mt-1">
                    Mapel: {item.subject}
                  </div>
                  <div className="lg:hidden text-xs text-muted-foreground mt-0.5">
                     Diperbarui: {isClient ? format(new Date(item.updatedAt), "dd/MM/yy", { locale: indonesianLocale }) : item.updatedAt.substring(0,10)}
                  </div>_
                </TableCell>
                <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top hidden md:table-cell">
                  <Badge variant={item.type === 'RPP' || item.type === 'ModulAjar' ? 'default' : item.type === 'PROTA' ? 'secondary' : 'outline'} className="text-xs">
                    {item.type === 'ModulAjar' ? <BrainCircuit className="mr-1 h-3 w-3"/> : <BookCopy className="mr-1 h-3 w-3"/>}
                    {docTypeDisplay}
                  </Badge>
                </TableCell>
                <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">
                  <Badge variant={getCurriculumBadgeVariant(item.curriculumType)} className="whitespace-nowrap text-xs py-1 px-2">
                    <BookCopy className="mr-1 h-3 w-3 hidden sm:inline-block"/>
                    {item.curriculumType}
                  </Badge>
                </TableCell>
                <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm hidden md:table-cell">{gradeLevelDisplay}</TableCell>
                <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarImage 
                          src={getCreatorAvatar(item.createdByUserId)} 
                          alt={getCreatorName(item.createdByUserId)} 
                          data-ai-hint="user avatar"
                        />
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {getInitials(getCreatorName(item.createdByUserId)) || <UserIcon size={14}/>}
                        </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs sm:text-sm max-w-[100px] sm:max-w-[120px]">{getCreatorName(item.createdByUserId)}</span>
                  </div>
                </TableCell>
                <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-xs hidden lg:table-cell">{isClient ? format(new Date(item.updatedAt), "PPp", { locale: indonesianLocale }) : item.updatedAt}</TableCell>
                <TableCell className="text-right px-3 sm:px-4 py-2 sm:py-3 align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Aksi</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(item)} className="text-sm">
                        <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                      </DropdownMenuItem>
                      {canEdit(item) && onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(item)} className="text-sm">
                          <FilePenLine className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handlePreparePrint(item)} disabled={!isClient} className="text-sm">
                        <Printer className="mr-2 h-4 w-4" /> Cetak / PDF
                      </DropdownMenuItem>
                      {(item.type === 'RPP' || item.type === 'PROTA' || item.type === 'Promes' || item.type === 'ModulAjar') && ( // Only allow export for supported types
                        <DropdownMenuItem onClick={() => handleExportToText(item)} disabled={isExporting[item.id] || !isClient} className="text-sm">
                            {isExporting[item.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} 
                            Ekspor ke Teks
                        </DropdownMenuItem>
                      )}
                      {canDelete(item) && onDelete && (
                        <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive focus:bg-destructive/10 focus:text-destructive text-sm">
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
      {isPrintOptionsOpen && itemToPrint && itemToPrint.type !== 'ModulAjar' && (
        <PrintOptionsDialog
            isOpen={isPrintOptionsOpen}
            onOpenChange={setIsPrintOptionsOpen}
            itemType={itemToPrint.type}
            itemCurriculumType={itemToPrint.curriculumType} 
            defaultOptions={currentPrintOptions}
            onSubmit={handleFinalizePrint}
            hasSchoolProfile={!!schoolProfile} 
        />
      )}
      {isModulAjarPrintOptionsOpen && itemToPrint && itemToPrint.type === 'ModulAjar' && (
        <PrintOptionsModulAjarDialog
            isOpen={isModulAjarPrintOptionsOpen}
            onOpenChange={setIsModulAjarPrintOptionsOpen}
            defaultOptions={currentModulAjarPrintOptions}
            onSubmit={handleFinalizePrint}
            hasSchoolProfile={!!schoolProfile}
        />
      )}
    </>
  );
});
