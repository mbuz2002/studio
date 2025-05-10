
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, CalendarDays, CalendarClock, Sparkles, PlusCircle, Users, FileText, LayoutDashboard, BrainCircuit } from "lucide-react"; 
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";
import { useCurriculum } from "@/contexts/CurriculumContext"; 

const featureCardsConfig: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  roles: UserRole[];
  isKurikulumMerdekaOnly?: boolean;
  iconColor?: string; // Optional color for icon
}[] = [
  {
    title: "RPP / ATP", // Label will adjust based on curriculum
    description: "Buat, edit, dan kelola RPP (K13/KTSP) atau Alur Tujuan Pembelajaran (ATP) untuk Kurikulum Merdeka.",
    icon: BookOpenText,
    href: "/lesson-plans",
    roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru", "TataUsaha"],
    iconColor: "text-sky-500",
  },
  {
    title: "Program Tahunan (PROTA)",
    description: "Rencanakan visi kurikulum Anda untuk keseluruhan tahun ajaran secara komprehensif.",
    icon: CalendarDays,
    href: "/annual-programs",
    roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru", "TataUsaha"],
    iconColor: "text-amber-500",
  },
  {
    title: "Program Semester (Promes)",
    description: "Rincikan jadwal dan materi pengajaran Anda dengan detail untuk setiap semester akademik.",
    icon: CalendarClock,
    href: "/semester-programs",
    roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru", "TataUsaha"],
    iconColor: "text-rose-500",
  },
  {
    title: "Modul Ajar (KM)",
    description: "Rancang dan kelola Modul Ajar spesifik untuk Kurikulum Merdeka dengan fitur AI.",
    icon: BrainCircuit,
    href: "/modul-ajar",
    roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"],
    isKurikulumMerdekaOnly: true,
    iconColor: "text-teal-500",
  },
  {
    title: "Asisten AI Materi",
    description: "Manfaatkan AI untuk ide, saran, dan pembuatan draf materi pengajaran inovatif.",
    icon: Sparkles,
    href: "/ai-assistant",
    roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"],
    iconColor: "text-violet-500",
  },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth(); 
  const { defaultCurriculum } = useCurriculum(); 

  const canCreateNewPlan = user && (user.role === "Admin" || user.role === "WakaKurikulum" || user.role === "Guru");

  const visibleFeatureCards = user 
    ? featureCardsConfig.map(card => {
        if (card.href === "/lesson-plans") {
          return {
            ...card,
            title: defaultCurriculum === "Kurikulum Merdeka" ? "ATP (Alur Tujuan Pembelajaran)" : "RPP (Rencana Pelaksanaan Pembelajaran)",
          };
        }
        return card;
      }).filter(card => 
        card.roles.includes(user.role) &&
        (!card.isKurikulumMerdekaOnly || defaultCurriculum === "Kurikulum Merdeka")
      ) 
    : [];

  if (authLoading || !user) { 
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center"> 
        <div className="flex flex-col items-center text-center">
          <LayoutDashboard className="h-12 w-12 animate-pulse text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Memuat dasbor Anda...</p>
          <p className="text-sm text-muted-foreground">Mohon tunggu sebentar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-8">
      <Card className="mb-8 shadow-xl rounded-lg overflow-hidden border-border/30">
        <CardHeader className="p-6 md:p-8 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground rounded-t-lg">
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
            <LayoutDashboard className="h-10 w-10 md:h-12 md:w-12 text-primary-foreground flex-shrink-0 mt-1 drop-shadow-lg" />
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Selamat Datang di EduAI Planner!</CardTitle>
              <CardDescription className="text-lg md:text-xl text-primary-foreground/90 mt-1.5">
                Platform cerdas untuk perencanaan dan manajemen kurikulum yang efektif dan inovatif.
              </CardDescription>
            </div>
          </div>
          <p className="text-base text-primary-foreground/90 mt-2">
            Peran Anda: <span className="font-semibold bg-black/20 px-2 py-0.5 rounded">{user?.role}</span>
          </p>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-6 bg-card">
          <p className="mb-6 text-base md:text-lg leading-relaxed text-card-foreground/90">
            Maksimalkan potensi pengajaran Anda dengan EduAI Planner. Buat, atur, dan tingkatkan kualitas dokumen pembelajaran Anda dengan dukungan AI. Mulai jelajahi fitur-fitur unggulan di bawah ini atau langsung buat dokumen baru.
          </p>
          {canCreateNewPlan && (
            <Button asChild size="lg" className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground text-lg py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-md">
              <Link href="/lesson-plans"> 
                <PlusCircle className="mr-2.5 h-5 w-5" /> Buat Dokumen Baru
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleFeatureCards.map((feature) => (
          <Card key={feature.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg border-border/50 group bg-card hover:border-primary/70">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.iconColor ? `from-${feature.iconColor.split('-')[1]}-500/20 to-${feature.iconColor.split('-')[1]}-500/10` : 'from-primary/20 to-primary/10'} flex-shrink-0`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor || 'text-primary'} drop-shadow-sm`} /> 
                </div>
                <div className="flex-grow">
                    <CardTitle className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed mt-1 line-clamp-3">{feature.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-end mt-auto pt-2 pb-6 px-6"> 
              <Button asChild variant="outline" className="w-full text-base border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300 rounded-md shadow-sm hover:shadow-md">
                <Link href={feature.href}>
                  Buka Fitur
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
         {visibleFeatureCards.length === 0 && (
           <Card className="rounded-lg col-span-full shadow-md border-border/50 bg-card">
            <CardHeader className="p-6">
              <CardTitle className="text-xl md:text-2xl font-semibold text-card-foreground">Tidak Ada Fitur Tersedia</CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-1">Saat ini tidak ada fitur yang dapat diakses untuk peran Anda atau sesuai dengan pengaturan kurikulum saat ini. Silakan hubungi administrator jika ini tidak sesuai.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
