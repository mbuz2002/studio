
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Search, Edit2, AlertTriangle, Sparkles, CalendarCheck, ListChecks, BookOpen, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import type { School, SchoolFeatureSettings } from "@/types";
import { SCHOOLS_STORAGE_KEY, DEFAULT_FEATURE_SETTINGS } from "@/types";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SubscriptionEditDialog } from "@/components/superadmin/SubscriptionEditDialog"; 
import { format, parseISO, isBefore, isAfter, differenceInDays } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";

export default function SuperAdminSubscriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (authLoading) return;

    if (user?.role !== "SuperAdmin") {
      toast({ title: "Akses Ditolak", variant: "destructive" });
      router.push("/dashboard");
      return;
    }
    if (isClient) {
      addLog("INFO", `SuperAdmin ${user.email} mengakses halaman Manajemen Langganan.`, "SuperAdminSubscriptionsPage");
    }

    try {
      const storedSchools = localStorage.getItem(SCHOOLS_STORAGE_KEY);
      let parsedSchools: School[] = storedSchools ? JSON.parse(storedSchools) : [];
      
      const today = new Date();
      let schoolsUpdated = false;
      parsedSchools = parsedSchools.map(school => {
        let updatedSchool = { ...school, featureSettings: school.featureSettings || { ...DEFAULT_FEATURE_SETTINGS } };
        if (updatedSchool.subscriptionEndDate && isBefore(parseISO(updatedSchool.subscriptionEndDate), today) && updatedSchool.subscriptionStatus === 'active') {
          updatedSchool.subscriptionStatus = 'inactive'; 
          updatedSchool.isActive = false; 
          schoolsUpdated = true;
          addLog("WARN", `Langganan sekolah "${school.name}" (ID: ${school.id}) otomatis diubah menjadi Tidak Aktif karena melewati batas akhir periode.`, "SuperAdminSubscriptionsPage-AutoUpdate");
        }
        return updatedSchool;
      });

      if(schoolsUpdated) {
        localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(parsedSchools));
      }
      
      setSchools(parsedSchools);

    } catch (error) {
      console.error("Gagal memuat data sekolah:", error);
      toast({ title: "Gagal Memuat Data Sekolah", variant: "destructive" });
    }
  }, [user, authLoading, router, toast, addLog, isClient]);

  const filteredSchools = useMemo(() => {
    if (!isClient) return [];
    return schools.filter(school =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (school.adminEmail && school.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      school.subscriptionStatus.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [isClient, schools, searchTerm]);

  const handleEditSubscription = (school: School) => {
    setEditingSchool(school);
    setIsEditDialogOpen(true);
  };

  const handleSaveSubscription = (updatedSchool: School) => {
    setSchools(prevSchools => {
      const updatedSchoolsList = prevSchools.map(s => s.id === updatedSchool.id ? updatedSchool : s);
      localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(updatedSchoolsList));
      return updatedSchoolsList;
    });
    toast({ title: "Langganan & Fitur Diperbarui", description: `Pengaturan untuk ${updatedSchool.name} telah diperbarui.` });
    addLog("INFO", `Langganan dan fitur sekolah "${updatedSchool.name}" (ID: ${updatedSchool.id}) diperbarui oleh SuperAdmin ${user?.email}. Status: ${updatedSchool.subscriptionStatus}, Periode: ${updatedSchool.subscriptionStartDate} - ${updatedSchool.subscriptionEndDate}, Fitur: ${JSON.stringify(updatedSchool.featureSettings)}.`, "SuperAdminSubscriptionsPage");
    setIsEditDialogOpen(false);
    setEditingSchool(null);
  };
  
  const getSubscriptionBadgeVariant = (status: School['subscriptionStatus']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default'; 
      case 'trial': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getSubscriptionPeriodText = (school: School): string => {
    if (school.subscriptionStartDate && school.subscriptionEndDate) {
      const start = format(parseISO(school.subscriptionStartDate), "dd MMM yyyy", { locale: indonesianLocale });
      const end = format(parseISO(school.subscriptionEndDate), "dd MMM yyyy", { locale: indonesianLocale });
      const daysRemaining = differenceInDays(parseISO(school.subscriptionEndDate), new Date());
      
      let statusText = "";
      if (isAfter(new Date(), parseISO(school.subscriptionEndDate))) {
        statusText = `(Berakhir ${Math.abs(daysRemaining)} hari lalu)`;
      } else if (daysRemaining <= 7 && daysRemaining >= 0) {
        statusText = `(Berakhir dalam ${daysRemaining} hari)`;
      } else if (daysRemaining < 0){
         statusText = `(Telah Berakhir)`;
      }
      return `${start} - ${end} ${statusText}`;
    }
    return "Periode tidak diatur";
  };

  const renderFeatureStatus = (settings?: SchoolFeatureSettings) => {
    if (!settings) return <span className="text-xs text-muted-foreground italic">Default</span>;
    
    const featuresToDisplay: {key: keyof SchoolFeatureSettings, label: string, icon: React.ElementType, color: string}[] = [
      { key: "aiToolsEnabled", label: "AI", icon: Sparkles, color: "violet" },
      { key: "academicCalendarEnabled", label: "Kalender", icon: CalendarCheck, color: "sky" },
      { key: "timetableManagementEnabled", label: "Jadwal", icon: ListChecks, color: "amber" },
      { key: "masterDataManagementEnabled", label: "Master", icon: BookOpen, color: "rose" },
    ];

    const enabledFeatures = featuresToDisplay.filter(f => settings[f.key]);

    if (enabledFeatures.length === 0) return <span className="text-xs text-destructive">Tidak Ada Fitur Aktif</span>;
    
    return (
      <div className="flex flex-wrap gap-1.5">
        {enabledFeatures.map(feature => (
          <Badge key={feature.key} variant="outline" className={`text-xs border-${feature.color}-500/50 text-${feature.color}-600 dark:text-${feature.color}-400`}>
            <feature.icon size={12} className="mr-1"/>{feature.label}
          </Badge>
        ))}
      </div>
    );
  };


  if (!isClient || authLoading) {
    return <LoadingSpinner message="Memuat Manajemen Langganan..." icon={<CreditCard className="h-12 w-12 animate-pulse text-primary mb-4"/>} />;
  }
  
  if (user?.role !== "SuperAdmin") {
    return (
        <div className="flex h-screen items-center justify-center">
             <p className="text-destructive text-lg">Akses ditolak. Hanya Super Admin yang dapat mengakses halaman ini.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary-foreground drop-shadow" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">Manajemen Langganan & Fitur Sekolah</CardTitle>
              <CardDescription className="text-primary-foreground/90 mt-1">
                Kelola status langganan, periode, catatan pembayaran, dan fitur yang aktif untuk setiap sekolah.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari sekolah (nama, email admin, status)..."
                className="pl-10 w-full text-base md:text-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px] px-3 sm:px-4 py-3 text-sm">Nama Sekolah</TableHead>
                  <TableHead className="min-w-[150px] px-3 sm:px-4 py-3 text-sm hidden md:table-cell">Email Admin</TableHead>
                  <TableHead className="min-w-[120px] px-3 sm:px-4 py-3 text-sm text-center">Status Langganan</TableHead>
                  <TableHead className="min-w-[220px] px-3 sm:px-4 py-3 text-sm">Periode Langganan</TableHead>
                  <TableHead className="min-w-[200px] px-3 sm:px-4 py-3 text-sm">Fitur Aktif</TableHead>
                  <TableHead className="text-right min-w-[80px] px-3 sm:px-4 py-3 text-sm">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground px-3 sm:px-4 text-base">
                      Tidak ada data sekolah ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((school) => (
                    <TableRow key={school.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">
                        {school.name}
                        <div className="text-xs text-muted-foreground mt-0.5 md:hidden">Admin: {school.adminEmail || "-"}</div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm hidden md:table-cell">{school.adminEmail || "-"}</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-center">
                        <Badge variant={getSubscriptionBadgeVariant(school.subscriptionStatus)} className="text-xs capitalize">
                          {school.subscriptionStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-xs">
                        <div className="flex items-center gap-1">
                            <CalendarDays size={14} className="text-muted-foreground flex-shrink-0"/>
                            {getSubscriptionPeriodText(school)}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top">
                         {renderFeatureStatus(school.featureSettings)}
                      </TableCell>
                      <TableCell className="text-right px-3 sm:px-4 py-2 sm:py-3 align-top">
                        <Button variant="outline" size="sm" onClick={() => handleEditSubscription(school)} className="text-xs">
                          <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Kelola
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
           {schools.length > 0 && (
                <Alert variant="default" className="mt-6 border-primary/30">
                    <AlertTriangle className="h-5 w-5 text-primary"/>
                    <AlertTitle className="text-primary">Informasi Langganan & Fitur</AlertTitle>
                    <AlertDescription>
                        Kelola status langganan, periode, catatan pembayaran, dan fitur yang aktif untuk setiap sekolah.
                        Jika periode langganan berakhir dan status masih 'Aktif', sistem akan otomatis mengubahnya menjadi 'Tidak Aktif'.
                        Fitur yang tidak aktif tidak akan muncul di menu atau dapat diakses oleh pengguna sekolah tersebut.
                    </AlertDescription>
                </Alert>
            )}
        </CardContent>
      </Card>

      {editingSchool && (
        <SubscriptionEditDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          school={editingSchool}
          onSave={handleSaveSubscription}
        />
      )}
    </div>
  );
}

