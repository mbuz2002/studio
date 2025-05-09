
"use client";

import React, { useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LessonPlan, CurriculumFramework, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";


interface LessonPlanFormFieldsProps {
  formData: Partial<LessonPlan>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleArrayChange: (name: keyof LessonPlan, value: string) => void;
  handleLangkahPembelajaranChange: (part: 'pendahuluan' | 'kegiatanInti' | 'penutup', value: string) => void;
  selectedCurriculum: CurriculumFramework;
  availableCurriculums: { value: CurriculumFramework; label: string }[];
  isGeneratingAI: boolean;
  handleGenerateWithAI: () => Promise<void>;
  userRole: UserRole;
}

const merdekaGradeLevels = [
  { value: "PAUD (Kurikulum Merdeka)", label: "PAUD (Kurikulum Merdeka)" },
  { value: "Fase A (Kelas 1-2 SD/MI)", label: "Fase A (Kelas 1-2 SD/MI)" },
  { value: "Fase B (Kelas 3-4 SD/MI)", label: "Fase B (Kelas 3-4 SD/MI)" },
  { value: "Fase C (Kelas 5-6 SD/MI)", label: "Fase C (Kelas 5-6 SD/MI)" },
  { value: "Fase D (Kelas 7-9 SMP/MTs)", label: "Fase D (Kelas 7-9 SMP/MTs)" },
  { value: "Fase E (Kelas 10 SMA/MA/SMK/MAK)", label: "Fase E (Kelas 10 SMA/MA/SMK/MAK)" },
  { value: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)", label: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)" },
  { value: "SLB (Fase A-F Disesuaikan)", label: "SLB (Fase A-F Disesuaikan)" },
  { value: "Pendidikan Kesetaraan (Fase A-F Disesuaikan)", label: "Pendidikan Kesetaraan (Fase A-F Disesuaikan)" },
];

const k13KtspGradeLevels = [
  { value: "PAUD (K13/KTSP)", label: "PAUD (K13/KTSP)" },
  { value: "Kelas I SD/MI", label: "Kelas I SD/MI" },
  { value: "Kelas II SD/MI", label: "Kelas II SD/MI" },
  { value: "Kelas III SD/MI", label: "Kelas III SD/MI" },
  { value: "Kelas IV SD/MI", label: "Kelas IV SD/MI" },
  { value: "Kelas V SD/MI", label: "Kelas V SD/MI" },
  { value: "Kelas VI SD/MI", label: "Kelas VI SD/MI" },
  { value: "Kelas VII SMP/MTs", label: "Kelas VII SMP/MTs" },
  { value: "Kelas VIII SMP/MTs", label: "Kelas VIII SMP/MTs" },
  { value: "Kelas IX SMP/MTs", label: "Kelas IX SMP/MTs" },
  { value: "Kelas X SMA/MA/SMK/MAK", label: "Kelas X SMA/MA/SMK/MAK" },
  { value: "Kelas XI SMA/MA/SMK/MAK", label: "Kelas XI SMA/MA/SMK/MAK" },
  { value: "Kelas XII SMA/MA/SMK/MAK", label: "Kelas XII SMA/MA/SMK/MAK" },
  { value: "SLB (Kelas 1-12 Disesuaikan)", label: "SLB (Kelas 1-12 Disesuaikan)" },
  { value: "Pendidikan Kesetaraan (Paket A/B/C)", label: "Pendidikan Kesetaraan (Paket A/B/C)" },
];


export function LessonPlanFormFields({
  formData,
  handleChange,
  handleSelectChange,
  handleArrayChange,
  handleLangkahPembelajaranChange,
  selectedCurriculum,
  availableCurriculums,
  isGeneratingAI,
  handleGenerateWithAI,
  userRole,
}: LessonPlanFormFieldsProps) {

  const currentGradeLevelOptions = useMemo(() => {
    if (selectedCurriculum === "Kurikulum Merdeka") {
      return merdekaGradeLevels;
    }
    return k13KtspGradeLevels;
  }, [selectedCurriculum]);

  const isPAUDSelected = useMemo(() => selectedCurriculum === "Kurikulum Merdeka" && formData.gradeLevel?.toUpperCase().includes("PAUD"), [selectedCurriculum, formData.gradeLevel]);
  const isSMKSelected = useMemo(() => selectedCurriculum === "Kurikulum Merdeka" && formData.gradeLevel?.toUpperCase().includes("SMK"), [selectedCurriculum, formData.gradeLevel]);

  useEffect(() => {
    if (formData.gradeLevel && !currentGradeLevelOptions.find(opt => opt.value === formData.gradeLevel)) {
      handleSelectChange('gradeLevel', ''); 
    }
  }, [selectedCurriculum, currentGradeLevelOptions, formData.gradeLevel, handleSelectChange]);
  
  const documentTypeLabel = selectedCurriculum === "Kurikulum Merdeka" 
    ? (isPAUDSelected ? "Modul Ajar PAUD" : "ATP / Modul Ajar") 
    : "RPP";

  const topicLabel = selectedCurriculum === "Kurikulum Merdeka" 
    ? (isPAUDSelected ? "Tema Pembelajaran (PAUD)" : "Konsentrasi Keahlian / Tema Utama") 
    : "Topik/Materi Pembelajaran";

  const topicPlaceholder = selectedCurriculum === "Kurikulum Merdeka"
    ? (isPAUDSelected ? "cth., Aku Sayang Bumi" : (isSMKSelected ? "cth., Teknik Animasi 2D (SMK)" : "cth., Perubahan Iklim Global"))
    : "cth., Fotosintesis";

  const learningObjectivesLabel = selectedCurriculum === "Kurikulum Merdeka"
    ? (isPAUDSelected ? "Tujuan Kegiatan (TK) (satu per baris)" : "Tujuan Pembelajaran (TP) (satu TP per baris untuk ATP)")
    : "Tujuan Pembelajaran (satu per baris)";
  
  const learningObjectivesPlaceholder = selectedCurriculum === "Kurikulum Merdeka"
    ? (isPAUDSelected ? "TK 1: Anak mampu menyebutkan...\nTK 2: Anak dapat bekerja sama..." : "TP 1: Peserta didik dapat menjelaskan...\nTP 2: Peserta didik dapat mengidentifikasi...")
    : "Tujuan 1: Setelah pembelajaran, siswa dapat...\nTujuan 2: Siswa mampu...";

  const langkahPembelajaranLabel = selectedCurriculum === "Kurikulum Merdeka"
    ? (isPAUDSelected ? "Rencana Kegiatan (Pembuka, Inti, Penutup)" : "Langkah-langkah Pembelajaran (opsional untuk ATP murni)")
    : "Langkah-langkah Pembelajaran";


  const commonAIButton = (
      <div className="my-4">
        <Button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={isGeneratingAI || !formData.gradeLevel || !selectedCurriculum || !formData.topic || (selectedCurriculum === "Kurikulum Merdeka" && !isPAUDSelected && (!formData.capaianPembelajaran || formData.capaianPembelajaran.length === 0))}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
        >
            {isGeneratingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Buat Draf Konten {documentTypeLabel} dengan AI (Kurikulum: {availableCurriculums.find(c=>c.value === selectedCurriculum)?.label || selectedCurriculum})
        </Button>
        {(!formData.topic || !formData.gradeLevel || !selectedCurriculum) && !isGeneratingAI && (
            <p className="text-xs text-muted-foreground mt-1">
                Isi Jenis Kurikulum, {topicLabel}, dan Jenjang/Fase untuk mengaktifkan tombol AI.
            </p>
        )}
         {(selectedCurriculum === "Kurikulum Merdeka" && !isPAUDSelected && (!formData.capaianPembelajaran || formData.capaianPembelajaran.length === 0) && !isGeneratingAI) && (
            <p className="text-xs text-muted-foreground mt-1">
                Untuk Kurikulum Merdeka (selain PAUD), isi juga Capaian Pembelajaran untuk hasil AI yang lebih baik.
            </p>
        )}
      </div>
    );

  return (
    <>
      {/* Common Fields */}
      <div className="space-y-1">
        <Label htmlFor="title">Judul {documentTypeLabel}</Label>
        <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} placeholder={selectedCurriculum === "Kurikulum Merdeka" ? (isPAUDSelected ? "Modul Ajar Tema Aku dan Sekolahku" : "ATP Animasi Fase F") : "RPP Fotosintesis Kelas VII"} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="curriculumType">Jenis Kurikulum</Label>
          <Select name="curriculumType" value={selectedCurriculum} onValueChange={(value) => handleSelectChange('curriculumType', value)}>
            <SelectTrigger id="curriculumType" disabled={userRole === 'Guru'}>
              <SelectValue placeholder="Pilih Jenis Kurikulum" />
            </SelectTrigger>
            <SelectContent>
              {availableCurriculums.map(curr => (
                <SelectItem key={curr.value} value={curr.value}>{curr.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {userRole === 'Guru' && (
            <p className="text-xs text-muted-foreground mt-1">Jenis kurikulum ditentukan oleh pengaturan global.</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="subject">Mata Pelajaran</Label>
          <Input id="subject" name="subject" value={formData.subject || ''} onChange={handleChange} required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
            <Label htmlFor="gradeLevel">{selectedCurriculum === "Kurikulum Merdeka" ? "Fase" : "Jenjang/Kelas"}</Label>
            <Select value={formData.gradeLevel || ''} onValueChange={(value) => handleSelectChange('gradeLevel', value === "placeholder-grade" ? "" : value)}>
                <SelectTrigger id="gradeLevel">
                    <SelectValue placeholder={selectedCurriculum === "Kurikulum Merdeka" ? "Pilih Fase" : "Pilih Jenjang/Kelas"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder-grade" disabled>{selectedCurriculum === "Kurikulum Merdeka" ? "Pilih Fase" : "Pilih Jenjang/Kelas"}</SelectItem>
                    {currentGradeLevelOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-1">
            <Label htmlFor="alokasiWaktuJP">Alokasi Waktu (JP)</Label>
            <Input id="alokasiWaktuJP" name="alokasiWaktuJP" value={formData.alokasiWaktuJP || ''} onChange={handleChange} placeholder="cth., 2 JP atau 3x40 menit" />
        </div>
      </div>


      {/* RPP/Modul Ajar/ATP Specific Fields */}
      <div className="space-y-1">
        <Label htmlFor="topic">{topicLabel}</Label>
        <Input id="topic" name="topic" value={formData.topic || ''} onChange={handleChange} placeholder={topicPlaceholder} required />
      </div>

      {selectedCurriculum === "Kurikulum Merdeka" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="bidangKeahlian">Bidang Keahlian (Opsional, utamanya SMK)</Label>
              <Input id="bidangKeahlian" name="bidangKeahlian" value={formData.bidangKeahlian || ''} onChange={handleChange} placeholder="cth., Seni dan Ekonomi Kreatif" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="programKeahlian">Program Keahlian (Opsional, utamanya SMK)</Label>
              <Input id="programKeahlian" name="programKeahlian" value={formData.programKeahlian || ''} onChange={handleChange} placeholder="cth., Animasi" />
            </div>
          </div>
          {!isPAUDSelected && (
            <div className="space-y-1">
              <Label htmlFor="capaianPembelajaran">Capaian Pembelajaran (CP) (satu per baris)</Label>
              <Textarea 
                id="capaianPembelajaran" 
                name="capaianPembelajaran" 
                value={formData.capaianPembelajaran?.join('\n') || ''} 
                onChange={(e) => handleArrayChange('capaianPembelajaran', e.target.value)} 
                placeholder={`Contoh: Pada akhir ${formData.gradeLevel || 'Fase'}, peserta didik dapat...`}
              />
              <p className="text-xs text-muted-foreground">Masukkan CP yang relevan. AI akan menggunakan CP ini untuk merumuskan Tujuan Pembelajaran (TP) untuk ATP.</p>
            </div>
          )}
        </>
      )}
      
      {commonAIButton}

      <div className="space-y-1">
        <Label htmlFor="learningObjectives">{learningObjectivesLabel}</Label>
        <Textarea 
          id="learningObjectives" 
          name="learningObjectives" 
          value={formData.learningObjectives?.join('\n') || ''} 
          onChange={(e) => handleArrayChange('learningObjectives', e.target.value)} 
          placeholder={learningObjectivesPlaceholder}
          rows={selectedCurriculum === "Kurikulum Merdeka" && !isPAUDSelected ? 5 : 3}
        />
         {selectedCurriculum === "Kurikulum Merdeka" && !isPAUDSelected && (
            <p className="text-xs text-muted-foreground">Masukkan Tujuan Pembelajaran (TP) secara berurutan untuk membentuk Alur Tujuan Pembelajaran (ATP). AI akan membantu menyusunnya dari CP yang diberikan.</p>
         )}
      </div>

      {selectedCurriculum === "Kurikulum Merdeka" && (
        <>
          <div className="space-y-1">
            <Label htmlFor="profilPelajarPancasilaFocus">Fokus Profil Pelajar Pancasila (satu per baris, opsional)</Label>
            <Textarea id="profilPelajarPancasilaFocus" name="profilPelajarPancasilaFocus" value={formData.profilPelajarPancasilaFocus?.join('\n') || ''} onChange={(e) => handleArrayChange('profilPelajarPancasilaFocus', e.target.value)} placeholder="Bernalar Kritis&#10;Kreatif" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pemahamanBermakna">Pemahaman Bermakna (satu per baris, opsional untuk ATP murni)</Label>
            <Textarea id="pemahamanBermakna" name="pemahamanBermakna" value={formData.pemahamanBermakna?.join('\n') || ''} onChange={(e) => handleArrayChange('pemahamanBermakna', e.target.value)} placeholder="Pemahaman 1&#10;Pemahaman 2" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pertanyaanPemantik">Pertanyaan Pemantik (satu per baris, opsional untuk ATP murni)</Label>
            <Textarea id="pertanyaanPemantik" name="pertanyaanPemantik" value={formData.pertanyaanPemantik?.join('\n') || ''} onChange={(e) => handleArrayChange('pertanyaanPemantik', e.target.value)} placeholder="Pertanyaan 1&#10;Pertanyaan 2" />
          </div>
            <div className="space-y-1">
            <Label htmlFor="differentiationStrategies">Strategi Diferensiasi (satu per baris, opsional)</Label>
            <Textarea id="differentiationStrategies" name="differentiationStrategies" value={formData.differentiationStrategies?.join('\n') || ''} onChange={(e) => handleArrayChange('differentiationStrategies', e.target.value)} placeholder="Strategi 1&#10;Strategi 2" />
          </div>
        </>
      )}

      {(selectedCurriculum === "K-13" || selectedCurriculum === "KTSP 2006") && (
        <>
          {selectedCurriculum === "KTSP 2006" && (
            <div className="space-y-1">
              <Label htmlFor="standarKompetensi">Standar Kompetensi (SK) (satu per baris)</Label>
              <Textarea id="standarKompetensi" name="standarKompetensi" value={formData.standarKompetensi?.join('\n') || ''} onChange={(e) => handleArrayChange('standarKompetensi', e.target.value)} placeholder="SK 1&#10;SK 2" />
            </div>
          )}
          {selectedCurriculum === "K-13" && (
            <div className="space-y-1">
              <Label htmlFor="kompetensiInti">Kompetensi Inti (KI) (satu per baris, misal KI-1, KI-2)</Label>
              <Textarea id="kompetensiInti" name="kompetensiInti" value={formData.kompetensiInti?.join('\n') || ''} onChange={(e) => handleArrayChange('kompetensiInti', e.target.value)} placeholder="KI-1: Menghayati...&#10;KI-2: Menunjukkan..." />
            </div>
          )}
            <div className="space-y-1">
            <Label htmlFor="kompetensiDasar">Kompetensi Dasar (KD) (satu per baris)</Label>
            <Textarea id="kompetensiDasar" name="kompetensiDasar" value={formData.kompetensiDasar?.join('\n') || ''} onChange={(e) => handleArrayChange('kompetensiDasar', e.target.value)} placeholder="KD 3.1: ...&#10;KD 4.1: ..." />
          </div>
            <div className="space-y-1">
            <Label htmlFor="indikatorPencapaianKompetensi">Indikator Pencapaian Kompetensi (IPK) (satu per baris)</Label>
            <Textarea id="indikatorPencapaianKompetensi" name="indikatorPencapaianKompetensi" value={formData.indikatorPencapaianKompetensi?.join('\n') || ''} onChange={(e) => handleArrayChange('indikatorPencapaianKompetensi', e.target.value)} placeholder="IPK 3.1.1: ...&#10;IPK 4.1.1: ..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="metodePembelajaran">Metode Pembelajaran (satu per baris)</Label>
            <Textarea id="metodePembelajaran" name="metodePembelajaran" value={formData.metodePembelajaran?.join('\n') || ''} onChange={(e) => handleArrayChange('metodePembelajaran', e.target.value)} placeholder="Ceramah&#10;Diskusi" />
          </div>
        </>
      )}

      <Label>{langkahPembelajaranLabel}</Label>
      <div className="space-y-2 rounded-md border p-4">
        <div className="space-y-1">
          <Label htmlFor="langkahPendahuluan" className="text-sm font-medium">
            {isPAUDSelected ? "Kegiatan Pembuka" : "Pendahuluan"}
          </Label>
          <Textarea id="langkahPendahuluan" value={formData.langkahPembelajaran?.pendahuluan?.join('\n') || ''} onChange={(e) => handleLangkahPembelajaranChange('pendahuluan', e.target.value)} placeholder={`${isPAUDSelected ? "Kegiatan pembuka 1" : "Kegiatan pendahuluan 1"}\n${isPAUDSelected ? "Kegiatan pembuka 2" : "Kegiatan pendahuluan 2"}`} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="langkahInti" className="text-sm font-medium">
            {isPAUDSelected ? "Kegiatan Inti (Bermain Belajar)" : "Kegiatan Inti"}
          </Label>
          <Textarea id="langkahInti" value={formData.langkahPembelajaran?.kegiatanInti?.join('\n') || ''} onChange={(e) => handleLangkahPembelajaranChange('kegiatanInti', e.target.value)} placeholder={`${isPAUDSelected ? "Kegiatan inti 1" : "Kegiatan inti 1"}\n${isPAUDSelected ? "Kegiatan inti 2" : "Kegiatan inti 2"}`} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="langkahPenutup" className="text-sm font-medium">
            {isPAUDSelected ? "Kegiatan Penutup" : "Penutup"}
          </Label>
          <Textarea id="langkahPenutup" value={formData.langkahPembelajaran?.penutup?.join('\n') || ''} onChange={(e) => handleLangkahPembelajaranChange('penutup', e.target.value)} placeholder={`${isPAUDSelected ? "Kegiatan penutup 1" : "Kegiatan penutup 1"}\n${isPAUDSelected ? "Kegiatan penutup 2" : "Kegiatan penutup 2"}`} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="assessment">Asesmen/Penilaian (opsional untuk ATP murni)</Label>
        <Textarea id="assessment" name="assessment" value={formData.assessment || ''} onChange={handleChange} placeholder="Jelaskan strategi dan bentuk asesmen" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="materials">Media/Sumber Belajar (opsional untuk ATP murni)</Label>
        <Input id="materials" name="materials" value={formData.materials || ''} onChange={handleChange} placeholder="cth., Buku paket, video YouTube, alat peraga" />
      </div>
    </>
  );
}
