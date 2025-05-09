
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, Save, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import type { LessonPlan, CurriculumFramework } from "@/types";
import { LessonPlanFormFields } from "@/components/curriculum/LessonPlanFormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurriculum } from "@/contexts/CurriculumContext";
import { useLog } from "@/contexts/LogContext";
import { generateLessonPlanFromTopic, type GenerateLessonPlanInput, type GenerateLessonPlanOutput } from "@/ai/flows/generate-lesson-plan-from-topic";


const LESSON_PLANS_STORAGE_KEY = "appLessonPlans";

export default function EditLessonPlanPage() {
  const router = useRouter();
  const params = useParams();
  const { id: lessonPlanId } = params;
  const { user } = useAuth();
  const { toast } = useToast();
  const { availableCurriculums } = useCurriculum();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<LessonPlan>>({});
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumFramework>("Kurikulum Merdeka");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login"); 
      return;
    }
    if (lessonPlanId && typeof window !== 'undefined') {
      const storedPlans = localStorage.getItem(LESSON_PLANS_STORAGE_KEY);
      if (storedPlans) {
        const plans: LessonPlan[] = JSON.parse(storedPlans);
        const planToEdit = plans.find(p => p.id === lessonPlanId);
        if (planToEdit) {
          const canEdit = user.role === "Admin" || user.role === "WakaKurikulum" || (user.role === "Guru" && planToEdit.createdByUserId === user.id);
          if (!canEdit) {
            toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit item ini.", variant: "destructive" });
            router.push("/lesson-plans");
            return;
          }
          setFormData(planToEdit);
          setSelectedCurriculum(planToEdit.curriculumType);
          const docType = planToEdit.curriculumType === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP";
          addLog("INFO", `Memuat ${docType} "${planToEdit.title}" (ID: ${lessonPlanId}) untuk diedit oleh ${user.email}.`, "EditLessonPlanPage");
        } else {
          toast({ title: "Dokumen Tidak Ditemukan", description: "Dokumen pembelajaran yang Anda cari tidak ada.", variant: "destructive" });
          router.push("/lesson-plans");
        }
      }
      setIsLoadingData(false);
    }
  }, [lessonPlanId, user, router, toast, addLog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'curriculumType') {
       if (user?.role === 'Guru') {
        toast({ title: "Informasi", description: "Jenis kurikulum tidak dapat diubah oleh Guru.", variant: "default" });
        return;
      }
      const newCurriculum = value as CurriculumFramework;
      setSelectedCurriculum(newCurriculum);
      setFormData(prev => ({
        ...prev,
        curriculumType: newCurriculum,
        // Kurikulum Merdeka specific
        bidangKeahlian: newCurriculum === "Kurikulum Merdeka" ? prev.bidangKeahlian || '' : undefined,
        programKeahlian: newCurriculum === "Kurikulum Merdeka" ? prev.programKeahlian || '' : undefined,
        capaianPembelajaran: newCurriculum === "Kurikulum Merdeka" ? prev.capaianPembelajaran || [] : undefined,
        pemahamanBermakna: newCurriculum === "Kurikulum Merdeka" ? prev.pemahamanBermakna || [] : undefined,
        pertanyaanPemantik: newCurriculum === "Kurikulum Merdeka" ? prev.pertanyaanPemantik || [] : undefined,
        differentiationStrategies: newCurriculum === "Kurikulum Merdeka" ? prev.differentiationStrategies || [] : undefined,
        profilPelajarPancasilaFocus: newCurriculum === "Kurikulum Merdeka" ? prev.profilPelajarPancasilaFocus || [] : undefined,
        // KTSP/K-13 specific
        standarKompetensi: newCurriculum === "KTSP 2006" ? prev.standarKompetensi || [] : undefined,
        kompetensiInti: newCurriculum === "K-13" ? prev.kompetensiInti || [] : undefined,
        kompetensiDasar: newCurriculum !== "Kurikulum Merdeka" ? prev.kompetensiDasar || [] : undefined,
        indikatorPencapaianKompetensi: newCurriculum !== "Kurikulum Merdeka" ? prev.indikatorPencapaianKompetensi || [] : undefined,
        metodePembelajaran: newCurriculum !== "Kurikulum Merdeka" ? prev.metodePembelajaran || [] : undefined,
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
    const source = `EditLessonPlanPage-AI`;
    const docType = selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP";
    if (!formData.gradeLevel || !selectedCurriculum || !formData.topic) {
         toast({
            title: "Informasi Kurang",
            description: `Harap isi Jenis Kurikulum, ${selectedCurriculum === "Kurikulum Merdeka" ? "Konsentrasi Keahlian/Tema Utama" : "Topik"}, dan Jenjang/Fase terlebih dahulu untuk menggunakan AI.`,
            variant: "destructive",
         });
         addLog("WARN", `Gagal membuat draf ${docType} dengan AI: Informasi kurang. ID: ${lessonPlanId}`, source);
         return;
    }
    if (selectedCurriculum === "Kurikulum Merdeka" && (!formData.capaianPembelajaran || formData.capaianPembelajaran.length === 0)) {
        toast({
            title: "Informasi Kurang untuk Kurikulum Merdeka",
            description: "Harap isi Capaian Pembelajaran untuk hasil AI yang lebih optimal.",
            variant: "destructive"
        });
        addLog("WARN", `Gagal membuat draf ${docType} dengan AI (Kurikulum Merdeka): Capaian Pembelajaran kosong. ID: ${lessonPlanId}`, source);
        return;
    }

    setIsGeneratingAI(true);
    addLog("INFO", `Memulai pembuatan draf ${docType} dengan AI untuk ID: ${lessonPlanId}. Kurikulum: ${selectedCurriculum}. Jenjang: "${formData.gradeLevel}". ${selectedCurriculum === "Kurikulum Merdeka" ? "Konsentrasi Keahlian/Tema: " : "Topik: "}"${formData.topic}".`, source);
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
            title: result.title && prev.title !== result.title ? result.title : prev.title,
            subject: result.subject || prev.subject,
            bidangKeahlian: result.bidangKeahlian || (selectedCurriculum === "Kurikulum Merdeka" ? prev.bidangKeahlian : undefined),
            programKeahlian: result.programKeahlian || (selectedCurriculum === "Kurikulum Merdeka" ? prev.programKeahlian : undefined),
            learningObjectives: result.learningObjectives,
            alokasiWaktuJP: result.alokasiWaktuJP || prev.alokasiWaktuJP,
            profilPelajarPancasilaFocus: result.profilPelajarPancasilaFocus || (selectedCurriculum === "Kurikulum Merdeka" ? prev.profilPelajarPancasilaFocus : undefined),
            pemahamanBermakna: result.pemahamanBermakna || (selectedCurriculum === "Kurikulum Merdeka" ? prev.pemahamanBermakna : undefined),
            pertanyaanPemantik: result.pertanyaanPemantik || (selectedCurriculum === "Kurikulum Merdeka" ? prev.pertanyaanPemantik : undefined),
            langkahPembelajaran: result.langkahPembelajaran || prev.langkahPembelajaran,
            assessment: result.assessmentStrategies?.join('\n- ') || prev.assessment,
            materials: result.materials || prev.materials,
            differentiationStrategies: result.differentiationStrategies || (selectedCurriculum === "Kurikulum Merdeka" ? prev.differentiationStrategies : undefined),
            standarKompetensi: result.standarKompetensi || (selectedCurriculum === "KTSP 2006" ? prev.standarKompetensi : undefined),
            kompetensiInti: result.kompetensiInti || (selectedCurriculum === "K-13" ? prev.kompetensiInti : undefined),
            kompetensiDasar: result.kompetensiDasar || (selectedCurriculum !== "Kurikulum Merdeka" ? prev.kompetensiDasar : undefined),
            indikatorPencapaianKompetensi: result.indikatorPencapaianKompetensi || (selectedCurriculum !== "Kurikulum Merdeka" ? prev.indikatorPencapaianKompetensi : undefined),
            metodePembelajaran: result.metodePembelajaran || (selectedCurriculum !== "Kurikulum Merdeka" ? prev.metodePembelajaran : undefined),
        }));
        toast({ title: `Konten ${docType} Diperbarui oleh AI!`, description: "AI telah memperbarui draf konten. Silakan tinjau." });
        addLog("INFO", `Konten ${docType} ID: ${lessonPlanId} berhasil diperbarui AI. Judul baru mungkin: "${result.title}".`, source);
    } catch (error) {
      console.error(`Error generating ${docType} with AI:`, error);
      toast({
        title: `Pembuatan AI ${docType} Gagal`,
        description: "Tidak dapat menghasilkan konten. Silakan coba lagi.",
        variant: "destructive",
      });
      addLog("ERROR", `Gagal membuat draf ${docType} dengan AI untuk ID ${lessonPlanId}. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, source);
    } finally {
      setIsGeneratingAI(false);
    }
  };


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const updatedLessonPlan: LessonPlan = {
      ...formData,
      type: 'RPP',
      curriculumType: selectedCurriculum,
      updatedAt: new Date().toISOString(),
    } as LessonPlan; 

    try {
      const existingPlans = JSON.parse(localStorage.getItem(LESSON_PLANS_STORAGE_KEY) || "[]") as LessonPlan[];
      const updatedPlans = existingPlans.map(p => p.id === lessonPlanId ? updatedLessonPlan : p);
      localStorage.setItem(LESSON_PLANS_STORAGE_KEY, JSON.stringify(updatedPlans));
      const docType = selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP";
      toast({ title: `${docType} Diperbarui`, description: `"${updatedLessonPlan.title}" telah berhasil diperbarui.` });
      addLog("INFO", `${docType} "${updatedLessonPlan.title}" (ID: ${lessonPlanId}) berhasil diperbarui oleh ${user?.email}.`, "EditLessonPlanPage");
      router.push("/lesson-plans");
    } catch (error) {
      const docType = selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP";
      toast({ title: "Gagal Memperbarui", description: `Terjadi kesalahan saat memperbarui ${docType}.`, variant: "destructive" });
      addLog("ERROR", `Gagal memperbarui ${docType} "${updatedLessonPlan.title}" (ID: ${lessonPlanId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditLessonPlanPage");
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    const docType = selectedCurriculum === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP";
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${docType} "${formData.title}"?`)) {
      try {
        const existingPlans = JSON.parse(localStorage.getItem(LESSON_PLANS_STORAGE_KEY) || "[]") as LessonPlan[];
        const updatedPlans = existingPlans.filter(p => p.id !== lessonPlanId);
        localStorage.setItem(LESSON_PLANS_STORAGE_KEY, JSON.stringify(updatedPlans));
        toast({ title: `${docType} Dihapus`, description: `"${formData.title}" telah berhasil dihapus.` });
        addLog("WARN", `${docType} "${formData.title}" (ID: ${lessonPlanId}) dihapus oleh ${user?.email}.`, "EditLessonPlanPage");
        router.push("/lesson-plans");
      } catch (error) {
        toast({ title: "Gagal Menghapus", description: `Terjadi kesalahan saat menghapus ${docType}.`, variant: "destructive" });
         addLog("ERROR", `Gagal menghapus ${docType} "${formData.title}" (ID: ${lessonPlanId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditLessonPlanPage");
      }
    }
  };

  if (isLoadingData || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat data dokumen...</p>
      </div>
    );
  }
  
  if (!formData.id) { 
      return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-destructive text-lg">Dokumen tidak ditemukan atau gagal dimuat.</p>
        </div>
    );
  }

  const documentTypeForTitle = selectedCurriculum === "Kurikulum Merdeka" ? "Alur Tujuan Pembelajaran (ATP) / Modul Ajar" : "Rencana Pelaksanaan Pembelajaran (RPP)";

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BookOpenText className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Edit {documentTypeForTitle}</CardTitle>
                <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1 truncate max-w-md sm:max-w-lg md:max-w-xl">
                  {formData.title || "Memuat judul..."}
                </CardDescription>
              </div>
            </div>
            <Button variant="destructive" onClick={handleDelete} className="w-full mt-2 sm:mt-0 sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" /> Hapus Dokumen Ini
            </Button>
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
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
