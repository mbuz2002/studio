
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cog, UserCircle, ShieldCheck, Database, Palette, Upload, Download, FileText, Users } from "lucide-react"; 
import { useAuth } from "@/contexts/AuthContext";
import { SchoolProfileForm } from "@/components/settings/SchoolProfileForm";
import { EditUserDialog } from "@/components/settings/EditUserDialog";
import { AppPreferencesDialog } from "@/components/settings/AppPreferencesDialog"; 
import type { User, SchoolProfile, ExportedCurriculumData, LessonPlan, AnnualProgram, SemesterProgram } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLog } from "@/contexts/LogContext"; // Import useLog

const LESSON_PLANS_STORAGE_KEY = "appLessonPlans";
const ANNUAL_PROGRAMS_STORAGE_KEY = "appAnnualPrograms";
const SEMESTER_PROGRAMS_STORAGE_KEY = "appSemesterPrograms";
const SCHOOL_PROFILE_STORAGE_KEY = "schoolProfile";
const APP_USERS_STORAGE_KEY = "appUsers";


export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog(); // Use LogContext
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isAppPreferencesDialogOpen, setIsAppPreferencesDialogOpen] = useState(false); 
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (user) { // Log page access once user is confirmed
      addLog("INFO", `Pengguna ${user.email} mengakses halaman Pengaturan Akun.`, "SettingsPage");
    }
  }, [user, addLog]);

  if (!user) {
    return (
       <div className="space-y-6 py-8">
        <Card>
          <CardHeader><CardTitle>Memuat Pengaturan...</CardTitle></CardHeader>
          <CardContent><p>Silakan tunggu...</p></CardContent>
        </Card>
      </div>
    );
  }

  const canSeeProfileSettings = ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"].includes(user.role);
  const canSeeAppSettings = ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"].includes(user.role);
  
  const canManageSchoolProfile = ["Admin", "TataUsaha"].includes(user.role);
  const canManageUsers = ["Admin", "TataUsaha"].includes(user.role); // For link visibility
  
  const canManageData = ["Admin", "WakaKurikulum"].includes(user.role);
  const canSeeSystemSettings = user.role === "Admin";

  const handleUserUpdate = (updatedUserData: Partial<User>) => {
    updateUser(updatedUserData); // AuthContext handles its own logging for this
    toast({
      title: "Profil Diperbarui",
      description: "Informasi profil Anda telah berhasil diperbarui.",
    });
    setIsEditUserDialogOpen(false);
  };

  const handleExportData = () => {
    addLog("INFO", `Pengguna ${user?.email} memulai ekspor semua data aplikasi.`, "SettingsPage-DataManagement");
    try {
      const lessonPlansData = JSON.parse(localStorage.getItem(LESSON_PLANS_STORAGE_KEY) || "[]") as LessonPlan[];
      const annualProgramsData = JSON.parse(localStorage.getItem(ANNUAL_PROGRAMS_STORAGE_KEY) || "[]") as AnnualProgram[];
      const semesterProgramsData = JSON.parse(localStorage.getItem(SEMESTER_PROGRAMS_STORAGE_KEY) || "[]") as SemesterProgram[];
      const schoolProfileData = JSON.parse(localStorage.getItem(SCHOOL_PROFILE_STORAGE_KEY) || "null") as SchoolProfile | null;
      const appUsersData = JSON.parse(localStorage.getItem(APP_USERS_STORAGE_KEY) || "[]") as User[];
      
      const dataToExport: ExportedCurriculumData = {
        lessonPlans: lessonPlansData,
        annualPrograms: annualProgramsData,
        semesterPrograms: semesterProgramsData,
        schoolProfile: schoolProfileData,
        appUsers: appUsersData,
      };

      const jsonData = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eduai_planner_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Ekspor Data Berhasil",
        description: "Semua data kurikulum, profil sekolah, dan pengguna telah diekspor.",
      });
      addLog("INFO", `Ekspor semua data aplikasi berhasil oleh pengguna ${user?.email}. File: eduai_planner_backup_${new Date().toISOString().split('T')[0]}.json`, "SettingsPage-DataManagement");

    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Ekspor Data Gagal",
        description: "Terjadi kesalahan saat mengekspor data. Periksa konsol untuk detail.",
        variant: "destructive",
      });
      addLog("ERROR", `Ekspor semua data aplikasi gagal. Pengguna: ${user?.email}. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "SettingsPage-DataManagement");
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addLog("INFO", `Pengguna ${user?.email} memulai impor data aplikasi dari file: ${file.name}.`, "SettingsPage-DataManagement");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content) as ExportedCurriculumData;

        if (
          !importedData ||
          typeof importedData.lessonPlans === 'undefined' ||
          typeof importedData.annualPrograms === 'undefined' ||
          typeof importedData.semesterPrograms === 'undefined' ||
          typeof importedData.schoolProfile === 'undefined' || // null is a valid value here
          typeof importedData.appUsers === 'undefined'
        ) {
          throw new Error("Format file tidak valid atau data tidak lengkap.");
        }

        // Validate array types roughly (more specific validation can be added)
        if (!Array.isArray(importedData.lessonPlans)) throw new Error("Data RPP tidak valid.");
        if (!Array.isArray(importedData.annualPrograms)) throw new Error("Data PROTA tidak valid.");
        if (!Array.isArray(importedData.semesterPrograms)) throw new Error("Data Promes tidak valid.");
        if (importedData.schoolProfile !== null && typeof importedData.schoolProfile !== 'object') throw new Error("Data Profil Sekolah tidak valid.");
        if (!Array.isArray(importedData.appUsers)) throw new Error("Data Pengguna tidak valid.");

        // Store imported data
        localStorage.setItem(LESSON_PLANS_STORAGE_KEY, JSON.stringify(importedData.lessonPlans));
        localStorage.setItem(ANNUAL_PROGRAMS_STORAGE_KEY, JSON.stringify(importedData.annualPrograms));
        localStorage.setItem(SEMESTER_PROGRAMS_STORAGE_KEY, JSON.stringify(importedData.semesterPrograms));
        localStorage.setItem(SCHOOL_PROFILE_STORAGE_KEY, JSON.stringify(importedData.schoolProfile));
        localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify(importedData.appUsers));
        
        toast({
          title: "Impor Data Berhasil",
          description: "Data telah berhasil diimpor. Muat ulang halaman untuk melihat perubahan.",
        });
        addLog("INFO", `Impor data aplikasi dari file ${file.name} berhasil oleh pengguna ${user?.email}. Halaman perlu dimuat ulang.`, "SettingsPage-DataManagement");
        // Optionally, trigger a state update or page reload to reflect changes immediately
        // window.location.reload(); // Or use Next.js router to refresh data if using server-side state management

      } catch (error) {
        console.error("Error importing data:", error);
        let errorMessage = "Terjadi kesalahan saat mengimpor data.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        toast({
          title: "Impor Data Gagal",
          description: errorMessage + " Pastikan file JSON valid dan sesuai format.",
          variant: "destructive",
        });
        addLog("ERROR", `Impor data aplikasi dari file ${file.name} gagal. Pengguna: ${user?.email}. Kesalahan: ${errorMessage}`, "SettingsPage-DataManagement");
      } finally {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
              <Cog className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">Pengaturan Akun</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Kelola preferensi aplikasi dan pengaturan akun Anda.
          </CardDescription>
        </CardHeader>
      </Card>

      {canManageSchoolProfile && (
        <div className="mt-6">
          <SchoolProfileForm />
        </div>
      )}
      
      <Card className="mt-6">
        <CardHeader>
            <CardTitle className="text-xl">Pengaturan Umum & Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {canSeeProfileSettings && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-6 w-6 text-primary" />
                    <CardTitle>Informasi Profil Pengguna</CardTitle>
                  </div>
                  <CardDescription>Perbarui rincian pribadi Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nama:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Peran:</strong> {user.role}</p>
                  <Button variant="outline" className="mt-2" onClick={() => setIsEditUserDialogOpen(true)}>
                    Edit Profil
                  </Button>
                </CardContent>
              </Card>
            )}

            {canSeeAppSettings && (
              <Card>
                <CardHeader>
                 <div className="flex items-center gap-2">
                    <Palette className="h-6 w-6 text-primary" /> 
                    <CardTitle>Preferensi Aplikasi</CardTitle>
                  </div>
                  <CardDescription>Sesuaikan tema tampilan aplikasi Anda.</CardDescription> 
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Atur tema visual aplikasi (Terang, Gelap, atau Sistem).</p>
                   <Button variant="outline" className="mt-2" onClick={() => setIsAppPreferencesDialogOpen(true)}>Atur Preferensi Tampilan</Button>
                </CardContent>
              </Card>
            )}

            {canManageData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="h-6 w-6 text-primary" />
                    <CardTitle>Manajemen Data Aplikasi</CardTitle>
                  </div>
                  <CardDescription>Ekspor atau impor semua data aplikasi termasuk kurikulum, profil sekolah, dan pengguna.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive" className="mb-4">
                    <FileText className="h-4 w-4"/>
                    <AlertTitle>Penting!</AlertTitle>
                    <AlertDescription>
                      Fitur impor akan menimpa SEMUA data yang ada saat ini (RPP, PROTA, Promes, Profil Sekolah, Pengguna) dengan data dari file yang diimpor. Pastikan Anda memiliki cadangan jika diperlukan.
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button variant="outline" onClick={handleExportData} className="w-full sm:w-auto">
                      <Download className="mr-2 h-4 w-4" /> Ekspor Semua Data
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
                      <Upload className="mr-2 h-4 w-4" /> Impor Semua Data
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleImportData}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Ekspor menghasilkan file JSON. Impor memerlukan file JSON dengan format yang sama.</p>
                </CardContent>
              </Card>
            )}
             {canManageUsers && (
                <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        <CardTitle>Manajemen Pengguna</CardTitle>
                    </div>
                    <CardDescription>Kelola akun pengguna dan peran mereka dalam sistem.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Akses panel manajemen pengguna untuk menambah, mengedit, atau menghapus pengguna.</p>
                    <Button asChild className="mt-2">
                        <Link href="/admin/user-management">Buka Manajemen Pengguna</Link>
                    </Button>
                </CardContent>
                </Card>
            )}


            {canSeeSystemSettings && (
                <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <CardTitle>Pengaturan Sistem</CardTitle>
                    </div>
                    <CardDescription>Konfigurasi tingkat lanjut untuk aplikasi (Khusus Admin).</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Akses panel pengaturan sistem untuk konfigurasi inti aplikasi.</p>
                    <Button asChild className="mt-2">
                        <Link href="/admin/system-settings">Buka Pengaturan Sistem</Link>
                    </Button>
                </CardContent>
                </Card>
            )}
            
          </div>
           {!(canSeeProfileSettings || canSeeAppSettings || canManageData || canSeeSystemSettings || canManageUsers) && 
            !canManageSchoolProfile && ( 
              <p className="text-muted-foreground">Tidak ada pengaturan yang tersedia untuk peran Anda saat ini.</p>
            )}
        </CardContent>
      </Card>

      {user && (
         <EditUserDialog
            isOpen={isEditUserDialogOpen}
            onOpenChange={setIsEditUserDialogOpen}
            user={user}
            onUserUpdated={handleUserUpdate}
          />
      )}
      
      <AppPreferencesDialog
        isOpen={isAppPreferencesDialogOpen}
        onOpenChange={setIsAppPreferencesDialogOpen}
      />
    </div>
  );
}
