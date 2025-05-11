"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, Sparkles, Settings as SettingsIcon, Users, BrainCircuit, ShieldCheck, MoreHorizontal, Package, UserCheck, ListChecks, Book, Home, ClipboardList, CalendarCheck } from 'lucide-react';
import type { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCurriculum } from '@/contexts/CurriculumContext';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface MobileNavItemData {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: UserRole[];
  isKurikulumMerdekaOnly?: boolean;
  isMasterData?: boolean;
}

const mobileNavItemsData: MobileNavItemData[] = [
  { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/lesson-plans", label: "RPP/ATP", icon: BookOpenText, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/academic-calendar", label: "Kalender", icon: CalendarCheck, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/annual-programs", label: "PROTA", icon: CalendarDays, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/semester-programs", label: "Promes", icon: CalendarClock, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/modul-ajar", label: "Modul KM", icon: BrainCircuit, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "Guru"], isKurikulumMerdekaOnly: true },
  { href: "/ai-assistant", label: "AI Materi", icon: Sparkles, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "Guru"] },
  
  { href: "/master-data/subjects", label: "Mapel", icon: Book, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"], isMasterData: true },
  { href: "/master-data/teachers", label: "Guru", icon: UserCheck, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"], isMasterData: true },
  { href: "/master-data/classes", label: "Kelas", icon: ClipboardList, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"], isMasterData: true },
  { href: "/timetables", label: "Jadwal", icon: ListChecks, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "Guru", "TataUsaha"]},

  { href: "/school-settings", label: "Profil SKLH", icon: Home, roles: ["SuperAdmin", "Admin", "TataUsaha", "KepalaSekolah"] }, 
  { href: "/admin/user-management", label: "Pengguna", icon: Users, roles: ["SuperAdmin", "Admin", "TataUsaha"] },
  { href: "/settings", label: "Atur Akun", icon: SettingsIcon, roles: ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/admin/system-settings", label: "Sys Cfg", icon: ShieldCheck, roles: ["SuperAdmin", "Admin"] },
];


export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { defaultCurriculum } = useCurriculum();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const filteredFullList = user
    ? mobileNavItemsData
        .map(item => {
          if (item.href === "/lesson-plans") {
            return { ...item, label: defaultCurriculum === "Kurikulum Merdeka" ? "ATP" : "RPP" };
          }
          return item;
        })
        .filter(item =>
            (!item.roles || item.roles.includes(user.role)) &&
            (!item.isKurikulumMerdekaOnly || defaultCurriculum === "Kurikulum Merdeka") &&
            (!item.isMasterData || ["SuperAdmin", "Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha"].includes(user.role))
        )
    : [];

  const MAX_ITEMS_IN_BAR = 5; 
  let finalNavItems: MobileNavItemData[] = [];
  let overflowItems: MobileNavItemData[] = [];

  if (filteredFullList.length <= MAX_ITEMS_IN_BAR) {
    finalNavItems = filteredFullList;
  } else {
    finalNavItems = filteredFullList.slice(0, MAX_ITEMS_IN_BAR - 1); 
    overflowItems = filteredFullList.slice(MAX_ITEMS_IN_BAR - 1);
    finalNavItems.push({
      href: "#more-menu", 
      label: "Lainnya",
      icon: MoreHorizontal,
    });
  }

  if (!user || finalNavItems.length === 0) {
    return null;
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch justify-around border-t border-border bg-background/95 backdrop-blur-md shadow-t-xl sm:hidden">
        {finalNavItems.map((item) => {
          const isActive = item.href !== "#more-menu" && pathname.startsWith(item.href);
          if (item.href === "#more-menu") {
            return (
              <Button
                key={item.href}
                variant="ghost"
                onClick={() => setIsMoreSheetOpen(true)}
                className={cn(
                  "flex flex-col items-center justify-center p-1 rounded-md text-[10px] leading-tight font-medium transition-colors flex-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-full",
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
                "flex flex-col items-center justify-center p-1 rounded-md text-[10px] leading-tight font-medium transition-colors flex-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
          <ScrollArea className="max-h-[calc(70vh-70px)]">
            <div className="grid grid-cols-1 gap-0 p-2">
              {overflowItems.map((overflowItem) => (
                <Link
                  key={overflowItem.href}
                  href={overflowItem.href}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors",
                    pathname.startsWith(overflowItem.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/50"
                  )}
                  onClick={() => setIsMoreSheetOpen(false)}
                >
                  <overflowItem.icon className={cn("h-5 w-5", pathname.startsWith(overflowItem.href) ? "text-primary" : "text-muted-foreground")} />
                  {mobileNavItemsData.find(i => i.href === overflowItem.href)?.label || overflowItem.label}
                </Link>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}