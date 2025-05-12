
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BarChart3, AlertTriangle, Building, Users, FileText, ActivityIcon, TrendingUp, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLog } from "@/contexts/LogContext";
import type { School, User, AnyCurriculumItem } from "@/types";
import { SCHOOLS_STORAGE_KEY, APP_USERS_STORAGE_KEY, LESSON_PLANS_STORAGE_KEY, ANNUAL_PROGRAMS_STORAGE_KEY, SEMESTER_PROGRAMS_STORAGE_KEY, MODUL_AJAR_STORAGE_KEY } from "@/types";

interface GlobalAnalyticsData {
  totalSchools: number;
  activeSchools: number;
  trialSchools: number;
  inactiveSchools: number;
  totalUsers: number;
  usersByRole: { role: User['role']; count: number }[];
  totalLessonPlans: number;
  totalAnnualPrograms: number;
  totalSemesterPrograms: number;
  totalModulAjar: number;
  mostActiveSchool?: { name: string; activityScore: number };
  featureUsageRate?: { feature: string; usage: number }[];
}

export default function SuperAdminAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addLog } = useLog();
  const [analyticsData, setAnalyticsData] = useState<GlobalAnalyticsData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && isClient) {
      if (user?.role !== "SuperAdmin") {
        addLog("WARN", `Pengguna ${user?.email || 'tidak dikenal'} (Peran: ${user?.role || 'tidak diketahui'}) mencoba mengakses Analitik Global tanpa izin SuperAdmin.`, "SuperAdminAnalyticsPage");
        router.push("/dashboard");
      } else {
        addLog("INFO", `SuperAdmin ${user.email} mengakses halaman Analitik & Laporan Global.`, "SuperAdminAnalyticsPage");
        
        const fetchGlobalData = () => {
          try {
            const schools: School[] = JSON.parse(localStorage.getItem(SCHOOLS_STORAGE_KEY) || "[]");
            const users: User[] = JSON.parse(localStorage.getItem(APP_USERS_STORAGE_KEY) || "[]");
            const lessonPlans: AnyCurriculumItem[] = JSON.parse(localStorage.getItem(LESSON_PLANS_STORAGE_KEY) || "[]");
            const annualPrograms: AnyCurriculumItem[] = JSON.parse(localStorage.getItem(ANNUAL_PROGRAMS_STORAGE_KEY) || "[]");
            const semesterPrograms: AnyCurriculumItem[] = JSON.parse(localStorage.getItem(SEMESTER_PROGRAMS_STORAGE_KEY) || "[]");
            const modulAjar: AnyCurriculumItem[] = JSON.parse(localStorage.getItem(MODUL_AJAR_STORAGE_KEY) || "[]");

            const usersByRole = users.reduce((acc, u) => {
              const roleIndex = acc.findIndex(item => item.role === u.role);
              if (roleIndex > -1) {
                acc[roleIndex].count++;
              } else {
                acc.push({ role: u.role, count: 1 });
              }
              return acc;
            }, [] as { role: User['role']; count: number }[]);

            setAnalyticsData({
              totalSchools: schools.length,
              activeSchools: schools.filter(s => s.subscriptionStatus === 'active').length,
              trialSchools: schools.filter(s => s.subscriptionStatus === 'trial').length,
              inactiveSchools: schools.filter(s => s.subscriptionStatus === 'inactive').length,
              totalUsers: users.length,
              usersByRole,
              totalLessonPlans: lessonPlans.length,
              totalAnnualPrograms: annualPrograms.length,
              totalSemesterPrograms: semesterPrograms.length,
              totalModulAjar: modulAjar.length,
              mostActiveSchool: schools.length > 0 ? { name: schools[0].name, activityScore: Math.floor(Math.random() * 1000) } : undefined,
              featureUsageRate: [
                { feature: "Alat AI", usage: Math.floor(Math.random() * 100) },
                { feature: "Kalender", usage: Math.floor(Math.random() * 100) },
              ]
            });
          } catch (error) {
            console.error("Error fetching global analytics data:", error);
            addLog("ERROR", `Gagal memuat data analitik global: ${error}`, "SuperAdminAnalyticsPage");
          }
        };
        fetchGlobalData();
      }
    }
  }, [user, loading, router, addLog, isClient]);

  if (loading || !user || user.role !== "SuperAdmin" || !isClient) {
    return <LoadingSpinner message="Memuat Analitik & Laporan Global..." icon={<BarChart3 className="h-12 w-12 animate-pulse text-primary mb-4"/>} />;
  }

  const renderUsersByRole = () => {
    if (!analyticsData?.usersByRole || analyticsData.usersByRole.length === 0) {
      return <p className="text-sm text-muted-foreground">Tidak ada data pengguna.</p>;
    }
    return (
      <ul className="space-y-1.5 text-sm">
        {analyticsData.usersByRole.map(roleInfo => (
          <li key={roleInfo.role} className="flex justify-between items-center py-1 border-b border-border/50 last:border-b-0">
            <span className="text-foreground/90">{roleInfo.role}:</span>
            <Badge variant="secondary" className="font-semibold">{roleInfo.count}</Badge>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary-foreground drop-shadow" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">Analitik & Laporan Global</CardTitle>
              <CardDescription className="text-primary-foreground/90 mt-1">
                Dasbor analitik penggunaan aplikasi GUMPLA AI secara keseluruhan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 p-4 md:p-6">
          <Alert variant="default" className="mb-6 border-amber-500/50 shadow-md rounded-md bg-amber-500/5 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="font-semibold">Data Simulasi</AlertTitle>
            <AlertDescription>
              Data yang ditampilkan di halaman ini adalah data simulasi dari localStorage untuk keperluan demo. Dalam aplikasi produksi, data ini akan berasal dari agregasi database terpusat.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card shadow-lg rounded-lg border-border/50 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground flex items-center gap-2"><Building size={20} className="text-primary"/>Total Sekolah Terdaftar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary drop-shadow-sm">{analyticsData?.totalSchools ?? '--'}</p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-lg rounded-lg border-border/50 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground flex items-center gap-2"><Users size={20} className="text-primary"/>Total Pengguna Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary drop-shadow-sm">{analyticsData?.totalUsers ?? '--'}</p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-lg rounded-lg border-border/50 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                 <CardTitle className="text-lg text-foreground flex items-center gap-2"><FileText size={20} className="text-primary"/>Total Dokumen Kurikulum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary drop-shadow-sm">
                  {(analyticsData?.totalLessonPlans ?? 0) +
                   (analyticsData?.totalAnnualPrograms ?? 0) +
                   (analyticsData?.totalSemesterPrograms ?? 0) +
                   (analyticsData?.totalModulAjar ?? 0)
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">RPP/ATP, PROTA, Promes, Modul Ajar</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md rounded-lg border-border/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><TrendingUp size={22} className="text-accent"/>Status Langganan Sekolah</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle size={18} />
                    <span className="font-medium text-sm">Aktif</span>
                  </div>
                  <span className="font-bold text-xl text-green-600 dark:text-green-500">{analyticsData?.activeSchools ?? '--'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Hourglass size={18} />
                    <span className="font-medium text-sm">Uji Coba (Trial)</span>
                  </div>
                  <span className="font-bold text-xl text-blue-600 dark:text-blue-500">{analyticsData?.trialSchools ?? '--'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle size={18} />
                    <span className="font-medium text-sm">Tidak Aktif</span>
                  </div>
                  <span className="font-bold text-xl text-red-600 dark:text-red-500">{analyticsData?.inactiveSchools ?? '--'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md rounded-lg border-border/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Users size={22} className="text-accent"/>Distribusi Pengguna per Peran</CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                {renderUsersByRole()}
              </CardContent>
            </Card>
          </div>
          
           <Card className="shadow-md rounded-lg mt-6 border-border/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><ActivityIcon size={22} className="text-accent"/>Aktivitas & Penggunaan Fitur (Contoh)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                 {analyticsData?.mostActiveSchool && (
                    <p className="py-1">Sekolah Teraktif (Demo): <Badge variant="outline" className="font-semibold text-base">{analyticsData.mostActiveSchool.name}</Badge> (Skor Aktivitas: {analyticsData.mostActiveSchool.activityScore})</p>
                 )}
                 {analyticsData?.featureUsageRate?.map(feature => (
                    <p key={feature.feature} className="py-1">Penggunaan Fitur {feature.feature}: <Badge className="font-semibold text-base">{feature.usage}%</Badge> (Demo)</p>
                 ))}
                 <p className="text-xs text-muted-foreground italic pt-2">Metrik penggunaan fitur lebih detail akan tersedia di masa mendatang dan akan divisualisasikan dengan grafik.</p>
              </CardContent>
               <CardFooter className="text-xs text-muted-foreground">
                   Data ini bersifat ilustratif untuk menunjukkan potensi laporan.
               </CardFooter>
            </Card>

        </CardContent>
      </Card>
    </div>
  );
}

