
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, Sparkles, Settings as SettingsIcon, Users, BrainCircuit, ShieldCheck, MoreHorizontal, Building, SlidersHorizontal, UserCheck, ListChecks, Book, Home, ClipboardList, CalendarCheck, CreditCard } from 'lucide-react';
import type { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCurriculum } from '@/contexts/CurriculumContext';
import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface MobileNavItemData {
  href: string;
  label: string;
  originalLabel?: string; // To store the base label before dynamic changes
  icon: React.ElementType;
  roles?: UserRole[];
  isKurikulumMerdekaOnly?: boolean;
  isMasterData?: boolean;
  isSuperAdminOnly?: boolean;
  isSystemSetting?: boolean; // For admin-specific settings
}

const allMobileNavItemsData: MobileNavItemData[] = [
  // SuperAdmin Specific Menu
  { href: "/superadmin/dashboard", label: "SA Dasbor", originalLabel: "SA Dasbor", icon: LayoutDashboard, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/schools", label: "Sekolah", originalLabel: "Manajemen Sekolah", icon: Building, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  { href: "/superadmin/app-settings", label: "Pengaturan App", originalLabel: "Pengaturan App", icon: SlidersHorizontal, roles: ["SuperAdmin"], isSuperAdminOnly: true },
  // { href: "/superadmin/subscriptions", label: "Langganan", originalLabel:"Langganan", icon: CreditCard, roles: ["SuperAdmin"], isSuperAdminOnly: true },

  // Regular App Menu
  { href: "/dashboard", label: "Dasbor", originalLabel: "Dasbor", icon: LayoutDashboard, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/lesson-plans", label: "RPP/ATP", originalLabel: "RPP / ATP", icon: BookOpenText, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/annual-programs", label: "PROTA", originalLabel: "Program Tahunan", icon: CalendarDays, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/semester-programs", label: "Promes", originalLabel: "Program Semester", icon: CalendarClock, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/modul-ajar", label: "Modul KM", originalLabel: "Modul Ajar (KM)", icon: BrainCircuit, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"], isKurikulumMerdekaOnly: true },
  { href: "/ai-assistant", label: "AI Materi", originalLabel: "Asisten AI Materi", icon: Sparkles, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"] },
  { href: "/academic-calendar", label: "Kalender", originalLabel: "Kalender Pendidikan", icon: CalendarCheck, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  
  { href: "/master-data/subjects", label: "Mapel", originalLabel: "Mata Pelajaran", icon: Book, roles: ["Admin", "KepalaSekolah", "WakaKurikulum"], isMasterData: true },
  { href: "/master-data/teachers", label: "Data Guru", originalLabel: "Data Guru", icon: UserCheck, roles: ["Admin", "KepalaSekolah", "WakaKurikulum"], isMasterData: true },
  { href: "/master-data/classes", label: "Data Kelas", originalLabel: "Data Kelas", icon: ClipboardList, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"], isMasterData: true },
  { href: "/timetables", label: "Jadwal", originalLabel: "Jadwal Pelajaran", icon: ListChecks, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru", "TataUsaha"]}, 
  
  { href: "/school-settings", label: "Profil SKLH", originalLabel: "Profil Sekolah", icon: Home, roles: ["Admin", "TataUsaha", "KepalaSekolah"] }, 
  { href: "/admin/user-management", label: "Pengguna", originalLabel: "Manajemen Pengguna", icon: Users, roles: ["Admin", "TataUsaha"] },
  { href: "/settings", label: "Atur Akun", originalLabel: "Pengaturan Akun", icon: SettingsIcon, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/admin/system-settings", label: "Sys Cfg", originalLabel: "Pengaturan Sistem", icon: ShieldCheck, roles: ["Admin"], isSystemSetting: true },
];


export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { defaultCurriculum } = useCurriculum();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const filteredNavItems = useMemo(() => {
    if (!user) return [];

    return allMobileNavItemsData
      .map(item => {
        let currentLabel = item.originalLabel || item.label;
        if (item.href === "/lesson-plans") {
          currentLabel = defaultCurriculum === "Kurikulum Merdeka" ? "ATP" : "RPP";
        }
        return { ...item, label: currentLabel };
      })
      .filter(item => {
        if (!item.roles?.includes(user.role)) return false;
        if (item.isKurikulumMerdekaOnly && defaultCurriculum !== "Kurikulum Merdeka") return false;
        if (item.isMasterData && !["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"].includes(user.role)) return false;
        if (item.isSystemSetting && !["Admin"].includes(user.role)) return false;
        // Segregate SuperAdmin menus
        if (user.role === "SuperAdmin") return item.isSuperAdminOnly === true;
        return !item.isSuperAdminOnly;
      })
      .sort((a,b) => { // Basic sort to attempt to keep dashboard first, settings last
        if (a.href.includes("dashboard")) return -1;
        if (b.href.includes("dashboard")) return 1;
        if (a.href.includes("setting")) return 1;
        if (b.href.includes("setting")) return -1;
        return 0;
      });
  }, [user, defaultCurriculum]);

  const MAX_ITEMS_IN_BAR = 5;
  let displayNavItems: MobileNavItemData[] = [];
  let overflowNavItems: MobileNavItemData[] = [];

  if (filteredNavItems.length <= MAX_ITEMS_IN_BAR) {
    displayNavItems = filteredNavItems;
  } else {
    displayNavItems = filteredNavItems.slice(0, MAX_ITEMS_IN_BAR - 1);
    overflowNavItems = filteredNavItems.slice(MAX_ITEMS_IN_BAR - 1);
    displayNavItems.push({
      href: "#more-menu",
      label: "Lainnya",
      icon: MoreHorizontal,
    });
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
