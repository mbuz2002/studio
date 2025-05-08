
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


const detailLevels: { value: GenerateTeachingMaterialInput['detailLevel'], label: string }[] = [
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

  // Teaching Material Generation State
  const [materialTopic, setMaterialTopic] = useState("");
  const [materialGradeLevel, setMaterialGradeLevel] = useState("");
  const [materialDetailLevel, setMaterialDetailLevel] = useState<GenerateTeachingMaterialInput['detailLevel']>("standar");
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
            <BookOpenCheck className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Asisten AI Pembuatan Materi Ajar</CardTitle>
              <CardDescription className="text-base md:text-lg">
                Buat draf materi pembelajaran lengkap dengan sumber referensi yang disarankan oleh AI.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buat Materi Ajar dengan AI</CardTitle>
          <CardDescription>Masukkan topik, jenjang, dan tingkat kedetailan untuk membuat draf materi ajar sesuai Kurikulum Merdeka.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateMaterial} className="space-y-4">
            <div>
              <Label htmlFor="materialTopic">Topik Materi</Label>
              <Input id="materialTopic" value={materialTopic} onChange={(e) => setMaterialTopic(e.target.value)} placeholder="cth., Ekosistem Hutan Hujan Tropis" />
            </div>
            <div>
              <Label htmlFor="materialGradeLevel">Jenjang/Fase/Kelas</Label>
              <Select value={materialGradeLevel} onValueChange={setMaterialGradeLevel}>
                <SelectTrigger id="materialGradeLevel"><SelectValue placeholder="Pilih Jenjang/Fase/Kelas" /></SelectTrigger>
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
              <Label htmlFor="materialDetailLevel">Tingkat Kedetailan Materi</Label>
              <Select value={materialDetailLevel} onValueChange={(value) => setMaterialDetailLevel(value as GenerateTeachingMaterialInput['detailLevel'])}>
                <SelectTrigger id="materialDetailLevel"><SelectValue placeholder="Pilih tingkat kedetailan" /></SelectTrigger>
                <SelectContent>
                  {detailLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isGeneratingMaterial} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isGeneratingMaterial ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Buat Materi Ajar
            </Button>
          </form>
          
          {generatedMaterial && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{generatedMaterial.materialTitle}</CardTitle>
                <CardDescription>Berikut adalah draf materi ajar yang dihasilkan oleh AI.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Konten Materi:</h3>
                  <ScrollArea className="h-96 rounded-md border p-4 bg-muted/30">
                    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                      {generatedMaterial.materialContent}
                    </ReactMarkdown>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sumber Referensi yang Disarankan:</h3>
                  {generatedMaterial.suggestedSources.length > 0 ? (
                    <div className="space-y-3">
                      {generatedMaterial.suggestedSources.map((source, index) => {
                        const IconComponent = sourceIcons[source.type] || FileText;
                        return (
                            <Card key={index} className="p-4 bg-background">
                                <div className="flex items-start gap-3">
                                    <IconComponent className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                    <div className="flex-grow">
                                    <h4 className="font-medium text-base">{source.title}</h4>
                                    <p className="text-xs text-muted-foreground">Jenis: {source.type}</p>
                                    {source.authorOrPublisher && <p className="text-xs text-muted-foreground">Penulis/Penerbit: {source.authorOrPublisher}</p>}
                                    {source.description && <p className="text-sm mt-1">{source.description}</p>}
                                    {source.url && (
                                        <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1">
                                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                                            Kunjungi Sumber <ExternalLink className="ml-1 h-3 w-3" />
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
                    <p className="text-sm text-muted-foreground">AI tidak menyarankan sumber referensi untuk materi ini.</p>
                  )}
                </div>
                 <Alert>
                    <Search className="h-4 w-4" />
                    <AlertTitle>Verifikasi Sumber</AlertTitle>
                    <AlertDescription>
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

