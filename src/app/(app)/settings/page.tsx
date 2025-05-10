
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cog, UserCircle, ShieldCheck, Database, Palette, Upload, Download, FileText, Users, BookCopy, LogOut } from "lucide-react"; 
import { useAuth } from "@/contexts/AuthContext";
import { SchoolProfileForm } from "@/components/settings/SchoolProfileForm";
import { EditUserDialog } from "@/components/settings/EditUserDialog";
import { AppPreferencesDialog } from "@/components/settings/AppPreferencesDialog"; 
import type { User, SchoolProfile, ExportedCurriculumData, LessonPlan, AnnualProgram, SemesterProgram, CurriculumFramework, ModulAjar } from "@/types"; 
import { MODUL_AJAR_STORAGE_KEY } from "@/types"; 
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLog } from "@/contexts/LogContext"; 
import { useCurriculum } from "@/contexts/CurriculumContext"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Label } from "@/components/ui/label"; 


const LESSON_PLANS_STORAGE_KEY = "appLessonPlans";
const ANNUAL_PROGRAMS_STORAGE_KEY = "appAnnualPrograms";
const SEMESTER_PROGRAMS_STORAGE_KEY = "appSemesterPrograms";
const SCHOOL_PROFILE_STORAGE_KEY = "schoolProfile";
const APP_USERS_STORAGE_KEY = "appUsers";


export default function SettingsPage() {
  const { user, updateUser, logout, loading: authLoading } = useAuth(); 
  const { toast } = useToast();
  const { addLog } = useLog(); 
  const { defaultCurriculum, setDefaultCurriculum, availableCurriculums } = useCurriculum(); 
  const [selectedGlobalCurriculum, setSelectedGlobalCurriculum] = useState<CurriculumFramework>(defaultCurriculum);

  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isAppPreferencesDialogOpen, setIsAppPreferencesDialogOpen] = useState(false); 
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (user && !authLoading) { 
      addLog("INFO", `Pengguna ${user.email} mengakses halaman Pengaturan Akun.`, "SettingsPage");
    }
    setSelectedGlobalCurriculum(defaultCurriculum); 
  }, [user, addLog, defaultCurriculum, authLoading]);

  if (authLoading) { 
    return (
       <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <Cog className="h-12 w-12 animate-pulse text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Memuat Pengaturan...</p>
          <p className="text-sm text-muted-foreground">Menyiapkan preferensi Anda.</p>
        </div>
      </div>
    );
  }
  
  if (!user) { 
    return (
       <div className="flex h-[calc(100vh-150px)] items-center justify-center">
        <p className="text-lg text-muted-foreground">Silakan login untuk mengakses pengaturan.</p>
      </div>
    );
  }


  const canSeeProfileSettings = ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"].includes(user.role);
  const canSeeAppSettings = ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"].includes(user.role);
  const canManageCurriculumSettings = ["Admin", "WakaKurikulum"].includes(user.role);
  
  const canManageSchoolProfile = ["Admin", "TataUsaha"].includes(user.role);
  const canManageUsers = ["Admin", "TataUsaha"].includes(user.role); 
  
  const canManageData = ["Admin", "WakaKurikulum"].includes(user.role);
  const canSeeSystemSettings = user.role === "Admin";

  const handleUserUpdate = (updatedUserData: Partial<User>) => {
    updateUser(updatedUserData); 
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
      const modulAjarData = JSON.parse(localStorage.getItem(MODUL_AJAR_STORAGE_KEY) || "[]") as ModulAjar[];
      const schoolProfileData = JSON.parse(localStorage.getItem(SCHOOL_PROFILE_STORAGE_KEY) || "null") as SchoolProfile | null;
      const appUsersData = JSON.parse(localStorage.getItem(APP_USERS_STORAGE_KEY) || "[]") as User[];
      
      const dataToExport: ExportedCurriculumData = {
        lessonPlans: lessonPlansData,
        annualPrograms: annualProgramsData,
        semesterPrograms: semesterProgramsData,
        modulAjar: modulAjarData,
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
          typeof importedData.modulAjar === 'undefined' || 
          typeof importedData.schoolProfile === 'undefined' || 
          typeof importedData.appUsers === 'undefined'
        ) {
          throw new Error("Format file tidak valid atau data tidak lengkap.");
        }

        if (!Array.isArray(importedData.lessonPlans)) throw new Error("Data RPP tidak valid.");
        if (!Array.isArray(importedData.annualPrograms)) throw new Error("Data PROTA tidak valid.");
        if (!Array.isArray(importedData.semesterPrograms)) throw new Error("Data Promes tidak valid.");
        if (!Array.isArray(importedData.modulAjar)) throw new Error("Data Modul Ajar tidak valid.");
        if (importedData.schoolProfile !== null && typeof importedData.schoolProfile !== 'object') throw new Error("Data Profil Sekolah tidak valid.");
        if (!Array.isArray(importedData.appUsers)) throw new Error("Data Pengguna tidak valid.");

        localStorage.setItem(LESSON_PLANS_STORAGE_KEY, JSON.stringify(importedData.lessonPlans));
        localStorage.setItem(ANNUAL_PROGRAMS_STORAGE_KEY, JSON.stringify(importedData.annualPrograms));
        localStorage.setItem(SEMESTER_PROGRAMS_STORAGE_KEY, JSON.stringify(importedData.semesterPrograms));
        localStorage.setItem(MODUL_AJAR_STORAGE_KEY, JSON.stringify(importedData.modulAjar));
        localStorage.setItem(SCHOOL_PROFILE_STORAGE_KEY, JSON.stringify(importedData.schoolProfile));
        localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify(importedData.appUsers));
        
        toast({
          title: "Impor Data Berhasil",
          description: "Data telah berhasil diimpor. Muat ulang halaman untuk melihat perubahan.",
        });
        addLog("INFO", `Impor data aplikasi dari file ${file.name} berhasil oleh pengguna ${user?.email}. Halaman perlu dimuat ulang.`, "SettingsPage-DataManagement");
        
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
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCurriculumChange = (value: CurriculumFramework) => {
    setSelectedGlobalCurriculum(value);
    setDefaultCurriculum(value); 
    toast({
      title: "Pengaturan Kurikulum Disimpan",
      description: `Kurikulum default untuk item baru telah diatur ke ${value}.`,
    });
    addLog("INFO", `Pengguna ${user?.email} mengubah kurikulum default menjadi: ${value}.`, "SettingsPage-Curriculum");
  };


  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Cog className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold">Pengaturan Aplikasi</CardTitle>
                <CardDescription className="text-lg md:text-xl text-primary-foreground/90 mt-1">
                    Kelola preferensi aplikasi dan pengaturan umum.
                </CardDescription>
              </div>
          </div>
        </CardHeader>
      </Card>

      {canManageSchoolProfile && (
        <div className="mt-6">
          <SchoolProfileForm />
        </div>
      )}
      
      <Card className="mt-6 shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="p-6 bg-muted/20">
            <CardTitle className="text-2xl font-semibold">Pengaturan Akun & Aplikasi</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {canSeeProfileSettings && (
              <Card className="shadow-md rounded-md">
                <CardHeader className="p-5">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-7 w-7 text-primary" />
                    <CardTitle className="text-xl font-semibold">Informasi Profil</CardTitle>
                  </div>
                  <CardDescription className="text-base text-muted-foreground">Perbarui rincian pribadi Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-5 pt-0">
                  <p className="text-base"><strong>Nama:</strong> {user.name}</p>
                  <p className="text-base"><strong>Email:</strong> {user.email}</p>
                  <p className="text-base"><strong>Peran:</strong> {user.role}</p>
                  <Button variant="outline" className="mt-3 text-base w-full sm:w-auto" onClick={() => setIsEditUserDialogOpen(true)}>
                    Edit Profil
                  </Button>
                </CardContent>
              </Card>
            )}

            {canSeeAppSettings && (
              <Card className="shadow-md rounded-md">
                <CardHeader className="p-5">
                 <div className="flex items-center gap-3">
                    <Palette className="h-7 w-7 text-primary" /> 
                    <CardTitle className="text-xl font-semibold">Preferensi Tampilan</CardTitle>
                  </div>
                  <CardDescription className="text-base text-muted-foreground">Sesuaikan tema visual aplikasi.</CardDescription> 
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-base text-muted-foreground mb-3">Atur tema visual (Terang, Gelap, atau Sistem).</p>
                   <Button variant="outline" className="text-base w-full sm:w-auto" onClick={() => setIsAppPreferencesDialogOpen(true)}>Atur Preferensi Tampilan</Button>
                </CardContent>
              </Card>
            )}
            
            {canManageCurriculumSettings && (
              <Card className="shadow-md rounded-md">
                <CardHeader className="p-5">
                  <div className="flex items-center gap-3">
                    <BookCopy className="h-7 w-7 text-primary" />
                    <CardTitle className="text-xl font-semibold">Pengaturan Kurikulum</CardTitle>
                  </div>
                  <CardDescription className="text-base text-muted-foreground">Pilih kurikulum default untuk item baru.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-5 pt-0">
                  <div className="space-y-1.5">
                    <Label htmlFor="defaultCurriculum" className="text-base font-medium">Kurikulum Default</Label>
                    <Select value={selectedGlobalCurriculum} onValueChange={handleCurriculumChange}>
                        <SelectTrigger id="defaultCurriculum" className="text-base">
                            <SelectValue placeholder="Pilih Kurikulum Default" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCurriculums.map(curr => (
                                <SelectItem key={curr.value} value={curr.value}>{curr.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pengaturan ini akan menentukan template awal saat Anda membuat RPP, PROTA, atau Promes baru.
                  </p>
                </CardContent>
              </Card>
            )}


            {canManageData && (
              <Card className="shadow-md rounded-md">
                <CardHeader className="p-5">
                  <div className="flex items-center gap-3">
                    <Database className="h-7 w-7 text-primary" />
                    <CardTitle className="text-xl font-semibold">Manajemen Data</CardTitle>
                  </div>
                  <CardDescription className="text-base text-muted-foreground">Ekspor atau impor semua data aplikasi.</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Alert variant="destructive" className="mb-4 shadow-inner rounded-md">
                    <FileText className="h-5 w-5"/>
                    <AlertTitle className="font-semibold">Penting!</AlertTitle>
                    <AlertDescription className="text-sm">
                      Fitur impor akan menimpa SEMUA data yang ada saat ini. Pastikan Anda memiliki cadangan jika diperlukan.
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button variant="outline" onClick={handleExportData} className="w-full sm:w-auto text-base">
                      <Download className="mr-2 h-5 w-5" /> Ekspor Data
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto text-base">
                      <Upload className="mr-2 h-5 w-5" /> Impor Data
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
                <Card className="shadow-md rounded-md">
                <CardHeader className="p-5">
                    <div className="flex items-center gap-3">
                        <Users className="h-7 w-7 text-primary" />
                        <CardTitle className="text-xl font-semibold">Manajemen Pengguna</CardTitle>
                    </div>
                    <CardDescription className="text-base text-muted-foreground">Kelola akun pengguna dan peran mereka.</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                    <p className="text-base text-muted-foreground mb-3">Akses panel manajemen pengguna untuk menambah, mengedit, atau menghapus pengguna.</p>
                    <Button asChild className="text-base w-full sm:w-auto">
                        <Link href="/admin/user-management">Buka Manajemen Pengguna</Link>
                    </Button>
                </CardContent>
                </Card>
            )}


            {canSeeSystemSettings && (
                <Card className="shadow-md rounded-md">
                <CardHeader className="p-5">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                        <CardTitle className="text-xl font-semibold">Pengaturan Sistem</CardTitle>
                    </div>
                    <CardDescription className="text-base text-muted-foreground">Konfigurasi tingkat lanjut (Khusus Admin).</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                    <p className="text-base text-muted-foreground mb-3">Akses panel pengaturan sistem untuk konfigurasi inti aplikasi.</p>
                    <Button asChild className="text-base w-full sm:w-auto">
                        <Link href="/admin/system-settings">Buka Pengaturan Sistem</Link>
                    </Button>
                </CardContent>
                </Card>
            )}
            
          </div>
          
          <div className="mt-8 sm:hidden">
            <Button
              variant="destructive"
              className="w-full text-base"
              onClick={() => {
                addLog("INFO", `Pengguna ${user?.email} keluar dari aplikasi (via tombol mobile).`, "SettingsPage-MobileLogout");
                logout();
              }}
            >
              <LogOut className="mr-2 h-5 w-5" /> Keluar dari Aplikasi
            </Button>
          </div>


           {!(canSeeProfileSettings || canSeeAppSettings || canManageData || canSeeSystemSettings || canManageUsers || canManageCurriculumSettings) && 
            !canManageSchoolProfile && ( 
              <p className="text-base text-muted-foreground">Tidak ada pengaturan yang tersedia untuk peran Anda saat ini.</p>
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
