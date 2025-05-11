
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, Sparkles, Settings as SettingsIcon, Users, BrainCircuit, ShieldCheck, MoreHorizontal, Building, SlidersHorizontal, UserCheck, ListChecks, Book, Home, ClipboardList, CalendarCheck, CreditCard, BarChart3, Activity } from 'lucide-react';
import type { UserRole, SchoolFeatureSettings } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCurriculum } from '@/contexts/CurriculumContext';
import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from "@/components/ui/button";

interface MobileNavItemData {
  href: string;
  label: string; // Short label for the bottom bar
  originalLabel?: string; // Full label for the "More" sheet
  icon: React.ElementType;
  roles?: UserRole[];
  isKurikulumMerdekaOnly?: boolean;
  isMasterData?: boolean;
  isSuperAdminOnly?: boolean;
  isSystemSetting?: boolean;
  featureFlag?: keyof SchoolFeatureSettings;
}

// Define all possible navigation items here
// 'label' should be the short version for the bottom bar
// 'originalLabel' is the full version for the "More" menu
const allMobileNavItemsData: MobileNavItemData[] = [
  // SuperAdmin Specific Menu
  { href: "/superadmin/dashboard", label: "Dasbor SA", originalLabel: "Dasbor Super Admin", icon: LayoutDashboard, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/schools", label: "Sekolah", originalLabel: "Manajemen Sekolah", icon: Building, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/app-settings", label: "App Cfg", originalLabel: "Pengaturan Aplikasi Global", icon: SlidersHorizontal, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/subscriptions", label: "Langganan", originalLabel: "Manajemen Langganan", icon: CreditCard, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/global-user-management", label: "User Global", originalLabel: "Pengguna Global", icon: Users, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/analytics", label: "Analitik", originalLabel: "Analitik & Laporan Global", icon: BarChart3, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/global-activity-logs", label: "Log Global", originalLabel: "Log Aktivitas Global", icon: Activity, roles: ["SuperAdmin"], isSuperAdminOnly: true },

  // Regular App Menu
  { href: "/dashboard", label: "Dasbor", originalLabel: "Dasbor Pengguna", icon: LayoutDashboard, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/lesson-plans", label: "RPP/ATP", originalLabel: "RPP / ATP", icon: BookOpenText, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/annual-programs", label: "PROTA", originalLabel: "Program Tahunan", icon: CalendarDays, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/semester-programs", label: "Promes", originalLabel: "Program Semester", icon: CalendarClock, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/modul-ajar", label: "Modul KM", originalLabel: "Modul Ajar (Kur. Merdeka)", icon: BrainCircuit, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"], isKurikulumMerdekaOnly: true, featureFlag: "aiToolsEnabled" },
  { href: "/ai-assistant", label: "AI Materi", originalLabel: "Asisten AI Pembuat Materi", icon: Sparkles, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"], featureFlag: "aiToolsEnabled" },
  { href: "/academic-calendar", label: "Kalender", originalLabel: "Kalender Pendidikan", icon: CalendarCheck, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"], featureFlag: "academicCalendarEnabled" },
  
  { href: "/master-data/subjects", label: "Mapel", originalLabel: "Data Mata Pelajaran", icon: Book, roles: ["Admin", "KepalaSekolah", "WakaKurikulum"], isMasterData: true, featureFlag: "masterDataManagementEnabled" },
  { href: "/master-data/teachers", label: "Guru", originalLabel: "Data Guru", icon: UserCheck, roles: ["Admin", "KepalaSekolah", "WakaKurikulum"], isMasterData: true, featureFlag: "masterDataManagementEnabled" },
  { href: "/master-data/classes", label: "Kelas", originalLabel: "Data Kelas/Rombel", icon: ClipboardList, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"], isMasterData: true, featureFlag: "masterDataManagementEnabled" },
  { href: "/timetables", label: "Jadwal", originalLabel: "Jadwal Pelajaran", icon: ListChecks, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru", "TataUsaha"], featureFlag: "timetableManagementEnabled"},
  
  { href: "/school-settings", label: "Profil SKLH", originalLabel: "Profil Sekolah", icon: Home, roles: ["Admin", "TataUsaha", "KepalaSekolah"] }, 
  { href: "/admin/user-management", label: "Pengguna", originalLabel: "Manajemen Pengguna Sekolah", icon: Users, roles: ["Admin", "TataUsaha"] },
  { href: "/admin/system-settings", label: "Sys Cfg", originalLabel: "Pengaturan Sistem Sekolah", icon: ShieldCheck, roles: ["Admin"], isSystemSetting: true },
  { href: "/admin/subscription-status", label: "Langganan", originalLabel: "Status Langganan Sekolah", icon: CreditCard, roles: ["Admin"], isSystemSetting: true },
  { href: "/settings", label: "Akun Saya", originalLabel: "Pengaturan Akun Saya", icon: SettingsIcon, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
];


export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, currentSchool } = useAuth(); 
  const { defaultCurriculum } = useCurriculum();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const filteredNavItems = useMemo(() => {
    if (!user) return [];

    return allMobileNavItemsData
      .map(item => {
        // Use the short label for the bottom bar, originalLabel for the sheet
        let displayLabel = item.label; 
        if (item.href === "/lesson-plans") {
          displayLabel = defaultCurriculum === "Kurikulum Merdeka" ? "ATP" : "RPP";
        }
        return { ...item, label: displayLabel }; // Ensure 'label' is the short one
      })
      .filter(item => {
        if (!item.roles?.includes(user.role)) return false;
        if (item.isKurikulumMerdekaOnly && defaultCurriculum !== "Kurikulum Merdeka") return false;
        
        // Master data filtering (could be stricter, e.g., only Admin)
        if (item.isMasterData && !["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"].includes(user.role)) return false;
        
        // System settings specific to Admin roles
        if (item.isSystemSetting && user.role !== "Admin" && user.role !== "SuperAdmin") return false;
        
        // SuperAdmin sees only SA items, others don't see SA items
        if (user.role === "SuperAdmin") return item.isSuperAdminOnly === true;
        if (item.isSuperAdminOnly) return false;

        // Feature flag check for non-SuperAdmin users
        if (item.featureFlag && !(currentSchool?.featureSettings?.[item.featureFlag] ?? true)) {
            return false;
        }
        return true;
      })
      .sort((a,b) => { 
        // Prioritize dashboard items
        if (a.href.includes("dashboard")) return -1;
        if (b.href.includes("dashboard")) return 1;
        // De-prioritize settings items among the main bar candidates
        if (a.href.includes("setting") || a.href.includes("akun")) return 1;
        if (b.href.includes("setting") || b.href.includes("akun")) return -1;
        return 0;
      });
  }, [user, defaultCurriculum, currentSchool]); 

  const MAX_ITEMS_IN_BAR = 5;
  let displayNavItems: MobileNavItemData[] = [];
  let overflowNavItems: MobileNavItemData[] = [];

  if (filteredNavItems.length <= MAX_ITEMS_IN_BAR) {
    displayNavItems = filteredNavItems;
  } else {
    // Ensure "Dasbor" and "Akun Saya" are prioritized if they exist and roles match
    const dashboardItem = filteredNavItems.find(item => item.href.includes("dashboard"));
    const settingsItem = filteredNavItems.find(item => item.href === "/settings"); // specific settings for user account

    const priorityItems = [dashboardItem, settingsItem].filter(Boolean) as MobileNavItemData[];
    const remainingItems = filteredNavItems.filter(item => !priorityItems.includes(item));
    
    const barSlotsLeft = MAX_ITEMS_IN_BAR - priorityItems.length -1; // -1 for the "More" button
    
    displayNavItems = [...priorityItems, ...remainingItems.slice(0, Math.max(0, barSlotsLeft))];
    overflowNavItems = remainingItems.slice(Math.max(0, barSlotsLeft));

    if (overflowNavItems.length > 0 || (priorityItems.length + remainingItems.slice(0, Math.max(0, barSlotsLeft)).length < filteredNavItems.length)) {
      displayNavItems.push({
        href: "#more-menu",
        label: "Lainnya",
        originalLabel: "Menu Lainnya",
        icon: MoreHorizontal,
      });
    }
  }


  if (!user || displayNavItems.length === 0) {
    return null;
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch justify-around border-t border-border bg-background/95 backdrop-blur-md shadow-t-xl sm:hidden">
        {displayNavItems.map((item) => {
          const isActive = item.href !== "#more-menu" && pathname.startsWith(item.href);
          if (item.href === "#more-menu") {
            return (
              <Button
                key={item.href}
                variant="ghost"
                onClick={() => setIsMoreSheetOpen(true)}
                className={cn(
                  "flex flex-col items-center justify-center p-1 rounded-none text-[10px] leading-tight font-medium transition-colors flex-1 text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 h-full",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                aria-label="Menu Lainnya"
              >
                <item.icon className={cn("h-[22px] w-[22px] mb-0.5", "text-muted-foreground")} />
                {item.label}
              </Button>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-1 rounded-none text-[10px] leading-tight font-medium transition-colors flex-1 text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 h-full",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn("h-[22px] w-[22px] mb-0.5", isActive ? "text-primary" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Sheet open={isMoreSheetOpen} onOpenChange={setIsMoreSheetOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[70vh] p-0 rounded-t-lg">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Menu Lainnya</SheetTitle>
          </SheetHeader>
          <ScrollArea className="max-h-[calc(70vh-70px)]"> {/* Adjust height considering header */}
            <div className="grid grid-cols-1 gap-0 p-2">
              {overflowNavItems.map((overflowItem) => (
                <SheetClose asChild key={overflowItem.href}>
                  <Link
                    href={overflowItem.href}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors w-full text-left",
                      pathname.startsWith(overflowItem.href)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/50"
                    )}
                  >
                    <overflowItem.icon className={cn("h-5 w-5", pathname.startsWith(overflowItem.href) ? "text-primary" : "text-muted-foreground")} />
                    {overflowItem.originalLabel || overflowItem.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

