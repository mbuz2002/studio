"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SchoolClass, Teacher, SchoolProfile, EducationLevel } from "@/types";
import { ClassFormFields } from "@/components/master-data/ClassFormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { SCHOOL_CLASSES_STORAGE_KEY, TEACHERS_STORAGE_KEY, SCHOOL_PROFILE_STORAGE_KEY } from "@/types";

export default function NewSchoolClassPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<SchoolClass>>({ name: "", gradeLevel: "" });
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [schoolEducationLevel, setSchoolEducationLevel] = useState<EducationLevel | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"].includes(user.role)) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk menambah kelas.", variant: "destructive" });
      router.push("/master-data/classes");
      return;
    }
    
    const storedTeachers = localStorage.getItem(TEACHERS_STORAGE_KEY);
    if (storedTeachers) {
      setAllTeachers(JSON.parse(storedTeachers));
    }

    const storedSchoolProfile = localStorage.getItem(SCHOOL_PROFILE_STORAGE_KEY);
    if (storedSchoolProfile) {
      try {
        const parsedProfile: SchoolProfile = JSON.parse(storedSchoolProfile);
        setSchoolEducationLevel(parsedProfile.jenjangPendidikan);
      } catch (e) {
        console.error("Failed to parse school profile for grade levels", e);
      }
    }

    addLog("INFO", `Pengguna ${user.email} mengakses halaman Tambah Kelas Baru.`, "NewSchoolClassPage");
  }, [user, authLoading, router, toast, addLog]);

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

    const newClass: SchoolClass = {
      id: `class-${Date.now()}`,
      name: formData.name!,
      gradeLevel: formData.gradeLevel!,
      homeroomTeacherId: formData.homeroomTeacherId,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: user?.id,
    };

    try {
      const existingClasses = JSON.parse(localStorage.getItem(SCHOOL_CLASSES_STORAGE_KEY) || "[]") as SchoolClass[];
      localStorage.setItem(SCHOOL_CLASSES_STORAGE_KEY, JSON.stringify([newClass, ...existingClasses]));
      toast({ title: "Kelas Ditambahkan", description: `Kelas "${newClass.name}" berhasil disimpan.` });
      addLog("INFO", `Kelas baru "${newClass.name}" (Jenjang: ${newClass.gradeLevel}) ditambahkan oleh ${user?.email}.`, "NewSchoolClassPage");
      router.push("/master-data/classes");
    } catch (error) {
      toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan kelas.", variant: "destructive" });
      addLog("ERROR", `Gagal menyimpan kelas baru "${newClass.name}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "NewSchoolClassPage");
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
     return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <ClipboardList className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat...</p>
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
              <CardTitle className="text-2xl md:text-3xl font-bold">Tambah Kelas Baru</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Masukkan detail untuk kelas atau rombongan belajar baru.
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
              schoolEducationLevel={schoolEducationLevel}
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                {isSubmitting ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Kelas
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

