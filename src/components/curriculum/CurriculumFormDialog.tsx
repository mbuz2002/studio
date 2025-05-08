

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnyCurriculumItem, LessonPlan, AnnualProgram, SemesterProgram, AnnualProgramComponent, WeeklyUnit, GenerateLessonPlanInput, User } from "@/types";
import { PlusCircle, Save, Trash2, Wand2, Loader2, Sparkles } from "lucide-react";
import type { FormEvent } from 'react';
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateLessonPlanFromTopic, type GenerateLessonPlanOutput } from "@/ai/flows/generate-lesson-plan-from-topic";
import { generateAnnualProgram, type GenerateAnnualProgramInput, type GenerateAnnualProgramOutput } from "@/ai/flows/generate-annual-program";
import { generateSemesterProgram, type GenerateSemesterProgramInput, type GenerateSemesterProgramOutput } from "@/ai/flows/generate-semester-program";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";


interface CurriculumFormDialogProps {
  triggerButtonText: string;
  dialogTitle: string;
  dialogDescription: string;
  itemType: "RPP" | "PROTA" | "Promes";
  initialData?: AnyCurriculumItem | null;
  onSubmit: (data: AnyCurriculumItem) => void;
  forceOpen?: boolean; 
  onOpenChange?: (open: boolean) => void; 
}

const defaultLessonPlan: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId'> = {
  type: 'RPP', title: '', subject: '', gradeLevel: '', topic: '',
  learningObjectives: [],
  pemahamanBermakna: [],
  pertanyaanPemantik: [],
  langkahPembelajaran: { pendahuluan: [], kegiatanInti: [], penutup: [] },
  assessment: '',
  differentiationStrategies: [],
  materials: '',
};

const defaultAnnualProgram: Omit<AnnualProgram, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId'> = {
  type: 'PROTA', title: '', subject: '', gradeLevel: '', year: '',
  semester1Components: [],
  semester2Components: [],
  profilPelajarPancasilaFocus: [],
};

const defaultSemesterProgram: Omit<SemesterProgram, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId'> = {
  type: 'Promes', title: '', subject: '', gradeLevel: '', semester: '1', year: '',
  capaianPembelajaranUmum: '',
  alokasiWaktuTotalSemester: '',
  komponenMingguan: [],
};


type ProtaFormState = {
  profilPelajarPancasilaFocus_textarea?: string;
  semester1_topics_textarea?: string;
  semester1_elements_textarea?: string;
  semester1_allocations_textarea?: string;
  semester2_topics_textarea?: string;
  semester2_elements_textarea?: string;
  semester2_allocations_textarea?: string;
};

type PromesFormState = {
  capaianPembelajaranUmum_textarea?: string;
  alokasiWaktuTotalSemester_input?: string;
  komponenMingguan_textarea?: string; 
};


export function CurriculumFormDialog({
  triggerButtonText,
  dialogTitle,
  dialogDescription,
  itemType,
  initialData,
  onSubmit,
  forceOpen,
  onOpenChange,
}: CurriculumFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<AnyCurriculumItem> & ProtaFormState & PromesFormState>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (isOpen) {
      let baseData: Partial<AnyCurriculumItem> = {};
      let protaTextareaData: ProtaFormState = {};
      let promesTextareaData: PromesFormState = {};

      if (initialData) {
        baseData = { ...initialData };
        if (itemType === "RPP") {
          const rpp = initialData as LessonPlan;
          baseData = {
            ...rpp,
            pemahamanBermakna: rpp.pemahamanBermakna || [],
            pertanyaanPemantik: rpp.pertanyaanPemantik || [],
            langkahPembelajaran: rpp.langkahPembelajaran || { pendahuluan: [], kegiatanInti: [], penutup: [] },
          };
        } else if (itemType === "PROTA") {
          const prota = initialData as AnnualProgram;
          protaTextareaData = {
            profilPelajarPancasilaFocus_textarea: prota.profilPelajarPancasilaFocus?.join('\n') || '',
            semester1_topics_textarea: prota.semester1Components?.map(c => c.topic).join('\n') || '',
            semester1_elements_textarea: prota.semester1Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '',
            semester1_allocations_textarea: prota.semester1Components?.map(c => c.alokasiWaktu).join('\n') || '',
            semester2_topics_textarea: prota.semester2Components?.map(c => c.topic).join('\n') || '',
            semester2_elements_textarea: prota.semester2Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '',
            semester2_allocations_textarea: prota.semester2Components?.map(c => c.alokasiWaktu).join('\n') || '',
          };
        } else if (itemType === "Promes") {
          const promes = initialData as SemesterProgram;
          promesTextareaData = {
            capaianPembelajaranUmum_textarea: promes.capaianPembelajaranUmum || '',
            alokasiWaktuTotalSemester_input: promes.alokasiWaktuTotalSemester || '',
            komponenMingguan_textarea: promes.komponenMingguan?.map(w => 
              `Minggu ke: ${w.mingguKe || ''}\nBulan: ${w.bulan || ''}\nMateri/TP: ${w.materiPokokAtauTujuanPembelajaran || ''}\nAlokasi: ${w.alokasiWaktu || ''}\nMetode: ${w.metodeStrategi?.join(', ') || ''}\nSumber: ${w.sumberBelajar?.join(', ') || ''}\nAsesmen: ${w.rencanaAsesmen?.join(', ') || ''}\nP5: ${w.catatanIntegrasiP5 || ''}`
            ).join('\n\n---\n\n') || '',
          };
        }
      } else {
        if (itemType === "RPP") baseData = { ...defaultLessonPlan };
        else if (itemType === "PROTA") baseData = { ...defaultAnnualProgram };
        else if (itemType === "Promes") baseData = { ...defaultSemesterProgram };
      }
      setFormData({ ...baseData, ...protaTextareaData, ...promesTextareaData });
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
  
  const parseProtaComponents = (topicsStr?: string, elementsStr?: string, allocationsStr?: string): AnnualProgramComponent[] => {
    if (!topicsStr || !allocationsStr) return [];
    const topics = topicsStr.split('\n').map(s => s.trim()).filter(s => s);
    const elementsLines = elementsStr?.split('\n').map(s => s.trim()) || [];
    const allocations = allocationsStr.split('\n').map(s => s.trim()).filter(s => s);

    return topics.map((topic, index) => ({
      topic,
      elemenCapaianPembelajaran: elementsLines[index]?.split(',').map(e => e.trim()).filter(e => e) || [],
      alokasiWaktu: allocations[index] || 'N/A',
    })).filter(c => c.topic && c.alokasiWaktu !== 'N/A');
  };

  const parsePromesKomponenMingguan = (komponenStr?: string): WeeklyUnit[] => {
    if (!komponenStr) return [];
    const units: WeeklyUnit[] = [];
    const unitBlocks = komponenStr.split(/\n\n---\n\n/); 

    unitBlocks.forEach(block => {
      const lines = block.split('\n');
      const unit: Partial<WeeklyUnit> = {};
      lines.forEach(line => {
        const [keyPart, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        const key = keyPart.trim().toLowerCase();

        if (key === 'minggu ke' && !isNaN(parseInt(value))) unit.mingguKe = parseInt(value);
        else if (key === 'bulan') unit.bulan = value;
        else if (key === 'materi/tp') unit.materiPokokAtauTujuanPembelajaran = value;
        else if (key === 'alokasi') unit.alokasiWaktu = value;
        else if (key === 'metode') unit.metodeStrategi = value.split(',').map(s => s.trim()).filter(s => s);
        else if (key === 'sumber') unit.sumberBelajar = value.split(',').map(s => s.trim()).filter(s => s);
        else if (key === 'asesmen') unit.rencanaAsesmen = value.split(',').map(s => s.trim()).filter(s => s);
        else if (key === 'p5') unit.catatanIntegrasiP5 = value;
      });
      if (unit.mingguKe && unit.materiPokokAtauTujuanPembelajaran && unit.alokasiWaktu) {
         units.push(unit as WeeklyUnit);
      }
    });
    return units.sort((a, b) => (a.mingguKe || 0) - (b.mingguKe || 0));
  };

  const formatWeeklyUnitsToString = (units: WeeklyUnit[]): string => {
    return units.map(w => 
      `Minggu ke: ${w.mingguKe || ''}\nBulan: ${w.bulan || ''}\nMateri/TP: ${w.materiPokokAtauTujuanPembelajaran || ''}\nAlokasi: ${w.alokasiWaktu || ''}\nMetode: ${w.metodeStrategi?.join(', ') || ''}\nSumber: ${w.sumberBelajar?.join(', ') || ''}\nAsesmen: ${w.rencanaAsesmen?.join(', ') || ''}\nP5: ${w.catatanIntegrasiP5 || ''}`
    ).join('\n\n---\n\n');
  };


  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    let finalItemData: Partial<AnyCurriculumItem> = { ...formData };

    if (itemType === "RPP") {
      finalItemData = {
        ...defaultLessonPlan,
        ...formData,
        pemahamanBermakna: (formData as Partial<LessonPlan>).pemahamanBermakna || [],
        pertanyaanPemantik: (formData as Partial<LessonPlan>).pertanyaanPemantik || [],
        langkahPembelajaran: (formData as Partial<LessonPlan>).langkahPembelajaran || { pendahuluan: [], kegiatanInti: [], penutup: [] },
      };
    } else if (itemType === "PROTA") {
      const protaForm = formData as Partial<AnnualProgram> & ProtaFormState;
      finalItemData = {
        ...defaultAnnualProgram,
        ...formData, 
        profilPelajarPancasilaFocus: protaForm.profilPelajarPancasilaFocus_textarea?.split('\n').map(s => s.trim()).filter(s => s) || [],
        semester1Components: parseProtaComponents(protaForm.semester1_topics_textarea, protaForm.semester1_elements_textarea, protaForm.semester1_allocations_textarea),
        semester2Components: parseProtaComponents(protaForm.semester2_topics_textarea, protaForm.semester2_elements_textarea, protaForm.semester2_allocations_textarea),
      };
    } else if (itemType === "Promes") {
       const promesForm = formData as Partial<SemesterProgram> & PromesFormState;
      finalItemData = {
        ...defaultSemesterProgram,
        ...formData, 
        capaianPembelajaranUmum: promesForm.capaianPembelajaranUmum_textarea || '',
        alokasiWaktuTotalSemester: promesForm.alokasiWaktuTotalSemester_input || '',
        komponenMingguan: parsePromesKomponenMingguan(promesForm.komponenMingguan_textarea),
      };
    }
    
    const fieldsToRemove: (keyof ProtaFormState | keyof PromesFormState)[] = [
      'profilPelajarPancasilaFocus_textarea',
      'semester1_topics_textarea', 'semester1_elements_textarea', 'semester1_allocations_textarea',
      'semester2_topics_textarea', 'semester2_elements_textarea', 'semester2_allocations_textarea',
      'capaianPembelajaranUmum_textarea', 'alokasiWaktuTotalSemester_input', 'komponenMingguan_textarea'
    ];
    fieldsToRemove.forEach(field => delete finalItemData[field as keyof typeof finalItemData]);


    const completeFormData: AnyCurriculumItem = {
      id: initialData?.id || new Date().toISOString() + Math.random().toString(36).substring(2, 9),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: initialData?.createdByUserId || user?.id, 
      ...finalItemData, 
      type: itemType, 
    } as AnyCurriculumItem;

    onSubmit(completeFormData);
    if (onOpenChange) {
      onOpenChange(false);
    } else {
      setIsOpen(false);
    }
  };
  
  const handleOpenChange = (openStatus: boolean) => {
    if (onOpenChange) {
      onOpenChange(openStatus);
    } else {
      setIsOpen(openStatus);
    }
  }

  const handleGenerateWithAI = async () => {
    if (!formData.gradeLevel) {
         toast({
            title: "Informasi Kurang",
            description: "Harap isi Jenjang/Fase/Kelas terlebih dahulu untuk menggunakan AI.",
            variant: "destructive",
         });
         return;
    }

    setIsGeneratingAI(true);
    try {
      if (itemType === "RPP") {
        if (!formData.topic) {
           toast({ title: "Informasi Kurang", description: "Harap isi Topik untuk RPP.", variant: "destructive" });
           setIsGeneratingAI(false);
           return;
        }
        const aiInput: GenerateLessonPlanInput = {
          topic: formData.topic as string,
          jenjangFaseKelas: formData.gradeLevel as string,
        };
        const result: GenerateLessonPlanOutput = await generateLessonPlanFromTopic(aiInput);
        setFormData(prev => ({
            ...prev,
            type: 'RPP',
            title: result.title || prev.title,
            learningObjectives: result.learningObjectives,
            pemahamanBermakna: result.pemahamanBermakna,
            pertanyaanPemantik: result.pertanyaanPemantik,
            langkahPembelajaran: result.langkahPembelajaran,
            assessment: result.assessmentStrategies.join('\n- ') || '',
            differentiationStrategies: result.differentiationStrategies,
        }));
        toast({ title: "Konten RPP Dihasilkan!", description: "AI telah membuat draf konten. Silakan tinjau." });

      } else if (itemType === "PROTA") {
        if (!formData.subject || !formData.year) {
           toast({ title: "Informasi Kurang", description: "Harap isi Mata Pelajaran dan Tahun Ajaran untuk PROTA.", variant: "destructive" });
           setIsGeneratingAI(false);
           return;
        }
        const aiInput: GenerateAnnualProgramInput = {
          subject: formData.subject as string,
          jenjangFaseKelas: formData.gradeLevel as string,
          year: formData.year as string,
        };
        const result: GenerateAnnualProgramOutput = await generateAnnualProgram(aiInput);
        setFormData(prev => ({
            ...prev,
            type: 'PROTA',
            title: result.title || prev.title,
            profilPelajarPancasilaFocus_textarea: result.profilPelajarPancasilaFocus?.join('\n') || '',
            semester1_topics_textarea: result.semester1Components?.map(c => c.topic).join('\n') || '',
            semester1_elements_textarea: result.semester1Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '',
            semester1_allocations_textarea: result.semester1Components?.map(c => c.alokasiWaktu).join('\n') || '',
            semester2_topics_textarea: result.semester2Components?.map(c => c.topic).join('\n') || '',
            semester2_elements_textarea: result.semester2Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '',
            semester2_allocations_textarea: result.semester2Components?.map(c => c.alokasiWaktu).join('\n') || '',
        }));
        toast({ title: "Konten PROTA Dihasilkan!", description: "AI telah membuat draf konten. Silakan tinjau." });

      } else if (itemType === "Promes") {
        if (!formData.subject || !formData.year || !formData.semester) {
           toast({ title: "Informasi Kurang", description: "Harap isi Mata Pelajaran, Tahun Ajaran, dan Semester untuk Promes.", variant: "destructive" });
           setIsGeneratingAI(false);
           return;
        }
        const aiInput: GenerateSemesterProgramInput = {
          subject: formData.subject as string,
          jenjangFaseKelas: formData.gradeLevel as string,
          year: formData.year as string,
          semester: formData.semester as '1' | '2',
          capaianPembelajaranUmumInput: (formData as PromesFormState).capaianPembelajaranUmum_textarea || undefined
        };
        const result: GenerateSemesterProgramOutput = await generateSemesterProgram(aiInput);
        setFormData(prev => ({
            ...prev,
            type: 'Promes',
            title: result.title || prev.title,
            capaianPembelajaranUmum_textarea: result.capaianPembelajaranUmum || '',
            alokasiWaktuTotalSemester_input: result.alokasiWaktuTotalSemester || '',
            komponenMingguan_textarea: formatWeeklyUnitsToString(result.komponenMingguan || []),
        }));
        toast({ title: "Konten Promes Dihasilkan!", description: "AI telah membuat draf konten. Silakan tinjau." });
      }
    } catch (error) {
      console.error(`Error generating ${itemType} with AI:`, error);
      toast({
        title: `Pembuatan AI ${itemType} Gagal`,
        description: "Tidak dapat menghasilkan konten. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };


  const renderSpecificFields = () => {
    const commonAIButton = (
      <div className="my-4">
        <Button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={isGeneratingAI || !formData.gradeLevel || (itemType === "RPP" && !formData.topic) || (itemType === "PROTA" && (!formData.subject || !formData.year)) || (itemType === "Promes" && (!formData.subject || !formData.year || !formData.semester)) }
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
        >
            {isGeneratingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Buat Draf Konten {itemType} dengan AI
        </Button>
        {((itemType === "RPP" && (!formData.topic || !formData.gradeLevel)) || 
          (itemType === "PROTA" && (!formData.subject || !formData.gradeLevel || !formData.year)) ||
          (itemType === "Promes" && (!formData.subject || !formData.gradeLevel || !formData.year || !formData.semester))) 
          && !isGeneratingAI && (
            <p className="text-xs text-muted-foreground mt-1">
                Isi {itemType === "RPP" ? "Topik dan Jenjang" : itemType === "PROTA" ? "Mapel, Jenjang, dan Tahun" : "Mapel, Jenjang, Tahun, dan Semester"} untuk mengaktifkan tombol AI.
            </p>
        )}
      </div>
    );

    switch (itemType) {
      case "RPP":
        const lessonPlanData = formData as Partial<LessonPlan>;
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="topic">Topik/Materi Pembelajaran</Label>
              <Input id="topic" name="topic" value={lessonPlanData.topic || ''} onChange={handleChange} required />
            </div>
            
            {commonAIButton}

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
        const protaData = formData as ProtaFormState & Partial<AnnualProgram>;
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="year">Tahun Ajaran</Label>
              <Input id="year" name="year" value={protaData.year || ''} onChange={handleChange} placeholder="cth., 2023/2024" required />
            </div>

            {commonAIButton}
            
            <div className="space-y-1">
              <Label htmlFor="profilPelajarPancasilaFocus_textarea">Fokus Profil Pelajar Pancasila (satu per baris, opsional)</Label>
              <Textarea id="profilPelajarPancasilaFocus_textarea" name="profilPelajarPancasilaFocus_textarea" value={protaData.profilPelajarPancasilaFocus_textarea || ''} onChange={handleChange} placeholder="Gotong Royong&#10;Kreatif" />
            </div>
            
            <Label className="font-semibold mt-2">Semester 1</Label>
            <div className="space-y-2 rounded-md border p-3">
              <div className="space-y-1">
                <Label htmlFor="semester1_topics_textarea">Topik Pembelajaran (satu per baris)</Label>
                <Textarea id="semester1_topics_textarea" name="semester1_topics_textarea" value={protaData.semester1_topics_textarea || ''} onChange={handleChange} placeholder="Topik A&#10;Topik B" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="semester1_elements_textarea">Elemen Capaian Pembelajaran (satu baris per topik, pisahkan dengan koma jika >1 elemen)</Label>
                <Textarea id="semester1_elements_textarea" name="semester1_elements_textarea" value={protaData.semester1_elements_textarea || ''} onChange={handleChange} placeholder="Bilangan, Aljabar&#10;Geometri" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="semester1_allocations_textarea">Alokasi Waktu (satu per baris, sesuai urutan topik)</Label>
                <Textarea id="semester1_allocations_textarea" name="semester1_allocations_textarea" value={protaData.semester1_allocations_textarea || ''} onChange={handleChange} placeholder="24 JP&#10;18 JP" />
              </div>
            </div>

            <Label className="font-semibold mt-2">Semester 2</Label>
             <div className="space-y-2 rounded-md border p-3">
              <div className="space-y-1">
                <Label htmlFor="semester2_topics_textarea">Topik Pembelajaran (satu per baris)</Label>
                <Textarea id="semester2_topics_textarea" name="semester2_topics_textarea" value={protaData.semester2_topics_textarea || ''} onChange={handleChange} placeholder="Topik C&#10;Topik D" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="semester2_elements_textarea">Elemen Capaian Pembelajaran (satu baris per topik, pisahkan dengan koma jika >1 elemen)</Label>
                <Textarea id="semester2_elements_textarea" name="semester2_elements_textarea" value={protaData.semester2_elements_textarea || ''} onChange={handleChange} placeholder="Statistika, Peluang&#10;Analisis Data" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="semester2_allocations_textarea">Alokasi Waktu (satu per baris, sesuai urutan topik)</Label>
                <Textarea id="semester2_allocations_textarea" name="semester2_allocations_textarea" value={protaData.semester2_allocations_textarea || ''} onChange={handleChange} placeholder="20 JP&#10;22 JP" />
              </div>
            </div>
          </>
        );
      case "Promes":
        const promesData = formData as PromesFormState & Partial<SemesterProgram>;
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="semester">Semester</Label>
              <Select name="semester" value={promesData.semester || '1'} onValueChange={(value) => handleSelectChange('semester', value)}>
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
              <Input id="year" name="year" value={promesData.year || ''} onChange={handleChange} placeholder="cth., 2023/2024" required />
            </div>
            
            {commonAIButton}

            <div className="space-y-1">
              <Label htmlFor="capaianPembelajaranUmum_textarea">Capaian Pembelajaran Umum Semester (Opsional)</Label>
              <Textarea id="capaianPembelajaranUmum_textarea" name="capaianPembelajaranUmum_textarea" value={promesData.capaianPembelajaranUmum_textarea || ''} onChange={handleChange} placeholder="Deskripsikan CP umum untuk semester ini..." />
            </div>
            <div className="space-y-1">
              <Label htmlFor="alokasiWaktuTotalSemester_input">Alokasi Waktu Total Semester (Opsional)</Label>
              <Input id="alokasiWaktuTotalSemester_input" name="alokasiWaktuTotalSemester_input" value={promesData.alokasiWaktuTotalSemester_input || ''} onChange={handleChange} placeholder="cth., 18 Minggu x 6 JP = 108 JP" />
            </div>
             <div className="space-y-1">
              <Label htmlFor="komponenMingguan_textarea">Komponen Mingguan</Label>
              <Textarea 
                id="komponenMingguan_textarea" 
                name="komponenMingguan_textarea" 
                value={promesData.komponenMingguan_textarea || ''} 
                onChange={handleChange} 
                rows={15}
                placeholder={
`Format per unit mingguan (pisahkan antar unit dengan '---'):
Minggu ke: 1
Bulan: Juli
Materi/TP: Pengenalan Bilangan Bulat
Alokasi: 6 JP (2 Pertemuan)
Metode: Ceramah, Latihan Soal
Sumber: Buku Matematika Kelas VII Hal. 1-15
Asesmen: Kuis awal, Observasi keaktifan
P5: Mandiri dalam mengerjakan latihan

---

Minggu ke: 2
... (dan seterusnya)`
                } 
              />
              <p className="text-xs text-muted-foreground">Isi rincian per minggu. Gunakan '---' (tiga tanda hubung) sebagai pemisah antar unit mingguan.</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const isEditMode = !!initialData?.id;
  const actualDialogTitle = isEditMode ? `Edit ${itemType}: ${formData.title || ''}` : dialogTitle;


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isEditMode && triggerButtonText !== "Pemicu Edit Tersembunyi" && (
         <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> {triggerButtonText}
            </Button>
        </DialogTrigger>
      )}
     
      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{actualDialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-10rem)]"> 
          <form onSubmit={handleSubmit} className="pr-6 py-2"> 
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
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4 sticky bottom-0 bg-background py-4 border-t">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

    