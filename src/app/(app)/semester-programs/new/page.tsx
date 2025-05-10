
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SemesterProgram, WeeklyUnit, CurriculumFramework } from "@/types";
import { SemesterProgramFormFields } from "@/components/curriculum/SemesterProgramFormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurriculum } from "@/contexts/CurriculumContext";
import { useLog } from "@/contexts/LogContext";
import { generateSemesterProgram, type GenerateSemesterProgramInput, type GenerateSemesterProgramOutput } from "@/ai/flows/generate-semester-program";


const SEMESTER_PROGRAMS_STORAGE_KEY = "appSemesterPrograms";

const getInitialPromesData = (curriculum: CurriculumFramework): Partial<SemesterProgram & PromesFormState> => {
    return {
        type: 'Promes' as const, title: '', subject: '', gradeLevel: '', semester: '1', year: '',
        capaianPembelajaranUmum: '',
        alokasiWaktuTotalSemester: '',
        komponenMingguan: [],
        curriculumType: curriculum,
        // Textarea fields for form binding
        capaianPembelajaranUmum_textarea: '',
        alokasiWaktuTotalSemester_input: '',
        komponenMingguan_textarea: '',
    };
};


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


export default function NewSemesterProgramPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { defaultCurriculum, availableCurriculums } = useCurriculum();
  const { addLog } = useLog();

  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumFramework>(defaultCurriculum);
  const [formData, setFormData] = useState<Partial<SemesterProgram & PromesFormState>>(getInitialPromesData(defaultCurriculum));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (!user || !(user.role === "Admin" || user.role === "WakaKurikulum" || user.role === "Guru")) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk membuat Promes baru.", variant: "destructive" });
      router.push("/semester-programs");
    }
    setSelectedCurriculum(defaultCurriculum);
    setFormData(getInitialPromesData(defaultCurriculum));
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
        semester: prev.semester,
        // Set new curriculum type and specific fields
        ...getInitialPromesData(newCurriculum),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGenerateWithAI = async () => {
    const source = `NewSemesterProgramPage-AI`;
    if (!formData.gradeLevel || !selectedCurriculum || !formData.subject || !formData.year || !formData.semester) {
         toast({
            title: "Informasi Kurang",
            description: `Harap isi Jenis Kurikulum, Mata Pelajaran, Jenjang, Tahun Ajaran, dan Semester terlebih dahulu untuk menggunakan AI.`,
            variant: "destructive",
         });
         addLog("WARN", `Gagal membuat draf Promes dengan AI: Informasi kurang.`, source);
         return;
    }

    setIsGeneratingAI(true);
    addLog("INFO", `Memulai pembuatan draf Promes dengan AI. Kurikulum: ${selectedCurriculum}. Jenjang: "${formData.gradeLevel}". Mapel: "${formData.subject}". Tahun: "${formData.year}". Semester: "${formData.semester}". Input CP/SK-KD: ${formData.capaianPembelajaranUmum_textarea || 'Tidak ada'}`, source);
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
            title: result.title || prev.title || `Promes ${formData.subject} ${formData.gradeLevel} Sem ${formData.semester} ${formData.year}`,
            capaianPembelajaranUmum: result.capaianPembelajaranUmum || '', 
            capaianPembelajaranUmum_textarea: result.capaianPembelajaranUmum || '',
            alokasiWaktuTotalSemester_input: result.alokasiWaktuTotalSemester || '',
            komponenMingguan_textarea: formatWeeklyUnitsToString(result.komponenMingguan || []),
        }));
        toast({ title: "Konten Promes Dihasilkan!", description: "AI telah membuat draf konten. Silakan tinjau." });
        addLog("INFO", `Konten Promes berhasil dibuat AI. Judul: "${result.title}".`, source);
    } catch (error) {
      console.error(`Error generating Promes with AI:`, error);
      toast({
        title: `Pembuatan AI Promes Gagal`,
        description: "Tidak dapat menghasilkan konten. Silakan coba lagi.",
        variant: "destructive",
      });
      addLog("ERROR", `Gagal membuat draf Promes dengan AI. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, source);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const newSemesterProgram: SemesterProgram = {
      id: `promes-${Date.now()}`,
      type: 'Promes',
      title: formData.title || '',
      subject: formData.subject || '',
      gradeLevel: formData.gradeLevel || '',
      curriculumType: selectedCurriculum,
      semester: formData.semester || '1',
      year: formData.year || '',
      capaianPembelajaranUmum: formData.capaianPembelajaranUmum_textarea || '',
      alokasiWaktuTotalSemester: formData.alokasiWaktuTotalSemester_input || '',
      komponenMingguan: parsePromesKomponenMingguan(formData.komponenMingguan_textarea),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: user?.id,
    };

    try {
      const existingPrograms = JSON.parse(localStorage.getItem(SEMESTER_PROGRAMS_STORAGE_KEY) || "[]") as SemesterProgram[];
      localStorage.setItem(SEMESTER_PROGRAMS_STORAGE_KEY, JSON.stringify([newSemesterProgram, ...existingPrograms]));
      toast({ title: "Promes Dibuat", description: `"${newSemesterProgram.title}" telah berhasil disimpan.` });
      addLog("INFO", `Promes baru "${newSemesterProgram.title}" berhasil dibuat oleh ${user?.email}.`, "NewSemesterProgramPage");
      router.push("/semester-programs");
    } catch (error) {
      toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan Promes.", variant: "destructive" });
      addLog("ERROR", `Gagal menyimpan Promes baru "${newSemesterProgram.title}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "NewSemesterProgramPage");
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <CalendarClock className="h-12 w-12 animate-pulse text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Memuat...</p>
          <p className="text-sm text-muted-foreground">Mohon tunggu sebentar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CalendarClock className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Buat Program Semester Baru (Promes)</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Rancang kurikulum Anda untuk semester tertentu.
              </CardDescription>
            </div>
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
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || isGeneratingAI} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                {isSubmitting ? <CalendarClock className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Promes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
