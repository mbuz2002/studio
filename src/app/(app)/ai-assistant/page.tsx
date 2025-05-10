
"use client";

import React, { useState, useEffect, type FormEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, BookOpenCheck, ExternalLink, FileText, Video, Book, Newspaper, Globe, Search, TableIcon, Languages, MessageSquareWarning } from "lucide-react";
import { generateTeachingMaterial, type GenerateTeachingMaterialInput, type GenerateTeachingMaterialOutput } from "@/ai/flows/generate-teaching-material"; 
import type { SuggestedSourceSchema as AISuggestedSource } from "@/ai/flows/generate-teaching-material"; 
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLog } from "@/contexts/LogContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { CurriculumFramework } from "@/types";


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

const merdekaGradeLevels = [
  { value: "PAUD (Kurikulum Merdeka)", label: "PAUD (Kurikulum Merdeka)" },
  { value: "Fase A (Kelas 1-2 SD/MI)", label: "Fase A (Kelas 1-2 SD/MI)" },
  { value: "Fase B (Kelas 3-4 SD/MI)", label: "Fase B (Kelas 3-4 SD/MI)" },
  { value: "Fase C (Kelas 5-6 SD/MI)", label: "Fase C (Kelas 5-6 SD/MI)" },
  { value: "Fase D (Kelas 7-9 SMP/MTs)", label: "Fase D (Kelas 7-9 SMP/MTs)" },
  { value: "Fase E (Kelas 10 SMA/MA/SMK/MAK)", label: "Fase E (Kelas 10 SMA/MA/SMK/MAK)" },
  { value: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)", label: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)" },
  { value: "SLB (Fase A-F Disesuaikan)", label: "SLB (Fase A-F Disesuaikan)" },
  { value: "Pendidikan Kesetaraan (Fase A-F Disesuaikan)", label: "Pendidikan Kesetaraan (Fase A-F Disesuaikan)" },
];


export default function AIAssistantPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); 
  const { addLog } = useLog();

  const [materialTopic, setMaterialTopic] = useState("");
  const [materialGradeLevel, setMaterialGradeLevel] = useState("");
  const [materialDetailLevel, setMaterialDetailLevel] = useState<NonNullable<GenerateTeachingMaterialInput['detailLevel']>>("standar");
  const [generatedMaterial, setGeneratedMaterial] = useState<GenerateTeachingMaterialOutput | null>(null);
  const [isGeneratingMaterial, setIsGeneratingMaterial] = useState(false);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    if (user && !authLoading) { // Ensure user and not authLoading
      addLog("INFO", `Pengguna ${user.email} mengakses halaman Asisten AI (Pembuatan Materi).`, "AIAssistantPage-Material");
    }
  }, [user, addLog, authLoading]); // Add authLoading to dependency array

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


  if (!isClient || authLoading) { 
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
         <div className="flex flex-col items-center text-center">
          <Sparkles className="h-12 w-12 animate-pulse text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Memuat Asisten AI...</p>
          <p className="text-sm text-muted-foreground">Menyiapkan alat bantu cerdas Anda.</p>
        </div>
      </div>
    );
  }

  if (!user) { 
    return (
         <div className="flex h-[calc(100vh-150px)] items-center justify-center">
            <p className="text-lg text-muted-foreground">Silakan login untuk menggunakan Asisten AI.</p>
        </div>
    );
  }


  return (
    <div className="container mx-auto py-6 md:py-8">
      <header className="mb-8">
        <Card className="shadow-xl overflow-hidden rounded-lg border-transparent">
          <CardHeader className="bg-gradient-to-br from-primary via-primary/90 to-accent p-6 md:p-8 text-primary-foreground rounded-t-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Sparkles className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0 text-background drop-shadow-lg" />
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Asisten AI Pembuatan Materi</CardTitle>
                <CardDescription className="text-lg md:text-xl mt-1.5 text-primary-foreground/90">
                  Buat draf materi pembelajaran inovatif lengkap dengan sumber referensi yang disarankan AI. Materi ini difokuskan untuk Kurikulum Merdeka.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-6 rounded-lg border-border/50">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-xl font-semibold text-foreground">Parameter Materi Ajar</CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-1">
                Isi detail di bawah ini untuk menghasilkan materi ajar yang relevan dan berkualitas.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleGenerateMaterial} className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="materialTopic" className="text-base font-medium">Topik Materi</Label>
                  <Input id="materialTopic" value={materialTopic} onChange={(e) => setMaterialTopic(e.target.value)} placeholder="cth., Revolusi Industri 4.0" className="text-base h-11 rounded-md focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="materialGradeLevel" className="text-base font-medium">Jenjang/Fase/Kelas (Kur. Merdeka)</Label>
                  <Select value={materialGradeLevel} onValueChange={(value) => { if (value !== "placeholder-grade") setMaterialGradeLevel(value); else setMaterialGradeLevel("");}}>
                    <SelectTrigger id="materialGradeLevel" className="text-base h-11 rounded-md focus:border-primary">
                      <SelectValue placeholder="Pilih Jenjang/Fase/Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder-grade" disabled>Pilih Jenjang/Fase/Kelas</SelectItem>
                       {merdekaGradeLevels.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="materialDetailLevel" className="text-base font-medium">Tingkat Kedetailan</Label>
                  <Select value={materialDetailLevel} onValueChange={(value) => setMaterialDetailLevel(value as NonNullable<GenerateTeachingMaterialInput['detailLevel']>)}>
                    <SelectTrigger id="materialDetailLevel" className="text-base h-11 rounded-md focus:border-primary">
                      <SelectValue placeholder="Pilih tingkat kedetailan" />
                    </SelectTrigger>
                    <SelectContent>
                      {detailLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isGeneratingMaterial || !materialTopic || !materialGradeLevel} className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground text-lg py-3 h-12 mt-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-md">
                  {isGeneratingMaterial ? <Sparkles className="mr-2.5 h-5 w-5 animate-spin" /> : <BookOpenCheck className="mr-2.5 h-5 w-5" />}
                  Buat Materi Ajar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {isGeneratingMaterial && (
            <Card className="shadow-lg rounded-lg border-border/50">
              <CardHeader className="p-6 rounded-t-lg bg-muted/30">
                <div className="flex items-center">
                    <Sparkles className="h-7 w-7 animate-pulse text-primary mr-3" />
                    <CardTitle className="text-2xl font-semibold text-muted-foreground">AI sedang meracik materi untuk Anda...</CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground mt-2">Proses ini mungkin memerlukan beberapa saat. Mohon tunggu.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5 animate-pulse">
                <div className="h-10 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-full"></div>
                <div className="h-6 bg-muted rounded w-5/6"></div>
                <div className="h-6 bg-muted rounded w-full"></div>
                <div className="h-6 bg-muted rounded w-4/5"></div>
              </CardContent>
            </Card>
          )}

          {generatedMaterial && !isGeneratingMaterial && (
            <Card className="shadow-xl rounded-lg border-border/50">
              <CardHeader className="p-6 bg-muted/30 border-b rounded-t-lg">
                <CardTitle className="text-2xl md:text-3xl text-primary font-bold tracking-tight">{generatedMaterial.materialTitle}</CardTitle>
                <CardDescription className="text-base text-muted-foreground pt-1.5">
                  Berikut adalah draf materi ajar yang dihasilkan oleh AI. Silakan tinjau, sesuaikan, dan lengkapi sesuai kebutuhan Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="prose prose-base dark:prose-invert max-w-none leading-relaxed">
                  <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                    <Book className="mr-2.5 h-5 w-5 text-primary" /> Konten Materi Ajar
                  </h3>
                  <Separator className="my-4" />
                  <ScrollArea className="h-auto max-h-[70vh] rounded-md border shadow-inner bg-background">
                    <div className="p-4 md:p-5"> 
                      <ReactMarkdown
                        className="markdown-content"
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-md border"><table className="min-w-full divide-y divide-border text-sm" {...props} /></div>,
                          thead: ({node, ...props}) => <thead className="bg-muted/50" {...props} />,
                          th: ({node, ...props}) => <th className="px-4 py-2.5 text-left font-semibold text-foreground" {...props} />,
                          td: ({node, ...props}) => <td className="px-4 py-2.5 text-foreground border-t border-border align-top" {...props} />,
                          p: ({node, ...props}) => <p className="mb-4 last:mb-0 text-base" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-3 pb-2 border-b border-border" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-5 mb-2.5 pb-1.5 border-b border-border" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1.5 text-base" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-base" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="pl-4 border-l-4 border-accent italic text-muted-foreground my-4 py-1" {...props} />,
                          code: ({node, inline, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <pre className="bg-muted p-3.5 rounded-md overflow-x-auto my-4 text-sm shadow-sm"><code className={className} {...props}>{children}</code></pre>
                            ) : (
                              <code className="bg-muted/70 px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props}>{children}</code>
                            )
                          }
                        }}
                      >
                        {generatedMaterial.materialContent}
                      </ReactMarkdown>
                    </div>
                  </ScrollArea>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-xl font-semibold mb-5 text-foreground flex items-center">
                    <Globe className="mr-2.5 h-5 w-5 text-primary" /> Sumber Referensi yang Disarankan
                  </h3>
                  {generatedMaterial.suggestedSources.length > 0 ? (
                    <div className="space-y-4">
                      {generatedMaterial.suggestedSources.map((source, index) => {
                        const IconComponent = sourceIcons[source.type] || FileText;
                        return (
                            <Card key={index} className="p-4 bg-card shadow-md hover:shadow-lg transition-shadow duration-200 rounded-md border-border/70">
                                <div className="flex items-start gap-4">
                                    <IconComponent className="h-7 w-7 text-accent flex-shrink-0 mt-1.5" />
                                    <div className="flex-grow">
                                    <h4 className="font-semibold text-lg text-primary">{source.title}</h4>
                                    <p className="text-sm text-muted-foreground capitalize">Jenis: {source.type}</p>
                                    {source.authorOrPublisher && <p className="text-sm text-muted-foreground">Penulis/Penerbit: {source.authorOrPublisher}</p>}
                                    {source.description && <p className="text-base mt-2 text-foreground/90">{source.description}</p>}
                                    {source.url && (
                                        <Button variant="link" size="sm" asChild className="p-0 h-auto mt-2.5 text-base text-accent hover:text-accent/80 font-medium">
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
                    <Alert variant="default" className="border-primary/30 shadow-sm rounded-md">
                        <MessageSquareWarning className="h-5 w-5 text-primary" />
                        <AlertTitle className="font-semibold text-primary">Tidak Ada Sumber</AlertTitle>
                        <AlertDescription className="text-base">
                            AI tidak menyarankan sumber referensi spesifik untuk materi ini. Anda dapat mencari sumber secara mandiri.
                        </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-6 border-t bg-muted/20 rounded-b-lg">
                 <Alert variant="default" className="border-primary/50 shadow-sm rounded-md">
                    <Search className="h-5 w-5 text-primary" />
                    <AlertTitle className="font-semibold text-primary">Verifikasi & Sesuaikan Materi</AlertTitle>
                    <AlertDescription className="text-base">
                        Konten yang dihasilkan AI adalah draf awal. Selalu verifikasi keakuratan, kelengkapan, dan relevansi materi serta sumber yang disarankan sebelum digunakan dalam proses pembelajaran. Pastikan teks Arab (jika ada) ditampilkan dengan benar, termasuk harakat dan arah baca (RTL).
                    </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          )}
          
          {!generatedMaterial && !isGeneratingMaterial && (
            <Card className="shadow-lg h-full flex flex-col items-center justify-center text-center p-8 md:p-12 bg-muted/30 border-2 border-dashed border-border/70 rounded-lg min-h-[400px]">
                <Sparkles className="h-16 w-16 md:h-20 md:w-20 text-muted-foreground/40 mb-5 animate-pulse" />
                <CardTitle className="text-2xl md:text-3xl font-semibold text-muted-foreground">Hasil Materi Akan Tampil di Sini</CardTitle>
                <CardDescription className="text-base md:text-lg text-muted-foreground mt-3 max-w-md">
                    Isi parameter di sebelah kiri dan klik "Buat Materi Ajar" untuk melihat bagaimana AI dapat membantu Anda menyusun konten pembelajaran.
                </CardDescription>
                 <div className="mt-8 space-y-2.5 text-sm text-muted-foreground text-left">
                    <p className="flex items-center"><TableIcon className="mr-2.5 h-4 w-4 text-accent"/> AI dapat menyertakan tabel jika relevan dengan topik.</p>
                    <p className="flex items-center"><Languages className="mr-2.5 h-4 w-4 text-accent"/> Materi Bahasa Arab akan menyertakan harakat (jika diminta).</p>
                 </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const style = `
  .markdown-content [dir="rtl"] {
    direction: rtl;
    text-align: right; 
    font-family: 'Noto Naskh Arabic', 'Amiri', serif; 
  }
  .prose table { width: 100%; display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; } 
  .prose th, .prose td { white-space: nowrap; } 
  @media (min-width: 768px) { 
    .prose table { display: table; overflow-x: visible; }
    .prose th, .prose td { white-space: normal; }
  }
`;
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = style;
  document.head.appendChild(styleSheet);
}
