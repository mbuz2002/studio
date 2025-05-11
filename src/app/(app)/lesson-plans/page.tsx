
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import type { LessonPlan, AnyCurriculumItem, CurriculumFramework } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search, BookOpenText, PlusCircle, X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurriculum } from "@/contexts/CurriculumContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const initialLessonPlansData: LessonPlan[] = [
  {
    id: "rpp1",
    type: "RPP",
    curriculumType: "Kurikulum Merdeka",
    title: "ATP Dasar-Dasar Animasi Fase F",
    subject: "Animasi",
    gradeLevel: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)",
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
    alokasiWaktuJP: "72 JP",
    createdAt: new Date("2023-09-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2023-09-05T14:30:00Z").toISOString(),
    createdByUserId: "user-4"
  },
  {
    id: "rpp2",
    type: "RPP",
    curriculumType: "K-13",
    title: "RPP Proses Fotosintesis (K-13 Demo)",
    subject: "IPA",
    gradeLevel: "Kelas VII SMP",
    topic: "Fotosintesis",
    kompetensiInti: ["KI-3: Memahami pengetahuan...", "KI-4: Mencoba, mengolah, dan menyaji..."],
    kompetensiDasar: ["3.7 Menganalisis konsep energi...", "4.7 Menyajikan hasil penyelidikan..."],
    indikatorPencapaianKompetensi: ["Menjelaskan proses fotosintesis", "Mengidentifikasi faktor-faktor fotosintesis"],
    learningObjectives: ["Siswa dapat menjelaskan proses fotosintesis.", "Siswa dapat mengidentifikasi faktor fotosintesis."],
    metodePembelajaran: ["Diskusi", "Eksperimen"],
    langkahPembelajaran: {
      pendahuluan: ["Salam, doa, presensi", "Apersepsi"],
      kegiatanInti: ["Mengamati video", "Diskusi kelompok", "Presentasi"],
      penutup: ["Kesimpulan", "Refleksi"],
    },
    assessment: "Observasi, Tes tulis, Laporan praktikum.",
    materials: "Buku teks, Video animasi",
    alokasiWaktuJP: "3 JP",
    createdAt: new Date("2023-10-10T09:00:00Z").toISOString(),
    updatedAt: new Date("2023-10-12T11:00:00Z").toISOString(),
    createdByUserId: "user-4"
  },
];

const LESSON_PLANS_STORAGE_KEY = "appLessonPlans";

export default function LessonPlansPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { availableCurriculums, defaultCurriculum } = useCurriculum();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  const [curriculumFilter, setCurriculumFilter] = useState<CurriculumFramework | "ALL">("ALL");
  const [gradeFilter, setGradeFilter] = useState<string | "ALL">("ALL");


  useEffect(() => {
    setIsClient(true);
    if (authLoading) return;

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
        setLessonPlans(initialLessonPlansData.map(lp => ({
            ...lp,
            createdByUserId: lp.createdByUserId || (user ? user.id : 'user-demo-fallback')
          })));
        toast({
          title: "Gagal Memuat Data Lokal",
          description: "Menggunakan data standar. Perubahan mungkin tidak tersimpan dengan benar.",
          variant: "destructive",
        });
      }
    }
  }, [toast, user, authLoading]);

  const uniqueGradeLevels = useMemo(() => {
    if (!isClient) return [];
    const grades = new Set(lessonPlans.map(lp => lp.gradeLevel));
    return Array.from(grades).sort();
  }, [lessonPlans, isClient]);


  const canCreate = user && (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum" || user.role === "Guru");

  const canEditItem = useCallback((item: AnyCurriculumItem): boolean => {
    if (!user) return false;
    const lessonPlanItem = item as LessonPlan;
    if (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum") return true;
    if (user.role === "Guru" && lessonPlanItem.createdByUserId === user.id) return true;
    if (user.role === "Guru" && initialLessonPlansData.some(lp => lp.id === lessonPlanItem.id && (!lessonPlanItem.createdByUserId || lessonPlanItem.createdByUserId === 'user-demo-fallback'))) return true;
    return false;
  }, [user]);

  const canDeleteItem = useCallback((item: AnyCurriculumItem): boolean => {
     if (!user) return false;
     const lessonPlanItem = item as LessonPlan;
    if (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum") return true;
    if (user.role === "Guru" && lessonPlanItem.createdByUserId === user.id) return true;
    if (user.role === "Guru" && initialLessonPlansData.some(lp => lp.id === lessonPlanItem.id && (!lessonPlanItem.createdByUserId || lessonPlanItem.createdByUserId === 'user-demo-fallback'))) return true;
    return false;
  }, [user]);

  const canImport = user && (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum");

  const handleEdit = useCallback((item: AnyCurriculumItem) => {
    if (!canEditItem(item as LessonPlan)) {
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit dokumen ini.", variant: "destructive" });
        return;
    }
    router.push(`/lesson-plans/edit/${item.id}`);
  }, [canEditItem, router, toast]);

  const handleDelete = useCallback((itemToDelete: AnyCurriculumItem) => {
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
  }, [canDeleteItem, lessonPlans, toast, setLessonPlans]);

  const handleView = useCallback((item: AnyCurriculumItem) => {
    const prettyPrintJson = JSON.stringify(item, null, 2);
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (newWindow) {
        newWindow.document.write(`<pre>${prettyPrintJson}</pre>`);
        newWindow.document.close();
    } else {
        toast({title: "Gagal Membuka Jendela Baru", description: "Mohon izinkan pop-up untuk situs ini.", variant: "destructive"});
    }
  }, [toast]);

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
      (user?.role !== "Guru" || lp.createdByUserId === user?.id || initialLessonPlansData.some(initialLp => initialLp.id === lp.id && (!lp.createdByUserId || lp.createdByUserId === 'user-demo-fallback')))
    ) : [];
  }, [isClient, lessonPlans, searchTerm, curriculumFilter, gradeFilter, user]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setCurriculumFilter("ALL");
    setGradeFilter("ALL");
    toast({ title: "Filter Direset", description: "Semua filter telah dikembalikan ke default." });
  }, [toast]);

  const activeFilterCount = [searchTerm, curriculumFilter, gradeFilter].filter(f => f !== "" && f !== "ALL").length;


  if (!isClient || authLoading || !user) {
    return (
      <LoadingSpinner
        icon={<BookOpenText className="h-12 w-12 animate-pulse text-primary mb-4" />}
        message="Memuat Dokumen Pembelajaran..."
      />
    );
  }

  const pageTitle = defaultCurriculum === "Kurikulum Merdeka" ? "ATP (Alur Tujuan Pembelajaran)" : "RPP (Rencana Pelaksanaan Pembelajaran)";
  const documentTypeForTable = defaultCurriculum === "Kurikulum Merdeka" ? "ATP" : "RPP";


  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <BookOpenText className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">{pageTitle}</CardTitle>
                <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                    Kelola {pageTitle} Anda.
                    {user.role === "KepalaSekolah" || user.role === "WakaKurikulum" || user.role === "TataUsaha" || user.role === "SuperAdmin" ? " Anda dapat melihat semua dokumen yang dibuat." : ""}
                    {user.role === "Guru" ? " Buat baru, edit, atau lihat rincian dokumen Anda." : ""}
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 items-center justify-between mb-6">
            <div className="w-full sm:flex-grow sm:max-w-xs md:max-w-sm lg:max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`Cari ${documentTypeForTable} (judul, jenjang, kurikulum, topik)...`}
                className="pl-10 w-full text-base md:text-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col xs:flex-row xs:flex-wrap gap-3 w-full sm:w-auto justify-center xs:justify-end">
              {canImport && (
                <Button variant="outline" className="w-full xs:w-auto text-base md:text-sm h-10" onClick={() => toast({title: "Fitur Belum Tersedia", description: "Impor dokumen akan segera hadir!"})}>
                    <FileUp className="mr-2 h-4 w-4" /> Impor
                </Button>
              )}
              {activeFilterCount > 0 && (
                <Button variant="outline" onClick={resetFilters} className="w-full xs:w-auto text-base md:text-sm h-10">
                  <X className="mr-2 h-4 w-4" /> Reset Filter ({activeFilterCount})
                </Button>
              )}
              {canCreate && (
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground w-full xs:w-auto">
                  <Link href="/lesson-plans/new">
                    <PlusCircle className="mr-2 h-5 w-5" /> Buat Dokumen Baru
                  </Link>
                </Button>
               )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
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
          </div>
          {filteredLessonPlans.length === 0 && searchTerm && (
            <Alert variant="default" className="mb-4 border-primary/30 shadow-sm">
                <Search className="h-5 w-5 text-primary"/>
                <AlertTitle>Pencarian Tidak Ditemukan</AlertTitle>
                <AlertDescription>
                    Tidak ada dokumen yang cocok dengan kata kunci "{searchTerm}". Coba kata kunci lain atau sesuaikan filter.
                </AlertDescription>
            </Alert>
          )}
          {filteredLessonPlans.length === 0 && !searchTerm && activeFilterCount > 0 && (
             <Alert variant="default" className="mb-4 border-primary/30 shadow-sm">
                <Filter className="h-5 w-5 text-primary"/>
                <AlertTitle>Filter Tidak Menemukan Hasil</AlertTitle>
                <AlertDescription>
                    Tidak ada dokumen yang cocok dengan kombinasi filter yang Anda pilih. Coba sesuaikan atau reset filter.
                </AlertDescription>
            </Alert>
          )}
          <div className="overflow-x-auto">
            <CurriculumDataTable
                items={filteredLessonPlans}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={canEditItem}
                canDelete={canDeleteItem}
                itemTypeForExport="RPP"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

