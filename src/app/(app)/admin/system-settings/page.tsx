
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2, Eye, EyeOff, Trash2, ExternalLink, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { useLog } from "@/contexts/LogContext";


export default function AdminSystemSettingsPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { addLog } = useLog();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [apiKey, setApiKey] = useState("********************");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && isClient) {
      if (!user || user.role !== "Admin") {
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
         addLog("INFO", `Admin ${user.email} mengakses halaman Pengaturan Sistem.`, "AdminSystemSettings");
      }
    }
  }, [user, loading, isClient, router, toast, addLog]);

  if (!isClient || loading || !user || user.role !== "Admin") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg">Memverifikasi akses...</p>
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

  const handleRevealApiKey = () => {
    if (!showApiKey) {
      setTimeout(() => {
        setApiKey("genkit_gcp_mock_key_xxxxxxxxxxxx");
        setShowApiKey(true);
        toast({ title: "Kunci API Ditampilkan", description: "Hanya untuk tujuan demonstrasi."});
        addLog("WARN", `Kunci API Google AI (Genkit) ditampilkan oleh Admin ${user?.email}.`, "AdminSystemSettings");
      }, 500);
    } else {
      setApiKey("********************");
      setShowApiKey(false);
    }
  };

  const handleClearCache = () => {
    toast({
      title: "Cache Aplikasi Dibersihkan",
      description: "Semua cache aplikasi telah berhasil dibersihkan. (Simulasi)",
    });
    addLog("INFO", `Cache aplikasi dibersihkan oleh Admin ${user?.email}. (Simulasi)`, "AdminSystemSettings");
  };

  const handleViewLogs = () => {
    addLog("INFO", `Admin ${user?.email} membuka halaman Log Sistem dari Pengaturan Sistem.`, "AdminSystemSettings");
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

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
                <CardTitle className="text-3xl md:text-4xl font-bold">Pengaturan Sistem</CardTitle>
                <CardDescription className="text-lg md:text-xl text-primary-foreground/90 mt-1">
                    Kelola konfigurasi inti dan pengaturan operasional aplikasi (Khusus Admin).
                </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="shadow-md rounded-md">
          <CardHeader className="p-5">
            <CardTitle className="text-xl font-semibold">Mode Perawatan</CardTitle>
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
            <CardTitle className="text-xl font-semibold">Manajemen Kunci API</CardTitle>
            <CardDescription className="text-base text-muted-foreground">Kelola kunci API untuk integrasi layanan eksternal (misalnya, Genkit/Google AI).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0">
            <div className="space-y-1.5">
              <Label htmlFor="api-key" className="text-base">Kunci API Google AI (Genkit)</Label>
              <div className="flex items-center gap-2">
                <Input id="api-key" type={showApiKey ? "text" : "password"} value={apiKey} readOnly className="text-base" />
                <Button variant="outline" size="icon" onClick={handleRevealApiKey} aria-label={showApiKey ? "Sembunyikan Kunci API" : "Tampilkan Kunci API"}>
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
               <p className="text-xs text-muted-foreground">Kunci ini digunakan untuk layanan GenAI. Ditampilkan hanya untuk demo.</p>
            </div>
            <Button variant="secondary" onClick={handleGenkitDashboard} className="text-base w-full sm:w-auto">
              <ExternalLink className="mr-2 h-5 w-5" /> Buka Dasbor Genkit (Dev)
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-md">
          <CardHeader className="p-5">
            <CardTitle className="text-xl font-semibold">Manajemen Cache</CardTitle>
            <CardDescription className="text-base text-muted-foreground">Kontrol cache aplikasi untuk memastikan data terbaru ditampilkan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0">
            <Button onClick={handleClearCache} variant="destructive" className="text-base w-full sm:w-auto">
              <Trash2 className="mr-2 h-5 w-5" /> Bersihkan Cache Aplikasi
            </Button>
            <p className="text-sm text-muted-foreground">
              Tindakan ini akan menghapus semua data cache yang disimpan oleh aplikasi. Gunakan dengan hati-hati.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-md">
          <CardHeader className="p-5">
            <CardTitle className="text-xl font-semibold">Log Sistem</CardTitle>
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
      </div>

      <Alert variant="destructive" className="mt-8 shadow-md rounded-md">
        <ShieldCheck className="h-6 w-6" />
        <AlertTitle className="text-lg font-semibold">Perhatian Keamanan</AlertTitle>
        <AlertDescription className="text-base">
          Pengaturan di halaman ini memiliki dampak signifikan pada operasional aplikasi. Harap lakukan perubahan dengan hati-hati dan hanya jika Anda memahami implikasinya.
        </AlertDescription>
      </Alert>
    </div>
  );
}

