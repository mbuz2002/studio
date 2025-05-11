
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert components
import { useLog } from "@/contexts/LogContext"; // Added useLog

export default function SuperAdminAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addLog } = useLog(); // Added addLog

  useEffect(() => {
    if (!loading) {
      if (user?.role !== "SuperAdmin") {
        addLog("WARN", `Pengguna ${user?.email || 'tidak dikenal'} (Peran: ${user?.role || 'tidak diketahui'}) mencoba mengakses Analitik Global tanpa izin SuperAdmin.`, "SuperAdminAnalyticsPage");
        router.push("/dashboard");
      } else {
        addLog("INFO", `SuperAdmin ${user.email} mengakses halaman Analitik & Laporan Global.`, "SuperAdminAnalyticsPage");
      }
    }
  }, [user, loading, router, addLog]);

  if (loading || !user || user.role !== "SuperAdmin") {
    return <LoadingSpinner message="Memuat Analitik & Laporan Global..." icon={<BarChart3 className="h-12 w-12 animate-pulse text-primary mb-4"/>} />;
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary-foreground drop-shadow" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">Analitik & Laporan Global</CardTitle>
              <CardDescription className="text-primary-foreground/90 mt-1">
                Dasbor analitik penggunaan aplikasi secara keseluruhan (Fitur Mendatang).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 p-4 md:p-6">
          <Alert variant="default" className="border-amber-500/50 shadow-md rounded-md">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="font-semibold text-amber-600">Fitur Dalam Pengembangan</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Halaman ini akan menampilkan data statistik dan laporan mengenai penggunaan aplikasi GUMPLA AI
              di semua sekolah, jumlah dokumen yang dibuat, aktivitas pengguna, dan metrik penting lainnya.
              Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia.
            </AlertDescription>
          </Alert>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards for future analytics */}
            <Card className="bg-muted/30 shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg text-foreground/90">Total Sekolah Terdaftar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">--</p>
                <p className="text-xs text-muted-foreground">Data akan tersedia nanti.</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg text-foreground/90">Total Pengguna Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">--</p>
                <p className="text-xs text-muted-foreground">Data akan tersedia nanti.</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg text-foreground/90">Dokumen Dibuat (Total)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">--</p>
                <p className="text-xs text-muted-foreground">Data akan tersedia nanti.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

