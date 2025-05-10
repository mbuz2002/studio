
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Book, Search, PlusCircle, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import type { Subject } from "@/types";
import { SUBJECTS_STORAGE_KEY } from "@/types";

const initialSubjectsData: Subject[] = [
  { id: "subj-1", name: "Matematika Wajib", code: "MTK-WAJIB", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: "user-1" },
  { id: "subj-2", name: "Bahasa Indonesia", code: "IND", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: "user-1" },
  { id: "subj-3", name: "Ilmu Pengetahuan Alam (IPA)", code: "IPA", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: "user-3" },
  { id: "subj-4", name: "Pendidikan Agama Islam", code: "PAI", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: "user-3" },
];

export default function SubjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [subjects, setSubjects] = useState<Subject[]>([]);
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
    addLog("INFO", `Pengguna ${user.email} mengakses halaman Master Data Mata Pelajaran.`, "SubjectsPage");

    try {
      const storedSubjects = localStorage.getItem(SUBJECTS_STORAGE_KEY);
      if (storedSubjects) {
        setSubjects(JSON.parse(storedSubjects));
      } else {
        setSubjects(initialSubjectsData);
        localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(initialSubjectsData));
      }
    } catch (error) {
      console.error("Gagal memuat data mata pelajaran:", error);
      setSubjects(initialSubjectsData);
      toast({ title: "Gagal Memuat Data", description: "Menggunakan data default.", variant: "destructive" });
    }
  }, [user, authLoading, router, toast, addLog]);

  const filteredSubjects = useMemo(() => {
    if (!isClient) return [];
    return subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.code && subject.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [isClient, subjects, searchTerm]);

  const handleDelete = useCallback((subjectId: string) => {
    const subjectToDelete = subjects.find(s => s.id === subjectId);
    if (!subjectToDelete) return;

    if (window.confirm(`Apakah Anda yakin ingin menghapus mata pelajaran "${subjectToDelete.name}"?`)) {
      const updatedSubjects = subjects.filter(s => s.id !== subjectId);
      setSubjects(updatedSubjects);
      localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(updatedSubjects));
      toast({ title: "Mata Pelajaran Dihapus", description: `"${subjectToDelete.name}" berhasil dihapus.` });
      addLog("WARN", `Mata pelajaran "${subjectToDelete.name}" (ID: ${subjectId}) dihapus oleh ${user?.email}.`, "SubjectsPage");
    }
  }, [subjects, user, toast, addLog, setSubjects]);


  if (!isClient || authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Book className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat data mata pelajaran...</p>
      </div>
    );
  }
  
  const canManage = user && ["Admin", "KepalaSekolah", "WakaKurikulum"].includes(user.role);

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Book className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Master Data Mata Pelajaran</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Kelola daftar mata pelajaran yang tersedia di sekolah.
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
                placeholder="Cari mata pelajaran (nama atau kode)..."
                className="pl-10 w-full text-base md:text-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {canManage && (
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground w-full md:w-auto">
                <Link href="/master-data/subjects/new">
                  <PlusCircle className="mr-2 h-5 w-5" /> Tambah Mata Pelajaran
                </Link>
              </Button>
            )}
          </div>

          <div className="rounded-lg border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] px-3 sm:px-4 py-3 text-sm">Nama Mata Pelajaran</TableHead>
                  <TableHead className="min-w-[100px] px-3 sm:px-4 py-3 text-sm">Kode</TableHead>
                  <TableHead className="min-w-[150px] px-3 sm:px-4 py-3 text-sm hidden md:table-cell">Dibuat Oleh</TableHead>
                  <TableHead className="text-right min-w-[80px] px-3 sm:px-4 py-3 text-sm">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground px-3 sm:px-4 text-base">
                      Tidak ada mata pelajaran ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubjects.map((subject) => (
                    <TableRow key={subject.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">{subject.name}</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">{subject.code || "-"}</TableCell>
                       <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-xs text-muted-foreground hidden md:table-cell">{subject.createdByUserId || "Sistem"}</TableCell>
                      <TableCell className="text-right px-3 sm:px-4 py-2 sm:py-3 align-top">
                        {canManage && (
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/master-data/subjects/edit/${subject.id}`)} className="text-sm">
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(subject.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive text-sm">
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
