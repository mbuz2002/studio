
"use client";

import React, { useState, useEffect, type FormEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, BrainCircuit, ExternalLink, Search, FileText, Book, ListChecks, UserCheck, MessageSquareHeart, Lightbulb, AlertTriangle, TableIcon } from "lucide-react";
import { 
    generateKurikulumMerdekaModule, 
    type GenerateKurikulumMerdekaModuleInput,
    type GenerateKurikulumMerdekaModuleOutput 
} from "@/ai/flows/generate-kurikulum-merdeka-module";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLog } from "@/contexts/LogContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useCurriculum } from "@/contexts/CurriculumContext";

const merdekaGradeLevels = [
  { value: "PAUD (Kurikulum Merdeka)", label: "PAUD (Kurikulum Merdeka)" },
  { value: "Fase A (Kelas 1-2 SD/MI)", label: "Fase A (Kelas 1-2 SD/MI)" },
  { value: "Fase B (Kelas 3-4 SD/MI)", label: "Fase B (Kelas 3-4 SD/MI)" },
  { value: "Fase C (Kelas 5-6 SD/MI)", label: "Fase C (Kelas 5-6 SD/MI)" },
  { value: "Fase D (Kelas 7-9 SMP/MTs)", label: "Fase D (Kelas 7-9 SMP/MTs)" },
  { value: "Fase E (Kelas 10 SMA/MA/SMK/MAK)", label: "Fase E (Kelas 10 SMA/MA/SMK/MAK)" },
  { value: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)", label: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)" },
  { value: "SLB (Fase A-F Disesuaikan)", label: "SLB (Fase A-F Disesuaikan)" },
];

export default function AIKurikulumMerdekaModulePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addLog } = useLog();
  const { defaultCurriculum } = useCurriculum();

  const [moduleTopic, setModuleTopic] = useState("");
  const [moduleSubject, setModuleSubject] = useState("");
  const [moduleGradeLevel, setModuleGradeLevel] = useState("");
  const [moduleCPElemen, setModuleCPElemen] = useState("");
  const [moduleAlokasiWaktu, setModuleAlokasiWaktu] = useState("");
  
  const [generatedModule, setGeneratedModule] = useState<GenerateKurikulumMerdekaModuleOutput | null>(null);
  const [isGeneratingModule, setIsGeneratingModule] = useState(false);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    if (user) {
      addLog("INFO", `Pengguna ${user.email} mengakses halaman Pembuatan Modul Ajar AI (Kurikulum Merdeka).`, "AIKurikulumMerdekaModulePage");
    }
    if (defaultCurriculum !== "Kurikulum Merdeka" && user) {
        toast({
            title: "Fitur Khusus Kurikulum Merdeka",
            description: "Halaman ini dioptimalkan untuk pembuatan Modul Ajar Kurikulum Merdeka.",
            variant: "default",
        });
         addLog("WARN", `Pengguna ${user.email} mengakses halaman Modul Ajar AI, namun kurikulum default bukan Kurikulum Merdeka.`, "AIKurikulumMerdekaModulePage");
    }
  }, [user, addLog, defaultCurriculum, toast]);

  const handleGenerateModule = async (e: FormEvent) => {
    e.preventDefault();
    if (!moduleTopic || !moduleSubject || !moduleGradeLevel) {
      toast({ title: "Informasi Kurang", description: "Harap isi Topik, Mata Pelajaran, dan Jenjang/Fase.", variant: "destructive" });
      addLog("WARN", `Gagal membuat Modul Ajar AI: Informasi dasar kurang. Topik: '${moduleTopic}', Mapel: '${moduleSubject}', Jenjang: '${moduleGradeLevel}'.`, "AIKurikulumMerdekaModulePage");
      return;
    }
    setIsGeneratingModule(true);
    setGeneratedModule(null);
    addLog("INFO", `Memulai pembuatan Modul Ajar dengan AI. Topik: "${moduleTopic}", Mapel: "${moduleSubject}", Jenjang: "${moduleGradeLevel}".`, "AIKurikulumMerdekaModulePage");
    try {
      const input: GenerateKurikulumMerdekaModuleInput = { 
        topic: moduleTopic, 
        subject: moduleSubject,
        jenjangFaseKelas: moduleGradeLevel,
        capaianPembelajaranElemen: moduleCPElemen.split('\n').map(s => s.trim()).filter(s => s),
        alokasiWaktuTotal: moduleAlokasiWaktu,
        namaPenyusun: user?.name || undefined, // Pass current user's name
        institusi: "Nama Sekolah/Institusi Anda", // Placeholder, can be fetched from SchoolProfile later
        tahunAjar: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1), // Placeholder
      };
      const result = await generateKurikulumMerdekaModule(input);
      setGeneratedModule(result);
      toast({ title: "Modul Ajar Dihasilkan!", description: "AI telah membuat draf Modul Ajar Kurikulum Merdeka untuk Anda." });
      addLog("INFO", `Modul Ajar AI berhasil dibuat. Judul: "${result.judulModul}".`, "AIKurikulumMerdekaModulePage");
    } catch (error) {
      console.error("Error generating Kurikulum Merdeka module:", error);
      toast({ title: "Pembuatan Modul Gagal", description: `Tidak dapat membuat modul ajar. ${error instanceof Error ? error.message : 'Silakan coba lagi.'}`, variant: "destructive" });
      addLog("ERROR", `Gagal membuat Modul Ajar AI. Topik: "${moduleTopic}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "AIKurikulumMerdekaModulePage");
    } finally {
      setIsGeneratingModule(false);
    }
  };

  if (!isClient || !user) {
    return (
      <div className="container mx-auto py-6 md:py-8">
        <Card className="shadow-lg rounded-lg">
          <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <CardTitle className="text-2xl md:text-3xl font-bold">Memuat Pembuat Modul Ajar AI...</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-4 flex items-center">
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
        <Card className="shadow-xl overflow-hidden rounded-lg border-transparent">
          <CardHeader className="bg-gradient-to-br from-primary via-primary/90 to-accent p-6 md:p-8 text-primary-foreground rounded-t-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <BrainCircuit className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0 text-background drop-shadow-lg" />
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">AI Pembuat Modul Ajar Kurikulum Merdeka</CardTitle>
                <CardDescription className="text-lg md:text-xl mt-1.5 text-primary-foreground/90">
                  Rancang Modul Ajar Kurikulum Merdeka yang komprehensif dengan bantuan AI.
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
              <CardTitle className="text-xl font-semibold text-foreground">Parameter Modul Ajar</CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-1">
                Isi detail di bawah ini untuk Modul Ajar Kurikulum Merdeka.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleGenerateModule} className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="moduleTopic" className="text-base font-medium">Topik Utama / Materi Pokok</Label>
                  <Input id="moduleTopic" value={moduleTopic} onChange={(e) => setModuleTopic(e.target.value)} placeholder="cth., Ekosistem dan Komponennya" className="text-base h-11 rounded-md focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="moduleSubject" className="text-base font-medium">Mata Pelajaran</Label>
                  <Input id="moduleSubject" value={moduleSubject} onChange={(e) => setModuleSubject(e.target.value)} placeholder="cth., Ilmu Pengetahuan Alam dan Sosial (IPAS)" className="text-base h-11 rounded-md focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="moduleGradeLevel" className="text-base font-medium">Jenjang/Fase/Kelas (Kur. Merdeka)</Label>
                  <Select value={moduleGradeLevel} onValueChange={(value) => { if (value !== "placeholder-grade") setModuleGradeLevel(value); else setModuleGradeLevel("");}}>
                    <SelectTrigger id="moduleGradeLevel" className="text-base h-11 rounded-md focus:border-primary">
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
                  <Label htmlFor="moduleAlokasiWaktu" className="text-base font-medium">Estimasi Alokasi Waktu (Opsional)</Label>
                  <Input id="moduleAlokasiWaktu" value={moduleAlokasiWaktu} onChange={(e) => setModuleAlokasiWaktu(e.target.value)} placeholder="cth., 12 JP atau 3 Pertemuan" className="text-base h-11 rounded-md focus:border-primary" />
                </div>
                 <div className="space-y-1.5">
                  <Label htmlFor="moduleCPElemen" className="text-base font-medium">Elemen Capaian Pembelajaran (CP) (Opsional, satu per baris)</Label>
                  <Textarea id="moduleCPElemen" value={moduleCPElemen} onChange={(e) => setModuleCPElemen(e.target.value)} placeholder="CP Elemen 1: Memahami konsep..." className="text-base rounded-md focus:border-primary" rows={3} />
                </div>
                <Button type="submit" disabled={isGeneratingModule || !moduleTopic || !moduleSubject || !moduleGradeLevel} className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground text-lg py-3 h-12 mt-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-md">
                  {isGeneratingModule ? <Loader2 className="mr-2.5 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2.5 h-5 w-5" />}
                  Buat Modul Ajar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {isGeneratingModule && (
            <Card className="shadow-lg animate-pulse rounded-lg border-border/50">
              <CardHeader className="p-6 rounded-t-lg bg-muted/30">
                <CardTitle className="text-2xl font-semibold text-muted-foreground">AI sedang merancang Modul Ajar...</CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-1">Proses ini mungkin memerlukan waktu. Mohon tunggu.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="h-10 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-full"></div>
                <div className="h-6 bg-muted rounded w-5/6"></div>
              </CardContent>
            </Card>
          )}

          {generatedModule && !isGeneratingModule && (
            <Card className="shadow-xl rounded-lg border-border/50">
              <CardHeader className="p-6 bg-muted/30 border-b rounded-t-lg">
                <CardTitle className="text-2xl md:text-3xl text-primary font-bold tracking-tight">{generatedModule.judulModul}</CardTitle>
              </CardHeader>
              <ScrollArea className="h-auto max-h-[80vh] rounded-b-md">
              <CardContent className="p-6 space-y-6">
                
                <section>
                    <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center"><FileText className="mr-2 h-5 w-5 text-accent"/>Identitas Modul</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm bg-secondary/30 p-4 rounded-md shadow-inner">
                        <p><strong>Nama Penyusun:</strong> {generatedModule.identitasModul.namaPenyusun}</p>
                        <p><strong>Institusi:</strong> {generatedModule.identitasModul.institusi}</p>
                        <p><strong>Tahun Ajar:</strong> {generatedModule.identitasModul.tahunAjar}</p>
                        <p><strong>Jenjang Sekolah:</strong> {generatedModule.identitasModul.jenjangSekolah}</p>
                        <p><strong>Fase:</strong> {generatedModule.identitasModul.fase}</p>
                        <p><strong>Kelas/Semester:</strong> {generatedModule.identitasModul.kelasSemester}</p>
                        <p><strong>Alokasi Waktu:</strong> {generatedModule.identitasModul.alokasiWaktu}</p>
                        <p><strong>Mata Pelajaran:</strong> {generatedModule.identitasModul.mataPelajaran}</p>
                        {generatedModule.identitasModul.elemenCapaianPembelajaran && generatedModule.identitasModul.elemenCapaianPembelajaran.length > 0 && (
                             <p className="sm:col-span-2"><strong>Elemen CP:</strong> {generatedModule.identitasModul.elemenCapaianPembelajaran.join(', ')}</p>
                        )}
                    </div>
                </section>
                <Separator/>

                {generatedModule.kompetensiAwal && generatedModule.kompetensiAwal.length > 0 && (
                    <section>
                        <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-accent"/>Kompetensi Awal</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            {generatedModule.kompetensiAwal.map((item, idx) => <li key={`ka-${idx}`}>{item}</li>)}
                        </ul>
                    </section>
                )}
                <Separator/>

                <section>
                    <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center"><UserCheck className="mr-2 h-5 w-5 text-accent"/>Profil Pelajar Pancasila</h3>
                    <div className="flex flex-wrap gap-2">
                        {generatedModule.profilPelajarPancasila.map((item, idx) => (
                            <Badge key={`p5-${idx}`} variant="secondary" className="text-sm">{item}</Badge>
                        ))}
                    </div>
                </section>
                <Separator/>
                
                <section>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Sarana dan Prasarana</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                       {generatedModule.saranaPrasarana.map((item, idx) => <li key={`sarpras-${idx}`}>{item}</li>)}
                    </ul>
                </section>
                <Separator/>

                <p className="text-sm"><strong>Target Peserta Didik:</strong> {generatedModule.targetPesertaDidik}</p>
                <p className="text-sm"><strong>Model Pembelajaran:</strong> {generatedModule.modelPembelajaran}</p>
                <Separator/>

                <section>
                    <h3 className="text-2xl font-bold mb-4 text-primary flex items-center"><ListChecks className="mr-2 h-6 w-6"/>Komponen Inti</h3>
                    
                    <h4 className="text-lg font-semibold mt-3 mb-1">Tujuan Pembelajaran</h4>
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                        {generatedModule.komponenInti.tujuanPembelajaran.map((item, idx) => <li key={`tp-${idx}`}>{item}</li>)}
                    </ol>

                    <h4 className="text-lg font-semibold mt-3 mb-1">Pemahaman Bermakna</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {generatedModule.komponenInti.pemahamanBermakna.map((item, idx) => <li key={`pb-${idx}`}>{item}</li>)}
                    </ul>

                    <h4 className="text-lg font-semibold mt-3 mb-1">Pertanyaan Pemantik</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {generatedModule.komponenInti.pertanyaanPemantik.map((item, idx) => <li key={`pp-${idx}`}>{item}</li>)}
                    </ul>
                    
                    <h4 className="text-lg font-semibold mt-4 mb-2">Kegiatan Pembelajaran</h4>
                    <div className="space-y-3 text-sm">
                        <div><strong>Pendahuluan:</strong>
                            <ul className="list-disc pl-6 mt-1 space-y-0.5">
                                {generatedModule.komponenInti.kegiatanPembelajaran.pendahuluan.map((item, idx) => <li key={`kp-awal-${idx}`}>{item}</li>)}
                            </ul>
                        </div>
                        <div><strong>Kegiatan Inti:</strong>
                            <ol className="list-decimal pl-6 mt-1 space-y-2">
                                {generatedModule.komponenInti.kegiatanPembelajaran.inti.map((kegiatan, idx) => (
                                    <li key={`kp-inti-${idx}`}>
                                        <strong>{kegiatan.langkah}:</strong>
                                        <ul className="list-disc pl-6 mt-1 space-y-0.5">
                                            {kegiatan.detailAktivitas.map((detail, detailIdx) => <li key={`kp-inti-${idx}-detail-${detailIdx}`}>{detail}</li>)}
                                        </ul>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div><strong>Penutup:</strong>
                            <ul className="list-disc pl-6 mt-1 space-y-0.5">
                                {generatedModule.komponenInti.kegiatanPembelajaran.penutup.map((item, idx) => <li key={`kp-akhir-${idx}`}>{item}</li>)}
                            </ul>
                        </div>
                    </div>

                    <h4 className="text-lg font-semibold mt-4 mb-2">Asesmen</h4>
                    <div className="space-y-2 text-sm">
                        {generatedModule.komponenInti.asesmen.diagnostik && <p><strong>Diagnostik:</strong> {generatedModule.komponenInti.asesmen.diagnostik}</p>}
                        <p><strong>Formatif:</strong> {generatedModule.komponenInti.asesmen.formatif}</p>
                        <p><strong>Sumatif:</strong> {generatedModule.komponenInti.asesmen.sumatif}</p>
                    </div>

                    {generatedModule.komponenInti.pengayaanRemedial && (
                        <>
                            <h4 className="text-lg font-semibold mt-3 mb-1">Pengayaan dan Remedial</h4>
                            <p className="text-sm"><strong>Pengayaan:</strong> {generatedModule.komponenInti.pengayaanRemedial.pengayaan}</p>
                            <p className="text-sm"><strong>Remedial:</strong> {generatedModule.komponenInti.pengayaanRemedial.remedial}</p>
                        </>
                    )}
                    {generatedModule.komponenInti.refleksiPesertaDidikGuru && (
                         <section className="mt-4">
                            <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center"><MessageSquareHeart className="mr-2 h-5 w-5 text-accent"/>Refleksi</h3>
                            <p className="text-sm"><strong>Refleksi Peserta Didik:</strong> {generatedModule.komponenInti.refleksiPesertaDidikGuru.refleksiPesertaDidik}</p>
                            <p className="text-sm"><strong>Refleksi Guru:</strong> {generatedModule.komponenInti.refleksiPesertaDidikGuru.refleksiGuru}</p>
                        </section>
                    )}
                </section>
                <Separator/>

                {generatedModule.lampiran && (
                    <section>
                        <h3 className="text-2xl font-bold mb-3 text-primary">Lampiran</h3>
                        {generatedModule.lampiran.lembarKerjaPesertaDidik && (
                            <>
                                <h4 className="text-lg font-semibold mt-3 mb-1">Lembar Kerja Peserta Didik (LKPD)</h4>
                                <ReactMarkdown className="markdown-content text-sm" remarkPlugins={[remarkGfm]}>{generatedModule.lampiran.lembarKerjaPesertaDidik}</ReactMarkdown>
                            </>
                        )}
                        {generatedModule.lampiran.bahanBacaanGuruSiswa && generatedModule.lampiran.bahanBacaanGuruSiswa.length > 0 &&(
                            <>
                                <h4 className="text-lg font-semibold mt-3 mb-1">Bahan Bacaan Guru & Siswa</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {generatedModule.lampiran.bahanBacaanGuruSiswa.map((item, idx) => <li key={`bb-${idx}`}>{item}</li>)}
                                </ul>
                            </>
                        )}
                        {generatedModule.lampiran.glosarium && generatedModule.lampiran.glosarium.length > 0 && (
                            <>
                                <h4 className="text-lg font-semibold mt-3 mb-1">Glosarium</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {generatedModule.lampiran.glosarium.map((item, idx) => <li key={`glos-${idx}`}><strong>{item.istilah}:</strong> {item.penjelasan}</li>)}
                                </ul>
                            </>
                        )}
                        {generatedModule.lampiran.daftarPustaka && generatedModule.lampiran.daftarPustaka.length > 0 && (
                            <>
                                <h4 className="text-lg font-semibold mt-3 mb-1">Daftar Pustaka</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {generatedModule.lampiran.daftarPustaka.map((item, idx) => <li key={`dp-${idx}`}>{item}</li>)}
                                </ul>
                            </>
                        )}
                    </section>
                )}
              </CardContent>
              </ScrollArea>
              <CardFooter className="p-6 border-t bg-muted/20 rounded-b-lg">
                 <Alert variant="default" className="border-primary/50 shadow-sm rounded-md">
                    <Search className="h-5 w-5 text-primary" />
                    <AlertTitle className="font-semibold text-primary">Verifikasi & Sesuaikan Modul</AlertTitle>
                    <AlertDescription className="text-base">
                        Konten yang dihasilkan AI adalah draf awal. Selalu verifikasi keakuratan, kelengkapan, dan relevansi modul sebelum digunakan.
                    </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          )}
          
          {!generatedModule && !isGeneratingModule && (
            <Card className="shadow-lg h-full flex flex-col items-center justify-center text-center p-8 md:p-12 bg-muted/30 border-2 border-dashed border-border/70 rounded-lg min-h-[400px]">
                <BrainCircuit className="h-16 w-16 md:h-20 md:w-20 text-muted-foreground/40 mb-5" />
                <CardTitle className="text-2xl md:text-3xl font-semibold text-muted-foreground">Hasil Modul Ajar Akan Tampil di Sini</CardTitle>
                <CardDescription className="text-base md:text-lg text-muted-foreground mt-3 max-w-md">
                    Isi parameter di sebelah kiri dan klik "Buat Modul Ajar" untuk memulai.
                </CardDescription>
                <Alert variant="default" className="mt-6 max-w-md text-left border-primary/30 shadow-sm rounded-md">
                    <AlertTriangle className="h-5 w-5 text-primary"/>
                    <AlertTitle className="font-semibold text-primary">Tips Penggunaan AI</AlertTitle>
                    <AlertDescription className="text-sm">
                        Semakin detail input Anda (terutama pada Topik dan Elemen CP), semakin relevan hasil yang akan diberikan AI.
                        AI akan menyarankan konten berdasarkan praktik umum Kurikulum Merdeka.
                    </AlertDescription>
                </Alert>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
