
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserCheck, Search, PlusCircle, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import type { Teacher, Subject } from "@/types";
import { TEACHERS_STORAGE_KEY, SUBJECTS_STORAGE_KEY } from "@/types";
import { Badge } from "@/components/ui/badge";
import { initialTeachersData } from '@/lib/initial-data';

export default function TeachersPage() {
  const { user, currentSchool, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjectsList] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (authLoading) return;

    if (!user || !["Admin", "KepalaSekolah", "WakaKurikulum"].includes(user.role)) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengakses halaman ini.", variant: "destructive" });
      router.push("/dashboard");
      return;
    }
    addLog("INFO", `Pengguna ${user.email} mengakses halaman Master Data Guru.`, "TeachersPage");

    try {
      const storedTeachers = localStorage.getItem(TEACHERS_STORAGE_KEY);
      if (storedTeachers) {
        setTeachers(JSON.parse(storedTeachers));
      } else {
        const demoDataWithSchoolId = initialTeachersData.map(t => ({
          ...t,
          schoolId: currentSchool?.id || t.schoolId
        }));
        setTeachers(demoDataWithSchoolId);
        localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(demoDataWithSchoolId));
      }
      const storedSubjects = localStorage.getItem(SUBJECTS_STORAGE_KEY);
      if (storedSubjects) {
        const allSubjects: Subject[] = JSON.parse(storedSubjects);
        // Filter subjects by current school if user is not SuperAdmin
        const schoolSubjects = user.role === "SuperAdmin" 
          ? allSubjects 
          : allSubjects.filter(s => s.schoolId === currentSchool?.id);
        setSubjectsList(schoolSubjects);
      }
    } catch (error) {
      console.error("Gagal memuat data guru/mapel:", error);
      const demoDataWithSchoolId = initialTeachersData.map(t => ({
          ...t,
          schoolId: currentSchool?.id || t.schoolId
        }));
      setTeachers(demoDataWithSchoolId);
      toast({ title: "Gagal Memuat Data", description: "Menggunakan data default.", variant: "destructive" });
    }
  }, [user, currentSchool, authLoading, router, toast, addLog]);

  const getSubjectNames = useCallback((subjectIds: string[]) => {
    if (!subjects.length) return "Memuat mapel...";
    return subjectIds.map(id => subjects.find(s => s.id === id)?.name || "Mapel Dihapus").join(", ") || "-";
  }, [subjects]);

  const filteredTeachers = useMemo(() => {
    if (!isClient || !user) return [];
    return teachers.filter(teacher =>
      (teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.nip && teacher.nip.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getSubjectNames(teacher.subjectIds).toLowerCase().includes(searchTerm.toLowerCase())) &&
      (user.role === "SuperAdmin" || teacher.schoolId === currentSchool?.id)
    );
  }, [isClient, teachers, searchTerm, getSubjectNames, user, currentSchool]);

  const handleDelete = useCallback((teacherId: string) => {
    const teacherToDelete = teachers.find(t => t.id === teacherId);
    if (!teacherToDelete) return;

    if (window.confirm(`Apakah Anda yakin ingin menghapus data guru "${teacherToDelete.name}"?`)) {
      const updatedTeachers = teachers.filter(t => t.id !== teacherId);
      setTeachers(updatedTeachers);
      localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updatedTeachers));
      toast({ title: "Data Guru Dihapus", description: `"${teacherToDelete.name}" berhasil dihapus.` });
      addLog("WARN", `Data guru "${teacherToDelete.name}" (ID: ${teacherId}) dihapus oleh ${user?.email}.`, "TeachersPage");
    }
  }, [teachers, user, toast, addLog, setTeachers]);

  if (!isClient || authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <UserCheck className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat data guru...</p>
      </div>
    );
  }

  const canManage = user && ["Admin", "KepalaSekolah", "WakaKurikulum"].includes(user.role);

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <UserCheck className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Master Data Guru</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Kelola daftar guru dan mata pelajaran yang diampu {currentSchool ? `di ${currentSchool.name}` : ''}.
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
                placeholder="Cari guru (nama, NIP, mapel)..."
                className="pl-10 w-full text-base md:text-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {canManage && (
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground w-full md:w-auto">
                <Link href="/master-data/teachers/new">
                  <PlusCircle className="mr-2 h-5 w-5" /> Tambah Data Guru
                </Link>
              </Button>
            )}
          </div>

          <div className="rounded-lg border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] px-3 sm:px-4 py-3 text-sm">Nama Guru</TableHead>
                  <TableHead className="min-w-[150px] px-3 sm:px-4 py-3 text-sm hidden md:table-cell">NIP</TableHead>
                  <TableHead className="min-w-[250px] px-3 sm:px-4 py-3 text-sm">Mata Pelajaran Diampu</TableHead>
                  <TableHead className="text-right min-w-[80px] px-3 sm:px-4 py-3 text-sm">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground px-3 sm:px-4 text-base">
                      Tidak ada data guru ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">{teacher.name}</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm hidden md:table-cell">{teacher.nip || "-"}</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">
                         <div className="flex flex-wrap gap-1">
                           {(teacher.subjectIds || []).map(id => {
                             const subject = subjects.find(s => s.id === id);
                             return subject ? <Badge key={id} variant="secondary" className="text-xs">{subject.name}</Badge> : null;
                           })}
                           {(!teacher.subjectIds || teacher.subjectIds.length === 0) && "-"}
                         </div>
                      </TableCell>
                      <TableCell className="text-right px-3 sm:px-4 py-2 sm:py-3 align-top">
                         {canManage && (
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/master-data/teachers/edit/${teacher.id}`)} className="text-sm">
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(teacher.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive text-sm">
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
