
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Save, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AnnualProgram, AnnualProgramComponent, CurriculumFramework } from "@/types";
import { AnnualProgramFormFields } from "@/components/curriculum/AnnualProgramFormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurriculum } from "@/contexts/CurriculumContext";
import { useLog } from "@/contexts/LogContext";
import { generateAnnualProgram, type GenerateAnnualProgramInput, type GenerateAnnualProgramOutput } from "@/ai/flows/generate-annual-program";

const ANNUAL_PROGRAMS_STORAGE_KEY = "appAnnualPrograms";

type ProtaFormState = {
  capaianPembelajaran_textarea?: string; 
  profilPelajarPancasilaFocus_textarea?: string;
  semester1_topics_textarea?: string;
  semester1_elements_textarea?: string; 
  semester1_allocations_textarea?: string;
  semester2_topics_textarea?: string;
  semester2_elements_textarea?: string; 
  semester2_allocations_textarea?: string;
};

const getInitialProtaData = (curriculum: CurriculumFramework): Partial<AnnualProgram & ProtaFormState> => {
    const common = {
        type: 'PROTA' as const, title: '', subject: '', gradeLevel: '', year: '',
        semester1Components: [],
        semester2Components: [],
        curriculumType: curriculum,
        // Textarea fields for form binding
        semester1_topics_textarea: '',
        semester1_elements_textarea: '',
        semester1_allocations_textarea: '',
        semester2_topics_textarea: '',
        semester2_elements_textarea: '',
        semester2_allocations_textarea: '',
    };
    if (curriculum === "Kurikulum Merdeka") {
        return {
            ...common,
            capaianPembelajaran_textarea: '',
            profilPelajarPancasilaFocus_textarea: '',
        };
    }
    return {
        ...common,
        capaianPembelajaran_textarea: undefined,
        capaianPembelajaran: undefined,
        profilPelajarPancasilaFocus_textarea: undefined,
        profilPelajarPancasilaFocus: undefined,
    };
};




export default function NewAnnualProgramPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { defaultCurriculum, availableCurriculums } = useCurriculum();
  const { addLog } = useLog();

  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumFramework>(defaultCurriculum);
  const [formData, setFormData] = useState<Partial<AnnualProgram & ProtaFormState>>(getInitialProtaData(defaultCurriculum));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (!user || !(user.role === "Admin" || user.role === "WakaKurikulum" || user.role === "Guru")) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk membuat PROTA baru.", variant: "destructive" });
      router.push("/annual-programs");
    }
    setSelectedCurriculum(defaultCurriculum);
    setFormData(getInitialProtaData(defaultCurriculum));
  }, [user, router, toast, defaultCurriculum]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'curriculumType') {
      if (user?.role === 'Guru') {
        toast({ title: "Informasi", description: "Jenis kurikulum ditentukan oleh pengaturan global dan tidak dapat diubah oleh Guru.", variant: "default" });
        return;
      }
      const newCurriculum = value as CurriculumFramework;
      setSelectedCurriculum(newCurriculum);
      setFormData(prev => ({
          // Preserve common fields
          title: prev.title,
          subject: prev.subject,
          // gradeLevel: prev.gradeLevel, // Will be reset by form field component
          year: prev.year,
          // Set new curriculum type and specific fields
          ...getInitialProtaData(newCurriculum),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

  const handleGenerateWithAI = async () => {
    const source = `NewAnnualProgramPage-AI`;
    if (!formData.gradeLevel || !selectedCurriculum || !formData.subject || !formData.year) {
         toast({
            title: "Informasi Kurang",
            description: `Harap isi Jenis Kurikulum, Mata Pelajaran, Jenjang, dan Tahun Ajaran terlebih dahulu untuk menggunakan AI.`,
            variant: "destructive",
         });
         addLog("WARN", `Gagal membuat draf PROTA dengan AI: Informasi kurang.`, source);
         return;
    }
     if (selectedCurriculum === "Kurikulum Merdeka" && !formData.capaianPembelajaran_textarea) {
         toast({
            title: "Informasi Kurang untuk Kurikulum Merdeka",
            description: `Harap isi Capaian Pembelajaran Umum Tahunan untuk hasil AI yang lebih baik.`,
            variant: "destructive",
         });
        addLog("WARN", `Gagal membuat draf PROTA dengan AI (Kurikulum Merdeka): Capaian Pembelajaran kosong.`, source);
        return;
    }

    setIsGeneratingAI(true);
    addLog("INFO", `Memulai pembuatan draf PROTA dengan AI. Kurikulum: ${selectedCurriculum}. Jenjang: "${formData.gradeLevel}". Mapel: "${formData.subject}". Tahun: "${formData.year}". CP Umum: ${selectedCurriculum === "Kurikulum Merdeka" ? formData.capaianPembelajaran_textarea : 'N/A'}`, source);
    try {
        const aiInput: GenerateAnnualProgramInput = {
          subject: formData.subject as string,
          jenjangFaseKelas: formData.gradeLevel as string,
          year: formData.year as string,
          curriculumType: selectedCurriculum,
          capaianPembelajaran: selectedCurriculum === "Kurikulum Merdeka" ? formData.capaianPembelajaran_textarea?.split('\n').map(s => s.trim()).filter(s => s) || [] : undefined,
        };
        const result: GenerateAnnualProgramOutput = await generateAnnualProgram(aiInput);
        setFormData(prev => ({
            ...prev,
            title: result.title || prev.title || `PROTA ${formData.subject} ${formData.gradeLevel} ${formData.year}`,
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
    } catch (error) {
      console.error(`Error generating PROTA with AI:`, error);
      toast({
        title: `Pembuatan AI PROTA Gagal`,
        description: "Tidak dapat menghasilkan konten. Silakan coba lagi.",
        variant: "destructive",
      });
      addLog("ERROR", `Gagal membuat draf PROTA dengan AI. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, source);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const newAnnualProgram: AnnualProgram = {
      id: `prota-${Date.now()}`,
      type: 'PROTA',
      title: formData.title || '',
      subject: formData.subject || '',
      gradeLevel: formData.gradeLevel || '',
      curriculumType: selectedCurriculum,
      year: formData.year || '',
      capaianPembelajaran: selectedCurriculum === "Kurikulum Merdeka" ? formData.capaianPembelajaran_textarea?.split('\n').map(s => s.trim()).filter(s => s) || [] : undefined,
      semester1Components: parseProtaComponents(formData.semester1_topics_textarea, formData.semester1_elements_textarea, formData.semester1_allocations_textarea),
      semester2Components: parseProtaComponents(formData.semester2_topics_textarea, formData.semester2_elements_textarea, formData.semester2_allocations_textarea),
      profilPelajarPancasilaFocus: selectedCurriculum === "Kurikulum Merdeka" ? formData.profilPelajarPancasilaFocus_textarea?.split('\n').map(s => s.trim()).filter(s => s) || [] : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: user?.id,
    };

    try {
      const existingPrograms = JSON.parse(localStorage.getItem(ANNUAL_PROGRAMS_STORAGE_KEY) || "[]") as AnnualProgram[];
      localStorage.setItem(ANNUAL_PROGRAMS_STORAGE_KEY, JSON.stringify([newAnnualProgram, ...existingPrograms]));
      toast({ title: "PROTA Dibuat", description: `"${newAnnualProgram.title}" telah berhasil disimpan.` });
      addLog("INFO", `PROTA baru "${newAnnualProgram.title}" berhasil dibuat oleh ${user?.email}.`, "NewAnnualProgramPage");
      router.push("/annual-programs");
    } catch (error) {
      toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan PROTA.", variant: "destructive" });
      addLog("ERROR", `Gagal menyimpan PROTA baru "${newAnnualProgram.title}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "NewAnnualProgramPage");
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CalendarDays className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Buat Program Tahunan Baru (PROTA)</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Definisikan struktur kurikulum untuk seluruh tahun ajaran.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnnualProgramFormFields
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              selectedCurriculum={selectedCurriculum}
              availableCurriculums={availableCurriculums}
              isGeneratingAI={isGeneratingAI}
              handleGenerateWithAI={handleGenerateWithAI}
              userRole={user.role}
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan PROTA
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
