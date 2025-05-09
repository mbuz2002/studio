
"use client";

import { useState, useEffect, useMemo } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import type { LessonPlan, AnyCurriculumItem, CurriculumFramework } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search, Loader2, BookOpenText, PlusCircle, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurriculum } from "@/contexts/CurriculumContext"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";


const initialLessonPlansData: LessonPlan[] = [
  {
    id: "rpp1",
    type: "RPP",
    curriculumType: "Kurikulum Merdeka",
    title: "ATP Dasar-Dasar Animasi Fase F",
    subject: "Animasi",
    gradeLevel: "Fase F (Kelas XI-XII SMK)",
    topic: "Dasar-Dasar Keahlian Animasi", 
    bidangKeahlian: "Seni dan Ekonomi Kreatif",
    programKeahlian: "Animasi",
    capaianPembelajaran: ["Pada akhir fase F, peserta didik mampu memahami prinsip dasar animasi.", "Peserta didik mampu membuat animasi sederhana menggunakan perangkat lunak."],
    learningObjectives: [
        "Memahami 12 prinsip dasar animasi.", 
        "Mengidentifikasi jenis-jenis software animasi.",
        "Mempraktikkan pembuatan storyboard untuk animasi pendek.",
        "Membuat animasi objek bergerak sederhana (bola memantul)."
    ],
    profilPelajarPancasilaFocus: ["Kreatif", "Bernalar Kritis"],
    pemahamanBermakna: ["Animasi adalah media komunikasi visual yang kuat.", "Prinsip dasar animasi adalah kunci menghasilkan gerakan yang alami dan menarik."],
    pertanyaanPemantik: ["Bagaimana benda mati bisa terlihat hidup di layar?", "Apa saja langkah-langkah membuat film animasi pendek?"],
    langkahPembelajaran: {
      pendahuluan: ["Salam dan doa", "Apersepsi: Menampilkan contoh animasi pendek", "Menyampaikan tujuan dan alur pembelajaran ATP"],
      kegiatanInti: ["Diskusi kelompok: Menganalisis 12 prinsip animasi dari contoh video.", "Eksplorasi mandiri: Mencoba fitur dasar software animasi.", "Praktik terbimbing: Membuat storyboard.", "Proyek mini: Animasi bola memantul."],
      penutup: ["Refleksi: Apa tantangan terbesar dalam membuat animasi?", "Presentasi hasil proyek mini (sampling).", "Umpan balik dan kesimpulan."],
    },
    assessment: "Observasi keaktifan diskusi, Penilaian storyboard, Penilaian hasil animasi bola memantul (rubrik).",
    differentiationStrategies: ["Memberikan contoh storyboard yang lebih kompleks untuk siswa mahir.", "Memberikan template storyboard untuk siswa yang membutuhkan."],
    materials: "Komputer dengan software animasi (Blender/Adobe Animate), Proyektor, Video contoh animasi, Referensi 12 Prinsip Animasi.",
    alokasiWaktuJP: "72 JP (Untuk keseluruhan ATP)",
    createdAt: new Date("2023-09-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2023-09-05T14:30:00Z").toISOString(),
    createdByUserId: "user-4" 
  },
  {
    id: "rpp2",
    type: "RPP",
    curriculumType: "K-13",
    title: "RPP Proses Fotosintesis (K-13)",
    subject: "IPA",
    gradeLevel: "Kelas VII SMP",
    topic: "Fotosintesis",
    kompetensiInti: ["KI-3: Memahami pengetahuan (faktual, konseptual, dan prosedural) berdasarkan rasa ingin tahunya tentang ilmu pengetahuan...", "KI-4: Mencoba, mengolah, dan menyaji dalam ranah konkret..."],
    kompetensiDasar: ["3.7 Menganalisis konsep energi, berbagai sumber energi, dan perubahan bentuk energi dalam kehidupan sehari-hari termasuk fotosintesis", "4.7 Menyajikan hasil penyelidikan tentang perubahan bentuk energi termasuk fotosintesis"],
    indikatorPencapaianKompetensi: ["Menjelaskan proses fotosintesis", "Mengidentifikasi faktor-faktor yang mempengaruhi fotosintesis"],
    learningObjectives: ["Setelah pembelajaran, siswa dapat menjelaskan proses fotosintesis dengan benar.", "Setelah pembelajaran, siswa dapat mengidentifikasi minimal 3 faktor yang mempengaruhi fotosintesis."],
    metodePembelajaran: ["Diskusi", "Eksperimen", "Tanya Jawab"],
    langkahPembelajaran: {
      pendahuluan: ["Salam, doa, presensi", "Apersepsi: Menanyakan tumbuhan di sekitar", "Menyampaikan KD dan tujuan"],
      kegiatanInti: ["Mengamati video fotosintesis", "Diskusi kelompok tentang bahan dan hasil fotosintesis", "Melakukan percobaan sederhana (opsional)", "Presentasi kelompok"],
      penutup: ["Kesimpulan", "Refleksi", "Pemberian tugas"],
    },
    assessment: "Penilaian sikap (observasi), Penilaian pengetahuan (tes tulis), Penilaian keterampilan (laporan praktikum/presentasi).",
    materials: "Buku teks IPA K-13, Video animasi fotosintesis, Gambar/Charta, Alat dan bahan praktikum (jika ada)",
    alokasiWaktuJP: "3 JP",
    createdAt: new Date("2023-10-10T09:00:00Z").toISOString(),
    updatedAt: new Date("2023-10-12T11:00:00Z").toISOString(),
    createdByUserId: "user-4" 
  },
];

const LESSON_PLANS_STORAGE_KEY = "appLessonPlans";

export default function LessonPlansPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { availableCurriculums } = useCurriculum();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  const [curriculumFilter, setCurriculumFilter] = useState<CurriculumFramework | "ALL">("ALL");
  const [gradeFilter, setGradeFilter] = useState<string | "ALL">("ALL");
  const [subjectFilter, setSubjectFilter] = useState<string | "ALL">("ALL");


  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      try {
        const storedLessonPlans = localStorage.getItem(LESSON_PLANS_STORAGE_KEY);
        if (storedLessonPlans) {
          setLessonPlans(JSON.parse(storedLessonPlans));
        } else {
          const dataToStore = initialLessonPlansData.map(lp => ({
            ...lp,
            createdByUserId: lp.createdByUserId || (user ? user.id : 'user-demo-fallback') 
          }));
          setLessonPlans(dataToStore);
          localStorage.setItem(LESSON_PLANS_STORAGE_KEY, JSON.stringify(dataToStore));
        }
      } catch (error) {
        console.error("Failed to access or parse localStorage for lesson plans:", error);
        setLessonPlans(initialLessonPlansData); 
        toast({
          title: "Gagal Memuat Data Lokal",
          description: "Menggunakan data standar. Perubahan mungkin tidak tersimpan dengan benar.",
          variant: "destructive",
        });
      }
    }
  }, [toast, user]);

  const uniqueGradeLevels = useMemo(() => {
    if (!isClient) return [];
    const grades = new Set(lessonPlans.map(lp => lp.gradeLevel));
    return Array.from(grades).sort();
  }, [lessonPlans, isClient]);

  const uniqueSubjects = useMemo(() => {
    if (!isClient) return [];
    const subjects = new Set(lessonPlans.map(lp => lp.subject));
    return Array.from(subjects).sort();
  }, [lessonPlans, isClient]);


  const canCreate = user && (user.role === "Admin" || user.role === "WakaKurikulum" || user.role === "Guru");
  
  const canEditItem = (item: LessonPlan): boolean => {
    if (!user) return false;
    if (user.role === "Admin" || user.role === "WakaKurikulum") return true;
    if (user.role === "Guru" && item.createdByUserId === user.id) return true; 
    if (user.role === "Guru" && initialLessonPlansData.some(lp => lp.id === item.id && (!item.createdByUserId || item.createdByUserId === 'user-demo-fallback'))) return true;
    return false;
  };

  const canDeleteItem = (item: LessonPlan): boolean => {
     if (!user) return false;
    if (user.role === "Admin" || user.role === "WakaKurikulum") return true;
    if (user.role === "Guru" && item.createdByUserId === user.id) return true;
    if (user.role === "Guru" && initialLessonPlansData.some(lp => lp.id === item.id && (!item.createdByUserId || item.createdByUserId === 'user-demo-fallback'))) return true;
    return false;
  };

  const canImport = user && (user.role === "Admin" || user.role === "WakaKurikulum");

  const handleEdit = (item: AnyCurriculumItem) => {
    if (!canEditItem(item as LessonPlan)) { 
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit dokumen ini.", variant: "destructive" });
        return;
    }
    router.push(`/lesson-plans/edit/${item.id}`);
  };

  const handleDelete = (itemToDelete: AnyCurriculumItem) => {
    if (!canDeleteItem(itemToDelete as LessonPlan)) { 
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk menghapus dokumen ini.", variant: "destructive" });
        return;
    }
    const docType = (itemToDelete as LessonPlan).curriculumType === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP";
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${docType} "${itemToDelete.title}"?`)) {
      const updatedLessonPlans = lessonPlans.filter(lp => lp.id !== itemToDelete.id);
      setLessonPlans(updatedLessonPlans);
      localStorage.setItem(LESSON_PLANS_STORAGE_KEY, JSON.stringify(updatedLessonPlans));
      toast({ title: `${docType} Dihapus`, description: `"${itemToDelete.title}" telah berhasil dihapus.`});
    }
  };
  
  const handleView = (item: AnyCurriculumItem) => {
    const prettyPrintJson = JSON.stringify(item, null, 2);
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    newWindow?.document.write(`<pre>${prettyPrintJson}</pre>`);
    newWindow?.document.close();
  };

  const filteredLessonPlans = useMemo(() => {
    return isClient ? lessonPlans.filter(lp =>
      (lp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lp.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lp.curriculumType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lp.topic && lp.topic.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (curriculumFilter === "ALL" || lp.curriculumType === curriculumFilter) &&
      (gradeFilter === "ALL" || lp.gradeLevel === gradeFilter) &&
      (subjectFilter === "ALL" || lp.subject === subjectFilter) &&
      (user?.role !== "Guru" || lp.createdByUserId === user?.id || initialLessonPlansData.some(initialLp => initialLp.id === lp.id && (!lp.createdByUserId || lp.createdByUserId === 'user-demo-fallback'))) 
    ) : [];
  }, [isClient, lessonPlans, searchTerm, curriculumFilter, gradeFilter, subjectFilter, user]);

  const resetFilters = () => {
    setSearchTerm("");
    setCurriculumFilter("ALL");
    setGradeFilter("ALL");
    setSubjectFilter("ALL");
    toast({ title: "Filter Direset", description: "Semua filter telah dikembalikan ke default." });
  };

  const activeFilterCount = [searchTerm, curriculumFilter, gradeFilter, subjectFilter].filter(f => f !== "" && f !== "ALL").length;


  if (!isClient || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat Dokumen Pembelajaran...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <BookOpenText className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Modul Ajar / RPP / ATP</CardTitle>
                <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                    Kelola Modul Ajar (Kurikulum Merdeka), Rencana Pelaksanaan Pembelajaran (RPP K13/KTSP), atau Alur Tujuan Pembelajaran (ATP).
                    {user.role === "KepalaSekolah" || user.role === "WakaKurikulum" || user.role === "TataUsaha" ? " Anda dapat melihat semua dokumen yang dibuat." : ""}
                    {user.role === "Guru" ? " Buat baru, edit, atau lihat rincian dokumen Anda." : ""}
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari (judul, mapel, jenjang, kurikulum, topik)..."
                  className="pl-10 w-full text-base md:text-sm h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {canImport && (
                  <Button variant="outline" className="w-full sm:w-auto text-base md:text-sm h-10" onClick={() => toast({title: "Fitur Belum Tersedia", description: "Impor dokumen akan segera hadir!"})}>
                      <FileUp className="mr-2 h-4 w-4" /> Impor
                  </Button>
                )}
                {activeFilterCount > 0 && (
                  <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto text-base md:text-sm h-10">
                    <X className="mr-2 h-4 w-4" /> Reset Filter ({activeFilterCount})
                  </Button>
                )}
              </div>
              {canCreate && (
                  <div className="w-full md:w-auto">
                      <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                        <Link href="/lesson-plans/new">
                          <PlusCircle className="mr-2 h-5 w-5" /> Buat Dokumen Baru
                        </Link>
                      </Button>
                  </div>
               )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="curriculumFilterLp" className="text-xs">Kurikulum</Label>
                <Select value={curriculumFilter} onValueChange={(value) => setCurriculumFilter(value as CurriculumFramework | "ALL")}>
                  <SelectTrigger id="curriculumFilterLp" className="h-10 text-sm">
                    <SelectValue placeholder="Filter Kurikulum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Kurikulum</SelectItem>
                    {availableCurriculums.map(curr => (
                      <SelectItem key={curr.value} value={curr.value}>{curr.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gradeFilterLp" className="text-xs">Jenjang/Fase</Label>
                <Select value={gradeFilter} onValueChange={(value) => setGradeFilter(value)}>
                  <SelectTrigger id="gradeFilterLp" className="h-10 text-sm">
                    <SelectValue placeholder="Filter Jenjang/Fase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Jenjang/Fase</SelectItem>
                    {uniqueGradeLevels.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subjectFilterLp" className="text-xs">Mata Pelajaran</Label>
                <Select value={subjectFilter} onValueChange={(value) => setSubjectFilter(value)}>
                  <SelectTrigger id="subjectFilterLp" className="h-10 text-sm">
                    <SelectValue placeholder="Filter Mata Pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Mapel</SelectItem>
                    {uniqueSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <CurriculumDataTable
                items={filteredLessonPlans}
                onView={handleView}
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                canEdit={(item) => canEditItem(item as LessonPlan)} 
                canDelete={(item) => canDeleteItem(item as LessonPlan)} 
                itemTypeForExport="RPP" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

