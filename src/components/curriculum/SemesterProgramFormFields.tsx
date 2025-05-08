
"use client";

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

export function SemesterProgramFormFields({
  formData,
  handleChange,
  handleSelectChange,
  selectedCurriculum,
  availableCurriculums,
  isGeneratingAI,
  handleGenerateWithAI,
}: SemesterProgramFormFieldsProps) {

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
      <div className="space-y-1">
        <Label htmlFor="gradeLevel">Jenjang/Fase/Kelas</Label>
         <Select value={formData.gradeLevel || ''} onValueChange={(value) => handleSelectChange('gradeLevel', value)}>
            <SelectTrigger id="gradeLevel">
                <SelectValue placeholder="Pilih Jenjang/Fase/Kelas" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="PAUD">PAUD</SelectItem>
                <SelectItem value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</SelectItem>
                <SelectItem value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</SelectItem>
                <SelectItem value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</SelectItem>
                <SelectItem value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</SelectItem>
                <SelectItem value="Fase E (Kelas 10 SMA/SMK)">Fase E (Kelas 10 SMA/SMK)</SelectItem>
                <SelectItem value="Fase F (Kelas 11-12 SMA/SMK)">Fase F (Kelas 11-12 SMA/SMK)</SelectItem>
                <SelectItem value="SLB">SLB (disesuaikan)</SelectItem>
                <SelectItem value="Pendidikan Kesetaraan">Pendidikan Kesetaraan</SelectItem>
            </SelectContent>
        </Select>
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
          <Label htmlFor="year">Tahun Ajaran</Label>
          <Input id="year" name="year" value={formData.year || ''} onChange={handleChange} placeholder="cth., 2023/2024" required />
        </div>
      </div>
      
      {commonAIButton}

      <div className="space-y-1">
        <Label htmlFor="capaianPembelajaranUmum_textarea">
          {selectedCurriculum === "Kurikulum Merdeka" ? "Capaian Pembelajaran Umum Semester" : "Rangkuman SK/KD Utama Semester"}
            (Opsional)
        </Label>
        <Textarea id="capaianPembelajaranUmum_textarea" name="capaianPembelajaranUmum_textarea" value={formData.capaianPembelajaranUmum_textarea || ''} onChange={handleChange} placeholder="Deskripsikan CP umum atau SK/KD utama untuk semester ini..." />
      </div>
      <div className="space-y-1">
        <Label htmlFor="alokasiWaktuTotalSemester_input">Alokasi Waktu Total Semester (Opsional)</Label>
        <Input id="alokasiWaktuTotalSemester_input" name="alokasiWaktuTotalSemester_input" value={formData.alokasiWaktuTotalSemester_input || ''} onChange={handleChange} placeholder="cth., 18 Minggu x 6 JP = 108 JP" />
      </div>
        <div className="space-y-1">
        <Label htmlFor="komponenMingguan_textarea">Komponen Mingguan</Label>
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
Materi/TP: Pengenalan Bilangan Bulat (atau Materi Pokok untuk KTSP/K13)
Alokasi: 6 JP (2 Pertemuan)
Metode: Ceramah, Latihan Soal
Sumber: Buku Matematika Kelas VII Hal. 1-15
Asesmen: Kuis awal, Observasi keaktifan
P5: Mandiri dalam mengerjakan latihan (jika Kurikulum Merdeka)

---

Minggu ke: 2
... (dan seterusnya)`
          } 
        />
        <p className="text-xs text-muted-foreground">Isi rincian per minggu. Gunakan '---' (tiga tanda hubung) sebagai pemisah antar unit mingguan.</p>
      </div>
    </>
  );
}
