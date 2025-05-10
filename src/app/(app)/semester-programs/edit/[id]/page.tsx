"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Save, ArrowLeft, Trash2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import type { SemesterProgram, WeeklyUnit, CurriculumFramework, SchoolProfile, EducationLevel } from "@/types";
import { SemesterProgramFormFields } from "@/components/curriculum/SemesterProgramFormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurriculum } from "@/contexts/CurriculumContext";
import { useLog } from "@/contexts/LogContext";
import { generateSemesterProgram, type GenerateSemesterProgramInput, type GenerateSemesterProgramOutput } from "@/ai/flows/generate-semester-program";
import { SCHOOL_PROFILE_STORAGE_KEY } from "@/types";

const SEMESTER_PROGRAMS_STORAGE_KEY = "appSemesterPrograms";

type PromesFormState = {
  capaianPembelajaranUmum_textarea?: string; 
  alokasiWaktuTotalSemester_input?: string;
  komponenMingguan_textarea?: string; 
};

const formatWeeklyUnitsToString = (units: WeeklyUnit[]): string => {
    return units.map(w => 
      `Minggu ke: ${w.mingguKe || ''}\nBulan: ${w.bulan || ''}\nMateri/TP: ${w.materiPokokAtauTujuanPembelajaran || ''}\nAlokasi: ${w.alokasiWaktu || ''}\nMetode: ${w.metodeStrategi?.join(', ') || ''}\nSumber: ${w.sumberBelajar?.join(', ') || ''}\nAsesmen: ${w.rencanaAsesmen?.join(', ') || ''}\nP5: ${w.catatanIntegrasiP5 || ''}`
    ).join('\n\n---\n\n');
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

export default function EditSemesterProgramPage() {
  const router = useRouter();
  const params = useParams();
  const { id: promesId } = params;
  const { user } = useAuth();
  const { toast } = useToast();
  const { availableCurriculums } = useCurriculum();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<SemesterProgram & PromesFormState>>({});
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumFramework>("Kurikulum Merdeka");
  const [schoolEducationLevel, setSchoolEducationLevel] = useState<EducationLevel | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login"); 
      return;
    }
    if (promesId && typeof window !== 'undefined') {
      const storedPrograms = localStorage.getItem(SEMESTER_PROGRAMS_STORAGE_KEY);
      if (storedPrograms) {
        const programs: SemesterProgram[] = JSON.parse(storedPrograms);
        const programToEdit = programs.find(p => p.id === promesId);
        if (programToEdit) {
           const canEdit = user.role === "Admin" || user.role === "WakaKurikulum" || (user.role === "Guru" && programToEdit.createdByUserId === user.id);
           if (!canEdit) {
            toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit Promes ini.", variant: "destructive" });
            router.push("/semester-programs");
            return;
          }
          setFormData({
            ...programToEdit,
            capaianPembelajaranUmum_textarea: programToEdit.capaianPembelajaranUmum || '',
            alokasiWaktuTotalSemester_input: programToEdit.alokasiWaktuTotalSemester || '',
            komponenMingguan_textarea: formatWeeklyUnitsToString(programToEdit.komponenMingguan || []),
          });
          setSelectedCurriculum(programToEdit.curriculumType);
          addLog("INFO", `Memuat Promes "${programToEdit.title}" (ID: ${promesId}) untuk diedit oleh ${user.email}.`, "EditSemesterProgramPage");
        } else {
          toast({ title: "Promes Tidak Ditemukan", description: "Program semester yang Anda cari tidak ada.", variant: "destructive" });
          router.push("/semester-programs");
        }
      }
      const storedSchoolProfile = localStorage.getItem(SCHOOL_PROFILE_STORAGE_KEY);
      if (storedSchoolProfile) {
        try {
          const parsedProfile: SchoolProfile = JSON.parse(storedSchoolProfile);
          setSchoolEducationLevel(parsedProfile.jenjangPendidikan);
        } catch (e) {
          console.error("Failed to parse school profile for grade levels", e);
        }
      }
      setIsLoadingData(false);
    }
  }, [promesId, user, router, toast, addLog]);

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
        const newFormData: Partial<SemesterProgram & PromesFormState> = {
            ...prev,
            curriculumType: newCurriculum,
            gradeLevel: '', 
        };
        newFormData.capaianPembelajaranUmum_textarea = '';
        newFormData.komponenMingguan_textarea = ''; 
        newFormData.capaianPembelajaranUmum = '';
        newFormData.komponenMingguan = [];
        return newFormData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGenerateWithAI = async () => {
    const source = `EditSemesterProgramPage-AI`;
    if (!formData.gradeLevel || !selectedCurriculum || !formData.subject || !formData.year || !formData.semester) {
         toast({
            title: "Informasi Kurang",
            description: `Harap isi Jenis Kurikulum, Mata Pelajaran, Jenjang, Tahun Ajaran, dan Semester terlebih dahulu untuk menggunakan AI.`,
            variant: "destructive",
         });
         addLog("WARN", `Gagal membuat draf Promes dengan AI: Informasi kurang. Promes ID: ${promesId}`, source);
         return;
    }

    setIsGeneratingAI(true);
    addLog("INFO", `Memulai pembuatan draf Promes dengan AI untuk Promes ID: ${promesId}. Kurikulum: ${selectedCurriculum}. Jenjang: "${formData.gradeLevel}". Mapel: "${formData.subject}". Tahun: "${formData.year}". Semester: "${formData.semester}". Input CP/SK-KD: ${formData.capaianPembelajaranUmum_textarea || 'Tidak ada'}`, source);
    try {
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
            capaianPembelajaranUmum: result.capaianPembelajaranUmum || '', 
            capaianPembelajaranUmum_textarea: result.capaianPembelajaranUmum || '', 
            alokasiWaktuTotalSemester_input: result.alokasiWaktuTotalSemester || '',
            komponenMingguan_textarea: formatWeeklyUnitsToString(result.komponenMingguan || []),
        }));
        toast({ title: "Konten Promes Diperbarui oleh AI!", description: "AI telah memperbarui draf konten. Silakan tinjau." });
        addLog("INFO", `Konten Promes ID: ${promesId} berhasil diperbarui AI. Judul baru mungkin: "${result.title}".`, source);
    } catch (error) {
      console.error(`Error generating Promes with AI:`, error);
      toast({
        title: `Pembuatan AI Promes Gagal`,
        description: "Tidak dapat menghasilkan konten. Silakan coba lagi.",
        variant: "destructive",
      });
      addLog("ERROR", `Gagal membuat draf Promes dengan AI untuk ID ${promesId}. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, source);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const updatedSemesterProgram: SemesterProgram = {
      ...formData,
      id: promesId as string,
      type: 'Promes',
      curriculumType: selectedCurriculum,
      capaianPembelajaranUmum: formData.capaianPembelajaranUmum_textarea || '',
      alokasiWaktuTotalSemester: formData.alokasiWaktuTotalSemester_input || '',
      komponenMingguan: parsePromesKomponenMingguan(formData.komponenMingguan_textarea),
      updatedAt: new Date().toISOString(),
    } as SemesterProgram;

    try {
      const existingPrograms = JSON.parse(localStorage.getItem(SEMESTER_PROGRAMS_STORAGE_KEY) || "[]") as SemesterProgram[];
      const updatedPrograms = existingPrograms.map(p => p.id === promesId ? updatedSemesterProgram : p);
      localStorage.setItem(SEMESTER_PROGRAMS_STORAGE_KEY, JSON.stringify(updatedPrograms));
      toast({ title: "Promes Diperbarui", description: `"${updatedSemesterProgram.title}" telah berhasil diperbarui.` });
      addLog("INFO", `Promes "${updatedSemesterProgram.title}" (ID: ${promesId}) berhasil diperbarui oleh ${user?.email}.`, "EditSemesterProgramPage");
      router.push("/semester-programs");
    } catch (error) {
      toast({ title: "Gagal Memperbarui", description: "Terjadi kesalahan saat memperbarui Promes.", variant: "destructive" });
      addLog("ERROR", `Gagal memperbarui Promes "${updatedSemesterProgram.title}" (ID: ${promesId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditSemesterProgramPage");
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus Promes "${formData.title}"?`)) {
      try {
        const existingPrograms = JSON.parse(localStorage.getItem(SEMESTER_PROGRAMS_STORAGE_KEY) || "[]") as SemesterProgram[];
        const updatedPrograms = existingPrograms.filter(p => p.id !== promesId);
        localStorage.setItem(SEMESTER_PROGRAMS_STORAGE_KEY, JSON.stringify(updatedPrograms));
        toast({ title: "Promes Dihapus", description: `"${formData.title}" telah berhasil dihapus.` });
        addLog("WARN", `Promes "${formData.title}" (ID: ${promesId}) dihapus oleh ${user?.email}.`, "EditSemesterProgramPage");
        router.push("/semester-programs");
      } catch (error) {
        toast({ title: "Gagal Menghapus", description: "Terjadi kesalahan saat menghapus Promes.", variant: "destructive" });
        addLog("ERROR", `Gagal menghapus Promes "${formData.title}" (ID: ${promesId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditSemesterProgramPage");
      }
    }
  };
  
  if (isLoadingData || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <CalendarClock className="h-12 w-12 animate-pulse text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Memuat data Promes...</p>
          <p className="text-sm text-muted-foreground">Mohon tunggu sebentar.</p>
        </div>
      </div>
    );
  }

  if (!formData.id) { 
      return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-destructive text-lg">Promes tidak ditemukan atau gagal dimuat.</p>
        </div>
    );
  }


  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Edit Program Semester</CardTitle>
                <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1 truncate max-w-md sm:max-w-lg md:max-w-xl">
                  {formData.title || "Memuat judul..."}
                </CardDescription>
              </div>
            </div>
             <Button variant="destructive" onClick={handleDelete} className="w-full mt-2 sm:mt-0 sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" /> Hapus Promes Ini
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <SemesterProgramFormFields
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              selectedCurriculum={selectedCurriculum}
              availableCurriculums={availableCurriculums}
              isGeneratingAI={isGeneratingAI}
              handleGenerateWithAI={handleGenerateWithAI}
              userRole={user.role}
              schoolEducationLevel={schoolEducationLevel}
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || isGeneratingAI} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                {isSubmitting ? <CalendarClock className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

