
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import type { SemesterProgram, AnyCurriculumItem, CurriculumFramework } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search, CalendarClock, PlusCircle, X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurriculum } from "@/contexts/CurriculumContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialSemesterProgramsData: SemesterProgram[] = [
  {
    id: "promes1",
    type: "Promes",
    curriculumType: "Kurikulum Merdeka",
    title: "Promes Matematika Fase D - Semester Ganjil 2024/2025 (Merdeka)",
    subject: "Matematika",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    semester: "1",
    year: "2024/2025",
    capaianPembelajaranUmum: "Peserta didik menunjukkan pemahaman dan intuisi bilangan (number sense) pada bilangan cacah sampai 1.000.000.",
    alokasiWaktuTotalSemester: "18 Minggu Efektif x 4 JP/Minggu = 72 JP",
    komponenMingguan: [
      { mingguKe: 1, bulan: "Juli", materiPokokAtauTujuanPembelajaran: "Orientasi dan Asesmen Diagnostik Awal", alokasiWaktu: "4 JP", metodeStrategi: ["Diskusi", "Tes diagnostik"], sumberBelajar: ["Modul Ajar"], rencanaAsesmen: ["Observasi", "Hasil tes"], catatanIntegrasiP5: "Pengenalan nilai-nilai P5."},
      { mingguKe: 2, bulan: "Juli", materiPokokAtauTujuanPembelajaran: "Bilangan: Membaca dan Menulis Bilangan Cacah", alokasiWaktu: "4 JP", metodeStrategi: ["Permainan kartu angka", "Latihan terbimbing"], sumberBelajar: ["Buku Siswa Bab 1"], rencanaAsesmen: ["Kinerja membaca bilangan", "Lembar kerja"], catatanIntegrasiP5: "Ketelitian (Mandiri)"},
    ],
    createdAt: new Date("2024-07-10T00:00:00Z").toISOString(),
    updatedAt: new Date("2024-07-12T00:00:00Z").toISOString(),
    createdByUserId: "user-3"
  },
  {
    id: "promes2",
    type: "Promes",
    curriculumType: "KTSP 2006",
    title: "Promes IPA Kelas VIII - Semester Genap 2024/2025 (KTSP)",
    subject: "IPA",
    gradeLevel: "Kelas VIII SMP",
    semester: "2",
    year: "2024/2025",
    capaianPembelajaranUmum: "SK 5: Memahami peranan usaha, gaya, dan energi dalam kehidupan sehari-hari.",
    alokasiWaktuTotalSemester: "16 Minggu Efektif x 5 JP/Minggu = 80 JP",
    komponenMingguan: [
      { mingguKe: 1, bulan: "Januari", materiPokokAtauTujuanPembelajaran: "Materi Pokok: Gaya dan Penerapannya (KD 5.1 Mengidentifikasi jenis-jenis gaya...)", alokasiWaktu: "5 JP", metodeStrategi: ["Eksperimen sederhana", "Pengamatan"], sumberBelajar: ["Modul IPA KTSP"], rencanaAsesmen: ["Laporan praktikum", "Kuis"], catatanIntegrasiP5: "Sikap ilmiah saat eksperimen."},
      { mingguKe: 2, bulan: "Januari", materiPokokAtauTujuanPembelajaran: "Materi Pokok: Usaha dan Energi (KD 5.2 Menghitung besar energi potensial dan kinetik)", alokasiWaktu: "5 JP", metodeStrategi: ["Studi kasus", "Problem solving"], sumberBelajar: ["Buku Teks IPA"], rencanaAsesmen: ["Penyelesaian soal", "Partisipasi diskusi"]},
    ],
    createdAt: new Date("2024-07-11T00:00:00Z").toISOString(),
    updatedAt: new Date("2024-07-15T00:00:00Z").toISOString(),
    createdByUserId: "user-1"
  },
];

const SEMESTER_PROGRAMS_STORAGE_KEY = "appSemesterPrograms";

export default function SemesterProgramsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { availableCurriculums } = useCurriculum();
  const [semesterPrograms, setSemesterPrograms] = useState<SemesterProgram[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  const [curriculumFilter, setCurriculumFilter] = useState<CurriculumFramework | "ALL">("ALL");
  const [gradeFilter, setGradeFilter] = useState<string | "ALL">("ALL");
  const [yearFilter, setYearFilter] = useState<string | "ALL">("ALL");
  const [semesterFilter, setSemesterFilter] = useState<"1" | "2" | "ALL">("ALL");

  useEffect(() => {
    setIsClient(true);
    if (authLoading) return;

    if (typeof window !== 'undefined') {
      try {
        const storedSemesterPrograms = localStorage.getItem(SEMESTER_PROGRAMS_STORAGE_KEY);
        if (storedSemesterPrograms) {
          setSemesterPrograms(JSON.parse(storedSemesterPrograms));
        } else {
           const dataToStore = initialSemesterProgramsData.map(sp => ({
            ...sp,
            createdByUserId: sp.createdByUserId || (user ? user.id : 'user-demo-fallback')
          }));
          setSemesterPrograms(dataToStore);
          localStorage.setItem(SEMESTER_PROGRAMS_STORAGE_KEY, JSON.stringify(dataToStore));
        }
      } catch (error) {
        console.error("Failed to access or parse localStorage for semester programs:", error);
        setSemesterPrograms(initialSemesterProgramsData.map(sp => ({
            ...sp,
            createdByUserId: sp.createdByUserId || (user ? user.id : 'user-demo-fallback')
          })));
        toast({
          title: "Gagal Memuat Data Lokal",
          description: "Menggunakan data Promes standar. Perubahan mungkin tidak tersimpan dengan benar.",
          variant: "destructive",
        });
      }
    }
  }, [toast, user, authLoading]);

  const uniqueGradeLevels = useMemo(() => {
    if (!isClient) return [];
    const grades = new Set(semesterPrograms.map(sp => sp.gradeLevel));
    return Array.from(grades).sort();
  }, [semesterPrograms, isClient]);

  const uniqueYears = useMemo(() => {
    if (!isClient) return [];
    const years = new Set(semesterPrograms.map(sp => sp.year));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [semesterPrograms, isClient]);


  const canCreate = user && (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum" || user.role === "Guru");

  const canEdit = useCallback((item: AnyCurriculumItem): boolean => {
    if (!user) return false;
    const semesterProgramItem = item as SemesterProgram;
    if (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum") return true;
    if (user.role === "Guru" && semesterProgramItem.createdByUserId === user.id) return true;
    if (user.role === "Guru" && initialSemesterProgramsData.some(sp => sp.id === semesterProgramItem.id && (!semesterProgramItem.createdByUserId || semesterProgramItem.createdByUserId === 'user-demo-fallback'))) return true;
    return false;
  }, [user]);

  const canDelete = useCallback((item: AnyCurriculumItem): boolean => {
    if (!user) return false;
    const semesterProgramItem = item as SemesterProgram;
    if (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum") return true;
    if (user.role === "Guru" && semesterProgramItem.createdByUserId === user.id) return true;
    if (user.role === "Guru" && initialSemesterProgramsData.some(sp => sp.id === semesterProgramItem.id && (!semesterProgramItem.createdByUserId || semesterProgramItem.createdByUserId === 'user-demo-fallback'))) return true;
    return false;
  }, [user]);

  const canImport = user && (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum");

  const handleEdit = useCallback((item: AnyCurriculumItem) => {
    if (!canEdit(item as SemesterProgram)) {
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit Promes ini.", variant: "destructive" });
        return;
    }
    router.push(`/semester-programs/edit/${item.id}`);
  }, [canEdit, router, toast]);

  const handleDelete = useCallback((itemToDelete: AnyCurriculumItem) => {
     if (!canDelete(itemToDelete as SemesterProgram)) {
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk menghapus Promes ini.", variant: "destructive" });
        return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${itemToDelete.title}"?`)) {
      const updatedSemesterPrograms = semesterPrograms.filter(sp => sp.id !== itemToDelete.id);
      setSemesterPrograms(updatedSemesterPrograms);
      localStorage.setItem(SEMESTER_PROGRAMS_STORAGE_KEY, JSON.stringify(updatedSemesterPrograms));
      toast({ title: "Promes Dihapus", description: `"${itemToDelete.title}" telah berhasil dihapus.`});
    }
  }, [canDelete, semesterPrograms, toast, setSemesterPrograms]);

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

  const filteredSemesterPrograms = useMemo(() => {
    return isClient ? semesterPrograms.filter(sp =>
      (sp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `Semester ${sp.semester}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sp.curriculumType.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (curriculumFilter === "ALL" || sp.curriculumType === curriculumFilter) &&
      (gradeFilter === "ALL" || sp.gradeLevel === gradeFilter) &&
      (yearFilter === "ALL" || sp.year === yearFilter) &&
      (semesterFilter === "ALL" || sp.semester === semesterFilter) &&
      (user?.role !== "Guru" || sp.createdByUserId === user?.id || initialSemesterProgramsData.some(initialSp => initialSp.id === sp.id && (!sp.createdByUserId || sp.createdByUserId === 'user-demo-fallback')))
    ) : [];
  }, [isClient, semesterPrograms, searchTerm, curriculumFilter, gradeFilter, yearFilter, semesterFilter, user]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setCurriculumFilter("ALL");
    setGradeFilter("ALL");
    setYearFilter("ALL");
    setSemesterFilter("ALL");
    toast({ title: "Filter Direset", description: "Semua filter telah dikembalikan ke default." });
  }, [toast]);

  const activeFilterCount = [searchTerm, curriculumFilter, gradeFilter, yearFilter, semesterFilter].filter(f => f !== "" && f !== "ALL").length;


  if (!isClient || authLoading || !user) {
    return (
      <LoadingSpinner
        icon={<CalendarClock className="h-12 w-12 animate-pulse text-primary mb-4" />}
        message="Memuat Program Semester..."
      />
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CalendarClock className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Program Semester (Promes)</CardTitle>
                <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                    Rincikan rencana pengajaran Anda untuk setiap semester.
                    {user.role === "KepalaSekolah" || user.role === "WakaKurikulum" || user.role === "TataUsaha" || user.role === "SuperAdmin" ? " Anda dapat melihat semua Promes." : ""}
                    {user.role === "Guru" ? " Lihat Promes yang telah disusun." : ""}
                    {(user.role === "Admin" || user.role === "SuperAdmin" || user.role === "WakaKurikulum" || user.role === "Guru") && " Anda dapat membuat, mengedit, dan menghapus Promes."}
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
                placeholder="Cari Promes (judul, semester, kurikulum)..."
                className="pl-10 w-full text-base md:text-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col xs:flex-row xs:flex-wrap gap-3 w-full sm:w-auto justify-center xs:justify-end">
              {canImport && (
                <Button variant="outline" className="w-full xs:w-auto text-base md:text-sm h-10" onClick={() => toast({title: "Fitur Belum Tersedia", description: "Impor Promes akan segera hadir!"})}>
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
                  <Link href="/semester-programs/new">
                      <PlusCircle className="mr-2 h-5 w-5" /> Buat Program Baru
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div>
              <Label htmlFor="curriculumFilterSp" className="text-xs">Kurikulum</Label>
              <Select value={curriculumFilter} onValueChange={(value) => setCurriculumFilter(value as CurriculumFramework | "ALL")}>
                <SelectTrigger id="curriculumFilterSp" className="h-10 text-sm">
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
              <Label htmlFor="gradeFilterSp" className="text-xs">Jenjang/Fase</Label>
              <Select value={gradeFilter} onValueChange={(value) => setGradeFilter(value)}>
                <SelectTrigger id="gradeFilterSp" className="h-10 text-sm">
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
              <Label htmlFor="yearFilterSp" className="text-xs">Tahun Ajaran</Label>
              <Select value={yearFilter} onValueChange={(value) => setYearFilter(value)}>
                <SelectTrigger id="yearFilterSp" className="h-10 text-sm">
                  <SelectValue placeholder="Filter Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Tahun</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="semesterFilterSp" className="text-xs">Semester</Label>
              <Select value={semesterFilter} onValueChange={(value) => setSemesterFilter(value as "1" | "2" | "ALL")}>
                <SelectTrigger id="semesterFilterSp" className="h-10 text-sm">
                  <SelectValue placeholder="Filter Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Semester</SelectItem>
                  <SelectItem value="1">Ganjil</SelectItem>
                  <SelectItem value="2">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {filteredSemesterPrograms.length === 0 && searchTerm && (
            <Alert variant="default" className="mb-4 border-primary/30 shadow-sm">
                <Search className="h-5 w-5 text-primary"/>
                <AlertTitle>Pencarian Tidak Ditemukan</AlertTitle>
                <AlertDescription>
                    Tidak ada Promes yang cocok dengan kata kunci "{searchTerm}". Coba kata kunci lain atau sesuaikan filter.
                </AlertDescription>
            </Alert>
          )}
          {filteredSemesterPrograms.length === 0 && !searchTerm && activeFilterCount > 0 && (
             <Alert variant="default" className="mb-4 border-primary/30 shadow-sm">
                <Filter className="h-5 w-5 text-primary"/>
                <AlertTitle>Filter Tidak Menemukan Hasil</AlertTitle>
                <AlertDescription>
                    Tidak ada Promes yang cocok dengan kombinasi filter yang Anda pilih. Coba sesuaikan atau reset filter.
                </AlertDescription>
            </Alert>
          )}
          <div className="overflow-x-auto">
            <CurriculumDataTable
                items={filteredSemesterPrograms}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={canEdit}
                canDelete={canDelete}
                itemTypeForExport="Promes"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

