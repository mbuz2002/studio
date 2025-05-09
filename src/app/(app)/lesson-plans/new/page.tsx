
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, Save, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { LessonPlan, CurriculumFramework } from "@/types";
import { LessonPlanFormFields } from "@/components/curriculum/LessonPlanFormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurriculum } from "@/contexts/CurriculumContext";
import { useLog } from "@/contexts/LogContext";
import { generateLessonPlanFromTopic, type GenerateLessonPlanInput, type GenerateLessonPlanOutput } from "@/ai/flows/generate-lesson-plan-from-topic";

const LESSON_PLANS_STORAGE_KEY = "appLessonPlans";

const baseRppData: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'curriculumType'> = {
  type: 'RPP', title: '', subject: '', gradeLevel: '', topic: '',
  learningObjectives: [],
  alokasiWaktuJP: '',
  langkahPembelajaran: { pendahuluan: [], kegiatanInti: [], penutup: [] },
  assessment: '',
  materials: '',
  // Initialize new Kurikulum Merdeka fields
  bidangKeahlian: '',
  programKeahlian: '',
  profilPelajarPancasilaFocus: [],
};

export default function NewLessonPlanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { defaultCurriculum, availableCurriculums } = useCurriculum();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<LessonPlan>>(
     { 
        ...baseRppData, 
        curriculumType: defaultCurriculum,
        // Specific initializations based on default curriculum
        capaianPembelajaran: defaultCurriculum === "Kurikulum Merdeka" ? [] : undefined,
        pemahamanBermakna: defaultCurriculum === "Kurikulum Merdeka" ? [] : undefined,
        pertanyaanPemantik: defaultCurriculum === "Kurikulum Merdeka" ? [] : undefined,
        differentiationStrategies: defaultCurriculum === "Kurikulum Merdeka" ? [] : undefined,
        profilPelajarPancasilaFocus: defaultCurriculum === "Kurikulum Merdeka" ? [] : undefined,
        bidangKeahlian: defaultCurriculum === "Kurikulum Merdeka" ? '' : undefined,
        programKeahlian: defaultCurriculum === "Kurikulum Merdeka" ? '' : undefined,
        standarKompetensi: defaultCurriculum === "KTSP 2006" ? [] : undefined,
        kompetensiInti: defaultCurriculum === "K-13" ? [] : undefined,
        kompetensiDasar: defaultCurriculum !== "Kurikulum Merdeka" ? [] : undefined,
        indikatorPencapaianKompetensi: defaultCurriculum !== "Kurikulum Merdeka" ? [] : undefined,
        metodePembelajaran: defaultCurriculum !== "Kurikulum Merdeka" ? [] : undefined,
     }
  );
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumFramework>(defaultCurriculum);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (!user || !(user.role === "Admin" || user.role === "WakaKurikulum" || user.role === "Guru")) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk membuat item ini.", variant: "destructive" });
      router.push("/lesson-plans");
    }
    // Reset form data when defaultCurriculum changes
    setSelectedCurriculum(defaultCurriculum);
    setFormData({
      ...baseRppData,
      curriculumType: defaultCurriculum,
      capaianPembelajaran: defaultCurriculum === "Kurikulum Merdeka" ? [] : undefined,
      pemahamanBermakna: defaultCurriculum === "Kurikulum Merdeka" ? [] : undefined,
      pertanyaanPemantik: defaultCurriculum === "Kurikulum Merdeka" ? [] : undefined,
      differentiationStrategies: defaultCurriculum === "Kurikulum Merdeka" ? [] : undefined,
      profilPelajarPancasilaFocus: defaultCurriculum === "Kurikulum Merdeka" ? [] : undefined,
      bidangKeahlian: defaultCurriculum === "Kurikulum Merdeka" ? '' : undefined,
      programKeahlian: defaultCurriculum === "Kurikulum Merdeka" ? '' : undefined,
      standarKompetensi: defaultCurriculum === "KTSP 2006" ? [] : undefined,
      kompetensiInti: defaultCurriculum === "K-13" ? [] : undefined,
      kompetensiDasar: defaultCurriculum !== "Kurikulum Merdeka" ? [] : undefined,
      indikatorPencapaianKompetensi: defaultCurriculum !== "Kurikulum Merdeka" ? [] : undefined,
      metodePembelajaran: defaultCurriculum !== "Kurikulum Merdeka" ? [] : undefined,
    });
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
        ...baseRppData, 
        curriculumType: newCurriculum,
        title: prev.title,
        subject: prev.subject,
        gradeLevel: prev.gradeLevel,
        topic: prev.topic,
        alokasiWaktuJP: prev.alokasiWaktuJP,
        capaianPembelajaran: newCurriculum === "Kurikulum Merdeka" ? [] : undefined,
        pemahamanBermakna: newCurriculum === "Kurikulum Merdeka" ? [] : undefined,
        pertanyaanPemantik: newCurriculum === "Kurikulum Merdeka" ? [] : undefined,
        differentiationStrategies: newCurriculum === "Kurikulum Merdeka" ? [] : undefined,
        profilPelajarPancasilaFocus: newCurriculum === "Kurikulum Merdeka" ? [] : undefined,
        bidangKeahlian: newCurriculum === "Kurikulum Merdeka" ? '' : undefined,
        programKeahlian: newCurriculum === "Kurikulum Merdeka" ? '' : undefined,
        standarKompetensi: newCurriculum === "KTSP 2006" ? [] : undefined,
        kompetensiInti: newCurriculum === "K-13" ? [] : undefined,
        kompetensiDasar: newCurriculum !== "Kurikulum Merdeka" ? [] : undefined,
        indikatorPencapaianKompetensi: newCurriculum !== "Kurikulum Merdeka" ? [] : undefined,
        metodePembelajaran: newCurriculum !== "Kurikulum Merdeka" ? [] : undefined,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (name: keyof LessonPlan, value: string) => {
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

  const handleGenerateWithAI = async () => {
    const source = `NewLessonPlanPage-AI`;
    if (!formData.gradeLevel || !selectedCurriculum || !formData.topic) {
         toast({
            title: "Informasi Kurang",
            description: `Harap isi Jenis Kurikulum, ${selectedCurriculum === "Kurikulum Merdeka" ? "Konsentrasi Keahlian/Tema Utama" : "Topik"}, dan Jenjang/Fase terlebih dahulu untuk menggunakan AI.`,
            variant: "destructive",
         });
         addLog("WARN", `Gagal membuat draf ${selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP"} dengan AI: Informasi kurang.`, source);
         return;
    }
    if (selectedCurriculum === "Kurikulum Merdeka" && (!formData.capaianPembelajaran || formData.capaianPembelajaran.length === 0)) {
        toast({
            title: "Informasi Kurang untuk Kurikulum Merdeka",
            description: "Harap isi Capaian Pembelajaran untuk hasil AI yang lebih optimal.",
            variant: "destructive"
        });
        addLog("WARN", `Gagal membuat draf ATP/Modul Ajar dengan AI (Kurikulum Merdeka): Capaian Pembelajaran kosong.`, source);
        return;
    }

    setIsGeneratingAI(true);
    addLog("INFO", `Memulai pembuatan draf ${selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP"} dengan AI. Kurikulum: ${selectedCurriculum}. Jenjang: "${formData.gradeLevel}". ${selectedCurriculum === "Kurikulum Merdeka" ? "Konsentrasi Keahlian/Tema: " : "Topik: "}"${formData.topic}".`, source);
    try {
        const aiInput: GenerateLessonPlanInput = {
          topic: formData.topic as string,
          jenjangFaseKelas: formData.gradeLevel as string,
          curriculumType: selectedCurriculum,
          subject: formData.subject,
          bidangKeahlian: formData.bidangKeahlian,
          programKeahlian: formData.programKeahlian,
          capaianPembelajaran: selectedCurriculum === "Kurikulum Merdeka" ? formData.capaianPembelajaran || [] : undefined,
        };
        const result: GenerateLessonPlanOutput = await generateLessonPlanFromTopic(aiInput);
        setFormData(prev => ({
            ...prev,
            title: result.title || prev.title || `${selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP"} ${formData.topic} - ${formData.gradeLevel}`,
            subject: result.subject || prev.subject,
            bidangKeahlian: result.bidangKeahlian || (selectedCurriculum === "Kurikulum Merdeka" ? prev.bidangKeahlian : undefined),
            programKeahlian: result.programKeahlian || (selectedCurriculum === "Kurikulum Merdeka" ? prev.programKeahlian : undefined),
            learningObjectives: result.learningObjectives,
            alokasiWaktuJP: result.alokasiWaktuJP || prev.alokasiWaktuJP,
            profilPelajarPancasilaFocus: result.profilPelajarPancasilaFocus || (selectedCurriculum === "Kurikulum Merdeka" ? [] : undefined),
            pemahamanBermakna: result.pemahamanBermakna || (selectedCurriculum === "Kurikulum Merdeka" ? [] : undefined),
            pertanyaanPemantik: result.pertanyaanPemantik || (selectedCurriculum === "Kurikulum Merdeka" ? [] : undefined),
            langkahPembelajaran: result.langkahPembelajaran || prev.langkahPembelajaran,
            assessment: result.assessmentStrategies?.join('\n- ') || prev.assessment || '',
            materials: result.materials || prev.materials,
            differentiationStrategies: result.differentiationStrategies || (selectedCurriculum === "Kurikulum Merdeka" ? [] : undefined),
            standarKompetensi: result.standarKompetensi || (selectedCurriculum === "KTSP 2006" ? [] : undefined),
            kompetensiInti: result.kompetensiInti || (selectedCurriculum === "K-13" ? [] : undefined),
            kompetensiDasar: result.kompetensiDasar || (selectedCurriculum !== "Kurikulum Merdeka" ? [] : undefined),
            indikatorPencapaianKompetensi: result.indikatorPencapaianKompetensi || (selectedCurriculum !== "Kurikulum Merdeka" ? [] : undefined),
            metodePembelajaran: result.metodePembelajaran || (selectedCurriculum !== "Kurikulum Merdeka" ? [] : undefined),
        }));
        toast({ title: `Konten ${selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP"} Dihasilkan!`, description: "AI telah membuat draf konten. Silakan tinjau." });
        addLog("INFO", `Konten ${selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP"} berhasil dibuat AI. Judul: "${result.title}".`, source);
    } catch (error) {
      console.error(`Error generating ${selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP"} with AI:`, error);
      toast({
        title: `Pembuatan AI Gagal`,
        description: "Tidak dapat menghasilkan konten. Silakan coba lagi.",
        variant: "destructive",
      });
      addLog("ERROR", `Gagal membuat draf ${selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP"} dengan AI. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, source);
    } finally {
      setIsGeneratingAI(false);
    }
  };


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const newLessonPlan: LessonPlan = {
      id: `rpp-${Date.now()}`, // ID can remain generic, type distinguishes it
      type: 'RPP', // This 'type' field is for broad categorization in storage/display
      title: formData.title || '',
      subject: formData.subject || '',
      gradeLevel: formData.gradeLevel || '',
      curriculumType: selectedCurriculum,
      topic: formData.topic || '',
      learningObjectives: formData.learningObjectives || [],
      alokasiWaktuJP: formData.alokasiWaktuJP || '',
      
      // Kurikulum Merdeka specific
      bidangKeahlian: selectedCurriculum === "Kurikulum Merdeka" ? formData.bidangKeahlian || undefined : undefined,
      programKeahlian: selectedCurriculum === "Kurikulum Merdeka" ? formData.programKeahlian || undefined : undefined,
      capaianPembelajaran: selectedCurriculum === "Kurikulum Merdeka" ? formData.capaianPembelajaran || [] : undefined,
      pemahamanBermakna: selectedCurriculum === "Kurikulum Merdeka" ? formData.pemahamanBermakna || [] : undefined,
      pertanyaanPemantik: selectedCurriculum === "Kurikulum Merdeka" ? formData.pertanyaanPemantik || [] : undefined,
      differentiationStrategies: selectedCurriculum === "Kurikulum Merdeka" ? formData.differentiationStrategies || [] : undefined,
      profilPelajarPancasilaFocus: selectedCurriculum === "Kurikulum Merdeka" ? formData.profilPelajarPancasilaFocus || [] : undefined,
      
      // KTSP / K-13 specific
      standarKompetensi: selectedCurriculum === "KTSP 2006" ? formData.standarKompetensi || [] : undefined,
      kompetensiInti: selectedCurriculum === "K-13" ? formData.kompetensiInti || [] : undefined,
      kompetensiDasar: (selectedCurriculum === "K-13" || selectedCurriculum === "KTSP 2006") ? formData.kompetensiDasar || [] : undefined,
      indikatorPencapaianKompetensi: (selectedCurriculum === "K-13" || selectedCurriculum === "KTSP 2006") ? formData.indikatorPencapaianKompetensi || [] : undefined,
      metodePembelajaran: (selectedCurriculum === "K-13" || selectedCurriculum === "KTSP 2006") ? formData.metodePembelajaran || [] : undefined,
      
      langkahPembelajaran: formData.langkahPembelajaran || { pendahuluan: [], kegiatanInti: [], penutup: [] },
      assessment: formData.assessment || '',
      materials: formData.materials || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: user?.id,
    };

    try {
      const existingPlans = JSON.parse(localStorage.getItem(LESSON_PLANS_STORAGE_KEY) || "[]") as LessonPlan[];
      localStorage.setItem(LESSON_PLANS_STORAGE_KEY, JSON.stringify([newLessonPlan, ...existingPlans]));
      const docType = selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP";
      toast({ title: `${docType} Dibuat`, description: `"${newLessonPlan.title}" telah berhasil disimpan.` });
      addLog("INFO", `${docType} baru "${newLessonPlan.title}" berhasil dibuat oleh ${user?.email}.`, "NewLessonPlanPage");
      router.push("/lesson-plans");
    } catch (error) {
      const docType = selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP";
      toast({ title: "Gagal Menyimpan", description: `Terjadi kesalahan saat menyimpan ${docType}.`, variant: "destructive" });
      addLog("ERROR", `Gagal menyimpan ${docType} baru "${newLessonPlan.title}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "NewLessonPlanPage");
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

  const documentTypeForTitle = selectedCurriculum === "Kurikulum Merdeka" ? "Alur Tujuan Pembelajaran (ATP) / Modul Ajar" : "Rencana Pelaksanaan Pembelajaran (RPP)";

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <BookOpenText className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Buat {documentTypeForTitle} Baru</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Isi rincian untuk dokumen pembelajaran baru Anda.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <LessonPlanFormFields
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleArrayChange={handleArrayChange}
              handleLangkahPembelajaranChange={handleLangkahPembelajaranChange}
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
                Simpan {selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
