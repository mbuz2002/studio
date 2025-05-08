
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function AdminSystemSettingsPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

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
        router.push("/dashboard");
      }
    }
  }, [user, loading, isClient, router, toast]);

  if (!isClient || loading || !user || user.role !== "Admin") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memverifikasi akses...</p>
      </div>
    );
  }

  const handleToggleMaintenance = () => {
    setMaintenanceMode(!maintenanceMode);
    toast({
      title: `Mode Perawatan ${!maintenanceMode ? "Diaktifkan" : "Dinonaktifkan"}`,
      description: `Sistem sekarang dalam mode ${!maintenanceMode ? "perawatan" : "normal"}. (Simulasi)`,
    });
  };

  const handleRevealApiKey = () => {
    if (!showApiKey) {
      // Simulate fetching and revealing API key
      setTimeout(() => {
        setApiKey("genkit_gcp_mock_key_xxxxxxxxxxxx");
        setShowApiKey(true);
        toast({ title: "Kunci API Ditampilkan", description: "Hanya untuk tujuan demonstrasi."});
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
  };

  const handleViewLogs = () => {
    // In a real app, this might open a new page or modal with logs
    toast({
      title: "Melihat Log Sistem",
      description: "Fitur log sistem sedang dalam pengembangan. (Simulasi)",
    });
     // Example: window.open('/admin/system-logs', '_blank');
  };
  
  const handleGenkitDashboard = () => {
    // Assuming Genkit dev dashboard runs on port 4000 locally
    window.open('http://localhost:4000', '_blank');
     toast({
      title: "Membuka Dasbor Genkit",
      description: "Membuka dasbor pengembangan Genkit di tab baru.",
    });
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">Pengaturan Sistem</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Kelola konfigurasi inti dan pengaturan operasional aplikasi (Khusus Admin).
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Mode Perawatan</CardTitle>
            <CardDescription>Aktifkan mode perawatan untuk menonaktifkan akses publik sementara.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={handleToggleMaintenance}
                aria-label={`Toggle Mode Perawatan. Saat ini ${maintenanceMode ? 'Aktif' : 'Tidak Aktif'}`}
              />
              <Label htmlFor="maintenance-mode">
                {maintenanceMode ? "Mode Perawatan Aktif" : "Mode Perawatan Tidak Aktif"}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Saat aktif, hanya admin yang dapat mengakses sistem. Pengguna lain akan melihat halaman pemberitahuan.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Manajemen Kunci API</CardTitle>
            <CardDescription>Kelola kunci API untuk integrasi layanan eksternal (misalnya, Genkit/Google AI).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="api-key">Kunci API Google AI (Genkit)</Label>
              <div className="flex items-center gap-2">
                <Input id="api-key" type={showApiKey ? "text" : "password"} value={apiKey} readOnly />
                <Button variant="outline" size="icon" onClick={handleRevealApiKey} aria-label={showApiKey ? "Sembunyikan Kunci API" : "Tampilkan Kunci API"}>
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
               <p className="text-xs text-muted-foreground">Kunci ini digunakan untuk layanan GenAI. Ditampilkan hanya untuk demo.</p>
            </div>
            <Button variant="secondary" onClick={handleGenkitDashboard}>
              <ExternalLink className="mr-2 h-4 w-4" /> Buka Dasbor Genkit (Dev)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Manajemen Cache</CardTitle>
            <CardDescription>Kontrol cache aplikasi untuk memastikan data terbaru ditampilkan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleClearCache} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Bersihkan Cache Aplikasi
            </Button>
            <p className="text-sm text-muted-foreground">
              Tindakan ini akan menghapus semua data cache yang disimpan oleh aplikasi. Gunakan dengan hati-hati.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Log Sistem</CardTitle>
            <CardDescription>Tinjau log aktivitas dan kesalahan sistem untuk pemecahan masalah.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleViewLogs} variant="outline">
              Lihat Log Sistem
            </Button>
            <p className="text-sm text-muted-foreground">
              Akses log sistem untuk memantau aktivitas dan mendiagnosis masalah.
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert variant="destructive" className="mt-8">
        <ShieldCheck className="h-5 w-5" />
        <AlertTitle>Perhatian Keamanan</AlertTitle>
        <AlertDescription>
          Pengaturan di halaman ini memiliki dampak signifikan pada operasional aplikasi. Harap lakukan perubahan dengan hati-hati dan hanya jika Anda memahami implikasinya.
        </AlertDescription>
      </Alert>
    </div>
  );
}
