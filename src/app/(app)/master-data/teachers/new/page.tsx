
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Teacher, Subject, User } from "@/types";
import { TeacherFormFields } from "@/components/master-data/TeacherFormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { TEACHERS_STORAGE_KEY, SUBJECTS_STORAGE_KEY, APP_USERS_STORAGE_KEY } from "@/types";

interface TeacherFormData extends Partial<Teacher> {
  userEmail?: string;
  password?: string; // Added password field
}

export default function NewTeacherPage() {
  const router = useRouter();
  const { user: adminUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<TeacherFormData>({ name: "", nip: "", subjectIds: [], userEmail: "", password: "" });
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!adminUser || !["Admin", "KepalaSekolah", "WakaKurikulum"].includes(adminUser.role)) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk menambah data guru.", variant: "destructive" });
      router.push("/master-data/teachers");
      return;
    }
    // Load subjects for the form
    const storedSubjects = localStorage.getItem(SUBJECTS_STORAGE_KEY);
    if (storedSubjects) {
      setAllSubjects(JSON.parse(storedSubjects));
    }
  }, [adminUser, authLoading, router, toast]);

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
    if (!formData.userEmail) {
        toast({ title: "Email Akun Pengguna Wajib Diisi", description: "Email ini akan digunakan untuk membuat akun pengguna untuk guru.", variant: "destructive"});
        return;
    }
    if (!formData.password || formData.password.length < 6) {
        toast({ title: "Kata Sandi Tidak Valid", description: "Kata sandi minimal 6 karakter.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);

    const teacherId = `teacher-${Date.now()}`;
    const userId = `user-${Date.now()}`;

    const newTeacher: Teacher = {
      id: teacherId,
      name: formData.name!,
      nip: formData.nip,
      subjectIds: formData.subjectIds || [],
      userId: userId, // Link to the new user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: adminUser?.id,
    };

    const newUser: User = {
        id: userId,
        name: formData.name!,
        email: formData.userEmail!,
        role: "Guru", // Automatically assign 'Guru' role
        // In a real app, password should be hashed before storing or sending to backend
        // For this localStorage demo, we'll omit storing it directly in the User object visible in storage
        // but acknowledge it's captured for account creation.
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name!)}&background=random&color=fff`,
        updatedAt: new Date().toISOString(),
    };

    try {
      // Save Teacher
      const existingTeachers = JSON.parse(localStorage.getItem(TEACHERS_STORAGE_KEY) || "[]") as Teacher[];
      localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify([newTeacher, ...existingTeachers]));
      addLog("INFO", `Data guru baru "${newTeacher.name}" (NIP: ${newTeacher.nip || '-'}) ditambahkan oleh ${adminUser?.email}.`, "NewTeacherPage-Teacher");

      // Save User
      const existingUsers = JSON.parse(localStorage.getItem(APP_USERS_STORAGE_KEY) || "[]") as User[];
      // IMPORTANT: Do not store raw password in localStorage for the User object.
      // The password from formData.password would be used by an auth system to create the account.
      // For this demo, we just create the user entry without the password field.
      localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify([newUser, ...existingUsers]));
      addLog("INFO", `Akun pengguna baru untuk guru "${newUser.name}" (Email: ${newUser.email}) berhasil dibuat. Kata sandi telah di-set (simulasi).`, "NewTeacherPage-User");
      
      toast({ title: "Data Guru & Akun Ditambahkan", description: `Data untuk "${newTeacher.name}" dan akun pengguna terkait berhasil disimpan.` });
      router.push("/master-data/teachers");
    } catch (error) {
      toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan data guru atau akun pengguna.", variant: "destructive" });
      addLog("ERROR", `Gagal menyimpan data guru baru "${newTeacher.name}" atau akun pengguna. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "NewTeacherPage");
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || !adminUser) {
     return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <UserCheck className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat...</p>
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
              <CardTitle className="text-2xl md:text-3xl font-bold">Tambah Data Guru Baru</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Masukkan detail untuk data guru baru. Akun pengguna akan otomatis dibuat.
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
              isNewUserForm={true}
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                {isSubmitting ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Data Guru
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
