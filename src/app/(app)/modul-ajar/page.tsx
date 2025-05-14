
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import type { ModulAjar, AnyCurriculumItem, SchoolProfile } from "@/types";
import { MODUL_AJAR_STORAGE_KEY } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search, BrainCircuit, PlusCircle, X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurriculum } from "@/contexts/CurriculumContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoadingSpinner from "@/components/ui/loading-spinner";


const initialModulAjarData: ModulAjar[] = [];

export default function ModulAjarPage() {
  const { user, currentSchool, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { defaultCurriculum } = useCurriculum();
  const [modulAjarItems, setModulAjarItems] = useState<ModulAjar[]>(initialModulAjarData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  const [faseFilter, setFaseFilter] = useState<string | "ALL">("ALL");

  useEffect(() => {
    setIsClient(true);
    if (authLoading) return;

    if (typeof window !== 'undefined') {
      try {
        const storedModulAjar = localStorage.getItem(MODUL_AJAR_STORAGE_KEY);
        if (storedModulAjar) {
          setModulAjarItems(JSON.parse(storedModulAjar));
        } else {
          localStorage.setItem(MODUL_AJAR_STORAGE_KEY, JSON.stringify(initialModulAjarData));
        }
      } catch (error) {
        console.error("Failed to access or parse localStorage for Modul Ajar:", error);
        setModulAjarItems(initialModulAjarData);
        toast({
          title: "Gagal Memuat Data Lokal",
          description: "Menggunakan data Modul Ajar standar (kosong). Perubahan mungkin tidak tersimpan.",
          variant: "destructive",
        });
      }
    }
  }, [toast, authLoading]);

  const uniqueFases = useMemo(() => {
    if (!isClient) return [];
    const fases = new Set(modulAjarItems.map(ma => ma.identitasModul.fase));
    return Array.from(fases).sort();
  }, [modulAjarItems, isClient]);

  const canCreate = user && defaultCurriculum === "Kurikulum Merdeka" && (user.role === "Admin" || user.role === "WakaKurikulum" || user.role === "Guru");

  const canEditItem = useCallback((item: AnyCurriculumItem): boolean => {
    if (!user) return false;
    const modulAjarItem = item as ModulAjar;
    if (user.role === "Admin" || user.role === "WakaKurikulum") return true;
    if (user.role === "Guru" && modulAjarItem.createdByUserId === user.id) return true;
    return false;
  }, [user]);

  const canDeleteItem = useCallback((item: AnyCurriculumItem): boolean => {
     if (!user) return false;
     const modulAjarItem = item as ModulAjar;
    if (user.role === "Admin" || user.role === "WakaKurikulum") return true;
    if (user.role === "Guru" && modulAjarItem.createdByUserId === user.id) return true;
    return false;
  }, [user]);

  const canImport = user && (user.role === "Admin" || user.role === "WakaKurikulum");

  const handleEdit = useCallback((item: AnyCurriculumItem) => {
    if (!canEditItem(item as ModulAjar)) {
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit Modul Ajar ini.", variant: "destructive" });
        return;
    }
    router.push(`/modul-ajar/edit/${item.id}`);
  }, [canEditItem, router, toast]);

  const handleDelete = useCallback((itemToDelete: AnyCurriculumItem) => {
    if (!canDeleteItem(itemToDelete as ModulAjar)) {
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk menghapus Modul Ajar ini.", variant: "destructive" });
        return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus Modul Ajar "${itemToDelete.title}"?`)) {
      const updatedModulAjarItems = modulAjarItems.filter(ma => ma.id !== itemToDelete.id);
      setModulAjarItems(updatedModulAjarItems);
      localStorage.setItem(MODUL_AJAR_STORAGE_KEY, JSON.stringify(updatedModulAjarItems));
      toast({ title: "Modul Ajar Dihapus", description: `"${itemToDelete.title}" telah berhasil dihapus.`});
    }
  }, [canDeleteItem, modulAjarItems, toast, setModulAjarItems]);

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

  const filteredModulAjarItems = useMemo(() => {
    if (!user) return [];
    return isClient ? modulAjarItems.filter(ma =>
      (ma.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ma.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ma.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (faseFilter === "ALL" || ma.identitasModul.fase === faseFilter) &&
      (user.role === "SuperAdmin" || ma.schoolId === currentSchool?.id)
    ) : [];
  }, [isClient, modulAjarItems, searchTerm, faseFilter, user, currentSchool]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setFaseFilter("ALL");
    toast({ title: "Filter Direset", description: "Semua filter Modul Ajar telah dikembalikan ke default." });
  }, [toast]);

  const activeFilterCount = [searchTerm, faseFilter].filter(f => f !== "" && f !== "ALL").length;

  if (!isClient || authLoading) {
    return (
      <LoadingSpinner
        icon={<BrainCircuit className="h-12 w-12 animate-pulse text-primary mb-4" />}
        message="Memuat Modul Ajar..."
      />
    );
  }

  if (!user) {
      return (
          <div className="flex h-[calc(100vh-150px)] items-center justify-center">
              <p className="text-lg text-muted-foreground">Silakan login untuk melihat Modul Ajar.</p>
          </div>
      );
  }

  if (defaultCurriculum !== "Kurikulum Merdeka") {
      return (
          <div className="container mx-auto py-6 md:py-8">
            <Alert variant="destructive">
                <AlertTriangle className="h-5 w-5"/>
                <AlertTitle>Fitur Tidak Tersedia</AlertTitle>
                <AlertDescription>
                    Modul Ajar hanya tersedia untuk Kurikulum Merdeka. Kurikulum default Anda saat ini adalah {defaultCurriculum}.
                    Silakan ubah pengaturan kurikulum default di Pengaturan Akun jika ingin menggunakan fitur ini.
                </AlertDescription>
            </Alert>
        </div>
      );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <BrainCircuit className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Modul Ajar (Kurikulum Merdeka)</CardTitle>
                <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                    Kelola Modul Ajar Kurikulum Merdeka Anda {currentSchool ? `di ${currentSchool.name}` : ''}.
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
                placeholder="Cari Modul Ajar (judul, mapel, fase)..."
                className="pl-10 w-full text-base md:text-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col xs:flex-row xs:flex-wrap gap-3 w-full sm:w-auto justify-center xs:justify-end">
              {canImport && (
                <Button variant="outline" className="w-full xs:w-auto text-base md:text-sm h-10" onClick={() => toast({title: "Fitur Belum Tersedia", description: "Impor Modul Ajar akan segera hadir!"})}>
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
                  <Link href="/ai-kurikulum-merdeka-module">
                    <PlusCircle className="mr-2 h-5 w-5" /> Buat Modul Ajar Baru (AI)
                  </Link>
                </Button>
               )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div>
              <Label htmlFor="faseFilterMA" className="text-xs">Fase</Label>
              <Select value={faseFilter} onValueChange={(value) => setFaseFilter(value)}>
                <SelectTrigger id="faseFilterMA" className="h-10 text-sm">
                  <SelectValue placeholder="Filter Fase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Fase</SelectItem>
                  {uniqueFases.map(fase => (
                    <SelectItem key={fase} value={fase}>{fase}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
           {filteredModulAjarItems.length === 0 && searchTerm && (
            <Alert variant="default" className="mb-4 border-primary/30 shadow-sm">
                <Search className="h-5 w-5 text-primary"/>
                <AlertTitle>Pencarian Tidak Ditemukan</AlertTitle>
                <AlertDescription>
                    Tidak ada Modul Ajar yang cocok dengan kata kunci "{searchTerm}". Coba kata kunci lain atau sesuaikan filter.
                </AlertDescription>
            </Alert>
          )}
          {filteredModulAjarItems.length === 0 && !searchTerm && activeFilterCount > 0 && (
             <Alert variant="default" className="mb-4 border-primary/30 shadow-sm">
                <Filter className="h-5 w-5 text-primary"/>
                <AlertTitle>Filter Tidak Menemukan Hasil</AlertTitle>
                <AlertDescription>
                    Tidak ada Modul Ajar yang cocok dengan kombinasi filter yang Anda pilih. Coba sesuaikan atau reset filter.
                </AlertDescription>
            </Alert>
          )}
          <div className="overflow-x-auto">
            <CurriculumDataTable
                items={filteredModulAjarItems}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={canEditItem}
                canDelete={canDeleteItem}
                itemTypeForExport="ModulAjar"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
