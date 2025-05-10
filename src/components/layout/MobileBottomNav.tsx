
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, Sparkles, Settings as SettingsIcon, Users, BrainCircuit, ShieldCheck } from 'lucide-react'; 
import type { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext'; 
import { useCurriculum } from '@/contexts/CurriculumContext';

interface MobileNavItemData {
  href: string;
  label: string; // This will be the short label for mobile
  icon: React.ElementType;
  roles?: UserRole[]; 
  isKurikulumMerdekaOnly?: boolean; 
}

// Expanded list for mobile bottom navigation
const mobileNavItemsData: MobileNavItemData[] = [
  { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/lesson-plans", label: "RPP/ATP", icon: BookOpenText, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] }, // Dynamic label handled below
  { href: "/annual-programs", label: "PROTA", icon: CalendarDays, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/semester-programs", label: "Promes", icon: CalendarClock, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/modul-ajar", label: "Modul KM", icon: BrainCircuit, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"], isKurikulumMerdekaOnly: true },
  { href: "/ai-assistant", label: "AI Materi", icon: Sparkles, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"] },
  { href: "/admin/user-management", label: "Pengguna", icon: Users, roles: ["Admin", "TataUsaha"] },
  { href: "/settings", label: "Atur Akun", icon: SettingsIcon, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/admin/system-settings", label: "Sys Cfg", icon: ShieldCheck, roles: ["Admin"] },
];


export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { defaultCurriculum } = useCurriculum(); 

  const visibleNavItems = user 
    ? mobileNavItemsData
        .map(item => {
          // Handle dynamic label for RPP/ATP
          if (item.href === "/lesson-plans") {
            return { ...item, label: defaultCurriculum === "Kurikulum Merdeka" ? "ATP" : "RPP" }; 
          }
          // For other items, use the defined short label
          return item; 
        })
        .filter(item => 
            (!item.roles || item.roles.includes(user.role)) &&
            (!item.isKurikulumMerdekaOnly || defaultCurriculum === "Kurikulum Merdeka") 
        )
        // Removed .slice(0, 5) to show all relevant items
    : [];

  if (!user || visibleNavItems.length === 0) {
    return null; 
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch justify-around border-t border-border bg-background/95 backdrop-blur-md shadow-t-xl sm:hidden">
      {visibleNavItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-1 rounded-md text-[10px] font-medium transition-colors flex-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", 
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
  );
}

