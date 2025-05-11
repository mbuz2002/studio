
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Trash2, ExternalLink, Activity, Settings as SettingsIcon, PackageOpen, Clock, Sparkles, CalendarCheck, ListChecks, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { useLog } from "@/contexts/LogContext";
import type { TeachingPeriodSettings, SchoolFeatureSettings } from "@/types";
import { TEACHING_PERIOD_SETTINGS_KEY } from "@/types";
import { Badge } from "@/components/ui/badge";


export default function AdminSystemSettingsPage() {
  const { user, currentSchool, loading: authLoading } = useAuth(); 
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { addLog } = useLog();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [jpDurationMinutes, setJpDurationMinutes] = useState<number>(45); // Default JP duration

  useEffect(() => {
    setIsClient(true);
    // Load JP duration from localStorage
    const storedSettings = localStorage.getItem(TEACHING_PERIOD_SETTINGS_KEY);
    if (storedSettings) {
      try {
        const parsedSettings: TeachingPeriodSettings = JSON.parse(storedSettings);
        if (parsedSettings.jpDurationMinutes) {
          setJpDurationMinutes(parsedSettings.jpDurationMinutes);
        }
      } catch (e) {
        console.error("Failed to parse teaching period settings", e);
        addLog("ERROR", "Gagal memuat pengaturan durasi JP dari localStorage.", "AdminSystemSettings");
      }
    }
  }, [addLog]);

  useEffect(() => {
    if (!authLoading && isClient) { 
      if (!user || !["Admin", "SuperAdmin"].includes(user.role)) {
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
          variant: "destructive",
        });
        if (user) {
             addLog("WARN", `Pengguna ${user.email} (Peran: ${user.role}) mencoba mengakses Pengaturan Sistem tanpa izin.`, "AdminSystemSettings");
        }
        router.push("/dashboard");
      } else {
         addLog("INFO", `Admin ${user.email} mengakses halaman Pengaturan Sistem Sekolah.`, "AdminSystemSettings");
      }
    }
  }, [user, authLoading, isClient, router, toast, addLog]); 

  if (!isClient || authLoading || !user || !["Admin", "SuperAdmin"].includes(user.role)) { 
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <SettingsIcon className="h-12 w-12 animate-pulse text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Memverifikasi akses...</p>
          <p className="text-sm text-muted-foreground">Mohon tunggu sebentar.</p>
        </div>
      </div>
    );
  }

  const handleToggleMaintenance = () => {
    const newMode = !maintenanceMode;
    setMaintenanceMode(newMode);
    const message = `Mode Perawatan ${newMode ? "Diaktifkan" : "Dinonaktifkan"} oleh Admin ${user?.email}. (Simulasi)`;
    toast({
      title: `Mode Perawatan ${newMode ? "Diaktifkan" : "Dinonaktifkan"}`,
      description: `Sistem sekarang dalam mode ${newMode ? "perawatan" : "normal"}. (Simulasi)`,
    });
    addLog(newMode ? "WARN" : "INFO", message, "AdminSystemSettings");
  };

  const handleClearCache = () => {
    toast({
      title: "Cache Aplikasi Dibersihkan",
      description: "Semua cache aplikasi telah berhasil dibersihkan. (Simulasi)",
    });
    addLog("INFO", `Cache aplikasi dibersihkan oleh Admin ${user?.email}. (Simulasi)`, "AdminSystemSettings");
  };

  const handleViewLogs = () => {
    addLog("INFO", `Admin ${user?.email} membuka halaman Log Sistem dari Pengaturan Sistem Sekolah.`, "AdminSystemSettings");
    router.push('/admin/system-logs');
  };
  
  const handleGenkitDashboard = () => {
    window.open('http://localhost:4000', '_blank');
     toast({
      title: "Membuka Dasbor Genkit",
      description: "Membuka dasbor pengembangan Genkit di tab baru.",
    });
    addLog("INFO", `Admin ${user?.email} mencoba membuka dasbor Genkit (Dev).`, "AdminSystemSettings");
  }

  const handleJpDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setJpDurationMinutes(value);
    } else if (e.target.value === "") {
      setJpDurationMinutes(0); // Allow clearing for re-typing
    }
  };

  const handleSaveJpDuration = () => {
    if (jpDurationMinutes <= 0) {
      toast({ title: "Input Tidak Valid", description: "Durasi JP harus lebih besar dari 0 menit.", variant: "destructive" });
      return;
    }
    const settings: TeachingPeriodSettings = { jpDurationMinutes };
    localStorage.setItem(TEACHING_PERIOD_SETTINGS_KEY, JSON.stringify(settings));
    toast({ title: "Pengaturan Disimpan", description: `Durasi 1 Jam Pelajaran (JP) diatur ke ${jpDurationMinutes} menit.` });
    addLog("INFO", `Admin ${user?.email} mengatur durasi JP menjadi ${jpDurationMinutes} menit.`, "AdminSystemSettings");
  };

  const schoolFeatures: { label: string; icon: React.ElementType; enabled: boolean }[] = [
    { label: "Alat AI (Materi & Modul Ajar)", icon: Sparkles, enabled: currentSchool?.featureSettings?.aiToolsEnabled ?? true },
    { label: "Kalender Akademik", icon: CalendarCheck, enabled: currentSchool?.featureSettings?.academicCalendarEnabled ?? true },
    { label: "Manajemen Jadwal Pelajaran", icon: ListChecks, enabled: currentSchool?.featureSettings?.timetableManagementEnabled ?? true },
    { label: "Master Data (Mapel, Guru, Kelas)", icon: BookOpen, enabled: currentSchool?.featureSettings?.masterDataManagementEnabled ?? true },
  ];

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
                <CardTitle className="text-3xl md:text-4xl font-bold">Pengaturan Sistem Sekolah</CardTitle>
                <CardDescription className="text-lg md:text-xl text-primary-foreground/90 mt-1">
                    Kelola konfigurasi sekolah dan pengaturan operasional (Khusus Admin).
                </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md rounded-md">
          <CardHeader className="p-5">
             <div className="flex items-center gap-2">
                <SettingsIcon className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-semibold">Mode Perawatan</CardTitle>
            </div>
            <CardDescription className="text-base text-muted-foreground">Aktifkan mode perawatan untuk menonaktifkan akses publik sementara.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0">
            <div className="flex items-center space-x-3">
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={handleToggleMaintenance}
                aria-label={`Toggle Mode Perawatan. Saat ini ${maintenanceMode ? 'Aktif' : 'Tidak Aktif'}`}
              />
              <Label htmlFor="maintenance-mode" className="text-base">
                {maintenanceMode ? "Mode Perawatan Aktif" : "Mode Perawatan Tidak Aktif"}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Saat aktif, hanya admin yang dapat mengakses sistem. Pengguna lain akan melihat halaman pemberitahuan.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-md">
          <CardHeader className="p-5">
            <div className="flex items-center gap-2">
                <PackageOpen className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-semibold">Manajemen Cache</CardTitle>
            </div>
            <CardDescription className="text-base text-muted-foreground">Kontrol cache aplikasi untuk memastikan data terbaru ditampilkan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0">
            <Button onClick={handleClearCache} variant="destructive" className="text-base w-full sm:w-auto">
              <Trash2 className="mr-2 h-5 w-5" /> Bersihkan Cache Aplikasi
            </Button>
            <p className="text-sm text-muted-foreground">
              Tindakan ini akan menghapus semua data cache yang disimpan oleh aplikasi (simulasi). Gunakan dengan hati-hati.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-md">
          <CardHeader className="p-5">
             <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-semibold">Log Sistem</CardTitle>
            </div>
            <CardDescription className="text-base text-muted-foreground">Tinjau log aktivitas dan kesalahan sistem untuk pemecahan masalah.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0">
            <Button onClick={handleViewLogs} variant="outline" className="text-base w-full sm:w-auto">
              <Activity className="mr-2 h-5 w-5" /> Lihat Log Sistem
            </Button>
            <p className="text-sm text-muted-foreground">
              Akses log sistem untuk memantau aktivitas dan mendiagnosis masalah.
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md rounded-md">
          <CardHeader className="p-5">
             <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-semibold">Pengaturan Jam Pelajaran</CardTitle>
            </div>
            <CardDescription className="text-base text-muted-foreground">Atur durasi standar untuk 1 Jam Pelajaran (JP).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0">
            <div className="space-y-1.5">
                <Label htmlFor="jpDuration" className="text-base">Durasi 1 JP (menit)</Label>
                <Input 
                    id="jpDuration" 
                    type="number" 
                    value={jpDurationMinutes === 0 ? "" : jpDurationMinutes} 
                    onChange={handleJpDurationChange}
                    min="1"
                    placeholder="cth., 45"
                    className="text-base"
                />
            </div>
            <Button onClick={handleSaveJpDuration} className="text-base w-full sm:w-auto">
              Simpan Durasi JP
            </Button>
            <p className="text-sm text-muted-foreground">
              Durasi ini akan digunakan sebagai acuan dalam penjadwalan dan perhitungan alokasi waktu.
            </p>
          </CardContent>
        </Card>

         <Card className="shadow-md rounded-md">
          <CardHeader className="p-5">
            <div className="flex items-center gap-2">
                <ExternalLink className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-semibold">Dasbor Genkit (Dev)</CardTitle>
            </div>
            <CardDescription className="text-base text-muted-foreground">Akses dasbor pengembangan Genkit untuk memantau alur AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0">
             <Button variant="secondary" onClick={handleGenkitDashboard} className="text-base w-full sm:w-auto">
              Buka Dasbor Genkit
            </Button>
            <p className="text-sm text-muted-foreground">
              Hanya untuk tujuan pengembangan dan debugging alur GenAI.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-md md:col-span-2 lg:col-span-1">
          <CardHeader className="p-5">
            <div className="flex items-center gap-2">
                <SettingsIcon className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-semibold">Status Fitur Sekolah</CardTitle>
            </div>
            <CardDescription className="text-base text-muted-foreground">
              Lihat fitur yang aktif untuk sekolah Anda berdasarkan paket langganan. Diatur oleh Super Admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0">
            {schoolFeatures.map(feature => (
              <div key={feature.label} className="flex items-center justify-between p-2 border-b last:border-b-0">
                <div className="flex items-center gap-2">
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{feature.label}</span>
                </div>
                <Badge variant={feature.enabled ? "default" : "destructive"}>
                  {feature.enabled ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
            ))}
            {!currentSchool?.featureSettings && (
                <p className="text-sm text-muted-foreground text-center py-2">Pengaturan fitur sekolah tidak ditemukan.</p>
            )}
          </CardContent>
        </Card>

      </div>

      <Alert variant="destructive" className="mt-8 shadow-md rounded-md">
        <ShieldCheck className="h-6 w-6" />
        <AlertTitle className="text-lg font-semibold">Perhatian Keamanan</AlertTitle>
        <AlertDescription className="text-base">
          Pengaturan di halaman ini memiliki dampak signifikan pada operasional aplikasi sekolah Anda. Harap lakukan perubahan dengan hati-hati.
        </AlertDescription>
      </Alert>
    </div>
  );
}

