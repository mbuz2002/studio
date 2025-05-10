// src/components/curriculum/AnnualProgramFormFields.tsx

"use client";

import React, { useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnnualProgram, CurriculumFramework, UserRole, EducationLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";

interface AnnualProgramFormFieldsProps {
  formData: Partial<AnnualProgram & { 
    capaianPembelajaran_textarea?: string;
    profilPelajarPancasilaFocus_textarea?: string;
    semester1_topics_textarea?: string;
    semester1_elements_textarea?: string;
    semester1_allocations_textarea?: string;
    semester2_topics_textarea?: string;
    semester2_elements_textarea?: string;
    semester2_allocations_textarea?: string;
  }>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
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


export function AnnualProgramFormFields({
  formData,
  handleChange,
  handleSelectChange,
  selectedCurriculum,
  availableCurriculums,
  isGeneratingAI,
  handleGenerateWithAI,
  userRole,
  schoolEducationLevel,
}: AnnualProgramFormFieldsProps) {

  const currentGradeLevelOptions = useMemo(() => {
    if (!schoolEducationLevel) {
      return allPossibleGradeLevels.filter(g => g.curriculums.includes(selectedCurriculum));
    }
    return allPossibleGradeLevels.filter(grade => 
      grade.educationLevels.includes(schoolEducationLevel) && 
      grade.curriculums.includes(selectedCurriculum)
    );
  }, [selectedCurriculum, schoolEducationLevel]);

  useEffect(() => {
    if (formData.gradeLevel && !currentGradeLevelOptions.find(opt => opt.value === formData.gradeLevel)) {
      handleSelectChange('gradeLevel', '');
    }
  }, [selectedCurriculum, schoolEducationLevel, currentGradeLevelOptions, formData.gradeLevel, handleSelectChange]);
  
  const isSDSelected = useMemo(() => {
    if (schoolEducationLevel === "SD/MI" && selectedCurriculum === "Kurikulum Merdeka" && formData.gradeLevel) {
      const grade = formData.gradeLevel.toLowerCase();
      return grade.includes("sd/mi") || grade.includes("fase a") || grade.includes("fase b") || grade.includes("fase c");
    }
    return false;
  }, [selectedCurriculum, formData.gradeLevel, schoolEducationLevel]);


  const elemenKdLabel = selectedCurriculum === "Kurikulum Merdeka" ? "Elemen Capaian Pembelajaran (CP) (pisahkan dengan koma)" : "Kompetensi Dasar (KD) (pisahkan dengan koma)";
  const elemenKdPlaceholder = selectedCurriculum === "Kurikulum Merdeka"
  ? (isSDSelected ? "Contoh: CP Matematika Fase A tentang Bilangan\nCP Bahasa Indonesia Fase A tentang Membaca" : "Contoh: CP tentang Memahami Konsep X\nCP tentang Menerapkan Prinsip Y")
  : "Contoh: KD 3.1 Memahami...\nKD 4.1 Menyajikan...";


  const commonAIButton = (
    <div className="my-4">
      <Button
          type="button"
          onClick={handleGenerateWithAI}
          disabled={isGeneratingAI || !formData.gradeLevel || !selectedCurriculum || !formData.subject || !formData.year || (selectedCurriculum === "Kurikulum Merdeka" && !formData.capaianPembelajaran_textarea)}
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary/10"
      >
          {isGeneratingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Buat Draf Konten PROTA dengan AI (Kurikulum: {availableCurriculums.find(c=>c.value === selectedCurriculum)?.label || selectedCurriculum})
      </Button>
      {(!formData.subject || !formData.gradeLevel || !formData.year || !selectedCurriculum) && !isGeneratingAI && (
          <p className="text-xs text-muted-foreground mt-1">
              Isi Jenis Kurikulum, Mata Pelajaran, {selectedCurriculum === "Kurikulum Merdeka" ? "Fase" : "Jenjang/Kelas"}, dan Tahun Ajaran untuk mengaktifkan tombol AI.
          </p>
      )}
       {(selectedCurriculum === "Kurikulum Merdeka" && !formData.capaianPembelajaran_textarea && !isGeneratingAI) && (
          <p className="text-xs text-muted-foreground mt-1">
              Untuk Kurikulum Merdeka, isi juga Capaian Pembelajaran Umum Tahunan untuk hasil AI yang lebih baik.
          </p>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="title">Judul Program Tahunan (PROTA)</Label>
        <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} placeholder="cth., PROTA Matematika Fase D 2024/2025" required />
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
          <Label htmlFor="subject">Mata Pelajaran / Tema Utama (untuk SD)</Label>
          <Input id="subject" name="subject" value={formData.subject || ''} onChange={handleChange} placeholder="cth., Matematika atau Tematik (SD)" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="gradeLevel">{selectedCurriculum === "Kurikulum Merdeka" ? "Fase" : "Jenjang/Kelas"}</Label>
          <Select 
            value={formData.gradeLevel || ''} 
            onValueChange={(value) => handleSelectChange('gradeLevel', value === "placeholder-grade" ? "" : value)}
            disabled={!schoolEducationLevel && selectedCurriculum !== "Kurikulum Merdeka"}
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
                  <SelectItem value="no-options-ap" disabled>Tidak ada opsi jenjang yang cocok</SelectItem>
              )}
            </SelectContent>
          </Select>
          {!schoolEducationLevel && selectedCurriculum !== "Kurikulum Merdeka" && <p className="text-xs text-muted-foreground mt-1">Pilihan jenjang akan muncul setelah Jenjang Pendidikan di Profil Sekolah diatur.</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="year">Tahun Ajaran</Label>
          <Input id="year" name="year" value={formData.year || ''} onChange={handleChange} placeholder="cth., 2024/2025" required />
        </div>
      </div>

      {selectedCurriculum === "Kurikulum Merdeka" && (
        <>
          <div className="space-y-1">
            <Label htmlFor="capaianPembelajaran_textarea">Capaian Pembelajaran (CP) Umum Tahunan (satu CP per baris)</Label>
            <Textarea
              id="capaianPembelajaran_textarea"
              name="capaianPembelajaran_textarea"
              value={formData.capaianPembelajaran_textarea || ''}
              onChange={handleChange}
              placeholder="Masukkan Capaian Pembelajaran (CP) umum untuk tahun ajaran ini. AI akan menggunakan ini sebagai acuan."
              rows={3}
            />
          </div>
        </>
      )}

      {commonAIButton}

      {selectedCurriculum === "Kurikulum Merdeka" && (
        <div className="space-y-1">
          <Label htmlFor="profilPelajarPancasilaFocus_textarea">Fokus Profil Pelajar Pancasila (satu dimensi per baris, opsional)</Label>
          <Textarea
            id="profilPelajarPancasilaFocus_textarea"
            name="profilPelajarPancasilaFocus_textarea"
            value={formData.profilPelajarPancasilaFocus_textarea || ''}
            onChange={handleChange}
            placeholder="Contoh: Bernalar Kritis\nKreatif\nGotong Royong"
            rows={3}
          />
        </div>
      )}

      <div className="space-y-4 rounded-md border p-4">
        <h3 className="text-lg font-medium">Komponen Semester 1</h3>
        <div className="space-y-1">
          <Label htmlFor="semester1_topics_textarea">Topik/Unit Pembelajaran (satu per baris)</Label>
          <Textarea id="semester1_topics_textarea" name="semester1_topics_textarea" value={formData.semester1_topics_textarea || ''} onChange={handleChange} placeholder="Topik 1 Semester 1\nTopik 2 Semester 1" rows={3} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="semester1_elements_textarea">{elemenKdLabel} (satu per baris, sesuaikan dengan baris topik)</Label>
          <Textarea id="semester1_elements_textarea" name="semester1_elements_textarea" value={formData.semester1_elements_textarea || ''} onChange={handleChange} placeholder={elemenKdPlaceholder} rows={3} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="semester1_allocations_textarea">Alokasi Waktu JP (satu per baris, sesuaikan dengan baris topik)</Label>
          <Textarea id="semester1_allocations_textarea" name="semester1_allocations_textarea" value={formData.semester1_allocations_textarea || ''} onChange={handleChange} placeholder="Contoh: 24 JP\n30 JP" rows={3} />
        </div>
      </div>

      <div className="space-y-4 rounded-md border p-4">
        <h3 className="text-lg font-medium">Komponen Semester 2</h3>
        <div className="space-y-1">
          <Label htmlFor="semester2_topics_textarea">Topik/Unit Pembelajaran (satu per baris)</Label>
          <Textarea id="semester2_topics_textarea" name="semester2_topics_textarea" value={formData.semester2_topics_textarea || ''} onChange={handleChange} placeholder="Topik 1 Semester 2\nTopik 2 Semester 2" rows={3} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="semester2_elements_textarea">{elemenKdLabel} (satu per baris, sesuaikan dengan baris topik)</Label>
          <Textarea id="semester2_elements_textarea" name="semester2_elements_textarea" value={formData.semester2_elements_textarea || ''} onChange={handleChange} placeholder={elemenKdPlaceholder} rows={3} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="semester2_allocations_textarea">Alokasi Waktu JP (satu per baris, sesuaikan dengan baris topik)</Label>
          <Textarea id="semester2_allocations_textarea" name="semester2_allocations_textarea" value={formData.semester2_allocations_textarea || ''} onChange={handleChange} placeholder="Contoh: 24 JP\n30 JP" rows={3} />
        </div>
      </div>
    </>
  );
}

