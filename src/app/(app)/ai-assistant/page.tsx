
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, BookOpenCheck, ExternalLink, FileText, Video, Book, Newspaper, Globe, Search } from "lucide-react";
import { generateTeachingMaterial, type GenerateTeachingMaterialInput, type GenerateTeachingMaterialOutput, type AISuggestedSource } from "@/ai/flows/generate-teaching-material";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLog } from "@/contexts/LogContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const detailLevels: { value: NonNullable<GenerateTeachingMaterialInput['detailLevel']>, label: string }[] = [
  { value: "ringkas", label: "Ringkas" },
  { value: "standar", label: "Standar" },
  { value: "mendalam", label: "Mendalam" },
];

const sourceIcons: Record<AISuggestedSource['type'], React.ElementType> = {
    'buku': Book,
    'jurnal': Newspaper,
    'artikel online': Globe,
    'video': Video,
    'website edukasi': Globe,
    'lainnya': FileText,
};

export default function AIAssistantPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addLog } = useLog();

  const [materialTopic, setMaterialTopic] = useState("");
  const [materialGradeLevel, setMaterialGradeLevel] = useState("");
  const [materialDetailLevel, setMaterialDetailLevel] = useState<NonNullable<GenerateTeachingMaterialInput['detailLevel']>>("standar");
  const [generatedMaterial, setGeneratedMaterial] = useState<GenerateTeachingMaterialOutput | null>(null);
  const [isGeneratingMaterial, setIsGeneratingMaterial] = useState(false);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    if (user) {
      addLog("INFO", `Pengguna ${user.email} mengakses halaman Asisten AI (Pembuatan Materi).`, "AIAssistantPage-Material");
    }
  }, [user, addLog]);

  const handleGenerateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTopic || !materialGradeLevel) {
      toast({ title: "Informasi Kurang", description: "Harap berikan topik dan jenjang/fase untuk materi.", variant: "destructive" });
      addLog("WARN", `Gagal membuat materi: Topik atau Jenjang tidak diisi. Topik: '${materialTopic}', Jenjang: '${materialGradeLevel}'.`, "AIAssistantPage-Material");
      return;
    }
    setIsGeneratingMaterial(true);
    setGeneratedMaterial(null);
    addLog("INFO", `Memulai pembuatan materi ajar dengan AI. Topik: "${materialTopic}", Jenjang: "${materialGradeLevel}", Detail: "${materialDetailLevel}".`, "AIAssistantPage-Material");
    try {
      const input: GenerateTeachingMaterialInput = { 
        topic: materialTopic, 
        jenjangFaseKelas: materialGradeLevel,
        detailLevel: materialDetailLevel
      };
      const result = await generateTeachingMaterial(input);
      setGeneratedMaterial(result);
      toast({ title: "Materi Ajar Dihasilkan!", description: "AI telah membuat draf materi ajar beserta sumber untuk Anda." });
      addLog("INFO", `Materi ajar berhasil dibuat oleh AI untuk topik: "${materialTopic}". Judul Materi: "${result.materialTitle}".`, "AIAssistantPage-Material");
    } catch (error) {
      console.error("Error generating material:", error);
      toast({ title: "Pembuatan Materi Gagal", description: "Tidak dapat membuat materi ajar. Silakan coba lagi.", variant: "destructive" });
      addLog("ERROR", `Gagal membuat materi ajar dengan AI untuk topik: "${materialTopic}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "AIAssistantPage-Material");
    } finally {
      setIsGeneratingMaterial(false);
    }
  };


  if (!isClient || !user) {
    return (
      <div className="space-y-6 py-8">
        <Card className="shadow-lg">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl md:text-3xl font-bold">Memuat Asisten AI...</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-lg">Silakan tunggu...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 md:py-8">
      <Card className="shadow-lg">
        <CardHeader className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <BookOpenCheck className="h-10 w-10 text-primary flex-shrink-0" />
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold">Asisten AI Pembuatan Materi Ajar</CardTitle>
              <CardDescription className="text-lg md:text-xl text-muted-foreground mt-1">
                Buat draf materi pembelajaran lengkap dengan sumber referensi yang disarankan oleh AI.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="p-6">
          <CardTitle className="text-xl font-semibold">Buat Materi Ajar dengan AI</CardTitle>
          <CardDescription className="text-base text-muted-foreground">Masukkan topik, jenjang, dan tingkat kedetailan untuk membuat draf materi ajar sesuai Kurikulum Merdeka.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleGenerateMaterial} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="materialTopic" className="text-base">Topik Materi</Label>
              <Input id="materialTopic" value={materialTopic} onChange={(e) => setMaterialTopic(e.target.value)} placeholder="cth., Ekosistem Hutan Hujan Tropis" className="text-base" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="materialGradeLevel" className="text-base">Jenjang/Fase/Kelas</Label>
              <Select value={materialGradeLevel} onValueChange={setMaterialGradeLevel}>
                <SelectTrigger id="materialGradeLevel" className="text-base"><SelectValue placeholder="Pilih Jenjang/Fase/Kelas" /></SelectTrigger>
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
            <div className="space-y-1.5">
              <Label htmlFor="materialDetailLevel" className="text-base">Tingkat Kedetailan Materi</Label>
              <Select value={materialDetailLevel} onValueChange={(value) => setMaterialDetailLevel(value as NonNullable<GenerateTeachingMaterialInput['detailLevel']>)}>
                <SelectTrigger id="materialDetailLevel" className="text-base"><SelectValue placeholder="Pilih tingkat kedetailan" /></SelectTrigger>
                <SelectContent>
                  {detailLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isGeneratingMaterial} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3">
              {isGeneratingMaterial ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              Buat Materi Ajar
            </Button>
          </form>
          
          {generatedMaterial && (
            <Card className="mt-8 shadow-inner">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl text-primary font-semibold">{generatedMaterial.materialTitle}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">Berikut adalah draf materi ajar yang dihasilkan oleh AI.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Konten Materi:</h3>
                  <ScrollArea className="h-[500px] rounded-md border p-4 bg-muted/20 shadow-sm">
                    <ReactMarkdown className="prose prose-base dark:prose-invert max-w-none leading-relaxed">
                      {generatedMaterial.materialContent}
                    </ReactMarkdown>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Sumber Referensi yang Disarankan:</h3>
                  {generatedMaterial.suggestedSources.length > 0 ? (
                    <div className="space-y-4">
                      {generatedMaterial.suggestedSources.map((source, index) => {
                        const IconComponent = sourceIcons[source.type] || FileText;
                        return (
                            <Card key={index} className="p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <IconComponent className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                    <div className="flex-grow">
                                    <h4 className="font-semibold text-lg">{source.title}</h4>
                                    <p className="text-sm text-muted-foreground">Jenis: {source.type}</p>
                                    {source.authorOrPublisher && <p className="text-sm text-muted-foreground">Penulis/Penerbit: {source.authorOrPublisher}</p>}
                                    {source.description && <p className="text-base mt-1.5">{source.description}</p>}
                                    {source.url && (
                                        <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1.5 text-base">
                                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                                            Kunjungi Sumber <ExternalLink className="ml-1.5 h-4 w-4" />
                                        </a>
                                        </Button>
                                    )}
                                    </div>
                                </div>
                            </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-base text-muted-foreground">AI tidak menyarankan sumber referensi untuk materi ini.</p>
                  )}
                </div>
                 <Alert variant="default" className="border-primary/50">
                    <Search className="h-5 w-5 text-primary" />
                    <AlertTitle className="font-semibold">Verifikasi Sumber</AlertTitle>
                    <AlertDescription className="text-base">
                        Selalu verifikasi keakuratan dan relevansi sumber yang disarankan AI sebelum digunakan dalam pengajaran.
                    </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
