
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import type { AnnualProgram, AnyCurriculumItem, CurriculumFramework } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search, CalendarDays, PlusCircle, X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurriculum } from "@/contexts/CurriculumContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialAnnualProgramsData: AnnualProgram[] = [
  {
    id: "prota1",
    type: "PROTA",
    curriculumType: "Kurikulum Merdeka",
    title: "PROTA Matematika Fase D 2024/2025 (Merdeka)",
    subject: "Matematika",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    year: "2024/2025",
    semester1Components: [
      { topic: "Bilangan", elemenCapaianPembelajaran: ["Memahami sifat-sifat bilangan", "Operasi hitung"], alokasiWaktu: "30 JP" },
      { topic: "Aljabar", elemenCapaianPembelajaran: ["Ekspresi aljabar", "Persamaan linear"], alokasiWaktu: "36 JP" },
    ],
    semester2Components: [
      { topic: "Geometri", elemenCapaianPembelajaran: ["Bangun datar", "Bangun ruang"], alokasiWaktu: "30 JP" },
      { topic: "Data dan Peluang", elemenCapaianPembelajaran: ["Penyajian data", "Analisis data sederhana"], alokasiWaktu: "24 JP" },
    ],
    profilPelajarPancasilaFocus: ["Bernalar Kritis", "Kreatif"],
    createdAt: new Date("2024-07-01T00:00:00Z").toISOString(),
    updatedAt: new Date("2024-07-05T00:00:00Z").toISOString(),
    createdByUserId: "user-3"
  },
  {
    id: "prota2",
    type: "PROTA",
    curriculumType: "K-13",
    title: "PROTA IPA Kelas X 2024/2025 (K-13)",
    subject: "IPA (Fisika, Kimia, Biologi)",
    gradeLevel: "Kelas X SMA/SMK",
    year: "2024/2025",
    semester1Components: [
      { topic: "Fisika: Pengukuran dan Kinematika", elemenCapaianPembelajaran: ["KD 3.1 Menerapkan hakikat ilmu Fisika...", "KD 3.2 Menganalisis gerak lurus..."], alokasiWaktu: "24 JP" },
      { topic: "Kimia: Struktur Atom dan Ikatan Kimia", elemenCapaianPembelajaran: ["KD 3.1 Memahami perkembangan model atom...", "KD 3.2 Menganalisis proses pembentukan ikatan kimia..."], alokasiWaktu: "20 JP" },
    ],
    semester2Components: [
      { topic: "Fisika: Dinamika dan Usaha Energi", elemenCapaianPembelajaran: ["KD 3.3 Menganalisis interaksi pada gaya...", "KD 3.4 Menganalisis konsep energi..."], alokasiWaktu: "24 JP" },
      { topic: "Kimia: Stoikiometri dan Larutan", elemenCapaianPembelajaran: ["KD 3.5 Menerapkan hukum-hukum dasar kimia...", "KD 3.6 Membedakan sifat koligatif larutan..."], alokasiWaktu: "20 JP" },
    ],
    createdAt: new Date("2024-07-02T00:00:00Z").toISOString(),
    updatedAt: new Date("2024-07-06T00:00:00Z").toISOString(),
    createdByUserId: "user-1"
  },
];

const ANNUAL_PROGRAMS_STORAGE_KEY = "appAnnualPrograms";

export default function AnnualProgramsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { availableCurriculums } = useCurriculum();
  const [annualPrograms, setAnnualPrograms] = useState<AnnualProgram[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  const [curriculumFilter, setCurriculumFilter] = useState<CurriculumFramework | "ALL">("ALL");
  const [gradeFilter, setGradeFilter] = useState<string | "ALL">("ALL");
  const [yearFilter, setYearFilter] = useState<string | "ALL">("ALL");

  useEffect(() => {
    setIsClient(true);
    if (authLoading) return;

    if (typeof window !== 'undefined') {
      try {
        const storedAnnualPrograms = localStorage.getItem(ANNUAL_PROGRAMS_STORAGE_KEY);
        if (storedAnnualPrograms) {
          setAnnualPrograms(JSON.parse(storedAnnualPrograms));
        } else {
           const dataToStore = initialAnnualProgramsData.map(ap => ({
            ...ap,
            createdByUserId: ap.createdByUserId || (user ? user.id : 'user-demo-fallback')
          }));
          setAnnualPrograms(dataToStore);
          localStorage.setItem(ANNUAL_PROGRAMS_STORAGE_KEY, JSON.stringify(dataToStore));
        }
      } catch (error) {
        console.error("Failed to access or parse localStorage for annual programs:", error);
        setAnnualPrograms(initialAnnualProgramsData.map(ap => ({
            ...ap,
            createdByUserId: ap.createdByUserId || (user ? user.id : 'user-demo-fallback')
          })));
        toast({
          title: "Gagal Memuat Data Lokal",
          description: "Menggunakan data PROTA standar. Perubahan mungkin tidak tersimpan dengan benar.",
          variant: "destructive",
        });
      }
    }
  }, [toast, user, authLoading]);

  const uniqueGradeLevels = useMemo(() => {
    if (!isClient) return [];
    const grades = new Set(annualPrograms.map(ap => ap.gradeLevel));
    return Array.from(grades).sort();
  }, [annualPrograms, isClient]);

  const uniqueYears = useMemo(() => {
    if (!isClient) return [];
    const years = new Set(annualPrograms.map(ap => ap.year));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [annualPrograms, isClient]);


  const canCreate = user && (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum" || user.role === "Guru");

  const canEdit = useCallback((item: AnyCurriculumItem): boolean => {
    if (!user) return false;
    const annualProgramItem = item as AnnualProgram;
    if (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum") return true;
    if (user.role === "Guru" && annualProgramItem.createdByUserId === user.id) return true;
    if (user.role === "Guru" && initialAnnualProgramsData.some(ap => ap.id === annualProgramItem.id && (!annualProgramItem.createdByUserId || annualProgramItem.createdByUserId === 'user-demo-fallback'))) return true;
    return false;
  }, [user]);

  const canDelete = useCallback((item: AnyCurriculumItem): boolean => {
    if (!user) return false;
    const annualProgramItem = item as AnnualProgram;
    if (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum") return true;
    if (user.role === "Guru" && annualProgramItem.createdByUserId === user.id) return true;
    if (user.role === "Guru" && initialAnnualProgramsData.some(ap => ap.id === annualProgramItem.id && (!annualProgramItem.createdByUserId || annualProgramItem.createdByUserId === 'user-demo-fallback'))) return true;
    return false;
  }, [user]);

  const canImport = user && (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "WakaKurikulum");


  const handleEdit = useCallback((item: AnyCurriculumItem) => {
    if (!canEdit(item as AnnualProgram)) {
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit PROTA ini.", variant: "destructive" });
        return;
    }
    router.push(`/annual-programs/edit/${item.id}`);
  }, [canEdit, router, toast]);

  const handleDelete = useCallback((itemToDelete: AnyCurriculumItem) => {
    if (!canDelete(itemToDelete as AnnualProgram)) {
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk menghapus PROTA ini.", variant: "destructive" });
        return;
    }
     if (window.confirm(`Apakah Anda yakin ingin menghapus "${itemToDelete.title}"?`)) {
      const updatedAnnualPrograms = annualPrograms.filter(ap => ap.id !== itemToDelete.id);
      setAnnualPrograms(updatedAnnualPrograms);
      localStorage.setItem(ANNUAL_PROGRAMS_STORAGE_KEY, JSON.stringify(updatedAnnualPrograms));
      toast({ title: "PROTA Dihapus", description: `"${itemToDelete.title}" telah berhasil dihapus.`});
    }
  }, [canDelete, annualPrograms, toast, setAnnualPrograms]);

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

  const filteredAnnualPrograms = useMemo(() => {
    return isClient ? annualPrograms.filter(ap =>
      (ap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.year.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.curriculumType.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (curriculumFilter === "ALL" || ap.curriculumType === curriculumFilter) &&
      (gradeFilter === "ALL" || ap.gradeLevel === gradeFilter) &&
      (yearFilter === "ALL" || ap.year === yearFilter) &&
      (user?.role !== "Guru" || ap.createdByUserId === user?.id || initialAnnualProgramsData.some(initialAp => initialAp.id === ap.id && (!ap.createdByUserId || ap.createdByUserId === 'user-demo-fallback')))
    ) : [];
  }, [isClient, annualPrograms, searchTerm, curriculumFilter, gradeFilter, yearFilter, user]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setCurriculumFilter("ALL");
    setGradeFilter("ALL");
    setYearFilter("ALL");
    toast({ title: "Filter Direset", description: "Semua filter telah dikembalikan ke default." });
  }, [toast]);

  const activeFilterCount = [searchTerm, curriculumFilter, gradeFilter, yearFilter].filter(f => f !== "" && f !== "ALL").length;

  if (!isClient || authLoading || !user) {
    return (
      <LoadingSpinner
        icon={<CalendarDays className="h-12 w-12 animate-pulse text-primary mb-4" />}
        message="Memuat Program Tahunan..."
      />
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CalendarDays className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Program Tahunan (PROTA)</CardTitle>
                <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                    Kelola program tahun ajaran Anda.
                    {user.role === "KepalaSekolah" || user.role === "WakaKurikulum" || user.role === "TataUsaha" || user.role === "SuperAdmin" ? " Anda dapat melihat semua PROTA." : ""}
                    {user.role === "Guru" ? " Lihat PROTA yang telah disusun." : ""}
                    {(user.role === "Admin" || user.role === "SuperAdmin" || user.role === "WakaKurikulum" || user.role === "Guru") && " Anda dapat membuat, mengedit, dan menghapus PROTA."}
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
                placeholder="Cari PROTA (judul, tahun, kurikulum)..."
                className="pl-10 w-full text-base md:text-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col xs:flex-row xs:flex-wrap gap-3 w-full sm:w-auto justify-center xs:justify-end">
              {canImport && (
                <Button variant="outline" className="w-full xs:w-auto text-base md:text-sm h-10" onClick={() => toast({title: "Fitur Belum Tersedia", description: "Impor PROTA akan segera hadir!"})}>
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
                  <Link href="/annual-programs/new">
                      <PlusCircle className="mr-2 h-5 w-5" /> Buat Program Baru
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div>
              <Label htmlFor="curriculumFilter" className="text-xs">Kurikulum</Label>
              <Select value={curriculumFilter} onValueChange={(value) => setCurriculumFilter(value as CurriculumFramework | "ALL")}>
                <SelectTrigger id="curriculumFilter" className="h-10 text-sm">
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
              <Label htmlFor="gradeFilter" className="text-xs">Jenjang/Fase</Label>
              <Select value={gradeFilter} onValueChange={(value) => setGradeFilter(value)}>
                <SelectTrigger id="gradeFilter" className="h-10 text-sm">
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
              <Label htmlFor="yearFilter" className="text-xs">Tahun Ajaran</Label>
              <Select value={yearFilter} onValueChange={(value) => setYearFilter(value)}>
                <SelectTrigger id="yearFilter" className="h-10 text-sm">
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
          </div>
          {filteredAnnualPrograms.length === 0 && searchTerm && (
            <Alert variant="default" className="mb-4 border-primary/30 shadow-sm">
                <Search className="h-5 w-5 text-primary"/>
                <AlertTitle>Pencarian Tidak Ditemukan</AlertTitle>
                <AlertDescription>
                    Tidak ada PROTA yang cocok dengan kata kunci "{searchTerm}". Coba kata kunci lain atau sesuaikan filter.
                </AlertDescription>
            </Alert>
          )}
          {filteredAnnualPrograms.length === 0 && !searchTerm && activeFilterCount > 0 && (
             <Alert variant="default" className="mb-4 border-primary/30 shadow-sm">
                <Filter className="h-5 w-5 text-primary"/>
                <AlertTitle>Filter Tidak Menemukan Hasil</AlertTitle>
                <AlertDescription>
                    Tidak ada PROTA yang cocok dengan kombinasi filter yang Anda pilih. Coba sesuaikan atau reset filter.
                </AlertDescription>
            </Alert>
          )}
          <div className="overflow-x-auto">
            <CurriculumDataTable
                items={filteredAnnualPrograms}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={canEdit}
                canDelete={canDelete}
                itemTypeForExport="PROTA"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

