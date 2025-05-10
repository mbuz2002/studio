"use client";

import React, { useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SchoolClass, Teacher, EducationLevel } from "@/types";

interface ClassFormFieldsProps {
  formData: Partial<SchoolClass>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  allTeachers: Teacher[];
  schoolEducationLevel?: EducationLevel; 
}

const allPossibleGradeLevels: { value: string, label: string, educationLevels: EducationLevel[], curriculums: string[] }[] = [
  // PAUD
  { value: "PAUD - Kelompok Bermain", label: "PAUD - Kelompok Bermain", educationLevels: ["PAUD"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "PAUD - TK A", label: "PAUD - TK A", educationLevels: ["PAUD"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "PAUD - TK B", label: "PAUD - TK B", educationLevels: ["PAUD"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Fase Fondasi (PAUD)", label: "Fase Fondasi (PAUD)", educationLevels: ["PAUD"], curriculums: ["Kurikulum Merdeka"] },
  
  // SD/MI
  { value: "Kelas I SD/MI", label: "Kelas I SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas II SD/MI", label: "Kelas II SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas III SD/MI", label: "Kelas III SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas IV SD/MI", label: "Kelas IV SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas V SD/MI", label: "Kelas V SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas VI SD/MI", label: "Kelas VI SD/MI", educationLevels: ["SD/MI"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Fase A (Kelas 1-2 SD/MI)", label: "Fase A (Kelas 1-2 SD/MI)", educationLevels: ["SD/MI"], curriculums: ["Kurikulum Merdeka"] },
  { value: "Fase B (Kelas 3-4 SD/MI)", label: "Fase B (Kelas 3-4 SD/MI)", educationLevels: ["SD/MI"], curriculums: ["Kurikulum Merdeka"] },
  { value: "Fase C (Kelas 5-6 SD/MI)", label: "Fase C (Kelas 5-6 SD/MI)", educationLevels: ["SD/MI"], curriculums: ["Kurikulum Merdeka"] },

  // SMP/MTs
  { value: "Kelas VII SMP/MTs", label: "Kelas VII SMP/MTs", educationLevels: ["SMP/MTs"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas VIII SMP/MTs", label: "Kelas VIII SMP/MTs", educationLevels: ["SMP/MTs"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas IX SMP/MTs", label: "Kelas IX SMP/MTs", educationLevels: ["SMP/MTs"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Fase D (Kelas 7-9 SMP/MTs)", label: "Fase D (Kelas 7-9 SMP/MTs)", educationLevels: ["SMP/MTs"], curriculums: ["Kurikulum Merdeka"] },

  // SMA/MA
  { value: "Kelas X SMA/MA", label: "Kelas X SMA/MA", educationLevels: ["SMA/MA"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas XI SMA/MA", label: "Kelas XI SMA/MA", educationLevels: ["SMA/MA"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas XII SMA/MA", label: "Kelas XII SMA/MA", educationLevels: ["SMA/MA"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Fase E (Kelas 10 SMA/MA)", label: "Fase E (Kelas 10 SMA/MA)", educationLevels: ["SMA/MA"], curriculums: ["Kurikulum Merdeka"] },
  { value: "Fase F (Kelas 11-12 SMA/MA)", label: "Fase F (Kelas 11-12 SMA/MA)", educationLevels: ["SMA/MA"], curriculums: ["Kurikulum Merdeka"] },

  // SMK/MAK - Shares phases with SMA/MA for KurMer, but distinct classes for K13/KTSP
  { value: "Kelas X SMK/MAK", label: "Kelas X SMK/MAK", educationLevels: ["SMK/MAK"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas XI SMK/MAK", label: "Kelas XI SMK/MAK", educationLevels: ["SMK/MAK"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Kelas XII SMK/MAK", label: "Kelas XII SMK/MAK", educationLevels: ["SMK/MAK"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "Fase E (Kelas 10 SMK/MAK)", label: "Fase E (Kelas 10 SMK/MAK)", educationLevels: ["SMK/MAK"], curriculums: ["Kurikulum Merdeka"] },
  { value: "Fase F (Kelas 11-12 SMK/MAK)", label: "Fase F (Kelas 11-12 SMK/MAK)", educationLevels: ["SMK/MAK"], curriculums: ["Kurikulum Merdeka"] },
  
  // SLB
  { value: "SLB SDLB (Fase A-C Disesuaikan)", label: "SLB SDLB (Fase A-C Disesuaikan)", educationLevels: ["SLB"], curriculums: ["Kurikulum Merdeka"] },
  { value: "SLB SMPLB (Fase D Disesuaikan)", label: "SLB SMPLB (Fase D Disesuaikan)", educationLevels: ["SLB"], curriculums: ["Kurikulum Merdeka"] },
  { value: "SLB SMALB (Fase E-F Disesuaikan)", label: "SLB SMALB (Fase E-F Disesuaikan)", educationLevels: ["SLB"], curriculums: ["Kurikulum Merdeka"] },
  { value: "SLB Kelas Dasar (1-6 Disesuaikan)", label: "SLB Kelas Dasar (1-6 Disesuaikan)", educationLevels: ["SLB"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "SLB Kelas Menengah (7-9 Disesuaikan)", label: "SLB Kelas Menengah (7-9 Disesuaikan)", educationLevels: ["SLB"], curriculums: ["K-13", "KTSP 2006"] },
  { value: "SLB Kelas Atas (10-12 Disesuaikan)", label: "SLB Kelas Atas (10-12 Disesuaikan)", educationLevels: ["SLB"], curriculums: ["K-13", "KTSP 2006"] },
  
  // Kesetaraan
  { value: "Paket A (Setara SD)", label: "Paket A (Setara SD)", educationLevels: ["PKBM/Kesetaraan"], curriculums: ["K-13", "KTSP 2006", "Kurikulum Merdeka"]}, // KurMer uses Fase A-C for Paket A equivalent
  { value: "Paket B (Setara SMP)", label: "Paket B (Setara SMP)", educationLevels: ["PKBM/Kesetaraan"], curriculums: ["K-13", "KTSP 2006", "Kurikulum Merdeka"]}, // KurMer uses Fase D for Paket B equivalent
  { value: "Paket C (Setara SMA)", label: "Paket C (Setara SMA)", educationLevels: ["PKBM/Kesetaraan"], curriculums: ["K-13", "KTSP 2006", "Kurikulum Merdeka"]}, // KurMer uses Fase E-F for Paket C equivalent
];


const NO_HOMEROOM_VALUE = "_NO_HOMEROOM_";

export function ClassFormFields({ 
    formData, 
    handleChange, 
    handleSelectChange,
    allTeachers,
    schoolEducationLevel
}: ClassFormFieldsProps) {

  const gradeLevelOptions = useMemo(() => {
    if (!schoolEducationLevel) {
        // If school level not set, show a generic list (could be empty or prompt to set school level)
        // For now, let's return a broader list but ideally prompt user.
        return allPossibleGradeLevels.filter(g => g.label.includes(formData.curriculumType || "Merdeka") || g.label.includes(formData.curriculumType || "K-13") || g.label.includes(formData.curriculumType || "KTSP") );
    }
    return allPossibleGradeLevels.filter(grade => grade.educationLevels.includes(schoolEducationLevel));
  }, [schoolEducationLevel, formData.curriculumType]);
  
  // Effect to clear gradeLevel if it's not in the new options
  useEffect(() => {
    if (formData.gradeLevel && !gradeLevelOptions.find(opt => opt.value === formData.gradeLevel)) {
      handleSelectChange('gradeLevel', '');
    }
  }, [gradeLevelOptions, formData.gradeLevel, handleSelectChange]);


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
            <Label htmlFor="name" className="text-base font-medium">Nama Kelas/Rombel</Label>
            <Input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="cth., Kelas X IPA 1 atau Fase A Kelompok Melati"
            required
            className="text-base h-11 rounded-md focus:border-primary"
            />
        </div>
        <div className="space-y-1.5">
            <Label htmlFor="gradeLevel" className="text-base font-medium">Jenjang/Tingkat</Label>
            <Select 
              value={formData.gradeLevel || ""} 
              onValueChange={(value) => handleSelectChange('gradeLevel', value === "placeholder-grade" ? "" : value)}
              disabled={!schoolEducationLevel}
            >
              <SelectTrigger id="gradeLevel" className="text-base h-11 rounded-md">
                <SelectValue placeholder={!schoolEducationLevel ? "Atur Jenjang Sekolah di Profil" : "Pilih Jenjang/Tingkat"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder-grade" disabled>{!schoolEducationLevel ? "Atur Jenjang Sekolah di Profil" : "Pilih Jenjang/Tingkat"}</SelectItem>
                {gradeLevelOptions.map(level => (
                  <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                ))}
                 {gradeLevelOptions.length === 0 && schoolEducationLevel && (
                    <SelectItem value="no-options" disabled>Tidak ada jenjang yang cocok</SelectItem>
                )}
              </SelectContent>
            </Select>
            {!schoolEducationLevel && <p className="text-xs text-muted-foreground mt-1">Pilihan jenjang akan muncul setelah Jenjang Pendidikan di Profil Sekolah diatur.</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="homeroomTeacherId" className="text-base font-medium">Wali Kelas (Opsional)</Label>
        <Select 
          value={formData.homeroomTeacherId || ""} 
          onValueChange={(value) => handleSelectChange('homeroomTeacherId', (value === "placeholder-teacher" || value === NO_HOMEROOM_VALUE) ? "" : value)}
        >
          <SelectTrigger id="homeroomTeacherId" className="text-base h-11 rounded-md">
            <SelectValue placeholder="Pilih Wali Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="placeholder-teacher" disabled>Pilih Wali Kelas</SelectItem>
            <SelectItem value={NO_HOMEROOM_VALUE}>Tidak Ada Wali Kelas</SelectItem>
            {allTeachers.length === 0 && <SelectItem value="no-teachers" disabled>Belum ada data guru</SelectItem>}
            {allTeachers.map(teacher => (
              <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-base font-medium">Catatan Tambahan (Opsional)</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Informasi tambahan mengenai kelas ini..."
          rows={3}
          className="text-base rounded-md focus:border-primary"
        />
      </div>
    </>
  );
}

