
"use client";
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarRail, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { AppLogo } from '@/components/layout/AppLogo';
import { UserProfile } from '@/components/layout/UserProfile';
import { LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, Sparkles, Settings as SettingsIcon, ShieldCheck, Activity, Users, Info, BrainCircuit, FileText, LogOut, Package, UserCheck, ListChecks, Book, Home, ClipboardList, CalendarCheck, CreditCard, SlidersHorizontal, BarChart3 } from 'lucide-react'; 
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import type { UserRole, SchoolFeatureSettings } from '@/types';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useCurriculum } from '@/contexts/CurriculumContext';
import { useToast } from '@/hooks/use-toast'; 
import LoadingSpinner from '@/components/ui/loading-spinner'; 

interface NavItem {
  href: string;
  label: string;
  originalLabel?: string;
  icon: React.ElementType;
  roles: UserRole[];
  isSystemSetting?: boolean;
  isHiddenFromSidebar?: boolean;
  isKurikulumMerdekaOnly?: boolean;
  isMasterData?: boolean;
  isSuperAdminOnly?: boolean; 
  featureFlag?: keyof SchoolFeatureSettings;
}

const allNavItems: NavItem[] = [
  // SuperAdmin Specific Menu
  { href: "/superadmin/dashboard", label: "SA Dasbor", originalLabel: "SA Dasbor", icon: LayoutDashboard, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/schools", label: "Manajemen Sekolah", originalLabel: "Manajemen Sekolah", icon: Building, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/app-settings", label: "Pengaturan Global", originalLabel: "Pengaturan Global", icon: SlidersHorizontal, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/subscriptions", label: "Langganan", originalLabel:"Langganan", icon: CreditCard, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/global-user-management", label: "Pengguna Global", originalLabel: "Manajemen Pengguna Global", icon: Users, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/analytics", label: "Analitik Global", originalLabel: "Analitik & Laporan Global", icon: BarChart3, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/global-activity-logs", label: "Log Global", originalLabel: "Log Aktivitas Global", icon: Activity, roles: ["SuperAdmin"], isSuperAdminOnly: true },


  // Regular App Menu
  { href: "/dashboard", label: "Dasbor", originalLabel: "Dasbor", icon: LayoutDashboard, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/lesson-plans", label: "RPP", originalLabel: "RPP / ATP", icon: BookOpenText, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/annual-programs", label: "Program Tahunan", originalLabel: "Program Tahunan", icon: CalendarDays, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/semester-programs", label: "Program Semester", originalLabel: "Program Semester", icon: CalendarClock, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/modul-ajar", label: "Modul Ajar (KM)", originalLabel: "Modul Ajar (KM)", icon: BrainCircuit, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"], isKurikulumMerdekaOnly: true, featureFlag: "aiToolsEnabled" }, 
  { href: "/ai-assistant", label: "Asisten AI Materi", originalLabel: "Asisten AI Materi", icon: Sparkles, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"], featureFlag: "aiToolsEnabled" },
  { href: "/ai-kurikulum-merdeka-module", label: "Buat Modul Ajar AI", originalLabel: "Buat Modul Ajar AI", icon: BrainCircuit, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"], isKurikulumMerdekaOnly: true, isHiddenFromSidebar: true, featureFlag: "aiToolsEnabled" },
  
  { href: "/academic-calendar", label: "Kalender Pendidikan", originalLabel: "Kalender Pendidikan", icon: CalendarCheck, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"], featureFlag: "academicCalendarEnabled" },

  { href: "/master-data/subjects", label: "Mata Pelajaran", originalLabel: "Mata Pelajaran", icon: Book, roles: ["Admin", "KepalaSekolah", "WakaKurikulum"], isMasterData: true, featureFlag: "masterDataManagementEnabled" },
  { href: "/master-data/teachers", label: "Data Guru", originalLabel: "Data Guru", icon: UserCheck, roles: ["Admin", "KepalaSekolah", "WakaKurikulum"], isMasterData: true, featureFlag: "masterDataManagementEnabled" },
  { href: "/master-data/classes", label: "Data Kelas", originalLabel: "Data Kelas", icon: ClipboardList, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"], isMasterData: true, featureFlag: "masterDataManagementEnabled" },
  
  { href: "/timetables", label: "Jadwal Pelajaran", originalLabel: "Jadwal Pelajaran", icon: ListChecks, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru", "TataUsaha"], featureFlag: "timetableManagementEnabled" }, 
  
  { href: "/school-settings", label: "Profil Sekolah", originalLabel: "Profil Sekolah", icon: Home, roles: ["Admin", "TataUsaha", "KepalaSekolah"] },
  { href: "/admin/user-management", label: "Manajemen Pengguna", originalLabel: "Manajemen Pengguna", icon: Users, roles: ["Admin", "TataUsaha"] }, 
  { href: "/settings", label: "Pengaturan Akun", originalLabel: "Pengaturan Akun", icon: SettingsIcon, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/admin/system-settings", label: "Pengaturan Sekolah", originalLabel: "Pengaturan Sekolah", icon: ShieldCheck, roles: ["Admin"], isSystemSetting: true }, 
  { href: "/admin/subscription-status", label: "Status Langganan", originalLabel: "Status Langganan", icon: CreditCard, roles: ["Admin"], isSystemSetting: true },
  { href: "/admin/system-logs", label: "Log Sistem", originalLabel: "Log Sistem", icon: Activity, roles: ["Admin"], isSystemSetting: true, isHiddenFromSidebar: true }, 
];

interface SidebarNavGroup {
  label: string;
  items: NavItem[];
}

export default function AppLayout({ children }: PropsWithChildren) {
  const { user, isAuthenticated, loading, logout, currentSchool } = useAuth(); 
  const { defaultCurriculum } = useCurriculum();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isPageLoading, setIsPageLoading] = useState(false); 

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 300); 
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      if (pathname.startsWith('/superadmin')) {
        router.push('/superadmin-access'); 
      } else if (pathname !== '/' && !pathname.startsWith('/login') && !pathname.startsWith('/signup') && !pathname.startsWith('/login-by-school')) {
        router.push('/login-by-school');
      }
    }
  }, [loading, isAuthenticated, router, pathname]);

  const navStructure = useMemo(() => {
    if (!user) return { dashboardItem: null, groups: [] };

    const processedNavItems = allNavItems
      .map(item => {
        let currentLabel = item.originalLabel || item.label;
        if (item.href === "/lesson-plans") {
          currentLabel = defaultCurriculum === "Kurikulum Merdeka" ? "ATP (Alur Tujuan Pembelajaran)" : "RPP (Rencana Pelaksanaan Pembelajaran)";
        }
        return { ...item, label: currentLabel };
      })
      .filter(item =>
        item.roles.includes(user.role) &&
        !item.isHiddenFromSidebar &&
        (!item.isMasterData || ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"].includes(user.role)) &&
        (item.isSystemSetting === undefined || item.isSystemSetting === false || (item.isSystemSetting === true && ["Admin"].includes(user.role)) || (item.isSuperAdminOnly && user.role === "SuperAdmin")) &&
        (!item.isKurikulumMerdekaOnly || defaultCurriculum === "Kurikulum Merdeka") &&
        (user.role === "SuperAdmin" ? item.isSuperAdminOnly === true : !item.isSuperAdminOnly) &&
        (user.role === "SuperAdmin" || !item.featureFlag || (currentSchool && (currentSchool.featureSettings?.[item.featureFlag] ?? true)))
      );

    const dashboardItem = processedNavItems.find(item => item.href.includes("dashboard"));
    
    const groups: SidebarNavGroup[] = [];

    if (user.role === "SuperAdmin") {
      const saItems = processedNavItems.filter(item => item.isSuperAdminOnly && !item.href.includes("dashboard"));
      if (saItems.length > 0) groups.push({ label: "Super Admin", items: saItems });
    } else {
      const planningItems = processedNavItems.filter(item => ["/lesson-plans", "/annual-programs", "/semester-programs", "/modul-ajar"].includes(item.href));
      if (planningItems.length > 0) groups.push({ label: "Perencanaan", items: planningItems });

      const academicItems = processedNavItems.filter(item => ["/academic-calendar", "/timetables"].includes(item.href));
      if (academicItems.length > 0) groups.push({ label: "Manajemen Akademik", items: academicItems });
      
      const aiItems = processedNavItems.filter(item => item.href === "/ai-assistant");
      if (aiItems.length > 0) groups.push({ label: "Alat AI", items: aiItems });

      const masterDataItemsFiltered = processedNavItems.filter(item => item.isMasterData);
      if (masterDataItemsFiltered.length > 0) groups.push({ label: "Master Data", items: masterDataItemsFiltered });
    }
    
    const settingsItems = processedNavItems.filter(item =>
      item.href === "/settings" ||
      item.href === "/school-settings" ||
      item.href === "/admin/user-management" ||
      item.isSystemSetting
    );
    if (settingsItems.length > 0) groups.push({ label: "Pengaturan", items: settingsItems });
    
    return { dashboardItem, groups };

  }, [user, defaultCurriculum, currentSchool]);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const currentNavItem = allNavItems.find(item => pathname.startsWith(item.href) && item.href !== '/');

      if (user.role === "SuperAdmin" && !pathname.startsWith('/superadmin') && pathname !== '/settings') {
         router.push("/superadmin/dashboard");
         return;
      }
      if (user.role !== "SuperAdmin" && pathname.startsWith('/superadmin')) {
         router.push("/dashboard");
         return;
      }
      
      if (currentNavItem) {
        if (!currentNavItem.roles.includes(user.role)) {
          router.push(user.role === "SuperAdmin" ? "/superadmin/dashboard" : "/dashboard");
          return;
        }
        if (currentNavItem.isKurikulumMerdekaOnly && defaultCurriculum !== "Kurikulum Merdeka") {
            toast({
                title: "Fitur Tidak Tersedia",
                description: `Menu '${currentNavItem.originalLabel || currentNavItem.label}' hanya untuk Kurikulum Merdeka. Kurikulum saat ini: ${defaultCurriculum}.`,
                variant: "destructive",
            });
            router.push(user.role === "SuperAdmin" ? "/superadmin/dashboard" : "/dashboard");
            return;
        }
        if (currentNavItem.isMasterData && !["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"].includes(user.role)) {
            toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengakses menu Master Data.", variant: "destructive"});
            router.push(user.role === "SuperAdmin" ? "/superadmin/dashboard" : "/dashboard");
            return;
        }
        if (user.role !== "SuperAdmin" && currentNavItem.featureFlag && currentSchool && !(currentSchool.featureSettings?.[currentNavItem.featureFlag] ?? true)) {
            toast({ title: "Fitur Dinonaktifkan", description: `Fitur '${currentNavItem.originalLabel || currentNavItem.label}' tidak aktif untuk sekolah Anda.`, variant: "destructive"});
            router.push("/dashboard");
            return;
        }
      } else if (pathname === "/settings" || pathname === "/school-settings" || pathname === "/admin/subscription-status") {
         const settingsBaseAccess = allNavItems.find(item => (item.href === "/settings" || item.href === "/school-settings" || item.href === "/admin/subscription-status") && item.roles.includes(user.role));
         if (!settingsBaseAccess) {
            router.push(user.role === "SuperAdmin" ? "/superadmin/dashboard" : "/dashboard");
         }
      }
    }
  }, [loading, isAuthenticated, user, pathname, router, logout, defaultCurriculum, toast, currentSchool]);

  if (loading || !isAuthenticated || !user) {
    return <LoadingSpinner message="Memuat Sesi Anda..." icon={<Sparkles className="h-16 w-16 animate-pulse text-primary mb-6" />} />;
  }

  const { dashboardItem, groups: navGroups } = navStructure;

  return (
      <SidebarProvider>
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r shadow-xl bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="border-b border-sidebar-border p-3 shadow-sm">
            <AppLogo />
          </SidebarHeader>
          <ScrollArea className="flex-1">
          <SidebarContent className="p-2">
            <SidebarMenu>
              {dashboardItem && (
                <SidebarMenuItem>
                  <Link href={dashboardItem.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      className="w-full text-base font-medium"
                      tooltip={{children: dashboardItem.label, className: "ml-1 text-xs"}}
                      isActive={pathname === dashboardItem.href}
                    >
                      <LayoutDashboard />
                      <span>{dashboardItem.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>

            {navGroups.map(group => (
              group.items.length > 0 && (
                <SidebarGroup key={group.label}>
                  <SidebarGroupLabel className="group-data-[state=expanded]:md:inline hidden">{group.label}</SidebarGroupLabel>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <Link href={item.href} legacyBehavior passHref>
                          <SidebarMenuButton
                            className="w-full text-base font-medium"
                            tooltip={{children: item.originalLabel || item.label, className: "ml-1 text-xs"}}
                            isActive={pathname.startsWith(item.href)}
                          >
                            <item.icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroup>
              )
            ))}
          </SidebarContent>
          </ScrollArea>
          <SidebarFooter className="border-t border-sidebar-border p-2 mt-auto shadow-inner">
            <UserProfile />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <MobileBottomNav />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-24 sm:pb-8 flex flex-col min-h-screen bg-background text-foreground md:ml-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar-wrapper:md:ml-[var(--sidebar-width)] transition-[margin-left] duration-200 ease-linear">
           {isPageLoading ? <LoadingSpinner icon={<Sparkles className="h-16 w-16 animate-pulse text-primary mb-6" />} message="Memuat Halaman..."/> : (
              <div className="flex-grow">
                  {children}
              </div>
           )}
            <footer className="mt-auto pt-8 text-center text-xs text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} {currentSchool?.name || "GUMPLA AI"}. Created by RIFQY IZA FAHRIZAL.</p>
            </footer>
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}

