
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { generateLessonPlanFromTopic, type GenerateLessonPlanOutput, type GenerateLessonPlanInput } from "@/ai/flows/generate-lesson-plan-from-topic";
import { suggestLessonPlanImprovements, type SuggestLessonPlanImprovementsOutput, type SuggestLessonPlanImprovementsInput } from "@/ai/flows/suggest-lesson-plan-improvements";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLog } from "@/contexts/LogContext"; // Import useLog

const NO_GRADE_LEVEL_VALUE = "__none__";

export default function AIAssistantPage() {
  const { toast } = useToast();
  const { user } = useAuth(); 
  const { addLog } = useLog(); // Use LogContext
  
  // State for Lesson Plan Generation
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<GenerateLessonPlanOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for Improvement Suggestions
  const [draftPlan, setDraftPlan] = useState("");
  const [improvementGradeLevel, setImprovementGradeLevel] = useState(""); 
  const [suggestedImprovements, setSuggestedImprovements] = useState<SuggestLessonPlanImprovementsOutput | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    if(user) { // Log page access once client and user are confirmed
        addLog("INFO", `Pengguna ${user.email} mengakses halaman Asisten AI.`, "AIAssistantPage");
    }
  }, [user, addLog]); // Add addLog and user to dependencies


  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !gradeLevel) {
      toast({ title: "Informasi Kurang", description: "Harap berikan topik dan jenjang/fase.", variant: "destructive" });
      addLog("WARN", `Gagal membuat Modul Ajar: Topik atau Jenjang tidak diisi. Topik: '${topic}', Jenjang: '${gradeLevel}'.`, "AIAssistantPage");
      return;
    }
    setIsGenerating(true);
    setGeneratedPlan(null);
    addLog("INFO", `Memulai pembuatan Modul Ajar dengan AI. Topik: "${topic}", Jenjang: "${gradeLevel}".`, "AIAssistantPage");
    try {
      const input: GenerateLessonPlanInput = { topic, jenjangFaseKelas: gradeLevel };
      const result = await generateLessonPlanFromTopic(input);
      setGeneratedPlan(result);
      toast({ title: "Rencana Pembelajaran Dihasilkan!", description: "AI telah membuat draf rencana pembelajaran untuk Anda." });
      addLog("INFO", `Modul Ajar berhasil dibuat oleh AI untuk topik: "${topic}". Judul: "${result.title}".`, "AIAssistantPage");
    } catch (error) {
      console.error("Error generating lesson plan:", error);
      toast({ title: "Pembuatan Gagal", description: "Tidak dapat membuat rencana pembelajaran. Silakan coba lagi.", variant: "destructive" });
      addLog("ERROR", `Gagal membuat Modul Ajar dengan AI untuk topik: "${topic}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "AIAssistantPage");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestImprovements = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftPlan) {
      toast({ title: "Informasi Kurang", description: "Harap berikan draf rencana pembelajaran.", variant: "destructive" });
      addLog("WARN", `Gagal memberi saran perbaikan: Draf Modul Ajar tidak diisi. Jenjang: '${improvementGradeLevel}'.`, "AIAssistantPage");
      return;
    }
    setIsSuggesting(true);
    setSuggestedImprovements(null);
    addLog("INFO", `Memulai pemberian saran perbaikan Modul Ajar dengan AI. Jenjang: "${improvementGradeLevel === NO_GRADE_LEVEL_VALUE ? 'Umum' : improvementGradeLevel}". Draf: ${draftPlan.substring(0,50)}...`, "AIAssistantPage");
    try {
      const input: SuggestLessonPlanImprovementsInput = { 
        lessonPlan: draftPlan,
        jenjangFaseKelas: improvementGradeLevel === NO_GRADE_LEVEL_VALUE ? undefined : improvementGradeLevel 
      };
      const result = await suggestLessonPlanImprovements(input);
      setSuggestedImprovements(result);
      toast({ title: "Saran Siap!", description: "AI telah memberikan saran perbaikan." });
      addLog("INFO", `Saran perbaikan Modul Ajar berhasil diberikan oleh AI. Jenjang: "${improvementGradeLevel === NO_GRADE_LEVEL_VALUE ? 'Umum' : improvementGradeLevel}".`, "AIAssistantPage");
    } catch (error) {
      console.error("Error suggesting improvements:", error);
      toast({ title: "Pemberian Saran Gagal", description: "Tidak dapat memperoleh saran. Silakan coba lagi.", variant: "destructive" });
      addLog("ERROR", `Gagal memberi saran perbaikan Modul Ajar dengan AI. Jenjang: "${improvementGradeLevel === NO_GRADE_LEVEL_VALUE ? 'Umum' : improvementGradeLevel}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "AIAssistantPage");
    } finally {
      setIsSuggesting(false);
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
                Manfaatkan AI untuk membuat atau menyempurnakan Modul Ajar Anda.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
          <TabsTrigger value="generate" className="text-xs sm:text-sm"><Wand2 className="mr-1 sm:mr-2 h-4 w-4 inline-block" />Buat Modul Ajar Baru</TabsTrigger>
          <TabsTrigger value="improve" className="text-xs sm:text-sm"><Sparkles className="mr-1 sm:mr-2 h-4 w-4 inline-block" />Perbaiki Modul Ajar</TabsTrigger>
        </TabsList>
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Buat Draf Modul Ajar (RPP Plus)</CardTitle>
              <CardDescription>Masukkan topik dan jenjang/fase untuk membuat draf Modul Ajar sesuai Kurikulum Merdeka.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeneratePlan} className="space-y-4">
                <div>
                  <Label htmlFor="topic-generate">Topik Pembelajaran</Label>
                  <Input id="topic-generate" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="cth., Perubahan Iklim dan Dampaknya" />
                </div>
                <div>
                  <Label htmlFor="gradeLevel-generate">Jenjang/Fase/Kelas</Label>
                  <Select value={gradeLevel} onValueChange={setGradeLevel}>
                    <SelectTrigger id="gradeLevel-generate">
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
                       <SelectItem value="Pendidikan Kesetaraan">Pendidikan Kesetaraan (Paket A/B/C)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isGenerating} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Buat Draf Modul Ajar
                </Button>
              </form>
              {generatedPlan && (
                <Card className="mt-6 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">{generatedPlan.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-base">Tujuan Pembelajaran:</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {generatedPlan.learningObjectives.map((obj, i) => <li key={`obj-${i}`}>{obj}</li>)}
                      </ul>
                    </div>
                     <div>
                      <h4 className="font-semibold text-base">Pemahaman Bermakna:</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {generatedPlan.pemahamanBermakna.map((pm, i) => <li key={`pm-${i}`}>{pm}</li>)}
                      </ul>
                    </div>
                     <div>
                      <h4 className="font-semibold text-base">Pertanyaan Pemantik:</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {generatedPlan.pertanyaanPemantik.map((pp, i) => <li key={`pp-${i}`}>{pp}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Langkah-langkah Pembelajaran:</h4>
                      <div className="pl-5 space-y-2 text-sm">
                        <div>
                          <h5 className="font-medium">Pendahuluan:</h5>
                          <ul className="list-disc pl-5 space-y-1">
                            {generatedPlan.langkahPembelajaran.pendahuluan.map((act, i) => <li key={`pend-${i}`}>{act}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium">Kegiatan Inti:</h5>
                          <ul className="list-disc pl-5 space-y-1">
                            {generatedPlan.langkahPembelajaran.kegiatanInti.map((act, i) => <li key={`inti-${i}`}>{act}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium">Penutup:</h5>
                          <ul className="list-disc pl-5 space-y-1">
                            {generatedPlan.langkahPembelajaran.penutup.map((act, i) => <li key={`penutup-${i}`}>{act}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                     <div>
                      <h4 className="font-semibold text-base">Strategi Asesmen:</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {generatedPlan.assessmentStrategies.map((idea, i) => <li key={`assess-${i}`}>{idea}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Strategi Diferensiasi:</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {generatedPlan.differentiationStrategies.map((strat, i) => <li key={`diff-${i}`}>{strat}</li>)}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="improve">
          <Card>
            <CardHeader>
              <CardTitle>Saran Perbaikan Modul Ajar</CardTitle>
              <CardDescription>Tempel draf Modul Ajar Anda di bawah untuk mendapatkan saran perbaikan berbasis AI sesuai Kurikulum Merdeka.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSuggestImprovements} className="space-y-4">
                <div>
                  <Label htmlFor="draftPlan-improve">Konten Draf Modul Ajar</Label>
                  <Textarea
                    id="draftPlan-improve"
                    value={draftPlan}
                    onChange={(e) => setDraftPlan(e.target.value)}
                    placeholder="Tempel teks Modul Ajar Anda di sini..."
                    rows={10}
                    className="text-sm"
                  />
                </div>
                 <div>
                  <Label htmlFor="gradeLevel-improve">Jenjang/Fase/Kelas (Opsional)</Label>
                  <Select value={improvementGradeLevel} onValueChange={setImprovementGradeLevel}>
                    <SelectTrigger id="gradeLevel-improve">
                      <SelectValue placeholder="Pilih Jenjang/Fase/Kelas (jika spesifik)" />
                    </SelectTrigger>
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
                <Button type="submit" disabled={isSuggesting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Dapatkan Saran Perbaikan
                </Button>
              </form>
              {suggestedImprovements && (
                <Card className="mt-6 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">Saran Perbaikan dari AI</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-base">Tujuan Pembelajaran/CP:</h4>
                      <p className="text-sm whitespace-pre-line">{suggestedImprovements.tujuanPembelajaran}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Kegiatan Pembelajaran:</h4>
                      <p className="text-sm whitespace-pre-line">{suggestedImprovements.kegiatanPembelajaran}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Asesmen:</h4>
                      <p className="text-sm whitespace-pre-line">{suggestedImprovements.asesmen}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Pembelajaran Berdiferensiasi:</h4>
                      <p className="text-sm whitespace-pre-line">{suggestedImprovements.pembelajaranBerdiferensiasi}</p>
                    </div>
                     <div>
                      <h4 className="font-semibold text-base">Integrasi Profil Pelajar Pancasila:</h4>
                      <p className="text-sm whitespace-pre-line">{suggestedImprovements.integrasiProfilPelajarPancasila}</p>
                    </div>
                     <div>
                      <h4 className="font-semibold text-base">Penggunaan Media/Sumber Belajar:</h4>
                      <p className="text-sm whitespace-pre-line">{suggestedImprovements.penggunaanMediaSumberBelajar}</p>
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
