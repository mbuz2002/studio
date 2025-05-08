
"use client";

import React, { useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SemesterProgram, CurriculumFramework } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";

interface SemesterProgramFormFieldsProps {
  formData: Partial<SemesterProgram & {
    capaianPembelajaranUmum_textarea?: string; 
    alokasiWaktuTotalSemester_input?: string;
    komponenMingguan_textarea?: string; 
  }>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  selectedCurriculum: CurriculumFramework;
  availableCurriculums: { value: CurriculumFramework; label: string }[];
  isGeneratingAI: boolean;
  handleGenerateWithAI: () => Promise<void>;
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


export function SemesterProgramFormFields({
  formData,
  handleChange,
  handleSelectChange,
  selectedCurriculum,
  availableCurriculums,
  isGeneratingAI,
  handleGenerateWithAI,
}: SemesterProgramFormFieldsProps) {

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
            disabled={isGeneratingAI || !formData.gradeLevel || !selectedCurriculum || !formData.subject || !formData.year || !formData.semester}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
        >
            {isGeneratingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Buat Draf Konten Promes dengan AI (Kurikulum: {availableCurriculums.find(c=>c.value === selectedCurriculum)?.label || selectedCurriculum})
        </Button>
        {(!formData.subject || !formData.gradeLevel || !formData.year || !formData.semester || !selectedCurriculum) && !isGeneratingAI && (
            <p className="text-xs text-muted-foreground mt-1">
                Isi Jenis Kurikulum, Mata Pelajaran, Jenjang, Tahun Ajaran, dan Semester untuk mengaktifkan tombol AI.
            </p>
        )}
      </div>
    );

  return (
    <>
      {/* Common Fields */}
      <div className="space-y-1">
        <Label htmlFor="title">Judul Program Semester (Promes)</Label>
        <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="curriculumType">Jenis Kurikulum</Label>
          <Select name="curriculumType" value={selectedCurriculum} onValueChange={(value) => handleSelectChange('curriculumType', value)}>
            <SelectTrigger id="curriculumType">
              <SelectValue placeholder="Pilih Jenis Kurikulum" />
            </SelectTrigger>
            <SelectContent>
              {availableCurriculums.map(curr => (
                <SelectItem key={curr.value} value={curr.value}>{curr.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Label htmlFor="year">Tahun Ajaran</Label>
          <Input id="year" name="year" value={formData.year || ''} onChange={handleChange} placeholder="cth., 2023/2024" required />
        </div>
      </div>

      {/* Promes Specific Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="semester">Semester</Label>
          <Select name="semester" value={formData.semester || '1'} onValueChange={(value) => handleSelectChange('semester', value)}>
            <SelectTrigger id="semester">
              <SelectValue placeholder="Pilih semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Ganjil</SelectItem>
              <SelectItem value="2">Genap</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
            <Label htmlFor="alokasiWaktuTotalSemester_input">Alokasi Waktu Total Semester (JP) (Opsional)</Label>
            <Input id="alokasiWaktuTotalSemester_input" name="alokasiWaktuTotalSemester_input" value={formData.alokasiWaktuTotalSemester_input || ''} onChange={handleChange} placeholder="cth., 72 JP" />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="capaianPembelajaranUmum_textarea">
          {selectedCurriculum === "Kurikulum Merdeka" ? "Input Capaian Pembelajaran (CP) Umum Semester" : "Input Rangkuman SK/KD Utama Semester"}
            (Opsional, untuk input ke AI)
        </Label>
        <Textarea 
            id="capaianPembelajaranUmum_textarea" 
            name="capaianPembelajaranUmum_textarea" 
            value={formData.capaianPembelajaranUmum_textarea || ''} 
            onChange={handleChange} 
            placeholder={
                selectedCurriculum === "Kurikulum Merdeka" 
                ? "Deskripsikan Capaian Pembelajaran umum yang ingin dicapai pada semester ini..." 
                : "Rangkum Standar Kompetensi dan Kompetensi Dasar utama untuk semester ini..."
            } 
        />
      </div>
      
      {commonAIButton}

        <div className="space-y-1">
        <Label htmlFor="komponenMingguan_textarea">Komponen Mingguan (Alokasi Waktu dalam JP)</Label>
        <Textarea 
          id="komponenMingguan_textarea" 
          name="komponenMingguan_textarea" 
          value={formData.komponenMingguan_textarea || ''} 
          onChange={handleChange} 
          rows={15}
          placeholder={
`Format per unit mingguan (pisahkan antar unit dengan '---'):
Minggu ke: 1
Bulan: Juli
Materi/TP: ${selectedCurriculum === "Kurikulum Merdeka" ? "Tujuan Pembelajaran 1.1" : "Materi Pokok: Bilangan Bulat"}
Alokasi: 6 JP 
Metode: Ceramah, Latihan Soal
Sumber: Buku Matematika Kelas VII Hal. 1-15
Asesmen: Kuis awal, Observasi keaktifan
P5: ${selectedCurriculum === "Kurikulum Merdeka" ? "Mandiri dalam mengerjakan latihan" : "(kosongkan atau isi nilai karakter jika relevan)"}

---

Minggu ke: 2
... (dan seterusnya)`
          } 
        />
        <p className="text-xs text-muted-foreground">Isi rincian per minggu. Gunakan '---' (tiga tanda hubung) sebagai pemisah antar unit mingguan. Pastikan alokasi waktu dalam Jam Pelajaran (JP).</p>
      </div>
    </>
  );
}
