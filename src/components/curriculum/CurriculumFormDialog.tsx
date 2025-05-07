"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnyCurriculumItem, LessonPlan, AnnualProgram, SemesterProgram } from "@/types";
import { PlusCircle, Save } from "lucide-react";
import type { FormEvent } from 'react';
import { useState, useEffect } from "react";

interface CurriculumFormDialogProps {
  triggerButtonText: string;
  dialogTitle: string;
  dialogDescription: string;
  itemType: "RPP" | "PROTA" | "Promes";
  initialData?: AnyCurriculumItem | null;
  onSubmit: (data: AnyCurriculumItem) => void;
}

const defaultLessonPlan: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt'> = {
  type: 'RPP', title: '', subject: '', gradeLevel: '', topic: '', 
  learningObjectives: [], 
  pemahamanBermakna: [],
  pertanyaanPemantik: [],
  langkahPembelajaran: { pendahuluan: [], kegiatanInti: [], penutup: [] },
  assessment: '',
  differentiationStrategies: [],
  materials: '',
};
const defaultAnnualProgram: Omit<AnnualProgram, 'id' | 'createdAt' | 'updatedAt'> = {
  type: 'PROTA', title: '', subject: '', gradeLevel: '', year: '', semester1Topics: [], semester2Topics: [],
};
const defaultSemesterProgram: Omit<SemesterProgram, 'id' | 'createdAt' | 'updatedAt'> = {
  type: 'Promes', title: '', subject: '', gradeLevel: '', semester: '1', year: '', weeklyBreakdown: [],
};


export function CurriculumFormDialog({
  triggerButtonText,
  dialogTitle,
  dialogDescription,
  itemType,
  initialData,
  onSubmit,
}: CurriculumFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<AnyCurriculumItem>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Ensure Langkah Pembelajaran exists for older RPP data
        if (itemType === "RPP" && !initialData.langkahPembelajaran && (initialData as LessonPlan).activities) {
          setFormData({
            ...initialData,
            langkahPembelajaran: { 
              pendahuluan: [], 
              kegiatanInti: (initialData as LessonPlan).activities || [], 
              penutup: [] 
            },
            pemahamanBermakna: (initialData as LessonPlan).pemahamanBermakna || [],
            pertanyaanPemantik: (initialData as LessonPlan).pertanyaanPemantik || [],
          });
        } else if (itemType === "RPP") {
           setFormData({
            ...initialData,
            pemahamanBermakna: (initialData as LessonPlan).pemahamanBermakna || [],
            pertanyaanPemantik: (initialData as LessonPlan).pertanyaanPemantik || [],
            langkahPembelajaran: (initialData as LessonPlan).langkahPembelajaran || { pendahuluan: [], kegiatanInti: [], penutup: [] },
          });
        }
        else {
          setFormData(initialData);
        }
      } else {
        if (itemType === "RPP") setFormData(defaultLessonPlan);
        else if (itemType === "PROTA") setFormData(defaultAnnualProgram);
        else if (itemType === "Promes") setFormData(defaultSemesterProgram);
      }
    }
  }, [isOpen, initialData, itemType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
     setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name: keyof LessonPlan | keyof AnnualProgram, value: string) => {
    const valuesArray = value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    setFormData(prev => ({ ...prev, [name]: valuesArray }));
  };

  const handleLangkahPembelajaranChange = (part: 'pendahuluan' | 'kegiatanInti' | 'penutup', value: string) => {
    const valuesArray = value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    setFormData(prev => {
      const currentLangkah = (prev as Partial<LessonPlan>).langkahPembelajaran || { pendahuluan: [], kegiatanInti: [], penutup: [] };
      return {
        ...prev,
        langkahPembelajaran: {
          ...currentLangkah,
          [part]: valuesArray,
        }
      };
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    
    let finalFormData = { ...formData };
    if (itemType === "RPP") {
      finalFormData = {
        ...defaultLessonPlan, // Start with defaults to ensure all fields are present
        ...formData,
        pemahamanBermakna: (formData as Partial<LessonPlan>).pemahamanBermakna || [],
        pertanyaanPemantik: (formData as Partial<LessonPlan>).pertanyaanPemantik || [],
        langkahPembelajaran: (formData as Partial<LessonPlan>).langkahPembelajaran || { pendahuluan: [], kegiatanInti: [], penutup: [] },
      };
    }


    const completeFormData: AnyCurriculumItem = {
      id: initialData?.id || new Date().toISOString() + Math.random().toString(36).substring(2,9), // Better unique ID
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...finalFormData,
      type: itemType, 
    } as AnyCurriculumItem; 
    
    onSubmit(completeFormData);
    setIsOpen(false);
  };
  
  const renderSpecificFields = () => {
    switch (itemType) {
      case "RPP":
        const lessonPlanData = formData as Partial<LessonPlan>;
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="topic">Topik/Materi Pembelajaran</Label>
              <Input id="topic" name="topic" value={lessonPlanData.topic || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="learningObjectives">Tujuan Pembelajaran (satu per baris)</Label>
              <Textarea id="learningObjectives" name="learningObjectives" value={lessonPlanData.learningObjectives?.join('\n') || ''} onChange={(e) => handleArrayChange('learningObjectives', e.target.value)} placeholder="Tujuan 1&#10;Tujuan 2" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pemahamanBermakna">Pemahaman Bermakna (satu per baris)</Label>
              <Textarea id="pemahamanBermakna" name="pemahamanBermakna" value={lessonPlanData.pemahamanBermakna?.join('\n') || ''} onChange={(e) => handleArrayChange('pemahamanBermakna' as any, e.target.value)} placeholder="Pemahaman 1&#10;Pemahaman 2" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pertanyaanPemantik">Pertanyaan Pemantik (satu per baris)</Label>
              <Textarea id="pertanyaanPemantik" name="pertanyaanPemantik" value={lessonPlanData.pertanyaanPemantik?.join('\n') || ''} onChange={(e) => handleArrayChange('pertanyaanPemantik' as any, e.target.value)} placeholder="Pertanyaan 1&#10;Pertanyaan 2" />
            </div>

            <Label>Langkah-langkah Pembelajaran (satu per baris untuk tiap bagian)</Label>
            <div className="space-y-2 rounded-md border p-4">
                <div className="space-y-1">
                <Label htmlFor="langkahPendahuluan" className="text-sm font-medium">Pendahuluan</Label>
                <Textarea id="langkahPendahuluan" value={lessonPlanData.langkahPembelajaran?.pendahuluan?.join('\n') || ''} onChange={(e) => handleLangkahPembelajaranChange('pendahuluan', e.target.value)} placeholder="Kegiatan pendahuluan 1&#10;Kegiatan pendahuluan 2" />
                </div>
                <div className="space-y-1">
                <Label htmlFor="langkahInti" className="text-sm font-medium">Kegiatan Inti</Label>
                <Textarea id="langkahInti" value={lessonPlanData.langkahPembelajaran?.kegiatanInti?.join('\n') || ''} onChange={(e) => handleLangkahPembelajaranChange('kegiatanInti', e.target.value)} placeholder="Kegiatan inti 1&#10;Kegiatan inti 2" />
                </div>
                <div className="space-y-1">
                <Label htmlFor="langkahPenutup" className="text-sm font-medium">Penutup</Label>
                <Textarea id="langkahPenutup" value={lessonPlanData.langkahPembelajaran?.penutup?.join('\n') || ''} onChange={(e) => handleLangkahPembelajaranChange('penutup', e.target.value)} placeholder="Kegiatan penutup 1&#10;Kegiatan penutup 2" />
                </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="assessment">Asesmen/Penilaian</Label>
              <Textarea id="assessment" name="assessment" value={lessonPlanData.assessment || ''} onChange={handleChange} placeholder="Jelaskan strategi dan bentuk asesmen" />
            </div>
             <div className="space-y-1">
              <Label htmlFor="differentiationStrategies">Strategi Diferensiasi (satu per baris, opsional)</Label>
              <Textarea id="differentiationStrategies" name="differentiationStrategies" value={lessonPlanData.differentiationStrategies?.join('\n') || ''} onChange={(e) => handleArrayChange('differentiationStrategies' as any, e.target.value)} placeholder="Strategi 1&#10;Strategi 2" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="materials">Media/Sumber Belajar (opsional)</Label>
              <Input id="materials" name="materials" value={lessonPlanData.materials || ''} onChange={handleChange} />
            </div>
          </>
        );
      case "PROTA":
        const annualProgramData = formData as Partial<AnnualProgram>;
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="year">Tahun Ajaran</Label>
              <Input id="year" name="year" value={annualProgramData.year || ''} onChange={handleChange} placeholder="cth., 2023/2024" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="semester1Topics">Topik Semester 1 (satu per baris)</Label>
              <Textarea id="semester1Topics" name="semester1Topics" value={annualProgramData.semester1Topics?.join('\n') || ''} onChange={(e) => handleArrayChange('semester1Topics', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="semester2Topics">Topik Semester 2 (satu per baris)</Label>
              <Textarea id="semester2Topics" name="semester2Topics" value={annualProgramData.semester2Topics?.join('\n') || ''} onChange={(e) => handleArrayChange('semester2Topics', e.target.value)} />
            </div>
          </>
        );
      case "Promes":
        const semesterProgramData = formData as Partial<SemesterProgram>;
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="semester">Semester</Label>
               <Select name="semester" value={semesterProgramData.semester || '1'} onValueChange={(value) => handleSelectChange('semester', value)}>
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
              <Input id="year" name="year" value={semesterProgramData.year || ''} onChange={handleChange} placeholder="cth., 2023/2024" required />
            </div>
            {/* Weekly breakdown is complex for a simple form, could be a separate component or simplified */}
            <div className="space-y-1">
                <Label htmlFor="weeklyBreakdown">Rincian Mingguan (Sederhana: Topik Minggu ke-1)</Label>
                <Input id="weeklyBreakdown" name="weeklyBreakdown" 
                 value={semesterProgramData.weeklyBreakdown?.[0]?.topic || ''} 
                 onChange={(e) => {
                    const newBreakdown = [{ week: 1, topic: e.target.value, activities: 'Akan dirinci' }];
                    setFormData(prev => ({ ...prev, weeklyBreakdown: newBreakdown }));
                 }}
                 placeholder="Topik untuk Minggu ke-1" 
                />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="title">Judul</Label>
              <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                <Label htmlFor="subject">Mata Pelajaran</Label>
                <Input id="subject" name="subject" value={formData.subject || ''} onChange={handleChange} required />
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
            </div>
            
            {renderSpecificFields()}
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
