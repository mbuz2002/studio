
"use client";
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AppLogo } from '@/components/layout/AppLogo';
import { UserProfile } from '@/components/layout/UserProfile';
import { LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, Sparkles, Settings as SettingsIcon, ShieldCheck, Activity, Users, Info, BrainCircuit, FileText, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import type { UserRole } from '@/types';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useCurriculum } from '@/contexts/CurriculumContext';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner'; // Corrected import path

interface NavItem {
  href: string;
  label: string;
  originalLabel?: string;
  icon: React.ElementType;
  roles: UserRole[];
  isSystemSetting?: boolean;
  isHiddenFromSidebar?: boolean;
  isKurikulumMerdekaOnly?: boolean;
}

const allNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dasbor", originalLabel: "Dasbor", icon: LayoutDashboard, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/lesson-plans", label: "RPP", originalLabel: "RPP / ATP", icon: BookOpenText, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/annual-programs", label: "Program Tahunan", originalLabel: "Program Tahunan", icon: CalendarDays, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/semester-programs", label: "Program Semester", originalLabel: "Program Semester", icon: CalendarClock, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/modul-ajar", label: "Modul Ajar (KM)", originalLabel: "Modul Ajar (KM)", icon: BrainCircuit, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"], isKurikulumMerdekaOnly: true },
  { href: "/ai-assistant", label: "Asisten AI Materi", originalLabel: "Asisten AI Materi", icon: Sparkles, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"] },
  { href: "/ai-kurikulum-merdeka-module", label: "Buat Modul Ajar AI", originalLabel: "Buat Modul Ajar AI", icon: BrainCircuit, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"], isKurikulumMerdekaOnly: true, isHiddenFromSidebar: true },
  { href: "/admin/user-management", label: "Manajemen Pengguna", originalLabel: "Manajemen Pengguna", icon: Users, roles: ["Admin", "TataUsaha"], isSystemSetting: false },
  { href: "/settings", label: "Pengaturan Akun", originalLabel: "Pengaturan Akun", icon: SettingsIcon, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/admin/system-settings", label: "Pengaturan Sistem", originalLabel: "Pengaturan Sistem", icon: ShieldCheck, roles: ["Admin"], isSystemSetting: true },
  { href: "/admin/system-logs", label: "Log Sistem", originalLabel: "Log Sistem", icon: Activity, roles: ["Admin"], isSystemSetting: true, isHiddenFromSidebar: true },
];

export default function AppLayout({ children }: PropsWithChildren) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { defaultCurriculum } = useCurriculum();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isPageLoading, setIsPageLoading] = useState(false); 

  // Simplified page transition loading effect
  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 300); // Simulate loading time
    return () => clearTimeout(timer);
  }, [pathname]);


  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const filteredNavItems = useMemo(() => {
    if (!user) return [];
    return allNavItems
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
        (item.isSystemSetting === false || (item.isSystemSetting === true && user.role === 'Admin') || item.roles.includes(user.role) ) &&
        (!item.isKurikulumMerdekaOnly || defaultCurriculum === "Kurikulum Merdeka")
    ).sort((a,b) => {
        if (a.isSystemSetting && !b.isSystemSetting) return 1;
        if (!a.isSystemSetting && b.isSystemSetting) return -1;
        if (a.isSystemSetting && b.isSystemSetting) return a.label.localeCompare(b.label);
        if (a.href === "/settings") return 1;
        if (b.href === "/settings") return -1;
        const aiOrder = ["/modul-ajar", "/ai-assistant"];
        const aIsAI = aiOrder.includes(a.href);
        const bIsAI = aiOrder.includes(b.href);
        if (aIsAI && !bIsAI) return 1;
        if (!aIsAI && bIsAI) return -1;
        if (aIsAI && bIsAI) return aiOrder.indexOf(a.href) - aiOrder.indexOf(b.href);
        return 0;
    });
  }, [user, defaultCurriculum]);

   useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const currentNavItem = allNavItems.find(item => pathname.startsWith(item.href) && item.href !== '/');

      if (currentNavItem) {
        if (!currentNavItem.roles.includes(user.role)) {
          const dashboardAccess = allNavItems.find(item => item.href === "/dashboard" && item.roles.includes(user.role));
          if (dashboardAccess) router.push("/dashboard"); else logout();
          return;
        }
        if (currentNavItem.isKurikulumMerdekaOnly && defaultCurriculum !== "Kurikulum Merdeka") {
            toast({
                title: "Fitur Tidak Tersedia",
                description: `Menu '${currentNavItem.originalLabel || currentNavItem.label}' hanya untuk Kurikulum Merdeka. Kurikulum saat ini: ${defaultCurriculum}.`,
                variant: "destructive",
            });
            router.push("/dashboard");
            return;
        }
      } else if (pathname === "/settings") {
         const settingsBaseAccess = allNavItems.find(item => item.href === "/settings" && item.roles.includes(user.role));
         if (!settingsBaseAccess) {
            router.push("/dashboard");
         }
      }
    }
  }, [loading, isAuthenticated, user, pathname, router, logout, defaultCurriculum, toast]);


  if (loading || !isAuthenticated || !user) {
    return <LoadingSpinner message="Memuat Sesi Anda..." icon={<Sparkles className="h-16 w-16 animate-pulse text-primary mb-6" />} />;
  }

  return (
      <SidebarProvider>
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r shadow-xl bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="border-b border-sidebar-border p-3 shadow-sm">
            <AppLogo />
          </SidebarHeader>
          <ScrollArea className="flex-1">
          <SidebarContent className="p-2">
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      className="w-full text-base font-medium"
                      tooltip={{children: item.label, className: "ml-1 text-xs"}}
                      isActive={pathname.startsWith(item.href)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[state=expanded]:md:inline hidden">{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          </ScrollArea>
          <SidebarFooter className="border-t border-sidebar-border p-2 mt-auto shadow-inner">
            <UserProfile />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <MobileBottomNav />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-24 sm:pb-8 flex flex-col min-h-screen bg-background text-foreground">
           {isPageLoading ? <LoadingSpinner icon={<Sparkles className="h-16 w-16 animate-pulse text-primary mb-6" />} message="Memuat Halaman..."/> : (
              <div className="flex-grow">
                  {children}
              </div>
           )}
            <footer className="mt-auto pt-8 text-center text-xs text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} GUMPLA AI. Created by RIFQY IZA FAHRIZAL.</p>
            </footer>
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}
