
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Save, ArrowLeft, Trash2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditAnnualProgramPage() {
  const router = useRouter();
  const params = useParams();
  const { id: protaId } = params;
  const { user } = useAuth();
  const { toast } = useToast();
  const { availableCurriculums } = useCurriculum();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<AnnualProgram & ProtaFormState>>({});
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumFramework>("Kurikulum Merdeka");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
     if (!user) {
      router.push("/login"); 
      return;
    }
    if (protaId && typeof window !== 'undefined') {
      const storedPrograms = localStorage.getItem(ANNUAL_PROGRAMS_STORAGE_KEY);
      if (storedPrograms) {
        const programs: AnnualProgram[] = JSON.parse(storedPrograms);
        const programToEdit = programs.find(p => p.id === protaId);
        if (programToEdit) {
           const canEdit = user.role === "Admin" || user.role === "WakaKurikulum" || (user.role === "Guru" && programToEdit.createdByUserId === user.id);
           if (!canEdit) {
            toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit PROTA ini.", variant: "destructive" });
            router.push("/annual-programs");
            return;
          }

          setFormData({
            ...programToEdit,
            capaianPembelajaran_textarea: programToEdit.capaianPembelajaran?.join('\n') || '',
            profilPelajarPancasilaFocus_textarea: programToEdit.profilPelajarPancasilaFocus?.join('\n') || '',
            semester1_topics_textarea: programToEdit.semester1Components?.map(c => c.topic).join('\n') || '',
            semester1_elements_textarea: programToEdit.semester1Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '',
            semester1_allocations_textarea: programToEdit.semester1Components?.map(c => c.alokasiWaktu).join('\n') || '',
            semester2_topics_textarea: programToEdit.semester2Components?.map(c => c.topic).join('\n') || '',
            semester2_elements_textarea: programToEdit.semester2Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '',
            semester2_allocations_textarea: programToEdit.semester2Components?.map(c => c.alokasiWaktu).join('\n') || '',
          });
          setSelectedCurriculum(programToEdit.curriculumType);
          addLog("INFO", `Memuat PROTA "${programToEdit.title}" (ID: ${protaId}) untuk diedit oleh ${user.email}.`, "EditAnnualProgramPage");
        } else {
          toast({ title: "PROTA Tidak Ditemukan", description: "Program tahunan yang Anda cari tidak ada.", variant: "destructive" });
          router.push("/annual-programs");
        }
      }
      setIsLoadingData(false);
    }
  }, [protaId, user, router, toast, addLog]);

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
      setFormData(prev => {
        const newFormData: Partial<AnnualProgram & ProtaFormState> = {
            ...prev,
            curriculumType: newCurriculum,
            gradeLevel: '', // Reset gradeLevel
        };
        if (newCurriculum === "Kurikulum Merdeka") {
            newFormData.capaianPembelajaran_textarea = prev.capaianPembelajaran_textarea || '';
            newFormData.profilPelajarPancasilaFocus_textarea = prev.profilPelajarPancasilaFocus_textarea || '';
        } else {
            newFormData.capaianPembelajaran_textarea = undefined;
            newFormData.capaianPembelajaran = undefined;
            newFormData.profilPelajarPancasilaFocus_textarea = undefined;
            newFormData.profilPelajarPancasilaFocus = undefined;
        }
        // Reset semester components as their structure (elemenCapaianPembelajaran vs KD) changes meaning
        newFormData.semester1_topics_textarea = '';
        newFormData.semester1_elements_textarea = '';
        newFormData.semester1_allocations_textarea = '';
        newFormData.semester2_topics_textarea = '';
        newFormData.semester2_elements_textarea = '';
        newFormData.semester2_allocations_textarea = '';
        newFormData.semester1Components = [];
        newFormData.semester2Components = [];
        return newFormData;
      });
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
    const source = `EditAnnualProgramPage-AI`;
    if (!formData.gradeLevel || !selectedCurriculum || !formData.subject || !formData.year) {
         toast({
            title: "Informasi Kurang",
            description: `Harap isi Jenis Kurikulum, Mata Pelajaran, Jenjang, dan Tahun Ajaran terlebih dahulu untuk menggunakan AI.`,
            variant: "destructive",
         });
         addLog("WARN", `Gagal membuat draf PROTA dengan AI: Informasi kurang. PROTA ID: ${protaId}`, source);
         return;
    }
    if (selectedCurriculum === "Kurikulum Merdeka" && !formData.capaianPembelajaran_textarea) {
         toast({
            title: "Informasi Kurang untuk Kurikulum Merdeka",
            description: `Harap isi Capaian Pembelajaran Umum Tahunan untuk hasil AI yang lebih baik.`,
            variant: "destructive",
         });
        addLog("WARN", `Gagal membuat draf PROTA dengan AI (Kurikulum Merdeka): Capaian Pembelajaran kosong. PROTA ID: ${protaId}`, source);
        return;
    }

    setIsGeneratingAI(true);
    addLog("INFO", `Memulai pembuatan draf PROTA dengan AI untuk PROTA ID: ${protaId}. Kurikulum: ${selectedCurriculum}. Jenjang: "${formData.gradeLevel}". Mapel: "${formData.subject}". Tahun: "${formData.year}". CP Umum: ${selectedCurriculum === "Kurikulum Merdeka" ? formData.capaianPembelajaran_textarea : 'N/A'}`, source);
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
            title: result.title || prev.title,
            profilPelajarPancasilaFocus_textarea: selectedCurriculum === "Kurikulum Merdeka" ? result.profilPelajarPancasilaFocus?.join('\n') || '' : undefined,
            semester1_topics_textarea: result.semester1Components?.map(c => c.topic).join('\n') || '',
            semester1_elements_textarea: result.semester1Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '',
            semester1_allocations_textarea: result.semester1Components?.map(c => c.alokasiWaktu).join('\n') || '',
            semester2_topics_textarea: result.semester2Components?.map(c => c.topic).join('\n') || '',
            semester2_elements_textarea: result.semester2Components?.map(c => c.elemenCapaianPembelajaran?.join(', ') || '').join('\n') || '',
            semester2_allocations_textarea: result.semester2Components?.map(c => c.alokasiWaktu).join('\n') || '',
        }));
        toast({ title: "Konten PROTA Diperbarui oleh AI!", description: "AI telah memperbarui draf konten. Silakan tinjau." });
        addLog("INFO", `Konten PROTA ID: ${protaId} berhasil diperbarui AI. Judul baru mungkin: "${result.title}".`, source);
    } catch (error) {
      console.error(`Error generating PROTA with AI:`, error);
      toast({
        title: `Pembuatan AI PROTA Gagal`,
        description: "Tidak dapat menghasilkan konten. Silakan coba lagi.",
        variant: "destructive",
      });
      addLog("ERROR", `Gagal membuat draf PROTA dengan AI untuk ID ${protaId}. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, source);
    } finally {
      setIsGeneratingAI(false);
    }
  };


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const updatedAnnualProgram: AnnualProgram = {
      ...formData,
      id: protaId as string,
      type: 'PROTA',
      curriculumType: selectedCurriculum,
      capaianPembelajaran: selectedCurriculum === "Kurikulum Merdeka" ? formData.capaianPembelajaran_textarea?.split('\n').map(s => s.trim()).filter(s => s) || [] : undefined,
      semester1Components: parseProtaComponents(formData.semester1_topics_textarea, formData.semester1_elements_textarea, formData.semester1_allocations_textarea),
      semester2Components: parseProtaComponents(formData.semester2_topics_textarea, formData.semester2_elements_textarea, formData.semester2_allocations_textarea),
      profilPelajarPancasilaFocus: selectedCurriculum === "Kurikulum Merdeka" ? formData.profilPelajarPancasilaFocus_textarea?.split('\n').map(s => s.trim()).filter(s => s) || [] : undefined,
      updatedAt: new Date().toISOString(),
    } as AnnualProgram;

    try {
      const existingPrograms = JSON.parse(localStorage.getItem(ANNUAL_PROGRAMS_STORAGE_KEY) || "[]") as AnnualProgram[];
      const updatedPrograms = existingPrograms.map(p => p.id === protaId ? updatedAnnualProgram : p);
      localStorage.setItem(ANNUAL_PROGRAMS_STORAGE_KEY, JSON.stringify(updatedPrograms));
      toast({ title: "PROTA Diperbarui", description: `"${updatedAnnualProgram.title}" telah berhasil diperbarui.` });
      addLog("INFO", `PROTA "${updatedAnnualProgram.title}" (ID: ${protaId}) berhasil diperbarui oleh ${user?.email}.`, "EditAnnualProgramPage");
      router.push("/annual-programs");
    } catch (error) {
      toast({ title: "Gagal Memperbarui", description: "Terjadi kesalahan saat memperbarui PROTA.", variant: "destructive" });
      addLog("ERROR", `Gagal memperbarui PROTA "${updatedAnnualProgram.title}" (ID: ${protaId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditAnnualProgramPage");
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus PROTA "${formData.title}"?`)) {
      try {
        const existingPrograms = JSON.parse(localStorage.getItem(ANNUAL_PROGRAMS_STORAGE_KEY) || "[]") as AnnualProgram[];
        const updatedPrograms = existingPrograms.filter(p => p.id !== protaId);
        localStorage.setItem(ANNUAL_PROGRAMS_STORAGE_KEY, JSON.stringify(updatedPrograms));
        toast({ title: "PROTA Dihapus", description: `"${formData.title}" telah berhasil dihapus.` });
        addLog("WARN", `PROTA "${formData.title}" (ID: ${protaId}) dihapus oleh ${user?.email}.`, "EditAnnualProgramPage");
        router.push("/annual-programs");
      } catch (error) {
        toast({ title: "Gagal Menghapus", description: "Terjadi kesalahan saat menghapus PROTA.", variant: "destructive" });
         addLog("ERROR", `Gagal menghapus PROTA "${formData.title}" (ID: ${protaId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditAnnualProgramPage");
      }
    }
  };
  
  if (isLoadingData || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <CalendarDays className="h-12 w-12 animate-pulse text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Memuat data PROTA...</p>
          <p className="text-sm text-muted-foreground">Mohon tunggu sebentar.</p>
        </div>
      </div>
    );
  }

  if (!formData.id) { 
      return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-destructive text-lg">PROTA tidak ditemukan atau gagal dimuat.</p>
        </div>
    );
  }


  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Edit Program Tahunan</CardTitle>
                 <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1 truncate max-w-md sm:max-w-lg md:max-w-xl">
                  {formData.title || "Memuat judul..."}
                </CardDescription>
              </div>
            </div>
             <Button variant="destructive" onClick={handleDelete} className="w-full mt-2 sm:mt-0 sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" /> Hapus PROTA Ini
            </Button>
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
              <Button type="submit" disabled={isSubmitting || isGeneratingAI} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                {isSubmitting ? <CalendarDays className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
