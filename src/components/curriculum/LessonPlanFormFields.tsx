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

  useEffect(() => {
    // Reset gradeLevel if current selection is not valid for the new curriculum
    if (formData.gradeLevel && !currentGradeLevelOptions.find(opt => opt.value === formData.gradeLevel)) {
      handleSelectChange('gradeLevel', ''); // Clear the grade level
    }
  }, [selectedCurriculum, currentGradeLevelOptions, formData.gradeLevel, handleSelectChange]);
  
  const commonAIButton = (
      <div className="my-4">
        <Button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={isGeneratingAI || !formData.gradeLevel || !selectedCurriculum || !formData.topic || (selectedCurriculum === "Kurikulum Merdeka" && (!formData.capaianPembelajaran || formData.capaianPembelajaran.length === 0))}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
        >
            {isGeneratingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Buat Draf Konten RPP dengan AI (Kurikulum: {availableCurriculums.find(c=>c.value === selectedCurriculum)?.label || selectedCurriculum})
        </Button>
        {(!formData.topic || !formData.gradeLevel || !selectedCurriculum) && !isGeneratingAI && (
            <p className="text-xs text-muted-foreground mt-1">
                Isi Jenis Kurikulum, Topik dan Jenjang untuk mengaktifkan tombol AI.
            </p>
        )}
         {(selectedCurriculum === "Kurikulum Merdeka" && (!formData.capaianPembelajaran || formData.capaianPembelajaran.length === 0) && !isGeneratingAI) && (
            <p className="text-xs text-muted-foreground mt-1">
                Untuk Kurikulum Merdeka, isi juga Capaian Pembelajaran untuk hasil AI yang lebih baik.
            </p>
        )}
      </div>
    );

  return (
    <>
      {/* Common Fields */}
      <div className="space-y-1">
        <Label htmlFor="title">Judul RPP/Modul Ajar</Label>
        <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required />
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
            <Label htmlFor="gradeLevel">Jenjang/Fase/Kelas</Label>
            <Select value={formData.gradeLevel || ''} onValueChange={(value) => handleSelectChange('gradeLevel', value === "placeholder-grade" ? "" : value)}>
                <SelectTrigger id="gradeLevel">
                    <SelectValue placeholder="Pilih Jenjang/Fase/Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder-grade" disabled>Pilih Jenjang/Fase/Kelas</SelectItem>
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


      {/* RPP Specific Fields */}
      <div className="space-y-1">
        <Label htmlFor="topic">Topik/Materi Pembelajaran</Label>
        <Input id="topic" name="topic" value={formData.topic || ''} onChange={handleChange} required />
      </div>

      {selectedCurriculum === "Kurikulum Merdeka" && (
        <div className="space-y-1">
          <Label htmlFor="capaianPembelajaran">Capaian Pembelajaran (CP) (satu per baris)</Label>
          <Textarea 
            id="capaianPembelajaran" 
            name="capaianPembelajaran" 
            value={formData.capaianPembelajaran?.join('\n') || ''} 
            onChange={(e) => handleArrayChange('capaianPembelajaran', e.target.value)} 
            placeholder="Contoh: Peserta didik mampu memahami konsep X dan Y dari elemen Z." 
          />
          <p className="text-xs text-muted-foreground">Masukkan CP yang relevan dengan topik ini. AI akan menggunakan CP ini untuk merumuskan Alur Tujuan Pembelajaran (ATP).</p>
        </div>
      )}
      
      {commonAIButton}

      <div className="space-y-1">
        <Label htmlFor="learningObjectives">
          {selectedCurriculum === "Kurikulum Merdeka" 
            ? "Tujuan Pembelajaran (TP) - Alur Tujuan Pembelajaran (ATP) (satu TP per baris)" 
            : "Tujuan Pembelajaran (satu per baris)"}
        </Label>
        <Textarea 
          id="learningObjectives" 
          name="learningObjectives" 
          value={formData.learningObjectives?.join('\n') || ''} 
          onChange={(e) => handleArrayChange('learningObjectives', e.target.value)} 
          placeholder={
            selectedCurriculum === "Kurikulum Merdeka"
            ? "TP 1: Peserta didik dapat menjelaskan...\nTP 2: Peserta didik dapat mengidentifikasi...\nTP 3: Peserta didik dapat menerapkan..."
            : "Tujuan 1: Setelah pembelajaran, siswa dapat...\nTujuan 2: Siswa mampu..."
          } 
        />
         {selectedCurriculum === "Kurikulum Merdeka" && (
            <p className="text-xs text-muted-foreground">Masukkan Tujuan Pembelajaran (TP) secara berurutan untuk membentuk Alur Tujuan Pembelajaran (ATP). AI akan membantu menyusunnya dari CP yang diberikan.</p>
         )}
      </div>

      {selectedCurriculum === "Kurikulum Merdeka" && (
        <>
          <div className="space-y-1">
            <Label htmlFor="pemahamanBermakna">Pemahaman Bermakna (satu per baris)</Label>
            <Textarea id="pemahamanBermakna" name="pemahamanBermakna" value={formData.pemahamanBermakna?.join('\n') || ''} onChange={(e) => handleArrayChange('pemahamanBermakna', e.target.value)} placeholder="Pemahaman 1&#10;Pemahaman 2" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pertanyaanPemantik">Pertanyaan Pemantik (satu per baris)</Label>
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

      <Label>Langkah-langkah Pembelajaran (satu per baris untuk tiap bagian)</Label>
      <div className="space-y-2 rounded-md border p-4">
        <div className="space-y-1">
          <Label htmlFor="langkahPendahuluan" className="text-sm font-medium">Pendahuluan</Label>
          <Textarea id="langkahPendahuluan" value={formData.langkahPembelajaran?.pendahuluan?.join('\n') || ''} onChange={(e) => handleLangkahPembelajaranChange('pendahuluan', e.target.value)} placeholder="Kegiatan pendahuluan 1&#10;Kegiatan pendahuluan 2" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="langkahInti" className="text-sm font-medium">Kegiatan Inti</Label>
          <Textarea id="langkahInti" value={formData.langkahPembelajaran?.kegiatanInti?.join('\n') || ''} onChange={(e) => handleLangkahPembelajaranChange('kegiatanInti', e.target.value)} placeholder="Kegiatan inti 1&#10;Kegiatan inti 2" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="langkahPenutup" className="text-sm font-medium">Penutup</Label>
          <Textarea id="langkahPenutup" value={formData.langkahPembelajaran?.penutup?.join('\n') || ''} onChange={(e) => handleLangkahPembelajaranChange('penutup', e.target.value)} placeholder="Kegiatan penutup 1&#10;Kegiatan penutup 2" />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="assessment">Asesmen/Penilaian</Label>
        <Textarea id="assessment" name="assessment" value={formData.assessment || ''} onChange={handleChange} placeholder="Jelaskan strategi dan bentuk asesmen" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="materials">Media/Sumber Belajar (opsional)</Label>
        <Input id="materials" name="materials" value={formData.materials || ''} onChange={handleChange} />
      </div>
    </>
  );
}

