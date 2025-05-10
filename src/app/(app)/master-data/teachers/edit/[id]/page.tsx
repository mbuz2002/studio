
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Save, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import type { Teacher, Subject } from "@/types";
import { TeacherFormFields } from "@/components/master-data/TeacherFormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { TEACHERS_STORAGE_KEY, SUBJECTS_STORAGE_KEY } from "@/types";

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const { id: teacherId } = params;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<Teacher>>({});
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !["Admin", "KepalaSekolah", "WakaKurikulum"].includes(user.role)) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit data guru.", variant: "destructive" });
      router.push("/master-data/teachers");
      return;
    }

    if (teacherId && typeof window !== 'undefined') {
      const storedTeachers = localStorage.getItem(TEACHERS_STORAGE_KEY);
      if (storedTeachers) {
        const teachers: Teacher[] = JSON.parse(storedTeachers);
        const teacherToEdit = teachers.find(t => t.id === teacherId);
        if (teacherToEdit) {
          setFormData(teacherToEdit);
          addLog("INFO", `Memuat data guru "${teacherToEdit.name}" (ID: ${teacherId}) untuk diedit oleh ${user.email}.`, "EditTeacherPage");
        } else {
          toast({ title: "Data Guru Tidak Ditemukan", variant: "destructive" });
          router.push("/master-data/teachers");
        }
      }
      const storedSubjects = localStorage.getItem(SUBJECTS_STORAGE_KEY);
      if (storedSubjects) {
        setAllSubjects(JSON.parse(storedSubjects));
      }
      setIsLoadingData(false);
    }
  }, [teacherId, user, authLoading, router, toast, addLog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subjectIds: string[]) => {
    setFormData(prev => ({ ...prev, subjectIds }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.name) {
        toast({ title: "Nama Guru Wajib Diisi", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);

    const updatedTeacher: Teacher = {
      ...formData,
      id: teacherId as string,
      updatedAt: new Date().toISOString(),
    } as Teacher;

    try {
      const existingTeachers = JSON.parse(localStorage.getItem(TEACHERS_STORAGE_KEY) || "[]") as Teacher[];
      const updatedTeachers = existingTeachers.map(t => t.id === teacherId ? updatedTeacher : t);
      localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updatedTeachers));
      toast({ title: "Data Guru Diperbarui", description: `Data untuk "${updatedTeacher.name}" berhasil diperbarui.` });
      addLog("INFO", `Data guru "${updatedTeacher.name}" (ID: ${teacherId}) diperbarui oleh ${user?.email}.`, "EditTeacherPage");
      router.push("/master-data/teachers");
    } catch (error) {
      toast({ title: "Gagal Memperbarui", description: "Terjadi kesalahan.", variant: "destructive" });
      addLog("ERROR", `Gagal memperbarui data guru "${updatedTeacher.name}" (ID: ${teacherId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditTeacherPage");
      setIsSubmitting(false);
    }
  };

  if (isLoadingData || authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <UserCheck className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat data...</p>
      </div>
    );
  }
  
  if (!formData.id && !isLoadingData) {
      return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-destructive text-lg">Data guru tidak ditemukan.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <UserCheck className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Edit Data Guru</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1 truncate max-w-md">
                {formData.name || "Memuat..."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <TeacherFormFields 
              formData={formData} 
              handleChange={handleChange} 
              allSubjects={allSubjects}
              handleSubjectChange={handleSubjectChange}
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                {isSubmitting ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
