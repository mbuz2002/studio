
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle, CalendarDays, Sparkles, CalendarCheck, ListChecks, BookOpen, CreditCard, ShieldAlert, ArrowUpCircle, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { School, SchoolFeatureSettings, CustomDomainStatus } from "@/types";
import { SCHOOLS_STORAGE_KEY } from "@/types";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { format, parseISO, isBefore, isAfter, differenceInDays } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import { useLog } from "@/contexts/LogContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; 

interface FeatureDisplayItem {
  key: keyof SchoolFeatureSettings;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
}

export default function AdminSubscriptionStatusPage() {
  const { user, currentSchool, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addLog } = useLog();
  const { toast } = useToast(); 
  const [isClient, setIsClient] = useState(false);
  const [schoolData, setSchoolData] = useState<School | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !authLoading) {
      if (!user || user.role !== "Admin") {
        router.push("/dashboard");
        addLog("WARN", `Pengguna ${user?.email || 'tidak dikenal'} mencoba mengakses status langganan tanpa izin Admin.`, "AdminSubscriptionStatusPage");
        return;
      }
      if (currentSchool) {
        const allSchoolsData = localStorage.getItem(SCHOOLS_STORAGE_KEY);
        if (allSchoolsData) {
          try {
            const allSchools: School[] = JSON.parse(allSchoolsData);
            const updatedCurrentSchool = allSchools.find(s => s.id === currentSchool.id);
            if (updatedCurrentSchool) {
              setSchoolData(updatedCurrentSchool);
            } else {
              setSchoolData(currentSchool); 
            }
          } catch (e) {
            console.error("Failed to parse schools data from localStorage for subscription status", e);
            setSchoolData(currentSchool); 
          }
        } else {
          setSchoolData(currentSchool);
        }
        addLog("INFO", `Admin ${user.email} melihat status langganan untuk sekolah: ${currentSchool.name}.`, "AdminSubscriptionStatusPage");
      } else if (user.role === "Admin" && !currentSchool) {
         addLog("ERROR", `Admin ${user.email} tidak memiliki data sekolah yang terkait.`, "AdminSubscriptionStatusPage");
      }
    }
  }, [isClient, user, currentSchool, authLoading, router, addLog]);

  const getSubscriptionBadgeVariant = (status: School['subscriptionStatus'] | undefined): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getCustomDomainStatusBadgeVariant = (status?: CustomDomainStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'pending_verification': return 'secondary';
      case 'configuration_error':
      case 'ssl_error': return 'destructive';
      case 'unconfigured':
      default: return 'outline';
    }
  };

  const getSubscriptionPeriodText = (school: School | null): string => {
    if (!school || !school.subscriptionStartDate || !school.subscriptionEndDate) {
      return "Periode tidak diatur";
    }
    try {
      const start = format(parseISO(school.subscriptionStartDate), "dd MMMM yyyy", { locale: indonesianLocale });
      const end = format(parseISO(school.subscriptionEndDate), "dd MMMM yyyy", { locale: indonesianLocale });
      const daysRemaining = differenceInDays(parseISO(school.subscriptionEndDate), new Date());
      let statusText = "";
      if (isAfter(new Date(), parseISO(school.subscriptionEndDate))) {
        statusText = `(Berakhir ${Math.abs(daysRemaining)} hari lalu)`;
      } else if (daysRemaining <= 30 && daysRemaining >= 0) { 
        statusText = `(Berakhir dalam ${daysRemaining} hari)`;
      } else if (daysRemaining < 0){
         statusText = `(Telah Berakhir)`;
      }
      return `${start} - ${end} ${statusText}`;
    } catch (error) {
      console.error("Error formatting subscription dates:", error);
      addLog("ERROR", `Error memformat tanggal langganan untuk sekolah ${school.name}: ${error}`, "AdminSubscriptionStatusPage");
      return "Format tanggal tidak valid";
    }
  };

  const featureDisplayList: FeatureDisplayItem[] = schoolData?.featureSettings ? [
    { key: "aiToolsEnabled", label: "Alat Bantu AI (Materi & Modul Ajar)", icon: Sparkles, enabled: schoolData.featureSettings.aiToolsEnabled },
    { key: "academicCalendarEnabled", label: "Kalender Pendidikan Interaktif", icon: CalendarCheck, enabled: schoolData.featureSettings.academicCalendarEnabled },
    { key: "timetableManagementEnabled", label: "Manajemen Jadwal Pelajaran", icon: ListChecks, enabled: schoolData.featureSettings.timetableManagementEnabled },
    { key: "masterDataManagementEnabled", label: "Pengelolaan Master Data Sekolah", icon: BookOpen, enabled: schoolData.featureSettings.masterDataManagementEnabled },
  ] : [];

  const handleUpgradeSubscription = () => {
    if (!user || !schoolData) {
      toast({
        title: "Gagal Memproses Permintaan",
        description: "Informasi pengguna atau sekolah tidak tersedia.",
        variant: "destructive",
      });
      return;
    }
    addLog("INFO", `Admin ${user.email} dari sekolah ${schoolData.name} mengklik tombol Upgrade Langganan.`, "AdminSubscriptionStatusPage");
    
    const schoolName = schoolData.name || "sekolah saya";
    const message = encodeURIComponent(`Halo GUMPLA AI, saya tertarik untuk meningkatkan langganan layanan untuk sekolah ${schoolName}. Mohon informasinya. Terima kasih.`);
    const whatsappLink = `https://wa.me/6282131100121?text=${message}`;
    
    window.open(whatsappLink, '_blank');
    
    toast({
      title: "Hubungi Kami via WhatsApp",
      description: "Anda akan diarahkan ke WhatsApp untuk diskusi lebih lanjut mengenai peningkatan langganan.",
      duration: 8000, 
    });
  };

  if (!isClient || authLoading || !user) {
    return <LoadingSpinner message="Memuat Status Langganan..." icon={<CreditCard className="h-12 w-12 animate-pulse text-primary mb-4"/>} />;
  }

  if (user.role !== "Admin") {
      return (
        <div className="flex h-screen items-center justify-center">
             <p className="text-destructive text-lg">Akses ditolak. Hanya Admin Sekolah yang dapat mengakses halaman ini.</p>
        </div>
    );
  }
  
  if (!schoolData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive flex items-center gap-2"><AlertCircle /> Data Sekolah Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Informasi sekolah Anda tidak dapat dimuat. Mohon hubungi Super Admin untuk bantuan.</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-primary-foreground drop-shadow" />
                <div>
                <CardTitle className="text-2xl md:text-3xl">Status Langganan & Fitur Sekolah</CardTitle>
                <CardDescription className="text-primary-foreground/90 mt-1">
                    Lihat detail langganan dan fitur yang aktif untuk sekolah Anda: {schoolData.name}.
                </CardDescription>
                </div>
            </div>
            <Button
              onClick={handleUpgradeSubscription}
              className="bg-background/20 hover:bg-background/30 text-primary-foreground shadow-md flex items-center gap-2"
              aria-label="Tingkatkan Langganan"
            >
              <ArrowUpCircle className="h-5 w-5" />
              Tingkatkan Langganan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-md rounded-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><CreditCard size={22}/> Detail Langganan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Nama Sekolah:</strong> {schoolData.name}</div>
                <div className="flex items-center gap-1.5">
                  <strong>Status Langganan:</strong> 
                  <Badge variant={getSubscriptionBadgeVariant(schoolData.subscriptionStatus)} className="capitalize">
                    {schoolData.subscriptionStatus || "Tidak Diketahui"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                    <CalendarDays size={16} className="text-muted-foreground"/>
                    <strong>Periode Aktif:</strong> {getSubscriptionPeriodText(schoolData)}
                </div>
                {schoolData.paymentDetails && <div><strong>Catatan Pembayaran:</strong> {schoolData.paymentDetails}</div>}
                 {!schoolData.isActive && (
                  <div className="text-destructive font-semibold flex items-center gap-1.5"><ShieldAlert size={16}/> Status Sekolah: Saat ini NONAKTIF</div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md rounded-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Sparkles size={22}/> Fitur Aplikasi yang Aktif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {featureDisplayList.length > 0 ? (
                  featureDisplayList.map(feature => (
                    <div key={feature.key} className={`flex items-center gap-2 p-2 rounded-md ${feature.enabled ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400 line-through'}`}>
                      {feature.enabled ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      <feature.icon className={`mr-1 h-4 w-4 ${feature.enabled ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}/>
                      <span className="font-medium text-sm">{feature.label}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Tidak ada pengaturan fitur khusus, fitur default aktif.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {schoolData.customDomain && (
            <Card className="shadow-md rounded-md mb-6">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Globe size={22}/> Domain Kustom</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Domain:</strong> <a href={`http://${schoolData.customDomain}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{schoolData.customDomain}</a></div>
                <div className="flex items-center gap-1.5">
                    <strong>Status Domain:</strong> 
                    <Badge variant={getCustomDomainStatusBadgeVariant(schoolData.customDomainStatus)} className="capitalize">
                        {schoolData.customDomainStatus?.replace(/_/g, ' ') || "Belum Dikonfigurasi"}
                    </Badge>
                </div>
                {(schoolData.customDomainStatus === 'pending_verification' || schoolData.customDomainStatus === 'configuration_error') && (
                    <p className="text-xs text-muted-foreground">
                        Pastikan CNAME record domain Anda telah diarahkan dengan benar ke target yang disediakan Super Admin (biasanya `app.gumpla.ai` atau sejenisnya). Propagasi DNS mungkin memerlukan waktu.
                    </p>
                )}
              </CardContent>
            </Card>
          )}

            <div className="mt-6 text-sm text-muted-foreground p-4 border rounded-md bg-secondary/30">
                <p className="font-semibold mb-1">Informasi:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Jika status langganan Anda 'Tidak Aktif' atau 'Trial' telah berakhir, beberapa fitur mungkin terbatas atau tidak dapat diakses.</li>
                    <li>Fitur yang tercantum sebagai nonaktif tidak akan muncul di menu navigasi atau tidak dapat digunakan.</li>
                    <li>Untuk pertanyaan mengenai langganan, perubahan paket, aktivasi fitur, atau pengaturan domain kustom, silakan hubungi Super Administrator aplikasi.</li>
                </ul>
            </div>
             <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>Kembali ke Dasbor</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
