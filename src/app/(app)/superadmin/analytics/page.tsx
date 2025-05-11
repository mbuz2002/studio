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
  featureUsageRate?: { feature: string; usage: number }[]; // e.g., { feature: "AI Tools", usage: 75 for 75% }
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
        // Simulate fetching global analytics data
        const fetchGlobalData = () => {
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
            // Mock data for more complex analytics
            mostActiveSchool: schools.length > 0 ? { name: schools[0].name, activityScore: Math.floor(Math.random() * 1000) } : undefined,
            featureUsageRate: [
              { feature: "Alat AI", usage: Math.floor(Math.random() * 100) },
              { feature: "Kalender", usage: Math.floor(Math.random() * 100) },
            ]
          });
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
      <ul className="space-y-1 text-sm">
        {analyticsData.usersByRole.map(roleInfo => (
          <li key={roleInfo.role} className="flex justify-between">
            <span>{roleInfo.role}:</span>
            <span className="font-semibold">{roleInfo.count}</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card className="bg-muted/30 shadow-sm rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-foreground/90 flex items-center gap-2"><Building size={20} />Total Sekolah</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{analyticsData?.totalSchools ?? '--'}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 shadow-sm rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-foreground/90 flex items-center gap-2"><Users size={20} />Total Pengguna</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{analyticsData?.totalUsers ?? '--'}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 shadow-sm rounded-lg">
              <CardHeader className="pb-2">
                 <CardTitle className="text-lg text-foreground/90 flex items-center gap-2"><FileText size={20}/>Total Dokumen Kurikulum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">
                  {(analyticsData?.totalLessonPlans ?? 0) +
                   (analyticsData?.totalAnnualPrograms ?? 0) +
                   (analyticsData?.totalSemesterPrograms ?? 0) +
                   (analyticsData?.totalModulAjar ?? 0)
                  }
                </p>
                <p className="text-xs text-muted-foreground">RPP/ATP, PROTA, Promes, Modul Ajar</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><TrendingUp size={22}/>Status Langganan Sekolah</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-md bg-green-500/10">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle size={18} />
                    <span className="font-medium text-sm">Aktif</span>
                  </div>
                  <span className="font-bold text-lg text-green-600 dark:text-green-500">{analyticsData?.activeSchools ?? '--'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-blue-500/10">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Hourglass size={18} />
                    <span className="font-medium text-sm">Uji Coba (Trial)</span>
                  </div>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-500">{analyticsData?.trialSchools ?? '--'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-red-500/10">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle size={18} />
                    <span className="font-medium text-sm">Tidak Aktif</span>
                  </div>
                  <span className="font-bold text-lg text-red-600 dark:text-red-500">{analyticsData?.inactiveSchools ?? '--'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Users size={22}/>Distribusi Pengguna per Peran</CardTitle>
              </CardHeader>
              <CardContent>
                {renderUsersByRole()}
              </CardContent>
            </Card>
          </div>
          
           <Card className="shadow-md rounded-lg mt-6">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><ActivityIcon size={22}/>Aktivitas & Penggunaan Fitur (Contoh)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                 {analyticsData?.mostActiveSchool && (
                    <p>Sekolah Teraktif (Demo): <span className="font-semibold">{analyticsData.mostActiveSchool.name}</span> (Skor: {analyticsData.mostActiveSchool.activityScore})</p>
                 )}
                 {analyticsData?.featureUsageRate?.map(feature => (
                    <p key={feature.feature}>Penggunaan {feature.feature}: <span className="font-semibold">{feature.usage}%</span> (Demo)</p>
                 ))}
                 <p className="text-xs text-muted-foreground italic">Metrik penggunaan fitur lebih detail akan tersedia di masa mendatang.</p>
              </CardContent>
               <CardFooter>
                   <p className="text-xs text-muted-foreground">Data ini bersifat ilustratif untuk menunjukkan potensi laporan.</p>
               </CardFooter>
            </Card>

        </CardContent>
      </Card>
    </div>
  );
}
