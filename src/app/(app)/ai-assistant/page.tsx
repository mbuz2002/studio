"use client";

import { useState } from "react";
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


export default function AIAssistantPage() {
  const { toast } = useToast();
  
  // State for Lesson Plan Generation
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<GenerateLessonPlanOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for Improvement Suggestions
  const [draftPlan, setDraftPlan] = useState("");
  const [suggestedImprovements, setSuggestedImprovements] = useState<SuggestLessonPlanImprovementsOutput | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !gradeLevel) {
      toast({ title: "Informasi Kurang", description: "Harap berikan topik dan jenjang/fase.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setGeneratedPlan(null);
    try {
      const input: GenerateLessonPlanInput = { topic, gradeLevel };
      const result = await generateLessonPlanFromTopic(input);
      setGeneratedPlan(result);
      toast({ title: "Rencana Pembelajaran Dihasilkan!", description: "AI telah membuat draf rencana pembelajaran untuk Anda." });
    } catch (error) {
      console.error("Error generating lesson plan:", error);
      toast({ title: "Pembuatan Gagal", description: "Tidak dapat membuat rencana pembelajaran. Silakan coba lagi.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestImprovements = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftPlan) {
      toast({ title: "Informasi Kurang", description: "Harap berikan draf rencana pembelajaran.", variant: "destructive" });
      return;
    }
    setIsSuggesting(true);
    setSuggestedImprovements(null);
    try {
      const input: SuggestLessonPlanImprovementsInput = { lessonPlan: draftPlan };
      const result = await suggestLessonPlanImprovements(input);
      setSuggestedImprovements(result);
      toast({ title: "Saran Siap!", description: "AI telah memberikan saran perbaikan." });
    } catch (error) {
      console.error("Error suggesting improvements:", error);
      toast({ title: "Pemberian Saran Gagal", description: "Tidak dapat memperoleh saran. Silakan coba lagi.", variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-8 py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">Asisten AI</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Manfaatkan AI untuk memulai perencanaan pembelajaran Anda atau meningkatkan materi yang sudah ada.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate"><Wand2 className="mr-2 h-4 w-4 inline-block" />Buat Rencana Baru</TabsTrigger>
          <TabsTrigger value="improve"><Sparkles className="mr-2 h-4 w-4 inline-block" />Perbaiki Rencana Yang Ada</TabsTrigger>
        </TabsList>
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Buat Rencana Pembelajaran</CardTitle>
              <CardDescription>Berikan topik dan jenjang/fase untuk membuat draf rencana pembelajaran.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeneratePlan} className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topik</Label>
                  <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="cth., Tata Surya" />
                </div>
                <div>
                  <Label htmlFor="gradeLevel-ai">Jenjang/Fase/Kelas</Label>
                  <Select value={gradeLevel} onValueChange={setGradeLevel}>
                    <SelectTrigger id="gradeLevel-ai">
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
                       <SelectItem value="Perguruan Tinggi">Perguruan Tinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isGenerating} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Buat Rencana
                </Button>
              </form>
              {generatedPlan && (
                <div className="mt-6 space-y-4 rounded-md border p-4 bg-secondary/50">
                  <h3 className="text-xl font-semibold text-primary">{generatedPlan.title}</h3>
                  <div>
                    <h4 className="font-semibold">Tujuan Pembelajaran:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {generatedPlan.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Saran Kegiatan:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {generatedPlan.suggestedActivities.map((act, i) => <li key={i}>{act}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="improve">
          <Card>
            <CardHeader>
              <CardTitle>Saran Perbaikan</CardTitle>
              <CardDescription>Tempel draf rencana pembelajaran Anda di bawah untuk mendapatkan saran berbasis AI.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSuggestImprovements} className="space-y-4">
                <div>
                  <Label htmlFor="draftPlan">Konten Draf Rencana Pembelajaran</Label>
                  <Textarea
                    id="draftPlan"
                    value={draftPlan}
                    onChange={(e) => setDraftPlan(e.target.value)}
                    placeholder="Tempel teks rencana pembelajaran Anda di sini..."
                    rows={10}
                  />
                </div>
                <Button type="submit" disabled={isSuggesting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Dapatkan Saran
                </Button>
              </form>
              {suggestedImprovements && (
                <div className="mt-6 space-y-4 rounded-md border p-4 bg-secondary/50">
                  <h3 className="text-xl font-semibold text-primary">Saran Perbaikan</h3>
                  <div>
                    <h4 className="font-semibold">Tujuan Pembelajaran:</h4>
                    <p className="text-sm">{suggestedImprovements.learningObjectives}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Metode Pengajaran:</h4>
                    <p className="text-sm">{suggestedImprovements.teachingMethods}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Materi Terkait:</h4>
                    <p className="text-sm">{suggestedImprovements.relatedMaterials}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
