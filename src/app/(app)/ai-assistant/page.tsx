
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, BookOpenCheck, ExternalLink, FileText, Video, Book, Newspaper, Globe, Search, TableIcon, Languages } from "lucide-react";
import { generateTeachingMaterial, type GenerateTeachingMaterialInput, type GenerateTeachingMaterialOutput, type AISuggestedSource } from "@/ai/flows/generate-teaching-material";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLog } from "@/contexts/LogContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";


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

  const handleGenerateMaterial = async (e: FormEvent) => {
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
    <div className="container mx-auto py-6 md:py-8">
      <header className="mb-8">
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-accent p-6 md:p-8 text-primary-foreground">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Sparkles className="h-12 w-12 flex-shrink-0 text-background" />
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold">Asisten AI Pembuatan Materi</CardTitle>
                <CardDescription className="text-lg md:text-xl mt-1 text-primary-foreground/90">
                  Buat draf materi pembelajaran inovatif lengkap dengan sumber referensi yang disarankan AI.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-6">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-semibold">Parameter Materi Ajar</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Isi detail untuk menghasilkan materi yang relevan.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <form onSubmit={handleGenerateMaterial} className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="materialTopic" className="text-base font-medium">Topik Materi</Label>
                  <Input id="materialTopic" value={materialTopic} onChange={(e) => setMaterialTopic(e.target.value)} placeholder="cth., Peradaban Lembah Sungai Nil" className="text-base" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="materialGradeLevel" className="text-base font-medium">Jenjang/Fase/Kelas</Label>
                  <Select value={materialGradeLevel} onValueChange={(value) => { if (value !== "placeholder") setMaterialGradeLevel(value); else setMaterialGradeLevel("");}}>
                    <SelectTrigger id="materialGradeLevel" className="text-base">
                      <SelectValue placeholder="Pilih Jenjang/Fase/Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" disabled>Pilih Jenjang/Fase/Kelas</SelectItem>
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
                  <Label htmlFor="materialDetailLevel" className="text-base font-medium">Tingkat Kedetailan</Label>
                  <Select value={materialDetailLevel} onValueChange={(value) => setMaterialDetailLevel(value as NonNullable<GenerateTeachingMaterialInput['detailLevel']>)}>
                    <SelectTrigger id="materialDetailLevel" className="text-base">
                      <SelectValue placeholder="Pilih tingkat kedetailan" />
                    </SelectTrigger>
                    <SelectContent>
                      {detailLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isGeneratingMaterial || !materialTopic || !materialGradeLevel} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 mt-4">
                  {isGeneratingMaterial ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BookOpenCheck className="mr-2 h-5 w-5" />}
                  Buat Materi Ajar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {isGeneratingMaterial && (
            <Card className="shadow-lg animate-pulse">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-semibold text-muted-foreground">AI sedang meracik materi...</CardTitle>
                <CardDescription className="text-base text-muted-foreground">Mohon tunggu sejenak.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          )}

          {generatedMaterial && !isGeneratingMaterial && (
            <Card className="shadow-xl">
              <CardHeader className="p-6 bg-muted/30 border-b">
                <CardTitle className="text-2xl md:text-3xl text-primary font-bold">{generatedMaterial.materialTitle}</CardTitle>
                <CardDescription className="text-base text-muted-foreground pt-1">
                  Berikut adalah draf materi ajar yang dihasilkan oleh AI. Silakan tinjau dan sesuaikan.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="prose prose-base dark:prose-invert max-w-none leading-relaxed">
                  <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
                    <Book className="mr-2 h-5 w-5 text-primary" /> Konten Materi Ajar
                  </h3>
                  <Separator className="my-4" />
                  <ScrollArea className="h-auto max-h-[70vh] rounded-md border p-4 shadow-inner bg-background">
                    <ReactMarkdown
                      className="markdown-content"
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({node, ...props}) => <div className="overflow-x-auto"><table className="min-w-full divide-y divide-border my-4 text-sm" {...props} /></div>,
                        thead: ({node, ...props}) => <thead className="bg-muted/50" {...props} />,
                        th: ({node, ...props}) => <th className="px-4 py-2 text-left font-semibold text-foreground" {...props} />,
                        td: ({node, ...props}) => <td className="px-4 py-2 text-foreground border-t border-border" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-3 pb-1 border-b border-border" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-5 mb-2 pb-1 border-b border-border" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="pl-4 border-l-4 border-accent italic text-muted-foreground my-4" {...props} />,
                        code: ({node, inline, className, children, ...props}) => {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <pre className="bg-muted p-3 rounded-md overflow-x-auto my-4 text-sm"><code className={className} {...props}>{children}</code></pre>
                          ) : (
                            <code className="bg-muted/70 px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                          )
                        }
                      }}
                    >
                      {generatedMaterial.materialContent}
                    </ReactMarkdown>
                  </ScrollArea>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-primary" /> Sumber Referensi yang Disarankan
                  </h3>
                  {generatedMaterial.suggestedSources.length > 0 ? (
                    <div className="space-y-4">
                      {generatedMaterial.suggestedSources.map((source, index) => {
                        const IconComponent = sourceIcons[source.type] || FileText;
                        return (
                            <Card key={index} className="p-4 bg-card shadow-md hover:shadow-lg transition-shadow duration-200">
                                <div className="flex items-start gap-4">
                                    <IconComponent className="h-7 w-7 text-accent flex-shrink-0 mt-1" />
                                    <div className="flex-grow">
                                    <h4 className="font-semibold text-lg text-primary">{source.title}</h4>
                                    <p className="text-sm text-muted-foreground capitalize">Jenis: {source.type}</p>
                                    {source.authorOrPublisher && <p className="text-sm text-muted-foreground">Penulis/Penerbit: {source.authorOrPublisher}</p>}
                                    {source.description && <p className="text-base mt-1.5 text-foreground/90">{source.description}</p>}
                                    {source.url && (
                                        <Button variant="link" size="sm" asChild className="p-0 h-auto mt-2 text-base text-accent hover:text-accent/80">
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
              </CardContent>
              <CardFooter className="p-6 border-t">
                 <Alert variant="default" className="border-primary/50 shadow-sm">
                    <Search className="h-5 w-5 text-primary" />
                    <AlertTitle className="font-semibold text-primary">Verifikasi & Sesuaikan</AlertTitle>
                    <AlertDescription className="text-base">
                        Selalu verifikasi keakuratan dan relevansi materi serta sumber yang disarankan AI sebelum digunakan dalam pengajaran. Konten ini adalah draf awal.
                        Pastikan teks Arab (jika ada) ditampilkan dengan benar, termasuk harakat dan arah baca (RTL).
                    </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          )}
          
          {!generatedMaterial && !isGeneratingMaterial && (
            <Card className="shadow-lg h-full flex flex-col items-center justify-center text-center p-8 bg-muted/20 border-2 border-dashed">
                <Sparkles className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <CardTitle className="text-2xl font-semibold text-muted-foreground">Hasil Materi Akan Muncul di Sini</CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2 max-w-md">
                    Isi parameter di sebelah kiri dan klik "Buat Materi Ajar" untuk melihat keajaiban AI dalam menyusun konten pembelajaran untuk Anda.
                </CardDescription>
                 <div className="mt-6 space-y-2 text-sm text-muted-foreground text-left">
                    <p className="flex items-center"><TableIcon className="mr-2 h-4 w-4 text-accent"/> AI dapat menyertakan tabel jika relevan.</p>
                    <p className="flex items-center"><Languages className="mr-2 h-4 w-4 text-accent"/> Materi Bahasa Arab akan menyertakan harakat.</p>
                 </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Add some basic styles for markdown content if not covered by prose
// This can be in globals.css or a style tag if scoped CSS is preferred
// For now, I'm assuming prose handles most things, and I added specific styling for table elements within ReactMarkdown components prop.
// Basic style for Arabic text to ensure RTL display
const style = `
  .markdown-content [dir="rtl"] {
    direction: rtl;
    text-align: right; /* Or start if you prefer */
    font-family: 'Noto Naskh Arabic', ' Amiri', serif; /* Example Arabic fonts */
  }
  .prose table { width: 100%; }
  .prose th, .prose td { border: 1px solid hsl(var(--border)); padding: 0.5em 0.75em; }
  .prose thead { background-color: hsl(var(--muted)); }
  .prose thead th { font-weight: 600; }
`;
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = style;
  document.head.appendChild(styleSheet);
}

