
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Save, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import type { Subject } from "@/types";
import { SubjectFormFields } from "@/components/master-data/SubjectFormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { SUBJECTS_STORAGE_KEY } from "@/types";

export default function EditSubjectPage() {
  const router = useRouter();
  const params = useParams();
  const { id: subjectId } = params;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<Subject>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !["Admin", "KepalaSekolah", "WakaKurikulum"].includes(user.role)) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit mata pelajaran.", variant: "destructive" });
      router.push("/master-data/subjects");
      return;
    }

    if (subjectId && typeof window !== 'undefined') {
      const storedSubjects = localStorage.getItem(SUBJECTS_STORAGE_KEY);
      if (storedSubjects) {
        const subjects: Subject[] = JSON.parse(storedSubjects);
        const subjectToEdit = subjects.find(s => s.id === subjectId);
        if (subjectToEdit) {
          setFormData(subjectToEdit);
          addLog("INFO", `Memuat mata pelajaran "${subjectToEdit.name}" (ID: ${subjectId}) untuk diedit oleh ${user.email}.`, "EditSubjectPage");
        } else {
          toast({ title: "Mata Pelajaran Tidak Ditemukan", variant: "destructive" });
          router.push("/master-data/subjects");
        }
      }
      setIsLoadingData(false);
    }
  }, [subjectId, user, authLoading, router, toast, addLog]);

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

    const updatedSubject: Subject = {
      ...formData,
      id: subjectId as string,
      updatedAt: new Date().toISOString(),
    } as Subject;

    try {
      const existingSubjects = JSON.parse(localStorage.getItem(SUBJECTS_STORAGE_KEY) || "[]") as Subject[];
      const updatedSubjects = existingSubjects.map(s => s.id === subjectId ? updatedSubject : s);
      localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(updatedSubjects));
      toast({ title: "Mata Pelajaran Diperbarui", description: `"${updatedSubject.name}" berhasil diperbarui.` });
      addLog("INFO", `Mata pelajaran "${updatedSubject.name}" (ID: ${subjectId}) diperbarui oleh ${user?.email}.`, "EditSubjectPage");
      router.push("/master-data/subjects");
    } catch (error) {
      toast({ title: "Gagal Memperbarui", description: "Terjadi kesalahan.", variant: "destructive" });
      addLog("ERROR", `Gagal memperbarui mata pelajaran "${updatedSubject.name}" (ID: ${subjectId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditSubjectPage");
      setIsSubmitting(false);
    }
  };

  if (isLoadingData || authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Book className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  if (!formData.id && !isLoadingData) {
      return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-destructive text-lg">Mata pelajaran tidak ditemukan.</p>
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
              <CardTitle className="text-2xl md:text-3xl font-bold">Edit Mata Pelajaran</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1 truncate max-w-md">
                {formData.name || "Memuat..."}
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
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
