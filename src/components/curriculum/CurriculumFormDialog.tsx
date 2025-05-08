
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
import type { AnyCurriculumItem, LessonPlan, AnnualProgram, SemesterProgram, AnnualProgramComponent, WeeklyUnit, User, CurriculumFramework } from "@/types";
import { PlusCircle, Save, Trash2, Wand2, Loader2, Sparkles, BookCopy } from "lucide-react";
import type { FormEvent } from 'react';
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateLessonPlanFromTopic, type GenerateLessonPlanInput, type GenerateLessonPlanOutput } from "@/ai/flows/generate-lesson-plan-from-topic";
import { generateAnnualProgram, type GenerateAnnualProgramInput, type GenerateAnnualProgramOutput } from "@/ai/flows/generate-annual-program";
import { generateSemesterProgram, type GenerateSemesterProgramInput, type GenerateSemesterProgramOutput } from "@/ai/flows/generate-semester-program";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useLog } from "@/contexts/LogContext";
import { useCurriculum } from "@/contexts/CurriculumContext";


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

// Base default structures for initializing the form for NEW items
const baseRppData: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'curriculumType'> = {
  type: 'RPP', title: '', subject: '', gradeLevel: '', topic: '',
  learningObjectives: [],
  langkahPembelajaran: { pendahuluan: [], kegiatanInti: [], penutup: [] },
  assessment: '',
  materials: '',
  // Curriculum-specific fields will be added/initialized based on selectedCurriculum
};

const baseProtaData: Omit<AnnualProgram, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'curriculumType'> = {
  type: 'PROTA', title: '', subject: '', gradeLevel: '', year: '',
  semester1Components: [],
  semester2Components: [],
  // profilPelajarPancasilaFocus might be added based on curriculum
};

const basePromesData: Omit<SemesterProgram, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'curriculumType'> = {
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
  // formData now holds all possible fields, including curriculum-specific ones and textarea helpers
  const [formData, setFormData] = useState<Partial<LessonPlan & AnnualProgram & SemesterProgram & ProtaFormState & PromesFormState>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addLog } = useLog(); 
  const { defaultCurriculum, availableCurriculums } = useCurriculum();
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumFramework>(initialData?.curriculumType || defaultCurriculum);


  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (isOpen) {
      let combinedData: Partial<LessonPlan & AnnualProgram & SemesterProgram & ProtaFormState & PromesFormState> = {};
      const currentCurriculumOnOpen = initialData?.curriculumType || defaultCurriculum;
      setSelectedCurriculum(currentCurriculumOnOpen);

      if (initialData) {
        combinedData = { ...initialData }; // Start with all fields from initialData

        if (itemType === "PROTA") {
          const prota = initialData as AnnualProgram;
          combinedData.profilPelajarPancasilaFocus_textarea = prota.profilPelajarPancasilaFocus?.join('\n') || '';
          combinedData.semester1_topics_textarea = prota.semester1Components?.map(c => c.topic).join('\n') || '';
          combinedData.semester1_elements_textarea = prota.semester1Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '';
          combinedData.semester1_allocations_textarea = prota.semester1Components?.map(c => c.alokasiWaktu).join('\n') || '';
          combinedData.semester2_topics_textarea = prota.semester2Components?.map(c => c.topic).join('\n') || '';
          combinedData.semester2_elements_textarea = prota.semester2Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '';
          combinedData.semester2_allocations_textarea = prota.semester2Components?.map(c => c.alokasiWaktu).join('\n') || '';
        } else if (itemType === "Promes") {
          const promes = initialData as SemesterProgram;
          combinedData.capaianPembelajaranUmum_textarea = promes.capaianPembelajaranUmum || '';
          combinedData.alokasiWaktuTotalSemester_input = promes.alokasiWaktuTotalSemester || '';
          combinedData.komponenMingguan_textarea = formatWeeklyUnitsToString(promes.komponenMingguan || []);
        }
        // RPP fields are directly part of LessonPlan, no special textarea conversion needed here for initial load
      } else { // New item
        if (itemType === "RPP") combinedData = { ...baseRppData, curriculumType: currentCurriculumOnOpen };
        else if (itemType === "PROTA") combinedData = { ...baseProtaData, curriculumType: currentCurriculumOnOpen };
        else if (itemType === "Promes") combinedData = { ...basePromesData, curriculumType: currentCurriculumOnOpen };
      }
      setFormData(combinedData);
    }
  }, [isOpen, initialData, itemType, defaultCurriculum]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'curriculumType') {
      setSelectedCurriculum(value as CurriculumFramework);
      // When curriculum type changes for a new form, we might want to reset curriculum-specific fields
      // For simplicity, we'll let handleSubmit clean up, but for better UX, fields could be cleared here.
      // Or, AI generation could be re-prompted.
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name: keyof (LessonPlan & AnnualProgram), value: string) => {
    const valuesArray = value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    setFormData(prev => ({ ...prev, [name]: valuesArray as any }));
  };

  const handleLangkahPembelajaranChange = (part: 'pendahuluan' | 'kegiatanInti' | 'penutup', value: string) => {
    const valuesArray = value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    setFormData(prev => {
      const currentLangkah = prev.langkahPembelajaran || { pendahuluan: [], kegiatanInti: [], penutup: [] };
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

    // Start with common fields and explicitly set curriculumType
    let baseSubmitData: Pick<AnyCurriculumItem, 'title' | 'subject' | 'gradeLevel' | 'curriculumType'> = {
      title: formData.title || '',
      subject: formData.subject || '',
      gradeLevel: formData.gradeLevel || '',
      curriculumType: selectedCurriculum,
    };

    let specificData: Omit<AnyCurriculumItem, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'title' | 'subject' | 'gradeLevel' | 'curriculumType'>;

    if (itemType === "RPP") {
      const rppSpecific: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'title' | 'subject' | 'gradeLevel' | 'curriculumType'> = {
        type: 'RPP',
        topic: formData.topic || '',
        learningObjectives: (formData.learningObjectives as string[]) || [],
        langkahPembelajaran: formData.langkahPembelajaran || { pendahuluan: [], kegiatanInti: [], penutup: [] },
        assessment: formData.assessment || '',
        materials: formData.materials || '',
        // Curriculum-specific parts
        ...(selectedCurriculum === "Kurikulum Merdeka" && {
          pemahamanBermakna: (formData.pemahamanBermakna as string[]) || [],
          pertanyaanPemantik: (formData.pertanyaanPemantik as string[]) || [],
          differentiationStrategies: (formData.differentiationStrategies as string[]) || [],
        }),
        ...(selectedCurriculum === "K-13" && {
          kompetensiInti: (formData.kompetensiInti as string[]) || [],
          kompetensiDasar: (formData.kompetensiDasar as string[]) || [],
          indikatorPencapaianKompetensi: (formData.indikatorPencapaianKompetensi as string[]) || [],
          metodePembelajaran: (formData.metodePembelajaran as string[]) || [],
        }),
        ...(selectedCurriculum === "KTSP 2006" && {
          standarKompetensi: (formData.standarKompetensi as string[]) || [],
          kompetensiDasar: (formData.kompetensiDasar as string[]) || [],
          indikatorPencapaianKompetensi: (formData.indikatorPencapaianKompetensi as string[]) || [],
          metodePembelajaran: (formData.metodePembelajaran as string[]) || [],
        }),
      };
      specificData = rppSpecific;
    } else if (itemType === "PROTA") {
      const protaSpecific: Omit<AnnualProgram, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'title' | 'subject' | 'gradeLevel' | 'curriculumType'> = {
        type: 'PROTA',
        year: formData.year || '',
        semester1Components: parseProtaComponents(formData.semester1_topics_textarea, formData.semester1_elements_textarea, formData.semester1_allocations_textarea),
        semester2Components: parseProtaComponents(formData.semester2_topics_textarea, formData.semester2_elements_textarea, formData.semester2_allocations_textarea),
        ...(selectedCurriculum === "Kurikulum Merdeka" && {
          profilPelajarPancasilaFocus: formData.profilPelajarPancasilaFocus_textarea?.split('\n').map(s => s.trim()).filter(s => s) || [],
        }),
      };
      specificData = protaSpecific;
    } else { // Promes
      const promesSpecific: Omit<SemesterProgram, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'title' | 'subject' | 'gradeLevel' | 'curriculumType'> = {
        type: 'Promes',
        semester: formData.semester || '1',
        year: formData.year || '',
        capaianPembelajaranUmum: formData.capaianPembelajaranUmum_textarea || '',
        alokasiWaktuTotalSemester: formData.alokasiWaktuTotalSemester_input || '',
        komponenMingguan: parsePromesKomponenMingguan(formData.komponenMingguan_textarea),
      };
      specificData = promesSpecific;
    }
    
    const completeFormData: AnyCurriculumItem = {
      ...baseSubmitData,
      ...specificData,
      id: initialData?.id || `item-${Date.now()}`, // Use initialData.id if editing
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: initialData?.createdByUserId || user?.id,
    } as AnyCurriculumItem; // Cast as AnyCurriculumItem because specificData will match one of the types

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
     if (!openStatus) { 
      setSelectedCurriculum(defaultCurriculum); // Reset to global default when dialog closes
    }
  }

  const handleGenerateWithAI = async () => {
    const source = `CurriculumFormDialog-AI-${itemType}`;
    let missingInfo = "";
    if (!formData.gradeLevel) missingInfo += "Jenjang/Fase/Kelas, ";
    if (!selectedCurriculum) missingInfo += "Jenis Kurikulum, ";

    if (itemType === "RPP" && !formData.topic) missingInfo += "Topik, ";
    if (itemType === "PROTA" && (!formData.subject || !formData.year)) missingInfo += "Mata Pelajaran, Tahun Ajaran, ";
    if (itemType === "Promes" && (!formData.subject || !formData.year || !formData.semester)) missingInfo += "Mata Pelajaran, Tahun Ajaran, Semester, ";
    
    if (missingInfo) {
         toast({
            title: "Informasi Kurang",
            description: `Harap isi ${missingInfo.slice(0, -2)} terlebih dahulu untuk menggunakan AI.`,
            variant: "destructive",
         });
         addLog("WARN", `Gagal membuat draf ${itemType} dengan AI: Informasi kurang (${missingInfo.slice(0, -2)}).`, source);
         return;
    }

    setIsGeneratingAI(true);
    addLog("INFO", `Memulai pembuatan draf ${itemType} dengan AI. Kurikulum: ${selectedCurriculum}. Jenjang: "${formData.gradeLevel}". ${itemType === 'RPP' ? `Topik: "${formData.topic}"` : `Mapel: "${formData.subject}", Tahun: "${formData.year}"`}`, source);
    try {
      if (itemType === "RPP") {
        const aiInput: GenerateLessonPlanInput = {
          topic: formData.topic as string,
          jenjangFaseKelas: formData.gradeLevel as string,
          curriculumType: selectedCurriculum,
        };
        const result: GenerateLessonPlanOutput = await generateLessonPlanFromTopic(aiInput);
        setFormData(prev => ({
            ...prev,
            title: result.title || prev.title,
            learningObjectives: result.learningObjectives,
            langkahPembelajaran: result.langkahPembelajaran,
            assessment: result.assessmentStrategies.join('\n- ') || '',
            // Curriculum-specific fields from AI result
            pemahamanBermakna: result.pemahamanBermakna || (selectedCurriculum === "Kurikulum Merdeka" ? [] : undefined),
            pertanyaanPemantik: result.pertanyaanPemantik || (selectedCurriculum === "Kurikulum Merdeka" ? [] : undefined),
            differentiationStrategies: result.differentiationStrategies || (selectedCurriculum === "Kurikulum Merdeka" ? [] : undefined),
            standarKompetensi: result.standarKompetensi || (selectedCurriculum === "KTSP 2006" ? [] : undefined),
            kompetensiInti: result.kompetensiInti || (selectedCurriculum === "K-13" ? [] : undefined),
            kompetensiDasar: result.kompetensiDasar || (selectedCurriculum !== "Kurikulum Merdeka" ? [] : undefined),
            indikatorPencapaianKompetensi: result.indikatorPencapaianKompetensi || (selectedCurriculum !== "Kurikulum Merdeka" ? [] : undefined),
            metodePembelajaran: result.metodePembelajaran || (selectedCurriculum !== "Kurikulum Merdeka" ? [] : undefined),
        }));
        toast({ title: "Konten RPP Dihasilkan!", description: "AI telah membuat draf konten. Silakan tinjau." });
        addLog("INFO", `Konten RPP berhasil dibuat AI. Judul: "${result.title}".`, source);

      } else if (itemType === "PROTA") {
        const aiInput: GenerateAnnualProgramInput = {
          subject: formData.subject as string,
          jenjangFaseKelas: formData.gradeLevel as string,
          year: formData.year as string,
          curriculumType: selectedCurriculum,
        };
        const result: GenerateAnnualProgramOutput = await generateAnnualProgram(aiInput);
        setFormData(prev => ({
            ...prev,
            title: result.title || prev.title,
            profilPelajarPancasilaFocus_textarea: selectedCurriculum === "Kurikulum Merdeka" ? result.profilPelajarPancasilaFocus?.join('\n') || '' : undefined,
            semester1_topics_textarea: result.semester1Components?.map(c => c.topic).join('\n') || '',
            semester1_elements_textarea: result.semester1Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '',
            semester1_allocations_textarea: result.semester1Components?.map(c => c.alokasiWaktu).join('\n') || '',
            semester2_topics_textarea: result.semester2Components?.map(c => c.topic).join('\n') || '',
            semester2_elements_textarea: result.semester2Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '',
            semester2_allocations_textarea: result.semester2Components?.map(c => c.alokasiWaktu).join('\n') || '',
        }));
        toast({ title: "Konten PROTA Dihasilkan!", description: "AI telah membuat draf konten. Silakan tinjau." });
        addLog("INFO", `Konten PROTA berhasil dibuat AI. Judul: "${result.title}".`, source);

      } else if (itemType === "Promes") {
        const aiInput: GenerateSemesterProgramInput = {
          subject: formData.subject as string,
          jenjangFaseKelas: formData.gradeLevel as string,
          year: formData.year as string,
          semester: formData.semester as '1' | '2',
          curriculumType: selectedCurriculum,
          capaianPembelajaranUmumInput: formData.capaianPembelajaranUmum_textarea || undefined
        };
        const result: GenerateSemesterProgramOutput = await generateSemesterProgram(aiInput);
        setFormData(prev => ({
            ...prev,
            title: result.title || prev.title,
            capaianPembelajaranUmum_textarea: result.capaianPembelajaranUmum || '',
            alokasiWaktuTotalSemester_input: result.alokasiWaktuTotalSemester || '',
            komponenMingguan_textarea: formatWeeklyUnitsToString(result.komponenMingguan || []),
        }));
        toast({ title: "Konten Promes Dihasilkan!", description: "AI telah membuat draf konten. Silakan tinjau." });
        addLog("INFO", `Konten Promes berhasil dibuat AI. Judul: "${result.title}".`, source);
      }
    } catch (error) {
      console.error(`Error generating ${itemType} with AI:`, error);
      toast({
        title: `Pembuatan AI ${itemType} Gagal`,
        description: "Tidak dapat menghasilkan konten. Silakan coba lagi.",
        variant: "destructive",
      });
      addLog("ERROR", `Gagal membuat draf ${itemType} dengan AI. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, source);
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
            disabled={isGeneratingAI || !formData.gradeLevel || !selectedCurriculum || (itemType === "RPP" && !formData.topic) || (itemType === "PROTA" && (!formData.subject || !formData.year)) || (itemType === "Promes" && (!formData.subject || !formData.year || !formData.semester)) }
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
        >
            {isGeneratingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Buat Draf Konten {itemType} dengan AI (Kurikulum: {availableCurriculums.find(c=>c.value === selectedCurriculum)?.label || selectedCurriculum})
        </Button>
        {((itemType === "RPP" && (!formData.topic || !formData.gradeLevel || !selectedCurriculum)) || 
          (itemType === "PROTA" && (!formData.subject || !formData.gradeLevel || !formData.year || !selectedCurriculum)) ||
          (itemType === "Promes" && (!formData.subject || !formData.gradeLevel || !formData.year || !formData.semester || !selectedCurriculum))) 
          && !isGeneratingAI && (
            <p className="text-xs text-muted-foreground mt-1">
                Isi Jenis Kurikulum, {itemType === "RPP" ? "Topik dan Jenjang" : itemType === "PROTA" ? "Mapel, Jenjang, dan Tahun" : "Mapel, Jenjang, Tahun, dan Semester"} untuk mengaktifkan tombol AI.
            </p>
        )}
      </div>
    );

    switch (itemType) {
      case "RPP":
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="topic">Topik/Materi Pembelajaran</Label>
              <Input id="topic" name="topic" value={formData.topic || ''} onChange={handleChange} required />
            </div>
            
            {commonAIButton}

            <div className="space-y-1">
              <Label htmlFor="learningObjectives">Tujuan Pembelajaran (satu per baris)</Label>
              <Textarea id="learningObjectives" name="learningObjectives" value={formData.learningObjectives?.join('\n') || ''} onChange={(e) => handleArrayChange('learningObjectives', e.target.value)} placeholder="Tujuan 1&#10;Tujuan 2" />
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
      case "PROTA":
        return (
          <>
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
            
            <Label className="font-semibold mt-2">Semester 1</Label>
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

            <Label className="font-semibold mt-2">Semester 2</Label>
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
      case "Promes":
        return (
          <>
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
     
      <DialogContent className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl max-h-[95vh] flex flex-col rounded-lg overflow-x-hidden">
        <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <DialogTitle>{actualDialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow overflow-y-auto px-1 sm:px-2 w-full"> 
          <form onSubmit={handleSubmit} className="px-3 py-2 sm:px-4 sm:py-4"> 
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="title">Judul</Label>
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
                <div className="space-y-1 md:col-span-2"> {/* Make gradeLevel full width on small screens */}
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
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4 sticky bottom-0 bg-background py-4 border-t px-4 sm:px-6">
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

