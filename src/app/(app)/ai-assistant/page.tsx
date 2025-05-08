
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Wand2, BookPlus, ListPlus, CalendarDays, CalendarClock } from "lucide-react"; // Added BookPlus, ListPlus
import { generateLessonPlanFromTopic, type GenerateLessonPlanOutput, type GenerateLessonPlanInput } from "@/ai/flows/generate-lesson-plan-from-topic";
import { suggestLessonPlanImprovements, type SuggestLessonPlanImprovementsOutput, type SuggestLessonPlanImprovementsInput } from "@/ai/flows/suggest-lesson-plan-improvements";
import { generateAnnualProgram, type GenerateAnnualProgramOutput, type GenerateAnnualProgramInput } from "@/ai/flows/generate-annual-program";
import { generateSemesterProgram, type GenerateSemesterProgramOutput, type GenerateSemesterProgramInput } from "@/ai/flows/generate-semester-program";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLog } from "@/contexts/LogContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const NO_GRADE_LEVEL_VALUE = "__none__";

export default function AIAssistantPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addLog } = useLog();

  // RPP Generation State
  const [rppTopic, setRppTopic] = useState("");
  const [rppGradeLevel, setRppGradeLevel] = useState("");
  const [generatedRpp, setGeneratedRpp] = useState<GenerateLessonPlanOutput | null>(null);
  const [isGeneratingRpp, setIsGeneratingRpp] = useState(false);

  // RPP Improvement State
  const [draftRpp, setDraftRpp] = useState("");
  const [improvementRppGradeLevel, setImprovementRppGradeLevel] = useState("");
  const [suggestedRppImprovements, setSuggestedRppImprovements] = useState<SuggestLessonPlanImprovementsOutput | null>(null);
  const [isSuggestingRppImprovements, setIsSuggestingRppImprovements] = useState(false);

  // PROTA Generation State
  const [protaSubject, setProtaSubject] = useState("");
  const [protaGradeLevel, setProtaGradeLevel] = useState("");
  const [protaYear, setProtaYear] = useState("");
  const [generatedProta, setGeneratedProta] = useState<GenerateAnnualProgramOutput | null>(null);
  const [isGeneratingProta, setIsGeneratingProta] = useState(false);

  // Promes Generation State
  const [promesSubject, setPromesSubject] = useState("");
  const [promesGradeLevel, setPromesGradeLevel] = useState("");
  const [promesYear, setPromesYear] = useState("");
  const [promesSemester, setPromesSemester] = useState<"1" | "2">("1");
  const [promesCapaian, setPromesCapaian] = useState("");
  const [generatedPromes, setGeneratedPromes] = useState<GenerateSemesterProgramOutput | null>(null);
  const [isGeneratingPromes, setIsGeneratingPromes] = useState(false);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    if (user) {
      addLog("INFO", `Pengguna ${user.email} mengakses halaman Asisten AI.`, "AIAssistantPage");
    }
  }, [user, addLog]);

  const handleGenerateRpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rppTopic || !rppGradeLevel) {
      toast({ title: "Informasi Kurang", description: "Harap berikan topik dan jenjang/fase untuk RPP.", variant: "destructive" });
      addLog("WARN", `Gagal membuat Modul Ajar: Topik atau Jenjang tidak diisi. Topik: '${rppTopic}', Jenjang: '${rppGradeLevel}'.`, "AIAssistantPage-RPP");
      return;
    }
    setIsGeneratingRpp(true);
    setGeneratedRpp(null);
    addLog("INFO", `Memulai pembuatan Modul Ajar (RPP) dengan AI. Topik: "${rppTopic}", Jenjang: "${rppGradeLevel}".`, "AIAssistantPage-RPP");
    try {
      const input: GenerateLessonPlanInput = { topic: rppTopic, jenjangFaseKelas: rppGradeLevel };
      const result = await generateLessonPlanFromTopic(input);
      setGeneratedRpp(result);
      toast({ title: "Modul Ajar (RPP) Dihasilkan!", description: "AI telah membuat draf Modul Ajar untuk Anda." });
      addLog("INFO", `Modul Ajar (RPP) berhasil dibuat oleh AI untuk topik: "${rppTopic}". Judul: "${result.title}".`, "AIAssistantPage-RPP");
    } catch (error) {
      console.error("Error generating RPP:", error);
      toast({ title: "Pembuatan RPP Gagal", description: "Tidak dapat membuat RPP. Silakan coba lagi.", variant: "destructive" });
      addLog("ERROR", `Gagal membuat Modul Ajar (RPP) dengan AI untuk topik: "${rppTopic}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "AIAssistantPage-RPP");
    } finally {
      setIsGeneratingRpp(false);
    }
  };

  const handleSuggestRppImprovements = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftRpp) {
      toast({ title: "Informasi Kurang", description: "Harap berikan draf Modul Ajar (RPP).", variant: "destructive" });
      addLog("WARN", `Gagal memberi saran perbaikan RPP: Draf tidak diisi. Jenjang: '${improvementRppGradeLevel}'.`, "AIAssistantPage-RPPImprove");
      return;
    }
    setIsSuggestingRppImprovements(true);
    setSuggestedRppImprovements(null);
    addLog("INFO", `Memulai pemberian saran perbaikan Modul Ajar (RPP) dengan AI. Jenjang: "${improvementRppGradeLevel === NO_GRADE_LEVEL_VALUE ? 'Umum' : improvementRppGradeLevel}". Draf: ${draftRpp.substring(0, 50)}...`, "AIAssistantPage-RPPImprove");
    try {
      const input: SuggestLessonPlanImprovementsInput = {
        lessonPlan: draftRpp,
        jenjangFaseKelas: improvementRppGradeLevel === NO_GRADE_LEVEL_VALUE ? undefined : improvementRppGradeLevel
      };
      const result = await suggestLessonPlanImprovements(input);
      setSuggestedRppImprovements(result);
      toast({ title: "Saran Perbaikan RPP Siap!", description: "AI telah memberikan saran perbaikan." });
      addLog("INFO", `Saran perbaikan Modul Ajar (RPP) berhasil diberikan oleh AI. Jenjang: "${improvementRppGradeLevel === NO_GRADE_LEVEL_VALUE ? 'Umum' : improvementRppGradeLevel}".`, "AIAssistantPage-RPPImprove");
    } catch (error) {
      console.error("Error suggesting RPP improvements:", error);
      toast({ title: "Pemberian Saran RPP Gagal", description: "Tidak dapat memperoleh saran. Silakan coba lagi.", variant: "destructive" });
      addLog("ERROR", `Gagal memberi saran perbaikan Modul Ajar (RPP) dengan AI. Jenjang: "${improvementRppGradeLevel === NO_GRADE_LEVEL_VALUE ? 'Umum' : improvementRppGradeLevel}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "AIAssistantPage-RPPImprove");
    } finally {
      setIsSuggestingRppImprovements(false);
    }
  };

  const handleGenerateProta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protaSubject || !protaGradeLevel || !protaYear) {
      toast({ title: "Informasi Kurang", description: "Harap isi Mata Pelajaran, Jenjang, dan Tahun Ajaran untuk PROTA.", variant: "destructive" });
      addLog("WARN", `Gagal membuat PROTA: Informasi kurang. Mapel: '${protaSubject}', Jenjang: '${protaGradeLevel}', Tahun: '${protaYear}'.`, "AIAssistantPage-PROTA");
      return;
    }
    setIsGeneratingProta(true);
    setGeneratedProta(null);
    addLog("INFO", `Memulai pembuatan PROTA dengan AI. Mapel: "${protaSubject}", Jenjang: "${protaGradeLevel}", Tahun: "${protaYear}".`, "AIAssistantPage-PROTA");
    try {
      const input: GenerateAnnualProgramInput = { subject: protaSubject, jenjangFaseKelas: protaGradeLevel, year: protaYear };
      const result = await generateAnnualProgram(input);
      setGeneratedProta(result);
      toast({ title: "PROTA Dihasilkan!", description: "AI telah membuat draf PROTA untuk Anda." });
      addLog("INFO", `PROTA berhasil dibuat oleh AI. Judul: "${result.title}".`, "AIAssistantPage-PROTA");
    } catch (error) {
      console.error("Error generating PROTA:", error);
      toast({ title: "Pembuatan PROTA Gagal", description: "Tidak dapat membuat PROTA. Silakan coba lagi.", variant: "destructive" });
      addLog("ERROR", `Gagal membuat PROTA dengan AI. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "AIAssistantPage-PROTA");
    } finally {
      setIsGeneratingProta(false);
    }
  };

  const handleGeneratePromes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promesSubject || !promesGradeLevel || !promesYear || !promesSemester) {
      toast({ title: "Informasi Kurang", description: "Harap isi Mata Pelajaran, Jenjang, Tahun Ajaran, dan Semester untuk Promes.", variant: "destructive" });
      addLog("WARN", `Gagal membuat Promes: Informasi kurang. Mapel: '${promesSubject}', Jenjang: '${promesGradeLevel}', Tahun: '${promesYear}', Semester: '${promesSemester}'.`, "AIAssistantPage-Promes");
      return;
    }
    setIsGeneratingPromes(true);
    setGeneratedPromes(null);
    addLog("INFO", `Memulai pembuatan Promes dengan AI. Mapel: "${promesSubject}", Jenjang: "${promesGradeLevel}", Tahun: "${promesYear}", Semester: "${promesSemester}".`, "AIAssistantPage-Promes");
    try {
      const input: GenerateSemesterProgramInput = {
        subject: promesSubject,
        jenjangFaseKelas: promesGradeLevel,
        year: promesYear,
        semester: promesSemester,
        capaianPembelajaranUmumInput: promesCapaian || undefined,
      };
      const result = await generateSemesterProgram(input);
      setGeneratedPromes(result);
      toast({ title: "Program Semester (Promes) Dihasilkan!", description: "AI telah membuat draf Promes untuk Anda." });
      addLog("INFO", `Promes berhasil dibuat oleh AI. Judul: "${result.title}".`, "AIAssistantPage-Promes");
    } catch (error) {
      console.error("Error generating Promes:", error);
      toast({ title: "Pembuatan Promes Gagal", description: "Tidak dapat membuat Promes. Silakan coba lagi.", variant: "destructive" });
      addLog("ERROR", `Gagal membuat Promes dengan AI. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "AIAssistantPage-Promes");
    } finally {
      setIsGeneratingPromes(false);
    }
  };


  if (!isClient || !user) {
    return (
      <div className="space-y-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Memuat Asisten AI...</CardTitle>
          </CardHeader>
          <CardContent>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 inline-block">Silakan tunggu...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 md:py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Asisten AI Kurikulum Merdeka</CardTitle>
              <CardDescription className="text-base md:text-lg">
                Manfaatkan AI untuk membuat atau menyempurnakan berbagai dokumen perencanaan pembelajaran Anda.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="generate-rpp" className="w-full">
        <ScrollArea className="whitespace-nowrap">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="generate-rpp" className="text-xs sm:text-sm py-2.5"><Wand2 className="mr-1 sm:mr-2 h-4 w-4" />Buat RPP</TabsTrigger>
            <TabsTrigger value="improve-rpp" className="text-xs sm:text-sm py-2.5"><Sparkles className="mr-1 sm:mr-2 h-4 w-4" />Perbaiki RPP</TabsTrigger>
            <TabsTrigger value="generate-prota" className="text-xs sm:text-sm py-2.5"><CalendarDays className="mr-1 sm:mr-2 h-4 w-4" />Buat PROTA</TabsTrigger>
            <TabsTrigger value="generate-promes" className="text-xs sm:text-sm py-2.5"><CalendarClock className="mr-1 sm:mr-2 h-4 w-4" />Buat Promes</TabsTrigger>
          </TabsList>
        </ScrollArea>

        {/* Tab: Buat RPP (Modul Ajar) */}
        <TabsContent value="generate-rpp">
          <Card>
            <CardHeader>
              <CardTitle>Buat Draf Modul Ajar (RPP Plus)</CardTitle>
              <CardDescription>Masukkan topik dan jenjang/fase untuk membuat draf Modul Ajar sesuai Kurikulum Merdeka.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateRpp} className="space-y-4">
                <div>
                  <Label htmlFor="topic-generate-rpp">Topik Pembelajaran</Label>
                  <Input id="topic-generate-rpp" value={rppTopic} onChange={(e) => setRppTopic(e.target.value)} placeholder="cth., Perubahan Iklim dan Dampaknya" />
                </div>
                <div>
                  <Label htmlFor="gradeLevel-generate-rpp">Jenjang/Fase/Kelas</Label>
                  <Select value={rppGradeLevel} onValueChange={setRppGradeLevel}>
                    <SelectTrigger id="gradeLevel-generate-rpp"><SelectValue placeholder="Pilih Jenjang/Fase/Kelas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAUD">PAUD</SelectItem>
                      <SelectItem value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</SelectItem>
                      <SelectItem value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</SelectItem>
                      <SelectItem value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</SelectItem>
                      <SelectItem value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</SelectItem>
                      <SelectItem value="Fase E (Kelas 10 SMA/SMK)">Fase E (Kelas 10 SMA/SMK)</SelectItem>
                      <SelectItem value="Fase F (Kelas 11-12 SMA/SMK)">Fase F (Kelas 11-12 SMA/SMK)</SelectItem>
                      <SelectItem value="SLB">SLB (disesuaikan)</SelectItem>
                      <SelectItem value="Pendidikan Kesetaraan">Pendidikan Kesetaraan (Paket A/B/C)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isGeneratingRpp} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isGeneratingRpp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Buat Draf Modul Ajar (RPP)
                </Button>
              </form>
              {generatedRpp && (
                <Card className="mt-6 shadow-md">
                  <CardHeader><CardTitle className="text-xl text-primary">{generatedRpp.title}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><h4 className="font-semibold">Tujuan Pembelajaran:</h4><ul className="list-disc pl-5 text-sm space-y-1">{generatedRpp.learningObjectives.map((obj, i) => <li key={`obj-${i}`}>{obj}</li>)}</ul></div>
                    <div><h4 className="font-semibold">Pemahaman Bermakna:</h4><ul className="list-disc pl-5 text-sm space-y-1">{generatedRpp.pemahamanBermakna.map((pm, i) => <li key={`pm-${i}`}>{pm}</li>)}</ul></div>
                    <div><h4 className="font-semibold">Pertanyaan Pemantik:</h4><ul className="list-disc pl-5 text-sm space-y-1">{generatedRpp.pertanyaanPemantik.map((pp, i) => <li key={`pp-${i}`}>{pp}</li>)}</ul></div>
                    <div>
                        <h4 className="font-semibold">Langkah Pembelajaran:</h4>
                        <div className="pl-5 space-y-2 text-sm">
                            <div><h5 className="font-medium">Pendahuluan:</h5><ul className="list-disc pl-5 space-y-1">{generatedRpp.langkahPembelajaran.pendahuluan.map((act, i) => <li key={`pend-${i}`}>{act}</li>)}</ul></div>
                            <div><h5 className="font-medium">Kegiatan Inti:</h5><ul className="list-disc pl-5 space-y-1">{generatedRpp.langkahPembelajaran.kegiatanInti.map((act, i) => <li key={`inti-${i}`}>{act}</li>)}</ul></div>
                            <div><h5 className="font-medium">Penutup:</h5><ul className="list-disc pl-5 space-y-1">{generatedRpp.langkahPembelajaran.penutup.map((act, i) => <li key={`penutup-${i}`}>{act}</li>)}</ul></div>
                        </div>
                    </div>
                    <div><h4 className="font-semibold">Strategi Asesmen:</h4><ul className="list-disc pl-5 text-sm space-y-1">{generatedRpp.assessmentStrategies.map((idea, i) => <li key={`assess-${i}`}>{idea}</li>)}</ul></div>
                    <div><h4 className="font-semibold">Strategi Diferensiasi:</h4><ul className="list-disc pl-5 text-sm space-y-1">{generatedRpp.differentiationStrategies.map((strat, i) => <li key={`diff-${i}`}>{strat}</li>)}</ul></div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Perbaiki RPP (Modul Ajar) */}
        <TabsContent value="improve-rpp">
          <Card>
            <CardHeader>
              <CardTitle>Saran Perbaikan Modul Ajar (RPP)</CardTitle>
              <CardDescription>Tempel draf Modul Ajar Anda di bawah untuk mendapatkan saran perbaikan berbasis AI.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSuggestRppImprovements} className="space-y-4">
                <div>
                  <Label htmlFor="draftPlan-improve-rpp">Konten Draf Modul Ajar</Label>
                  <Textarea id="draftPlan-improve-rpp" value={draftRpp} onChange={(e) => setDraftRpp(e.target.value)} placeholder="Tempel teks Modul Ajar Anda di sini..." rows={10} className="text-sm" />
                </div>
                <div>
                  <Label htmlFor="gradeLevel-improve-rpp">Jenjang/Fase/Kelas (Opsional)</Label>
                  <Select value={improvementRppGradeLevel} onValueChange={setImprovementRppGradeLevel}>
                    <SelectTrigger id="gradeLevel-improve-rpp"><SelectValue placeholder="Pilih Jenjang/Fase/Kelas (jika spesifik)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_GRADE_LEVEL_VALUE}>Tidak Ada (Umum)</SelectItem>
                      <SelectItem value="PAUD">PAUD</SelectItem>
                      <SelectItem value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</SelectItem>
                      <SelectItem value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</SelectItem>
                      <SelectItem value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</SelectItem>
                      <SelectItem value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</SelectItem>
                      <SelectItem value="Fase E (Kelas 10 SMA/SMK)">Fase E (Kelas 10 SMA/SMK)</SelectItem>
                      <SelectItem value="Fase F (Kelas 11-12 SMA/SMK)">Fase F (Kelas 11-12 SMA/SMK)</SelectItem>
                      <SelectItem value="SLB">SLB (disesuaikan)</SelectItem>
                       <SelectItem value="Pendidikan Kesetaraan">Pendidikan Kesetaraan (Paket A/B/C)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Memberikan jenjang akan membantu AI memberikan saran yang lebih kontekstual.</p>
                </div>
                <Button type="submit" disabled={isSuggestingRppImprovements} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isSuggestingRppImprovements ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Dapatkan Saran Perbaikan RPP
                </Button>
              </form>
              {suggestedRppImprovements && (
                <Card className="mt-6 shadow-md">
                  <CardHeader><CardTitle className="text-xl text-primary">Saran Perbaikan RPP dari AI</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div><h4 className="font-semibold">Tujuan Pembelajaran/CP:</h4><p className="text-sm whitespace-pre-line">{suggestedRppImprovements.tujuanPembelajaran}</p></div>
                    <div><h4 className="font-semibold">Kegiatan Pembelajaran:</h4><p className="text-sm whitespace-pre-line">{suggestedRppImprovements.kegiatanPembelajaran}</p></div>
                    <div><h4 className="font-semibold">Asesmen:</h4><p className="text-sm whitespace-pre-line">{suggestedRppImprovements.asesmen}</p></div>
                    <div><h4 className="font-semibold">Pembelajaran Berdiferensiasi:</h4><p className="text-sm whitespace-pre-line">{suggestedRppImprovements.pembelajaranBerdiferensiasi}</p></div>
                    <div><h4 className="font-semibold">Integrasi Profil Pelajar Pancasila:</h4><p className="text-sm whitespace-pre-line">{suggestedRppImprovements.integrasiProfilPelajarPancasila}</p></div>
                    <div><h4 className="font-semibold">Penggunaan Media/Sumber Belajar:</h4><p className="text-sm whitespace-pre-line">{suggestedRppImprovements.penggunaanMediaSumberBelajar}</p></div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Buat PROTA */}
        <TabsContent value="generate-prota">
          <Card>
            <CardHeader>
              <CardTitle>Buat Draf Program Tahunan (PROTA)</CardTitle>
              <CardDescription>Masukkan informasi dasar untuk membuat draf PROTA sesuai Kurikulum Merdeka.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateProta} className="space-y-4">
                <div>
                  <Label htmlFor="subject-generate-prota">Mata Pelajaran / Tema Utama</Label>
                  <Input id="subject-generate-prota" value={protaSubject} onChange={(e) => setProtaSubject(e.target.value)} placeholder="cth., Matematika, Projek Penguatan Profil Pelajar Pancasila" />
                </div>
                <div>
                  <Label htmlFor="gradeLevel-generate-prota">Jenjang/Fase/Kelas</Label>
                  <Select value={protaGradeLevel} onValueChange={setProtaGradeLevel}>
                    <SelectTrigger id="gradeLevel-generate-prota"><SelectValue placeholder="Pilih Jenjang/Fase/Kelas" /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="PAUD">PAUD</SelectItem>
                      <SelectItem value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</SelectItem>
                      <SelectItem value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</SelectItem>
                      <SelectItem value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</SelectItem>
                      <SelectItem value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</SelectItem>
                      <SelectItem value="Fase E (Kelas 10 SMA/SMK)">Fase E (Kelas 10 SMA/SMK)</SelectItem>
                      <SelectItem value="Fase F (Kelas 11-12 SMA/SMK)">Fase F (Kelas 11-12 SMA/SMK)</SelectItem>
                       <SelectItem value="SLB">SLB (disesuaikan)</SelectItem>
                       <SelectItem value="Pendidikan Kesetaraan">Pendidikan Kesetaraan (Paket A/B/C)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year-generate-prota">Tahun Ajaran</Label>
                  <Input id="year-generate-prota" value={protaYear} onChange={(e) => setProtaYear(e.target.value)} placeholder="cth., 2024/2025" />
                </div>
                <Button type="submit" disabled={isGeneratingProta} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isGeneratingProta ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                  Buat Draf PROTA
                </Button>
              </form>
              {generatedProta && (
                <Card className="mt-6 shadow-md">
                  <CardHeader><CardTitle className="text-xl text-primary">{generatedProta.title}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {generatedProta.profilPelajarPancasilaFocus && generatedProta.profilPelajarPancasilaFocus.length > 0 && (
                        <div><h4 className="font-semibold">Fokus Profil Pelajar Pancasila:</h4><p className="text-sm">{generatedProta.profilPelajarPancasilaFocus.join(', ')}</p></div>
                    )}
                    <div>
                        <h4 className="font-semibold">Semester 1:</h4>
                        {generatedProta.semester1Components.length > 0 ? (
                            <ul className="list-disc pl-5 text-sm space-y-2">
                                {generatedProta.semester1Components.map((comp, i) => (
                                    <li key={`s1-${i}`}><strong>{comp.topic}</strong> ({comp.alokasiWaktu})<br/>
                                    <span className="text-xs text-muted-foreground">Elemen CP: {comp.elemenCapaianPembelajaran?.join(', ') || '-'}</span></li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">Tidak ada komponen untuk semester 1.</p>}
                    </div>
                     <div>
                        <h4 className="font-semibold">Semester 2:</h4>
                        {generatedProta.semester2Components.length > 0 ? (
                            <ul className="list-disc pl-5 text-sm space-y-2">
                                {generatedProta.semester2Components.map((comp, i) => (
                                    <li key={`s2-${i}`}><strong>{comp.topic}</strong> ({comp.alokasiWaktu})<br/>
                                    <span className="text-xs text-muted-foreground">Elemen CP: {comp.elemenCapaianPembelajaran?.join(', ') || '-'}</span></li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">Tidak ada komponen untuk semester 2.</p>}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Buat Promes */}
        <TabsContent value="generate-promes">
          <Card>
            <CardHeader>
              <CardTitle>Buat Draf Program Semester (Promes)</CardTitle>
              <CardDescription>Lengkapi informasi untuk membuat draf Promes sesuai Kurikulum Merdeka.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeneratePromes} className="space-y-4">
                <div>
                  <Label htmlFor="subject-generate-promes">Mata Pelajaran</Label>
                  <Input id="subject-generate-promes" value={promesSubject} onChange={(e) => setPromesSubject(e.target.value)} placeholder="cth., Bahasa Indonesia" />
                </div>
                <div>
                  <Label htmlFor="gradeLevel-generate-promes">Jenjang/Fase/Kelas</Label>
                  <Select value={promesGradeLevel} onValueChange={setPromesGradeLevel}>
                    <SelectTrigger id="gradeLevel-generate-promes"><SelectValue placeholder="Pilih Jenjang/Fase/Kelas" /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="PAUD">PAUD</SelectItem>
                      <SelectItem value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</SelectItem>
                      <SelectItem value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</SelectItem>
                      <SelectItem value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</SelectItem>
                      <SelectItem value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</SelectItem>
                      <SelectItem value="Fase E (Kelas 10 SMA/SMK)">Fase E (Kelas 10 SMA/SMK)</SelectItem>
                      <SelectItem value="Fase F (Kelas 11-12 SMA/SMK)">Fase F (Kelas 11-12 SMA/SMK)</SelectItem>
                       <SelectItem value="SLB">SLB (disesuaikan)</SelectItem>
                       <SelectItem value="Pendidikan Kesetaraan">Pendidikan Kesetaraan (Paket A/B/C)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor="year-generate-promes">Tahun Ajaran</Label>
                    <Input id="year-generate-promes" value={promesYear} onChange={(e) => setPromesYear(e.target.value)} placeholder="cth., 2024/2025" />
                    </div>
                    <div>
                    <Label htmlFor="semester-generate-promes">Semester</Label>
                    <Select value={promesSemester} onValueChange={(v) => setPromesSemester(v as "1" | "2")}>
                        <SelectTrigger id="semester-generate-promes"><SelectValue placeholder="Pilih Semester" /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="1">Ganjil (1)</SelectItem>
                        <SelectItem value="2">Genap (2)</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                <div>
                  <Label htmlFor="capaian-generate-promes">Capaian Pembelajaran Umum Semester (Opsional)</Label>
                  <Textarea id="capaian-generate-promes" value={promesCapaian} onChange={(e) => setPromesCapaian(e.target.value)} placeholder="Deskripsikan CP umum untuk semester ini..." rows={3}/>
                </div>
                <Button type="submit" disabled={isGeneratingPromes} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isGeneratingPromes ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-2 h-4 w-4" />}
                  Buat Draf Promes
                </Button>
              </form>
              {generatedPromes && (
                <Card className="mt-6 shadow-md">
                  <CardHeader><CardTitle className="text-xl text-primary">{generatedPromes.title}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><h4 className="font-semibold">Capaian Pembelajaran Umum:</h4><p className="text-sm">{generatedPromes.capaianPembelajaranUmum}</p></div>
                    <div><h4 className="font-semibold">Alokasi Waktu Total Semester:</h4><p className="text-sm">{generatedPromes.alokasiWaktuTotalSemester}</p></div>
                    <div>
                        <h4 className="font-semibold">Komponen Mingguan (Contoh):</h4>
                         {generatedPromes.komponenMingguan.length > 0 ? (
                            <div className="space-y-3">
                                {generatedPromes.komponenMingguan.map((unit, i) => (
                                <div key={`minggu-${i}`} className="p-3 border rounded-md bg-muted/30">
                                    <p className="font-medium text-sm">Minggu ke-{unit.mingguKe} {unit.bulan ? `(${unit.bulan})` : ''}</p>
                                    <p className="text-sm"><strong>Materi/TP:</strong> {unit.materiPokokAtauTujuanPembelajaran}</p>
                                    <p className="text-sm"><strong>Alokasi:</strong> {unit.alokasiWaktu}</p>
                                    {unit.metodeStrategi && unit.metodeStrategi.length > 0 && <p className="text-xs"><strong>Metode/Strategi:</strong> {unit.metodeStrategi.join(', ')}</p>}
                                    {unit.sumberBelajar && unit.sumberBelajar.length > 0 && <p className="text-xs"><strong>Sumber:</strong> {unit.sumberBelajar.join(', ')}</p>}
                                    {unit.rencanaAsesmen && unit.rencanaAsesmen.length > 0 && <p className="text-xs"><strong>Asesmen:</strong> {unit.rencanaAsesmen.join(', ')}</p>}
                                    {unit.catatanIntegrasiP5 && <p className="text-xs"><strong>P5:</strong> {unit.catatanIntegrasiP5}</p>}
                                </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-muted-foreground">Tidak ada komponen mingguan yang dihasilkan.</p>}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

