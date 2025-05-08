
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnnualProgram, CurriculumFramework } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";

interface AnnualProgramFormFieldsProps {
  formData: Partial<AnnualProgram & {
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
}

export function AnnualProgramFormFields({
  formData,
  handleChange,
  handleSelectChange,
  selectedCurriculum,
  availableCurriculums,
  isGeneratingAI,
  handleGenerateWithAI,
}: AnnualProgramFormFieldsProps) {

  const commonAIButton = (
      <div className="my-4">
        <Button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={isGeneratingAI || !formData.gradeLevel || !selectedCurriculum || !formData.subject || !formData.year}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
        >
            {isGeneratingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Buat Draf Konten PROTA dengan AI (Kurikulum: {availableCurriculums.find(c=>c.value === selectedCurriculum)?.label || selectedCurriculum})
        </Button>
        {(!formData.subject || !formData.gradeLevel || !formData.year || !selectedCurriculum) && !isGeneratingAI && (
            <p className="text-xs text-muted-foreground mt-1">
                Isi Jenis Kurikulum, Mata Pelajaran, Jenjang dan Tahun Ajaran untuk mengaktifkan tombol AI.
            </p>
        )}
      </div>
    );
    
  return (
    <>
       {/* Common Fields */}
      <div className="space-y-1">
        <Label htmlFor="title">Judul Program Tahunan (PROTA)</Label>
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

      {/* PROTA Specific Fields */}
      <div className="space-y-1">
        <Label htmlFor="year">Tahun Ajaran</Label>
        <Input id="year" name="year" value={formData.year || ''} onChange={handleChange} placeholder="cth., 2023/2024" required />
      </div>

      {commonAIButton}
      
      {selectedCurriculum === "Kurikulum Merdeka" && (
      <div className="space-y-1">
        <Label htmlFor="profilPelajarPancasilaFocus_textarea">Fokus Profil Pelajar Pancasila (satu per baris, opsional)</Label>
        <Textarea id="profilPelajarPancasilaFocus_textarea" name="profilPelajarPancasilaFocus_textarea" value={formData.profilPelajarPancasilaFocus_textarea || ''} onChange={handleChange} placeholder="Gotong Royong&#10;Kreatif" />
      </div>
      )}
      
      <Label className="font-semibold mt-2 block">Semester 1</Label>
      <div className="space-y-2 rounded-md border p-3">
        <div className="space-y-1">
          <Label htmlFor="semester1_topics_textarea">Topik Pembelajaran / Materi Pokok (satu per baris)</Label>
          <Textarea id="semester1_topics_textarea" name="semester1_topics_textarea" value={formData.semester1_topics_textarea || ''} onChange={handleChange} placeholder="Topik A&#10;Topik B" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="semester1_elements_textarea">
              {selectedCurriculum === "Kurikulum Merdeka" ? "Elemen Capaian Pembelajaran" : "Kompetensi Dasar (KD)"}
                (satu baris per topik, pisahkan dengan koma jika >1 elemen/KD)
          </Label>
          <Textarea id="semester1_elements_textarea" name="semester1_elements_textarea" value={formData.semester1_elements_textarea || ''} onChange={handleChange} placeholder="Bilangan, Aljabar&#10;Geometri" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="semester1_allocations_textarea">Alokasi Waktu (satu per baris, sesuai urutan topik)</Label>
          <Textarea id="semester1_allocations_textarea" name="semester1_allocations_textarea" value={formData.semester1_allocations_textarea || ''} onChange={handleChange} placeholder="24 JP&#10;18 JP" />
        </div>
      </div>

      <Label className="font-semibold mt-2 block">Semester 2</Label>
        <div className="space-y-2 rounded-md border p-3">
        <div className="space-y-1">
          <Label htmlFor="semester2_topics_textarea">Topik Pembelajaran / Materi Pokok (satu per baris)</Label>
          <Textarea id="semester2_topics_textarea" name="semester2_topics_textarea" value={formData.semester2_topics_textarea || ''} onChange={handleChange} placeholder="Topik C&#10;Topik D" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="semester2_elements_textarea">
              {selectedCurriculum === "Kurikulum Merdeka" ? "Elemen Capaian Pembelajaran" : "Kompetensi Dasar (KD)"}
                (satu baris per topik, pisahkan dengan koma jika >1 elemen/KD)
          </Label>
          <Textarea id="semester2_elements_textarea" name="semester2_elements_textarea" value={formData.semester2_elements_textarea || ''} onChange={handleChange} placeholder="Statistika, Peluang&#10;Analisis Data" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="semester2_allocations_textarea">Alokasi Waktu (satu per baris, sesuai urutan topik)</Label>
          <Textarea id="semester2_allocations_textarea" name="semester2_allocations_textarea" value={formData.semester2_allocations_textarea || ''} onChange={handleChange} placeholder="20 JP&#10;22 JP" />
        </div>
      </div>
    </>
  );
}
