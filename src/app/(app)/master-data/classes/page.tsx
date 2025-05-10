
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ClipboardList, Search, PlusCircle, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import type { SchoolClass, Teacher } from "@/types";
import { SCHOOL_CLASSES_STORAGE_KEY, TEACHERS_STORAGE_KEY } from "@/types";
import { Badge } from "@/components/ui/badge";

const initialClassesData: SchoolClass[] = [
  { id: "class-1", name: "Kelas X IPA 1", gradeLevel: "X", homeroomTeacherId: "teacher-1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: "user-1" },
  { id: "class-2", name: "Kelas XI IPS 2", gradeLevel: "XI", homeroomTeacherId: "teacher-2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: "user-1" },
  { id: "class-3", name: "Fase A Kelompok Bermain Matahari", gradeLevel: "Fase A", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: "user-3"},
];

export default function SchoolClassesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (authLoading) return;

    if (!user || !["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"].includes(user.role)) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengakses halaman ini.", variant: "destructive" });
      router.push("/dashboard");
      return;
    }
    addLog("INFO", `Pengguna ${user.email} mengakses halaman Master Data Kelas.`, "SchoolClassesPage");

    try {
      const storedClasses = localStorage.getItem(SCHOOL_CLASSES_STORAGE_KEY);
      if (storedClasses) {
        setSchoolClasses(JSON.parse(storedClasses));
      } else {
        setSchoolClasses(initialClassesData);
        localStorage.setItem(SCHOOL_CLASSES_STORAGE_KEY, JSON.stringify(initialClassesData));
      }
      const storedTeachers = localStorage.getItem(TEACHERS_STORAGE_KEY);
      if (storedTeachers) {
        setTeachers(JSON.parse(storedTeachers));
      }
    } catch (error) {
      console.error("Gagal memuat data kelas/guru:", error);
      setSchoolClasses(initialClassesData);
      toast({ title: "Gagal Memuat Data", description: "Menggunakan data default.", variant: "destructive" });
    }
  }, [user, authLoading, router, toast, addLog]);

  const getTeacherName = useCallback((teacherId?: string) => {
    if (!teacherId) return "-";
    return teachers.find(t => t.id === teacherId)?.name || "Guru Tidak Ditemukan";
  }, [teachers]);

  const filteredClasses = useMemo(() => {
    if (!isClient) return [];
    return schoolClasses.filter(sc =>
      sc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sc.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sc.homeroomTeacherId && getTeacherName(sc.homeroomTeacherId).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [isClient, schoolClasses, searchTerm, getTeacherName]);

  const handleDelete = useCallback((classId: string) => {
    const classToDelete = schoolClasses.find(sc => sc.id === classId);
    if (!classToDelete) return;

    if (window.confirm(`Apakah Anda yakin ingin menghapus kelas "${classToDelete.name}"?`)) {
      const updatedClasses = schoolClasses.filter(sc => sc.id !== classId);
      setSchoolClasses(updatedClasses);
      localStorage.setItem(SCHOOL_CLASSES_STORAGE_KEY, JSON.stringify(updatedClasses));
      toast({ title: "Kelas Dihapus", description: `Kelas "${classToDelete.name}" berhasil dihapus.` });
      addLog("WARN", `Kelas "${classToDelete.name}" (ID: ${classId}) dihapus oleh ${user?.email}.`, "SchoolClassesPage");
    }
  }, [schoolClasses, user, toast, addLog]);


  if (!isClient || authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <ClipboardList className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat data kelas...</p>
      </div>
    );
  }
  
  const canManage = user && ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"].includes(user.role);

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <ClipboardList className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Master Data Kelas</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Kelola daftar kelas atau rombongan belajar di sekolah.
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
                placeholder="Cari kelas (nama, jenjang, wali kelas)..."
                className="pl-10 w-full text-base md:text-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {canManage && (
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground w-full md:w-auto">
                <Link href="/master-data/classes/new">
                  <PlusCircle className="mr-2 h-5 w-5" /> Tambah Kelas Baru
                </Link>
              </Button>
            )}
          </div>

          <div className="rounded-lg border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] px-3 sm:px-4 py-3 text-sm">Nama Kelas/Rombel</TableHead>
                  <TableHead className="min-w-[100px] px-3 sm:px-4 py-3 text-sm">Jenjang/Tingkat</TableHead>
                  <TableHead className="min-w-[180px] px-3 sm:px-4 py-3 text-sm hidden md:table-cell">Wali Kelas</TableHead>
                  <TableHead className="text-right min-w-[80px] px-3 sm:px-4 py-3 text-sm">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground px-3 sm:px-4 text-base">
                      Tidak ada data kelas ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClasses.map((sc) => (
                    <TableRow key={sc.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">{sc.name}</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">{sc.gradeLevel}</TableCell>
                       <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm hidden md:table-cell">{getTeacherName(sc.homeroomTeacherId)}</TableCell>
                      <TableCell className="text-right px-3 sm:px-4 py-2 sm:py-3 align-top">
                        {canManage && (
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/master-data/classes/edit/${sc.id}`)} className="text-sm">
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(sc.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive text-sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
