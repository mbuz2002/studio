
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Subject } from "@/types";
import { SubjectFormFields } from "@/components/master-data/SubjectFormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { SUBJECTS_STORAGE_KEY } from "@/types";

export default function NewSubjectPage() {
  const router = useRouter();
  const { user, currentSchool, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<Subject>>({ name: "", code: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !["Admin", "KepalaSekolah", "WakaKurikulum"].includes(user.role)) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk menambah mata pelajaran.", variant: "destructive" });
      router.push("/master-data/subjects");
    }
  }, [user, authLoading, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.name) {
      toast({ title: "Nama Mata Pelajaran Wajib Diisi", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name: formData.name!,
      code: formData.code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: user?.id,
      schoolId: currentSchool?.id,
    };

    try {
      const existingSubjects = JSON.parse(localStorage.getItem(SUBJECTS_STORAGE_KEY) || "[]") as Subject[];
      localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify([newSubject, ...existingSubjects]));
      toast({ title: "Mata Pelajaran Ditambahkan", description: `"${newSubject.name}" berhasil disimpan.` });
      addLog("INFO", `Mata pelajaran baru "${newSubject.name}" (Kode: ${newSubject.code || '-'}) ditambahkan oleh ${user?.email} untuk sekolah ID ${currentSchool?.id}.`, "NewSubjectPage");
      router.push("/master-data/subjects");
    } catch (error) {
      toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan mata pelajaran.", variant: "destructive" });
      addLog("ERROR", `Gagal menyimpan mata pelajaran baru "${newSubject.name}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "NewSubjectPage");
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
     return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Book className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Book className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Tambah Mata Pelajaran Baru</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Masukkan detail untuk mata pelajaran baru.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <SubjectFormFields formData={formData} handleChange={handleChange} />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                {isSubmitting ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Mata Pelajaran
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
