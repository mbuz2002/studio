
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Save, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import type { SchoolClass, Teacher } from "@/types";
import { ClassFormFields } from "@/components/master-data/ClassFormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { SCHOOL_CLASSES_STORAGE_KEY, TEACHERS_STORAGE_KEY } from "@/types";

export default function EditSchoolClassPage() {
  const router = useRouter();
  const params = useParams();
  const { id: classId } = params;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<SchoolClass>>({});
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"].includes(user.role)) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit kelas.", variant: "destructive" });
      router.push("/master-data/classes");
      return;
    }

    if (classId && typeof window !== 'undefined') {
      const storedClasses = localStorage.getItem(SCHOOL_CLASSES_STORAGE_KEY);
      if (storedClasses) {
        const classes: SchoolClass[] = JSON.parse(storedClasses);
        const classToEdit = classes.find(s => s.id === classId);
        if (classToEdit) {
          setFormData(classToEdit);
          addLog("INFO", `Memuat kelas "${classToEdit.name}" (ID: ${classId}) untuk diedit oleh ${user.email}.`, "EditSchoolClassPage");
        } else {
          toast({ title: "Kelas Tidak Ditemukan", variant: "destructive" });
          router.push("/master-data/classes");
        }
      }
      const storedTeachers = localStorage.getItem(TEACHERS_STORAGE_KEY);
      if (storedTeachers) {
        setAllTeachers(JSON.parse(storedTeachers));
      }
      setIsLoadingData(false);
    }
  }, [classId, user, authLoading, router, toast, addLog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.name || !formData.gradeLevel) {
      toast({ title: "Data Tidak Lengkap", description: "Nama Kelas dan Jenjang/Tingkat wajib diisi.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const updatedClass: SchoolClass = {
      ...formData,
      id: classId as string,
      updatedAt: new Date().toISOString(),
    } as SchoolClass;

    try {
      const existingClasses = JSON.parse(localStorage.getItem(SCHOOL_CLASSES_STORAGE_KEY) || "[]") as SchoolClass[];
      const updatedClasses = existingClasses.map(s => s.id === classId ? updatedClass : s);
      localStorage.setItem(SCHOOL_CLASSES_STORAGE_KEY, JSON.stringify(updatedClasses));
      toast({ title: "Kelas Diperbarui", description: `Kelas "${updatedClass.name}" berhasil diperbarui.` });
      addLog("INFO", `Kelas "${updatedClass.name}" (ID: ${classId}) diperbarui oleh ${user?.email}.`, "EditSchoolClassPage");
      router.push("/master-data/classes");
    } catch (error) {
      toast({ title: "Gagal Memperbarui", description: "Terjadi kesalahan.", variant: "destructive" });
      addLog("ERROR", `Gagal memperbarui kelas "${updatedClass.name}" (ID: ${classId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditSchoolClassPage");
      setIsSubmitting(false);
    }
  };

  if (isLoadingData || authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <ClipboardList className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  if (!formData.id && !isLoadingData) {
      return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-destructive text-lg">Kelas tidak ditemukan.</p>
        </div>
    );
  }


  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <ClipboardList className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Edit Kelas</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1 truncate max-w-md">
                {formData.name || "Memuat..."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <ClassFormFields 
              formData={formData} 
              handleChange={handleChange} 
              handleSelectChange={handleSelectChange}
              allTeachers={allTeachers} 
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
