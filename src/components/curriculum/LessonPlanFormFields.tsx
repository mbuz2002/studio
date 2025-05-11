
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LessonPlan, CurriculumFramework, UserRole, EducationLevel, TeachingPeriodSettings } from "@/types";
import { TEACHING_PERIOD_SETTINGS_KEY } from "@/types";
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
  schoolEducationLevel?: EducationLevel;
}

const allPossibleGradeLevels: { value: string, label: string, educationLevels: EducationLevel[], curriculums: string[] }[] = [
  { value: "PAUD (Kurikulum Merdeka)", label: "PAUD (Kurikulum Merdeka)", educationLevels: ["PAUD"], curriculums: ["Kurikulum Merdeka"] },
  { value: "Fase A (Kelas 1-2 SD/MI)", label: "Fase A (Kelas 1-2 SD/MI)", educationLevels: ["SD/MI"], curriculums: ["Kurikulum Merdeka"] },
  { value: "Fase B (Kelas 3-4 SD/MI)", label: "Fase B (Kelas 3-4 SD/MI)", educationLevels: ["SD/MI"], curriculums: ["Kurikulum Merdeka"] },
  { value: "Fase C (Kelas 5-6 SD/MI)", label: "Fase C (Kelas 5-6 SD/MI)", educationLevels: ["SD/MI"], curriculums: ["Kurikulum Merdeka"] },
  { value: "Fase D (Kelas 7-9 SMP/MTs)", label: "Fase D (Kelas 7-9 SMP/MTs)", educationLevels: ["SMP/MTs"], curriculums: ["Kurikulum Merdeka"] },
  { value: "Fase E (Kelas 10 SMA/MA/SMK/MAK)", label: "Fase E (Kelas 10 SMA/MA/SMK/MAK)", educationLevels: ["SMA/MA", "SMK/MAK"], curriculums: ["Kurikulum Merdeka"] },
  { value: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)", label: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)", educationLevels: ["SMA/MA", "SMK/MAK"], curriculums: ["Kurikulum Merdeka"] },
  { value: "SLB (Fase A-F Disesuaikan)", label: "SLB (Fase A-F Disesuaikan)", educationLevels: ["SLB"], curriculums: ["Kurikulum Merdeka"] },
  { value: "Pendidikan Kesetaraan (Fase A-F Disesuaikan)", label: "Pendidikan Kesetaraan (Fase A-F Disesuaikan)", educationLevels: ["PKBM/Kesetaraan"], curriculums: ["Kurikulum Merdeka"] },

  { value: "PAUD (K13/KTSP)", label: "PAUD (K13/KTSP)", educationLevels: ["PAUD"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas I SD/MI", label: "Kelas I SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas II SD/MI", label: "Kelas II SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas III SD/MI", label: "Kelas III SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas IV SD/MI", label: "Kelas IV SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas V SD/MI", label: "Kelas V SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas VI SD/MI", label: "Kelas VI SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas VII SMP/MTs", label: "Kelas VII SMP/MTs", educationLevels: ["SMP/MTs"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas VIII SMP/MTs", label: "Kelas VIII SMP/MTs", educationLevels: ["SMP/MTs"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas IX SMP/MTs", label: "Kelas IX SMP/MTs", educationLevels: ["SMP/MTs"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas X SMA/MA/SMK/MAK", label: "Kelas X SMA/MA/SMK/MAK", educationLevels: ["SMA/MA", "SMK/MAK"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas XI SMA/MA/SMK/MAK", label: "Kelas XI SMA/MA/SMK/MAK", educationLevels: ["SMA/MA", "SMK/MAK"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas XII SMA/MA/SMK/MAK", label: "Kelas XII SMA/MA/SMK/MAK", educationLevels: ["SMA/MA", "SMK/MAK"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "SLB (Kelas 1-12 Disesuaikan)", label: "SLB (Kelas 1-12 Disesuaikan)", educationLevels: ["SLB"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Pendidikan Kesetaraan (Paket A/B/C)", label: "Pendidikan Kesetaraan (Paket A/B/C)", educationLevels: ["PKBM/Kesetaraan"], curriculums: ["K-13", "KTSP 2006"] },
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
  schoolEducationLevel,
}: LessonPlanFormFieldsProps) {

  const [jpDuration, setJpDuration] = useState<number | null>(null);

  useEffect(() => {
    const storedSettings = localStorage.getItem(TEACHING_PERIOD_SETTINGS_KEY);
    if (storedSettings) {
      try {
        const parsedSettings: TeachingPeriodSettings = JSON.parse(storedSettings);
        if (parsedSettings.jpDurationMinutes) {
          setJpDuration(parsedSettings.jpDurationMinutes);
        }
      } catch (e) {
        console.error("Failed to parse teaching period settings", e);
      }
    }
  }, []);

  const currentGradeLevelOptions = useMemo(() => {
    if (!schoolEducationLevel) {
      // If school level not set, show grades relevant to selected curriculum only
      return allPossibleGradeLevels.filter(g => g.curriculums.includes(selectedCurriculum));
    }
    return allPossibleGradeLevels.filter(grade => 
      grade.educationLevels.includes(schoolEducationLevel) && 
      grade.curriculums.includes(selectedCurriculum)
    );
  }, [selectedCurriculum, schoolEducationLevel]);

  const isPAUDSelected = useMemo(() => schoolEducationLevel === "PAUD" && selectedCurriculum === "Kurikulum Merdeka" && formData.gradeLevel?.toUpperCase().includes("PAUD"), [selectedCurriculum, formData.gradeLevel, schoolEducationLevel]);
  const isSMKSelected = useMemo(() => schoolEducationLevel === "SMK/MAK" && selectedCurriculum === "Kurikulum Merdeka" && formData.gradeLevel?.toUpperCase().includes("SMK"), [selectedCurriculum, formData.gradeLevel, schoolEducationLevel]);

  useEffect(() => {
    if (formData.gradeLevel && !currentGradeLevelOptions.find(opt => opt.value === formData.gradeLevel)) {
      handleSelectChange('gradeLevel', ''); 
    }
  }, [selectedCurriculum, schoolEducationLevel, currentGradeLevelOptions, formData.gradeLevel, handleSelectChange]);
  
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
                Isi Jenis Kurikulum, {topicLabel}, dan {selectedCurriculum === "Kurikulum Merdeka" ? "Fase" : "Jenjang/Kelas"} untuk mengaktifkan tombol AI.
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
            <SelectTrigger id="curriculumType" disabled={!["Admin", "SuperAdmin", "WakaKurikulum"].includes(userRole)}>
              <SelectValue placeholder="Pilih Jenis Kurikulum" />
            </SelectTrigger>
            <SelectContent>
              {availableCurriculums.map(curr => (
                <SelectItem key={curr.value} value={curr.value}>{curr.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!["Admin", "SuperAdmin", "WakaKurikulum"].includes(userRole) && (
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
            <Select 
              value={formData.gradeLevel || ''} 
              onValueChange={(value) => handleSelectChange('gradeLevel', value === "placeholder-grade" ? "" : value)}
              disabled={!schoolEducationLevel && selectedCurriculum !== "Kurikulum Merdeka"} // Allow KM selection if school level not set
            >
                <SelectTrigger id="gradeLevel">
                    <SelectValue placeholder={!schoolEducationLevel && selectedCurriculum !== "Kurikulum Merdeka" ? "Atur Jenjang Sekolah di Profil" : (selectedCurriculum === "Kurikulum Merdeka" ? "Pilih Fase" : "Pilih Jenjang/Kelas")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder-grade" disabled>{!schoolEducationLevel && selectedCurriculum !== "Kurikulum Merdeka" ? "Atur Jenjang Sekolah di Profil" : (selectedCurriculum === "Kurikulum Merdeka" ? "Pilih Fase" : "Pilih Jenjang/Kelas")}</SelectItem>
                    {currentGradeLevelOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                    {currentGradeLevelOptions.length === 0 && schoolEducationLevel && (
                      <SelectItem value="no-options-lp" disabled>Tidak ada opsi jenjang yang cocok</SelectItem>
                    )}
                </SelectContent>
            </Select>
            {!schoolEducationLevel && selectedCurriculum !== "Kurikulum Merdeka" && <p className="text-xs text-muted-foreground mt-1">Pilihan jenjang akan muncul setelah Jenjang Pendidikan di Profil Sekolah diatur.</p>}
        </div>
        <div className="space-y-1">
            <Label htmlFor="alokasiWaktuJP">Alokasi Waktu (JP)</Label>
            <Input id="alokasiWaktuJP" name="alokasiWaktuJP" value={formData.alokasiWaktuJP || ''} onChange={handleChange} placeholder="cth., 2 JP atau 3x40 menit" />
            {jpDuration && <p className="text-xs text-muted-foreground mt-1">Estimasi (1 JP = {jpDuration} menit).</p>}
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
