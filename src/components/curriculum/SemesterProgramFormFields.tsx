"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SemesterProgram, CurriculumFramework, UserRole, EducationLevel, TeachingPeriodSettings } from "@/types";
import { TEACHING_PERIOD_SETTINGS_KEY } from "@/types";
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


export function SemesterProgramFormFields({
  formData,
  handleChange,
  handleSelectChange,
  selectedCurriculum,
  availableCurriculums,
  isGeneratingAI,
  handleGenerateWithAI,
  userRole,
  schoolEducationLevel,
}: SemesterProgramFormFieldsProps) {

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
                Isi Jenis Kurikulum, Mata Pelajaran, {selectedCurriculum === "Kurikulum Merdeka" ? "Fase" : "Jenjang/Kelas"}, Tahun Ajaran, dan Semester untuk mengaktifkan tombol AI.
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
                       <SelectItem value="no-options-sp" disabled>Tidak ada opsi jenjang yang cocok</SelectItem>
                    )}
                </SelectContent>
            </Select>
            {!schoolEducationLevel && selectedCurriculum !== "Kurikulum Merdeka" && <p className="text-xs text-muted-foreground mt-1">Pilihan jenjang akan muncul setelah Jenjang Pendidikan di Profil Sekolah diatur.</p>}
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
            {jpDuration && <p className="text-xs text-muted-foreground mt-1">Estimasi (1 JP = {jpDuration} menit).</p>}
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
        <p className="text-xs text-muted-foreground">Isi rincian per minggu. Gunakan '---' (tiga tanda hubung) sebagai pemisah antar unit mingguan. Pastikan alokasi waktu dalam Jam Pelajaran (JP). {jpDuration && `(1 JP = ${jpDuration} menit).`}</p>
      </div>
    </>
  );
}
