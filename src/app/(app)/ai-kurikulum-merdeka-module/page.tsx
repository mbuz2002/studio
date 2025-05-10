
"use client";

import React, { useState, useEffect, type FormEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, BrainCircuit, Printer, FileText, Book, ListChecks, UserCheck, MessageSquareHeart, Lightbulb, AlertTriangle, Search, Save } from "lucide-react";
import { 
    generateKurikulumMerdekaModule, 
    type GenerateKurikulumMerdekaModuleInput,
    type GenerateKurikulumMerdekaModuleOutput 
} from "@/ai/flows/generate-kurikulum-merdeka-module";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLog } from "@/contexts/LogContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useCurriculum } from "@/contexts/CurriculumContext";
import { Badge } from "@/components/ui/badge";
import type { SchoolProfile, User, PrintOptionsModulAjar, ModulAjar } from "@/types";
import { defaultPrintOptionsModulAjar, MODUL_AJAR_STORAGE_KEY } from "@/types";
import { PrintOptionsModulAjarDialog } from "@/components/curriculum/PrintOptionsModulAjarDialog";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import { useRouter } from "next/navigation";

const merdekaGradeLevels = [
  { value: "PAUD (Kurikulum Merdeka)", label: "PAUD (Kurikulum Merdeka)" },
  { value: "Fase A (Kelas 1-2 SD/MI)", label: "Fase A (Kelas 1-2 SD/MI)" },
  { value: "Fase B (Kelas 3-4 SD/MI)", label: "Fase B (Kelas 3-4 SD/MI)" },
  { value: "Fase C (Kelas 5-6 SD/MI)", label: "Fase C (Kelas 5-6 SD/MI)" },
  { value: "Fase D (Kelas 7-9 SMP/MTs)", label: "Fase D (Kelas 7-9 SMP/MTs)" },
  { value: "Fase E (Kelas 10 SMA/MA/SMK/MAK)", label: "Fase E (Kelas 10 SMA/MA/SMK/MAK)" },
  { value: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)", label: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)" },
  { value: "SLB (Fase A-F Disesuaikan)", label: "SLB (Fase A-F Disesuaikan)" },
];

export default function NewAIKurikulumMerdekaModulePage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); 
  const { addLog } = useLog();
  const { defaultCurriculum } = useCurriculum();
  const router = useRouter();

  const [moduleTopic, setModuleTopic] = useState("");
  const [moduleSubject, setModuleSubject] = useState("");
  const [moduleGradeLevel, setModuleGradeLevel] = useState("");
  const [moduleCPElemen, setModuleCPElemen] = useState("");
  const [moduleAlokasiWaktu, setModuleAlokasiWaktu] = useState("");
  
  const [generatedModule, setGeneratedModule] = useState<GenerateKurikulumMerdekaModuleOutput | null>(null);
  const [isGeneratingModule, setIsGeneratingModule] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isClient, setIsClient] = useState(false);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);
  const [currentPrintOptions, setCurrentPrintOptions] = useState<PrintOptionsModulAjar>(defaultPrintOptionsModulAjar);


  useEffect(() => {
    setIsClient(true);
    const pageSource = "NewAIKurikulumMerdekaModulePage";
    if (user && !authLoading) { // Check authLoading
      addLog("INFO", `Pengguna ${user.email} mengakses halaman Pembuatan Modul Ajar AI Baru.`, pageSource);
    }
    if (defaultCurriculum !== "Kurikulum Merdeka" && user && !authLoading) {
        toast({
            title: "Fitur Khusus Kurikulum Merdeka",
            description: "Halaman ini untuk pembuatan Modul Ajar Kurikulum Merdeka. Kurikulum default Anda saat ini bukan Kurikulum Merdeka.",
            variant: "default",
        });
         addLog("WARN", `Pengguna ${user.email} mengakses halaman Modul Ajar AI, namun kurikulum default bukan Kurikulum Merdeka.`, pageSource);
         router.push("/dashboard"); 
         return;
    }
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem("schoolProfile");
      if (storedProfile) {
        try {
            setSchoolProfile(JSON.parse(storedProfile));
        } catch (e) {
            console.error("Failed to parse school profile from localStorage", e);
             addLog("ERROR", `Gagal memuat profil sekolah dari penyimpanan lokal: ${e instanceof Error ? e.message : String(e)}`, pageSource);
        }
      }
    }
  }, [user, addLog, defaultCurriculum, toast, router, authLoading]); // Add authLoading to dependency array

  const handleGenerateModule = async (e: FormEvent) => {
    e.preventDefault();
    if (!moduleTopic || !moduleSubject || !moduleGradeLevel) {
      toast({ title: "Informasi Kurang", description: "Harap isi Topik, Mata Pelajaran, dan Jenjang/Fase.", variant: "destructive" });
      addLog("WARN", `Gagal membuat Modul Ajar AI: Informasi dasar kurang. Topik: '${moduleTopic}', Mapel: '${moduleSubject}', Jenjang: '${moduleGradeLevel}'.`, "NewAIKurikulumMerdekaModulePage-AI");
      return;
    }
    setIsGeneratingModule(true);
    setGeneratedModule(null);
    addLog("INFO", `Memulai pembuatan Modul Ajar dengan AI. Topik: "${moduleTopic}", Mapel: "${moduleSubject}", Jenjang: "${moduleGradeLevel}".`, "NewAIKurikulumMerdekaModulePage-AI");
    try {
      const input: GenerateKurikulumMerdekaModuleInput = { 
        topic: moduleTopic, 
        subject: moduleSubject,
        jenjangFaseKelas: moduleGradeLevel,
        capaianPembelajaranElemen: moduleCPElemen.split('\n').map(s => s.trim()).filter(s => s),
        alokasiWaktuTotal: moduleAlokasiWaktu,
        namaPenyusun: user?.name || "Nama Guru Penyusun", 
        institusi: schoolProfile?.namaSekolah || "Nama Sekolah/Institusi", 
        tahunAjar: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1), 
      };
      const result = await generateKurikulumMerdekaModule(input);
      setGeneratedModule(result);
      toast({ title: "Modul Ajar Dihasilkan!", description: "AI telah membuat draf Modul Ajar Kurikulum Merdeka untuk Anda." });
      addLog("INFO", `Modul Ajar AI berhasil dibuat. Judul: "${result.judulModul}".`, "NewAIKurikulumMerdekaModulePage-AI");
    } catch (error) {
      console.error("Error generating Kurikulum Merdeka module:", error);
      toast({ title: "Pembuatan Modul Gagal", description: `Tidak dapat membuat modul ajar. ${error instanceof Error ? error.message : 'Silakan coba lagi.'}`, variant: "destructive" });
      addLog("ERROR", `Gagal membuat Modul Ajar AI. Topik: "${moduleTopic}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "NewAIKurikulumMerdekaModulePage-AI");
    } finally {
      setIsGeneratingModule(false);
    }
  };

  const handleSaveModule = async () => {
    if (!generatedModule || !user) return;
    setIsSaving(true);
    addLog("INFO", `Pengguna ${user.email} menyimpan Modul Ajar AI "${generatedModule.judulModul}".`, "NewAIKurikulumMerdekaModulePage-Save");

    const newModulAjar: ModulAjar = {
        ...generatedModule,
        id: `modulajar-${Date.now()}`,
        type: 'ModulAjar',
        title: generatedModule.judulModul,
        subject: generatedModule.identitasModul.mataPelajaran,
        gradeLevel: generatedModule.identitasModul.fase, 
        curriculumType: "Kurikulum Merdeka",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByUserId: user.id,
    };

    try {
        const existingModules = JSON.parse(localStorage.getItem(MODUL_AJAR_STORAGE_KEY) || "[]") as ModulAjar[];
        localStorage.setItem(MODUL_AJAR_STORAGE_KEY, JSON.stringify([newModulAjar, ...existingModules]));
        toast({ title: "Modul Ajar Disimpan", description: `"${newModulAjar.title}" telah berhasil disimpan.` });
        addLog("INFO", `Modul Ajar "${newModulAjar.title}" (ID: ${newModulAjar.id}) berhasil disimpan oleh ${user.email}.`, "NewAIKurikulumMerdekaModulePage-Save");
        router.push("/modul-ajar");
    } catch (error) {
        toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan Modul Ajar.", variant: "destructive" });
        addLog("ERROR", `Gagal menyimpan Modul Ajar "${newModulAjar.title}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "NewAIKurikulumMerdekaModulePage-Save");
        setIsSaving(false);
    }
  };

  const handlePreparePrintModulAjar = useCallback(() => {
    if (!generatedModule) return;
    setCurrentPrintOptions(defaultPrintOptionsModulAjar);
    setIsPrintOptionsOpen(true);
  }, [generatedModule]);

  const generatePrintableHtmlModulAjar = useCallback((modul: GenerateKurikulumMerdekaModuleOutput, options: PrintOptionsModulAjar): string => {
    const logSource = `PrintModulAjar-${modul.identitasModul.mataPelajaran}`;
    addLog("INFO", `Mempersiapkan pratinjau cetak untuk Modul Ajar "${modul.judulModul}" oleh ${user?.email}. Opsi: ${JSON.stringify(options)}`, logSource);

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
          addLog("WARN", `Kop surat diminta untuk Modul Ajar "${modul.judulModul}" tapi profil sekolah tidak lengkap/tidak ada.`, logSource);
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

    contentHtml += `<h2 class="modul-main-title">${modul.judulModul}</h2>`;
    
    let sectionCounter = 0;
    const nextLetter = () => String.fromCharCode(65 + sectionCounter++);

    if (options.showMAIdentitas) {
        sectionCounter = 0; 
        contentHtml += `<h3>${nextLetter()}. INFORMASI UMUM</h3>`;
        contentHtml += `<table class="info-table">
            <tr><td>Nama Penyusun</td><td>: ${modul.identitasModul.namaPenyusun}</td></tr>
            <tr><td>Institusi</td><td>: ${modul.identitasModul.institusi}</td></tr>
            <tr><td>Tahun Ajar</td><td>: ${modul.identitasModul.tahunAjar}</td></tr>
            <tr><td>Jenjang Sekolah</td><td>: ${modul.identitasModul.jenjangSekolah}</td></tr>
            <tr><td>Fase</td><td>: ${modul.identitasModul.fase}</td></tr>
            <tr><td>Kelas/Semester</td><td>: ${modul.identitasModul.kelasSemester}</td></tr>
            <tr><td>Alokasi Waktu</td><td>: ${modul.identitasModul.alokasiWaktu}</td></tr>
            <tr><td>Mata Pelajaran</td><td>: ${modul.identitasModul.mataPelajaran}</td></tr>
            ${modul.identitasModul.elemenCapaianPembelajaran && modul.identitasModul.elemenCapaianPembelajaran.length > 0 ? `<tr><td>Elemen Capaian Pembelajaran</td><td>: ${modul.identitasModul.elemenCapaianPembelajaran.join(', ')}</td></tr>` : ''}
        </table>`;
    }

    if (options.showMAKompetensiAwal && modul.kompetensiAwal && modul.kompetensiAwal.length > 0) {
        contentHtml += `<h3>${nextLetter()}. KOMPETENSI AWAL</h3><ul>${modul.kompetensiAwal.map(k => `<li>${k}</li>`).join('')}</ul>`;
    }
    if (options.showMAProfilPelajarPancasila && modul.profilPelajarPancasila.length > 0) {
        contentHtml += `<h3>${nextLetter()}. PROFIL PELAJAR PANCASILA</h3><ul>${modul.profilPelajarPancasila.map(p => `<li>${p}</li>`).join('')}</ul>`;
    }
    if (options.showMASaranaPrasarana && modul.saranaPrasarana.length > 0) {
        contentHtml += `<h3>${nextLetter()}. SARANA DAN PRASARANA</h3><ul>${modul.saranaPrasarana.map(s => `<li>${s}</li>`).join('')}</ul>`;
    }
    if (options.showMATargetPesertaDidik) {
        contentHtml += `<h3>${nextLetter()}. TARGET PESERTA DIDIK</h3><p>${modul.targetPesertaDidik}</p>`;
    }
    if (options.showMAModelPembelajaran) {
        contentHtml += `<h3>${nextLetter()}. MODEL PEMBELAJARAN</h3><p>${modul.modelPembelajaran}</p>`;
    }

    sectionCounter = 0; 
    contentHtml += `<hr class="content-hr"><h3>KOMPONEN INTI</h3>`;
    const ki = modul.komponenInti;
    if (options.showMAKomponenInti_TujuanPembelajaran && ki.tujuanPembelajaran.length > 0) {
        contentHtml += `<h4>${nextLetter()}. Tujuan Pembelajaran</h4><ol>${ki.tujuanPembelajaran.map(tp => `<li>${tp}</li>`).join('')}</ol>`;
    }
    if (options.showMAKomponenInti_PemahamanBermakna && ki.pemahamanBermakna.length > 0) {
        contentHtml += `<h4>${nextLetter()}. Pemahaman Bermakna</h4><ul>${ki.pemahamanBermakna.map(pb => `<li>${pb}</li>`).join('')}</ul>`;
    }
    if (options.showMAKomponenInti_PertanyaanPemantik && ki.pertanyaanPemantik.length > 0) {
        contentHtml += `<h4>${nextLetter()}. Pertanyaan Pemantik</h4><ul>${ki.pertanyaanPemantik.map(pp => `<li>${pp}</li>`).join('')}</ul>`;
    }
    if (options.showMAKomponenInti_KegiatanPembelajaran) {
        contentHtml += `<h4>${nextLetter()}. Kegiatan Pembelajaran</h4>`;
        if (options.showMAKomponenInti_Kegiatan_Pendahuluan && ki.kegiatanPembelajaran.pendahuluan.length > 0) {
            contentHtml += `<h5>1. Pendahuluan</h5><ul>${ki.kegiatanPembelajaran.pendahuluan.map(p => `<li>${p}</li>`).join('')}</ul>`;
        }
        if (options.showMAKomponenInti_Kegiatan_Inti && ki.kegiatanPembelajaran.inti.length > 0) {
            contentHtml += `<h5>2. Kegiatan Inti</h5><ol class="kegiatan-inti-list">${ki.kegiatanPembelajaran.inti.map(k => `<li><strong>${k.langkah}</strong><ul>${k.detailAktivitas.map(d => `<li>${d}</li>`).join('')}</ul></li>`).join('')}</ol>`;
        }
        if (options.showMAKomponenInti_Kegiatan_Penutup && ki.kegiatanPembelajaran.penutup.length > 0) {
            contentHtml += `<h5>3. Penutup</h5><ul>${ki.kegiatanPembelajaran.penutup.map(p => `<li>${p}</li>`).join('')}</ul>`;
        }
    }
    if (options.showMAKomponenInti_Asesmen) {
        contentHtml += `<h4>${nextLetter()}. Asesmen</h4>`;
        if (options.showMAKomponenInti_Asesmen_Diagnostik && ki.asesmen.diagnostik) contentHtml += `<p><strong>Diagnostik:</strong> ${ki.asesmen.diagnostik}</p>`;
        if (options.showMAKomponenInti_Asesmen_Formatif) contentHtml += `<p><strong>Formatif:</strong> ${ki.asesmen.formatif}</p>`;
        if (options.showMAKomponenInti_Asesmen_Sumatif) contentHtml += `<p><strong>Sumatif:</strong> ${ki.asesmen.sumatif}</p>`;
    }
    if (options.showMAKomponenInti_PengayaanRemedial && ki.pengayaanRemedial) {
        contentHtml += `<h4>${nextLetter()}. Pengayaan dan Remedial</h4><p><strong>Pengayaan:</strong> ${ki.pengayaanRemedial.pengayaan}</p><p><strong>Remedial:</strong> ${ki.pengayaanRemedial.remedial}</p>`;
    }
    if (options.showMAKomponenInti_Refleksi && ki.refleksiPesertaDidikGuru) {
        contentHtml += `<h4>${nextLetter()}. Refleksi Peserta Didik dan Guru</h4><p><strong>Refleksi Peserta Didik:</strong> ${ki.refleksiPesertaDidikGuru.refleksiPesertaDidik}</p><p><strong>Refleksi Guru:</strong> ${ki.refleksiPesertaDidikGuru.refleksiGuru}</p>`;
    }

    if (modul.lampiran && (options.showMALampiran_LKPD || options.showMALampiran_BahanBacaan || options.showMALampiran_Glosarium || options.showMALampiran_DaftarPustaka)) {
        sectionCounter = 0; 
        contentHtml += `<hr class="content-hr"><h3>LAMPIRAN</h3>`;
        const lamp = modul.lampiran;
        if (options.showMALampiran_LKPD && lamp.lembarKerjaPesertaDidik) {
            contentHtml += `<h4>${nextLetter()}. Lembar Kerja Peserta Didik (LKPD)</h4><div>${lamp.lembarKerjaPesertaDidik.replace(/\n/g, '<br>')}</div>`;
        }
        if (options.showMALampiran_BahanBacaan && lamp.bahanBacaanGuruSiswa && lamp.bahanBacaanGuruSiswa.length > 0) {
            contentHtml += `<h4>${nextLetter()}. Bahan Bacaan Guru dan Peserta Didik</h4><ul>${lamp.bahanBacaanGuruSiswa.map(b => `<li>${b.includes('http') ? `<a href="${b}" target="_blank" rel="noopener noreferrer">${b}</a>` : b}</li>`).join('')}</ul>`;
        }
        if (options.showMALampiran_Glosarium && lamp.glosarium && lamp.glosarium.length > 0) {
            contentHtml += `<h4>${nextLetter()}. Glosarium</h4><ul>${lamp.glosarium.map(g => `<li><strong>${g.istilah}:</strong> ${g.penjelasan}</li>`).join('')}</ul>`;
        }
        if (options.showMALampiran_DaftarPustaka && lamp.daftarPustaka && lamp.daftarPustaka.length > 0) {
            contentHtml += `<h4>${nextLetter()}. Daftar Pustaka</h4><ul>${lamp.daftarPustaka.map(dp => `<li>${dp.includes('http') ? `<a href="${dp}" target="_blank" rel="noopener noreferrer">${dp}</a>` : dp}</li>`).join('')}</ul>`;
        }
    }
    
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
          <p class="signature-name">${modul.identitasModul.namaPenyusun || '(.........................................)'}</p>
           ${user && user.role === 'Guru' ? `<p class="signature-nip">NIP: (NIP Guru Jika Ada)</p>` : ''}
        </div>
      </div>
    `;

    return `
      <html>
        <head>
          <title>Cetak Modul Ajar: ${modul.judulModul}</title>
          <style>
            @page { 
              size: 21cm 33cm; 
              margin: 0.75in; 
            }
            body { font-family: 'Times New Roman', Times, serif; margin: 0; line-height: 1.4; font-size: 11pt; color: #333; }
            .kop-surat { display: flex; align-items: center; margin-bottom: 15px; border-bottom: 4px double black; padding-bottom: 10px; min-height: 80px; }
            .logo-sekolah { max-height: 75px; max-width: 75px; margin-right: 15px; object-fit: contain; }
            .logo-placeholder { width: 75px; height: 75px; border: 1px dashed #999; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9pt; color: #666; margin-right: 15px;}
            .kop-text { text-align: center; flex-grow: 1; }
            .kop-text h1 { font-size: 16pt; margin: 0 0 2px 0; font-weight: bold; text-transform: uppercase; }
            .kop-text p { font-size: 10pt; margin: 1px 0; }
            .kop-text .kop-address { font-size: 9pt; }
            .kop-text .kop-contact { font-size: 9pt; }
            .modul-main-title { font-size: 14pt; margin-top: 15px; margin-bottom: 15px; font-weight: bold; text-transform: uppercase; text-align: center; }
            .info-table { width: 100%; margin-bottom: 15px; font-size: 11pt; border-collapse: collapse;}
            .info-table td { padding: 3px 0px; vertical-align: top;}
            .info-table td:first-child { font-weight: normal; width: 35%; } 
            .info-table td:nth-child(2) { font-weight: normal; }
            .content-hr { border: 0; border-top: 1.5px solid #888; margin: 20px 0; }
            h3 { font-size: 12pt; margin-top: 18px; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; }
            h4 { font-size: 11pt; margin-top: 12px; margin-bottom: 6px; font-weight: bold; }
            h5 { font-size: 11pt; margin-top: 8px; margin-bottom: 4px; font-weight: bold; }
            ul, ol { padding-left: 25px; margin-top: 5px; margin-bottom: 10px; }
            ol.kegiatan-inti-list { padding-left: 20px; }
            ol.kegiatan-inti-list > li > ul { padding-left: 20px; list-style-type: disc; }
            li { margin-bottom: 5px; text-align: justify; }
            p { margin-bottom: 10px; text-align: justify; }
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
  }, [isClient, schoolProfile, user, addLog]);

  const handleFinalizePrintModulAjar = useCallback((options: PrintOptionsModulAjar) => {
    if (!generatedModule) return;
    const logSource = `PrintModulAjar-${generatedModule.identitasModul.mataPelajaran}`; 
    const printableHtml = generatePrintableHtmlModulAjar(generatedModule, options); 
    
    const printWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
    if (printWindow) {
      printWindow.document.write(printableHtml);
      printWindow.document.close();
      addLog("INFO", `Jendela cetak dibuka untuk Modul Ajar "${generatedModule.judulModul}".`, logSource);
    } else {
      toast({ title: "Gagal Membuka Jendela Cetak", description: "Pastikan pop-up diizinkan untuk situs ini.", variant: "destructive" });
      addLog("ERROR", `Gagal membuka jendela cetak untuk Modul Ajar. Kemungkinan pop-up diblokir.`, logSource);
    }
    setIsPrintOptionsOpen(false);
  }, [generatedModule, generatePrintableHtmlModulAjar, addLog, toast]);


  if (!isClient || authLoading) { 
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
         <div className="flex flex-col items-center text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Memuat Pembuat Modul Ajar AI...</p>
           <p className="text-sm text-muted-foreground">Menyiapkan fitur canggih untuk Anda.</p>
        </div>
      </div>
    );
  }
   if (!user) { 
    return (
         <div className="flex h-[calc(100vh-150px)] items-center justify-center">
            <p className="text-lg text-muted-foreground">Silakan login untuk menggunakan fitur ini.</p>
        </div>
    );
  }
   if (defaultCurriculum !== "Kurikulum Merdeka") {
      return (
          <div className="container mx-auto py-6 md:py-8">
            <Alert variant="destructive">
                <AlertTriangle className="h-5 w-5"/>
                <AlertTitle>Fitur Tidak Tersedia</AlertTitle>
                <AlertDescription>
                    Fitur pembuatan Modul Ajar AI hanya tersedia untuk Kurikulum Merdeka. Silakan ubah pengaturan kurikulum default Anda jika ingin menggunakan fitur ini.
                </AlertDescription>
            </Alert>
        </div>
      );
  }


  return (
    <div className="container mx-auto py-6 md:py-8">
      <header className="mb-8">
        <Card className="shadow-xl overflow-hidden rounded-lg border-transparent">
          <CardHeader className="bg-gradient-to-br from-primary via-primary/90 to-accent p-6 md:p-8 text-primary-foreground rounded-t-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <BrainCircuit className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0 text-background drop-shadow-lg" />
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">AI Pembuat Modul Ajar Baru</CardTitle>
                <CardDescription className="text-lg md:text-xl mt-1.5 text-primary-foreground/90">
                  Rancang Modul Ajar Kurikulum Merdeka yang komprehensif dengan bantuan AI.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-6 rounded-lg border-border/50">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-xl font-semibold text-foreground">Parameter Modul Ajar</CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-1">
                Isi detail di bawah ini untuk Modul Ajar Kurikulum Merdeka.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleGenerateModule} className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="moduleTopic" className="text-base font-medium">Topik Utama / Materi Pokok</Label>
                  <Input id="moduleTopic" value={moduleTopic} onChange={(e) => setModuleTopic(e.target.value)} placeholder="cth., Ekosistem dan Komponennya" className="text-base h-11 rounded-md focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="moduleSubject" className="text-base font-medium">Mata Pelajaran</Label>
                  <Input id="moduleSubject" value={moduleSubject} onChange={(e) => setModuleSubject(e.target.value)} placeholder="cth., Ilmu Pengetahuan Alam dan Sosial (IPAS)" className="text-base h-11 rounded-md focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="moduleGradeLevel" className="text-base font-medium">Jenjang/Fase/Kelas</Label>
                  <Select value={moduleGradeLevel} onValueChange={(value) => { if (value !== "placeholder-grade") setModuleGradeLevel(value); else setModuleGradeLevel("");}}>
                    <SelectTrigger id="moduleGradeLevel" className="text-base h-11 rounded-md focus:border-primary">
                      <SelectValue placeholder="Pilih Jenjang/Fase/Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder-grade" disabled>Pilih Jenjang/Fase/Kelas</SelectItem>
                       {merdekaGradeLevels.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="moduleAlokasiWaktu" className="text-base font-medium">Estimasi Alokasi Waktu (Opsional)</Label>
                  <Input id="moduleAlokasiWaktu" value={moduleAlokasiWaktu} onChange={(e) => setModuleAlokasiWaktu(e.target.value)} placeholder="cth., 12 JP atau 3 Pertemuan" className="text-base h-11 rounded-md focus:border-primary" />
                </div>
                 <div className="space-y-1.5">
                  <Label htmlFor="moduleCPElemen" className="text-base font-medium">Elemen Capaian Pembelajaran (CP) (Opsional, satu per baris)</Label>
                  <Textarea id="moduleCPElemen" value={moduleCPElemen} onChange={(e) => setModuleCPElemen(e.target.value)} placeholder="CP Elemen 1: Memahami konsep..." className="text-base rounded-md focus:border-primary" rows={3} />
                </div>
                <Button type="submit" disabled={isGeneratingModule || !moduleTopic || !moduleSubject || !moduleGradeLevel} className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground text-lg py-3 h-12 mt-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-md">
                  {isGeneratingModule ? <Loader2 className="mr-2.5 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2.5 h-5 w-5" />}
                  Buat Modul Ajar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {isGeneratingModule && (
            <Card className="shadow-lg rounded-lg border-border/50">
               <CardHeader className="p-6 rounded-t-lg bg-muted/30">
                <div className="flex items-center">
                    <Loader2 className="h-7 w-7 animate-spin text-primary mr-3" />
                    <CardTitle className="text-2xl font-semibold text-muted-foreground">AI sedang merancang Modul Ajar...</CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground mt-2">Proses ini mungkin memerlukan waktu. Mohon tunggu.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5 animate-pulse">
                <div className="h-10 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-full"></div>
                <div className="h-6 bg-muted rounded w-5/6"></div>
              </CardContent>
            </Card>
          )}

          {generatedModule && !isGeneratingModule && (
            <Card className="shadow-xl rounded-lg border-border/50">
              <CardHeader className="p-6 bg-muted/30 border-b rounded-t-lg">
                <CardTitle className="text-2xl md:text-3xl text-primary font-bold tracking-tight">{generatedModule.judulModul}</CardTitle>
              </CardHeader>
              <ScrollArea className="h-auto max-h-[calc(100vh-280px)] lg:max-h-[calc(100vh-240px)] rounded-b-md"> 
              <CardContent className="p-6 space-y-6">
                
                <section>
                    <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center"><FileText className="mr-2 h-5 w-5 text-accent"/>Identitas Modul</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm bg-secondary/30 p-4 rounded-md shadow-inner">
                        <p><strong>Nama Penyusun:</strong> {generatedModule.identitasModul.namaPenyusun}</p>
                        <p><strong>Institusi:</strong> {generatedModule.identitasModul.institusi}</p>
                        <p><strong>Tahun Ajar:</strong> {generatedModule.identitasModul.tahunAjar}</p>
                        <p><strong>Jenjang Sekolah:</strong> {generatedModule.identitasModul.jenjangSekolah}</p>
                        <p><strong>Fase:</strong> {generatedModule.identitasModul.fase}</p>
                        <p><strong>Kelas/Semester:</strong> {generatedModule.identitasModul.kelasSemester}</p>
                        <p><strong>Alokasi Waktu:</strong> {generatedModule.identitasModul.alokasiWaktu}</p>
                        <p><strong>Mata Pelajaran:</strong> {generatedModule.identitasModul.mataPelajaran}</p>
                        {generatedModule.identitasModul.elemenCapaianPembelajaran && generatedModule.identitasModul.elemenCapaianPembelajaran.length > 0 && (
                             <p className="sm:col-span-2"><strong>Elemen CP:</strong> {generatedModule.identitasModul.elemenCapaianPembelajaran.join(', ')}</p>
                        )}
                    </div>
                </section>
                <Separator/>

                {generatedModule.kompetensiAwal && generatedModule.kompetensiAwal.length > 0 && (
                    <section>
                        <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-accent"/>Kompetensi Awal</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            {generatedModule.kompetensiAwal.map((item, idx) => <li key={`ka-${idx}`}>{item}</li>)}
                        </ul>
                    </section>
                )}
                <Separator/>

                <section>
                    <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center"><UserCheck className="mr-2 h-5 w-5 text-accent"/>Profil Pelajar Pancasila</h3>
                    <div className="flex flex-wrap gap-2">
                        {generatedModule.profilPelajarPancasila.map((item, idx) => (
                            <Badge key={`p5-${idx}`} variant="secondary" className="text-sm">{item}</Badge>
                        ))}
                    </div>
                </section>
                <Separator/>
                
                <section>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Sarana dan Prasarana</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                       {generatedModule.saranaPrasarana.map((item, idx) => <li key={`sarpras-${idx}`}>{item}</li>)}
                    </ul>
                </section>
                <Separator/>

                <p className="text-sm"><strong>Target Peserta Didik:</strong> {generatedModule.targetPesertaDidik}</p>
                <p className="text-sm"><strong>Model Pembelajaran:</strong> {generatedModule.modelPembelajaran}</p>
                <Separator/>

                <section>
                    <h3 className="text-2xl font-bold mb-4 text-primary flex items-center"><ListChecks className="mr-2 h-6 w-6"/>Komponen Inti</h3>
                    
                    <h4 className="text-lg font-semibold mt-3 mb-1">Tujuan Pembelajaran</h4>
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                        {generatedModule.komponenInti.tujuanPembelajaran.map((item, idx) => <li key={`tp-${idx}`}>{item}</li>)}
                    </ol>

                    <h4 className="text-lg font-semibold mt-3 mb-1">Pemahaman Bermakna</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {generatedModule.komponenInti.pemahamanBermakna.map((item, idx) => <li key={`pb-${idx}`}>{item}</li>)}
                    </ul>

                    <h4 className="text-lg font-semibold mt-3 mb-1">Pertanyaan Pemantik</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {generatedModule.komponenInti.pertanyaanPemantik.map((item, idx) => <li key={`pp-${idx}`}>{item}</li>)}
                    </ul>
                    
                    <h4 className="text-lg font-semibold mt-4 mb-2">Kegiatan Pembelajaran</h4>
                    <div className="space-y-3 text-sm">
                        <div><strong>Pendahuluan:</strong>
                            <ul className="list-disc pl-6 mt-1 space-y-0.5">
                                {generatedModule.komponenInti.kegiatanPembelajaran.pendahuluan.map((item, idx) => <li key={`kp-awal-${idx}`}>{item}</li>)}
                            </ul>
                        </div>
                        <div><strong>Kegiatan Inti:</strong>
                            <ol className="list-decimal pl-6 mt-1 space-y-2">
                                {generatedModule.komponenInti.kegiatanPembelajaran.inti.map((kegiatan, idx) => (
                                    <li key={`kp-inti-${idx}`}>
                                        <strong>{kegiatan.langkah}:</strong>
                                        <ul className="list-disc pl-6 mt-1 space-y-0.5">
                                            {kegiatan.detailAktivitas.map((detail, detailIdx) => <li key={`kp-inti-${idx}-detail-${detailIdx}`}>{detail}</li>)}
                                        </ul>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div><strong>Penutup:</strong>
                            <ul className="list-disc pl-6 mt-1 space-y-0.5">
                                {generatedModule.komponenInti.kegiatanPembelajaran.penutup.map((item, idx) => <li key={`kp-akhir-${idx}`}>{item}</li>)}
                            </ul>
                        </div>
                    </div>

                    <h4 className="text-lg font-semibold mt-4 mb-2">Asesmen</h4>
                    <div className="space-y-2 text-sm">
                        {generatedModule.komponenInti.asesmen.diagnostik && <p><strong>Diagnostik:</strong> {generatedModule.komponenInti.asesmen.diagnostik}</p>}
                        <p><strong>Formatif:</strong> {generatedModule.komponenInti.asesmen.formatif}</p>
                        <p><strong>Sumatif:</strong> {generatedModule.komponenInti.asesmen.sumatif}</p>
                    </div>

                    {generatedModule.komponenInti.pengayaanRemedial && (
                        <>
                            <h4 className="text-lg font-semibold mt-3 mb-1">Pengayaan dan Remedial</h4>
                            <p className="text-sm"><strong>Pengayaan:</strong> {generatedModule.komponenInti.pengayaanRemedial.pengayaan}</p>
                            <p className="text-sm"><strong>Remedial:</strong> {generatedModule.komponenInti.pengayaanRemedial.remedial}</p>
                        </>
                    )}
                    {generatedModule.komponenInti.refleksiPesertaDidikGuru && (
                         <section className="mt-4">
                            <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center"><MessageSquareHeart className="mr-2 h-5 w-5 text-accent"/>Refleksi</h3>
                            <p className="text-sm"><strong>Refleksi Peserta Didik:</strong> {generatedModule.komponenInti.refleksiPesertaDidikGuru.refleksiPesertaDidik}</p>
                            <p className="text-sm"><strong>Refleksi Guru:</strong> {generatedModule.komponenInti.refleksiPesertaDidikGuru.refleksiGuru}</p>
                        </section>
                    )}
                </section>
                <Separator/>

                {generatedModule.lampiran && (
                    <section>
                        <h3 className="text-2xl font-bold mb-3 text-primary">Lampiran</h3>
                        {generatedModule.lampiran.lembarKerjaPesertaDidik && (
                            <>
                                <h4 className="text-lg font-semibold mt-3 mb-1">Lembar Kerja Peserta Didik (LKPD)</h4>
                                <ReactMarkdown className="markdown-content text-sm" remarkPlugins={[remarkGfm]}>{generatedModule.lampiran.lembarKerjaPesertaDidik}</ReactMarkdown>
                            </>
                        )}
                        {generatedModule.lampiran.bahanBacaanGuruSiswa && generatedModule.lampiran.bahanBacaanGuruSiswa.length > 0 &&(
                            <>
                                <h4 className="text-lg font-semibold mt-3 mb-1">Bahan Bacaan Guru & Siswa</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {generatedModule.lampiran.bahanBacaanGuruSiswa.map((item, idx) => (
                                        <li key={`bb-${idx}`}>
                                            {item.includes('http') ? <a href={item} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{item}</a> : item}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {generatedModule.lampiran.glosarium && generatedModule.lampiran.glosarium.length > 0 && (
                            <>
                                <h4 className="text-lg font-semibold mt-3 mb-1">Glosarium</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {generatedModule.lampiran.glosarium.map((item, idx) => <li key={`glos-${idx}`}><strong>{item.istilah}:</strong> {item.penjelasan}</li>)}
                                </ul>
                            </>
                        )}
                        {generatedModule.lampiran.daftarPustaka && generatedModule.lampiran.daftarPustaka.length > 0 && (
                            <>
                                <h4 className="text-lg font-semibold mt-3 mb-1">Daftar Pustaka</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {generatedModule.lampiran.daftarPustaka.map((item, idx) => (
                                      <li key={`dp-${idx}`}>
                                        {item.includes('http') ? <a href={item} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{item}</a> : item}
                                      </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </section>
                )}
              </CardContent>
              </ScrollArea>
              <CardFooter className="p-6 border-t bg-muted/20 rounded-b-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                 <Alert variant="default" className="border-primary/50 shadow-sm rounded-md flex-grow">
                    <Search className="h-5 w-5 text-primary" />
                    <AlertTitle className="font-semibold text-primary">Verifikasi & Sesuaikan Modul</AlertTitle>
                    <AlertDescription className="text-base">
                        Konten yang dihasilkan AI adalah draf awal. Selalu verifikasi keakuratan, kelengkapan, dan relevansi modul sebelum digunakan.
                    </AlertDescription>
                </Alert>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button onClick={handleSaveModule} disabled={isSaving || !generatedModule} className="w-full sm:w-auto">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />} Simpan Modul Ajar
                    </Button>
                    <Button onClick={handlePreparePrintModulAjar} disabled={!generatedModule} variant="outline" className="w-full sm:w-auto">
                        <Printer className="mr-2 h-4 w-4" /> Cetak / PDF
                    </Button>
                </div>
              </CardFooter>
            </Card>
          )}
          
          {!generatedModule && !isGeneratingModule && (
            <Card className="shadow-lg h-full flex flex-col items-center justify-center text-center p-8 md:p-12 bg-muted/30 border-2 border-dashed border-border/70 rounded-lg min-h-[400px]">
                <BrainCircuit className="h-16 w-16 md:h-20 md:w-20 text-muted-foreground/40 mb-5" />
                <CardTitle className="text-2xl md:text-3xl font-semibold text-muted-foreground">Hasil Modul Ajar Akan Tampil di Sini</CardTitle>
                <CardDescription className="text-base md:text-lg text-muted-foreground mt-3 max-w-md">
                    Isi parameter di sebelah kiri dan klik "Buat Modul Ajar" untuk memulai.
                </CardDescription>
                <Alert variant="default" className="mt-6 max-w-md text-left border-primary/30 shadow-sm rounded-md">
                    <AlertTriangle className="h-5 w-5 text-primary"/>
                    <AlertTitle className="font-semibold text-primary">Tips Penggunaan AI</AlertTitle>
                    <AlertDescription className="text-sm">
                        Semakin detail input Anda (terutama pada Topik dan Elemen CP), semakin relevan hasil yang akan diberikan AI.
                        AI akan menyarankan konten berdasarkan praktik umum Kurikulum Merdeka.
                    </AlertDescription>
                </Alert>
            </Card>
          )}
        </div>
      </div>
      {generatedModule && (
        <PrintOptionsModulAjarDialog
            isOpen={isPrintOptionsOpen}
            onOpenChange={setIsPrintOptionsOpen}
            defaultOptions={currentPrintOptions}
            onSubmit={handleFinalizePrintModulAjar}
            hasSchoolProfile={!!schoolProfile} 
        />
      )}
    </div>
  );
}
