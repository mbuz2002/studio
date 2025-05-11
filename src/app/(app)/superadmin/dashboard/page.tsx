
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Settings, Users, BarChart3, Activity, GraduationCap, SlidersHorizontal, CreditCard } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";

const superAdminFeatureCards = [
  {
    title: "Manajemen Sekolah",
    description: "Tambah, edit, dan kelola semua sekolah dalam sistem.",
    icon: Building,
    href: "/superadmin/schools",
    iconColor: "text-sky-500",
    gradientFrom: "from-sky-500/20",
    gradientTo: "to-sky-500/10",
  },
  {
    title: "Pengaturan Aplikasi Global",
    description: "Konfigurasi nama aplikasi, logo, dan aspek global lainnya.",
    icon: SlidersHorizontal, 
    href: "/superadmin/app-settings",
    iconColor: "text-amber-500",
    gradientFrom: "from-amber-500/20",
    gradientTo: "to-amber-500/10",
  },
  {
    title: "Manajemen Langganan",
    description: "Kelola status langganan untuk semua sekolah.",
    icon: CreditCard,
    href: "/superadmin/subscriptions",
    iconColor: "text-lime-500",
    gradientFrom: "from-lime-500/20",
    gradientTo: "to-lime-500/10",
  },
  {
    title: "Manajemen Pengguna Global",
    description: "Lihat dan kelola semua pengguna di seluruh sekolah.",
    icon: Users,
    href: "/superadmin/global-user-management",
    iconColor: "text-rose-500",
    gradientFrom: "from-rose-500/20",
    gradientTo: "to-rose-500/10",
  },
  {
    title: "Analitik & Laporan",
    description: "Dasbor analitik penggunaan aplikasi secara keseluruhan.",
    icon: BarChart3,
    href: "/superadmin/analytics",
    iconColor: "text-teal-500",
    gradientFrom: "from-teal-500/20",
    gradientTo: "to-teal-500/10",
  },
   {
    title: "Log Aktivitas Global",
    description: "Tinjau semua log aktivitas penting di seluruh sistem.",
    icon: Activity,
    href: "/superadmin/global-activity-logs",
    iconColor: "text-indigo-500",
    gradientFrom: "from-indigo-500/20",
    gradientTo: "to-indigo-500/10",
  },
];

export default function SuperAdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (user?.role !== "SuperAdmin")) {
      router.push("/dashboard"); // Redirect if not SuperAdmin
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "SuperAdmin") {
    return <LoadingSpinner message="Memuat Dasbor Super Admin..." icon={<GraduationCap className="h-16 w-16 animate-pulse text-primary mb-6" />} />;
  }

  return (
    <div className="container mx-auto py-6 md:py-8">
      <Card className="mb-8 shadow-xl rounded-lg overflow-hidden border-border/30 bg-card">
        <CardHeader className="p-6 md:p-8 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground rounded-t-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
            <GraduationCap className="h-10 w-10 md:h-12 md:w-12 text-background flex-shrink-0 mt-1 drop-shadow-lg" />
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Dasbor Super Admin</CardTitle>
              <CardDescription className="text-lg md:text-xl text-primary-foreground/90 mt-1.5">
                Kelola aspek global aplikasi GUMPLA AI.
              </CardDescription>
            </div>
          </div>
           <p className="text-base text-primary-foreground/80 mt-2">
            Selamat datang, <span className="font-semibold">{user.name}</span>!
          </p>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-6">
          <p className="mb-6 text-base md:text-lg leading-relaxed text-card-foreground/90">
            Gunakan alat di bawah ini untuk mengelola sekolah, pengguna, dan pengaturan aplikasi secara keseluruhan.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {superAdminFeatureCards.map((feature) => (
          <Card
            key={feature.title}
            className={`flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl border-border/50 group bg-card ${feature.disabled ? "opacity-60 cursor-not-allowed" : "hover:border-primary/70 hover:scale-[1.02] transform"}`}
          >
            <CardHeader className={`pb-4 pt-6 px-6 bg-gradient-to-br ${feature.gradientFrom || 'from-primary/10'} ${feature.gradientTo || 'to-accent/5'} rounded-t-xl`}>
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-lg bg-background/80 shadow-inner flex-shrink-0">
                  <feature.icon className={`h-8 w-8 ${feature.iconColor || 'text-primary'} drop-shadow-sm`} />
                </div>
                <div className="flex-grow">
                  <CardTitle className={`text-xl font-semibold text-card-foreground ${!feature.disabled ? "group-hover:text-primary" : ""} transition-colors`}>{feature.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-3">
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{feature.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                asChild
                variant="outline"
                className={`w-full text-base border-primary/60 text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300 rounded-md shadow-sm hover:shadow-md py-2.5`}
                disabled={feature.disabled}
              >
                {feature.disabled ? (
                  <span className="opacity-50 cursor-not-allowed">Segera Hadir</span>
                ) : (
                  <Link href={feature.href}>
                    Buka Fitur
                  </Link>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

