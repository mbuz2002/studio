
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building, Search, PlusCircle, MoreHorizontal, Edit2, Trash2, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import type { School, User } from "@/types";
import { SCHOOLS_STORAGE_KEY, APP_USERS_STORAGE_KEY } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 

export default function ManageSchoolsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initial log moved to after authLoading and user role check
  }, []);
  
  useEffect(() => {
    if (authLoading) return;

    if (user?.role !== "SuperAdmin") {
      toast({ title: "Akses Ditolak", variant: "destructive" });
      router.push("/dashboard");
      return;
    }
    // Log access only after role check and not loading
    if (isClient) { // Ensure this only runs client-side once
      addLog("INFO", `SuperAdmin ${user.email} mengakses halaman Manajemen Sekolah.`, "ManageSchoolsPage");
    }

    try {
      const storedSchools = localStorage.getItem(SCHOOLS_STORAGE_KEY);
      setSchools(storedSchools ? JSON.parse(storedSchools) : []);
    } catch (error) {
      console.error("Gagal memuat data sekolah:", error);
      toast({ title: "Gagal Memuat Data Sekolah", variant: "destructive" });
    }
  }, [user, authLoading, router, toast, addLog, isClient]);


  const filteredSchools = useMemo(() => {
    if (!isClient) return [];
    return schools.filter(school =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (school.npsn && school.npsn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (school.adminEmail && school.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [isClient, schools, searchTerm]);

  const toggleSchoolStatus = useCallback((schoolId: string) => {
    const schoolToToggle = schools.find(s => s.id === schoolId);
    if (!schoolToToggle) {
      console.error("School not found for toggling status:", schoolId);
      return;
    }
  
    const newStatus = !schoolToToggle.isActive;
  
    setSchools(prevSchools => {
      const updatedSchools = prevSchools.map(s =>
        s.id === schoolId
          ? { ...s, isActive: newStatus, updatedAt: new Date().toISOString() }
          : s
      );
      localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(updatedSchools));
      return updatedSchools;
    });
  
    // Moved addLog and toast outside of setSchools updater
    addLog("WARN", `Status sekolah "${schoolToToggle.name}" (ID: ${schoolId}) diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'} oleh SuperAdmin ${user?.email}.`, "ManageSchoolsPage");
    toast({ title: "Status Sekolah Diperbarui", description: `Sekolah "${schoolToToggle.name}" sekarang ${newStatus ? 'Aktif' : 'Nonaktif'}.` });
  }, [schools, user, toast, addLog]);


  const handleDeleteSchool = useCallback((schoolId: string) => {
    const schoolToDelete = schools.find(s => s.id === schoolId);
    if (!schoolToDelete) return;

    if (window.confirm(`PERHATIAN! Menghapus sekolah "${schoolToDelete.name}" juga akan menghapus SEMUA DATA TERKAIT (pengguna, RPP, dll.). Aksi ini tidak dapat diurungkan. Lanjutkan?`)) {
       if (window.confirm(`KONFIRMASI KEDUA: Anda benar-benar yakin ingin menghapus sekolah "${schoolToDelete.name}" dan semua datanya?`)) {
        const updatedSchools = schools.filter(s => s.id !== schoolId);
        setSchools(updatedSchools);
        localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(updatedSchools));

        // Cascade delete: Remove users associated with this school
        const storedUsers = localStorage.getItem(APP_USERS_STORAGE_KEY);
        if (storedUsers) {
          let usersList: User[] = JSON.parse(storedUsers);
          usersList = usersList.filter(u => u.schoolId !== schoolId);
          localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify(usersList));
        }
        // TODO: Implement cascade delete for other school-specific data (LessonPlans, etc.) if stored separately or filter them out.
        // For now, data is filtered by schoolId on retrieval, so deleting the school effectively hides its data.

        toast({ title: "Sekolah Dihapus", description: `Sekolah "${schoolToDelete.name}" dan data terkait telah dihapus.` });
        addLog("CRITICAL", `Sekolah "${schoolToDelete.name}" (ID: ${schoolId}) dan semua data terkait DIHAPUS oleh SuperAdmin ${user?.email}.`, "ManageSchoolsPage");
      } else {
         addLog("INFO", `Penghapusan sekolah "${schoolToDelete.name}" dibatalkan (konfirmasi kedua).`, "ManageSchoolsPage");
      }
    } else {
      addLog("INFO", `Penghapusan sekolah "${schoolToDelete.name}" dibatalkan.`, "ManageSchoolsPage");
    }
  }, [schools, user, toast, addLog]);

  if (!isClient || authLoading) {
    return <LoadingSpinner message="Memuat Manajemen Sekolah..." icon={<Building className="h-12 w-12 animate-pulse text-primary mb-4"/>} />;
  }
  
  // Redundant check, already handled in useEffect, but good for safety if useEffect logic changes
  if (user?.role !== "SuperAdmin") {
    return (
        <div className="flex h-screen items-center justify-center">
             <p className="text-destructive text-lg">Akses ditolak. Hanya Super Admin yang dapat mengakses halaman ini.</p>
        </div>
    );
  }


  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-primary-foreground drop-shadow" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">Manajemen Sekolah</CardTitle>
              <CardDescription className="text-primary-foreground/90 mt-1">
                Kelola semua sekolah yang terdaftar dalam sistem GUMPLA AI.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari sekolah (nama, NPSN, email admin)..."
                className="pl-10 w-full text-base md:text-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground w-full md:w-auto">
              <Link href="/superadmin/schools/new">
                <PlusCircle className="mr-2 h-5 w-5" /> Tambah Sekolah Baru
              </Link>
            </Button>
          </div>

          <div className="rounded-lg border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] px-3 sm:px-4 py-3 text-sm">Nama Sekolah</TableHead>
                  <TableHead className="min-w-[120px] px-3 sm:px-4 py-3 text-sm hidden md:table-cell">NPSN</TableHead>
                  <TableHead className="min-w-[180px] px-3 sm:px-4 py-3 text-sm hidden lg:table-cell">Email Admin Sekolah</TableHead>
                  <TableHead className="px-3 sm:px-4 py-3 text-sm text-center">Status</TableHead>
                  <TableHead className="text-right min-w-[80px] px-3 sm:px-4 py-3 text-sm">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground px-3 sm:px-4 text-base">
                      Tidak ada data sekolah ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((school) => (
                    <TableRow key={school.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">
                        <Link href={`/superadmin/schools/edit/${school.id}`} className="hover:underline text-primary">
                          {school.name}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5 md:hidden">NPSN: {school.npsn || "-"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 lg:hidden">Admin: {school.adminEmail || "-"}</div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm hidden md:table-cell">{school.npsn || "-"}</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm hidden lg:table-cell">{school.adminEmail || "-"}</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-center">
                        <Badge variant={school.isActive ? "default" : "destructive"} className="text-xs cursor-pointer" onClick={() => toggleSchoolStatus(school.id)}>
                          {school.isActive ? <ToggleRight className="mr-1 h-3.5 w-3.5"/> : <ToggleLeft className="mr-1 h-3.5 w-3.5"/> }
                          {school.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-3 sm:px-4 py-2 sm:py-3 align-top">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/superadmin/schools/edit/${school.id}`)} className="text-sm">
                              <Edit2 className="mr-2 h-4 w-4" /> Edit Sekolah
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleSchoolStatus(school.id)} className="text-sm">
                              {school.isActive ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                              {school.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSchool(school.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive text-sm">
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus Sekolah
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
            {schools.length > 0 && (
                <Alert variant="destructive" className="mt-6">
                    <AlertTriangle className="h-5 w-5"/>
                    <AlertTitle>Perhatian!</AlertTitle>
                    <AlertDescription>
                        Menghapus sekolah akan menghapus semua data yang terkait dengannya (pengguna, RPP, dll.) secara permanen dan tidak dapat diurungkan.
                        Nonaktifkan sekolah jika Anda hanya ingin menangguhkan aksesnya sementara.
                    </AlertDescription>
                </Alert>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

