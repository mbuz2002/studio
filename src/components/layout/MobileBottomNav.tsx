
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, Sparkles, Settings as SettingsIcon, Users } from 'lucide-react'; 
import type { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext'; 
import { useCurriculum } from '@/contexts/CurriculumContext'; // Import CurriculumContext

interface MobileNavItemData {
  href: string;
  label: string;
  originalLabel?: string; // To store the base label
  icon: React.ElementType;
  roles?: UserRole[]; 
}

const mobileNavItemsData: MobileNavItemData[] = [
  { href: "/dashboard", label: "Dasbor", originalLabel: "Dasbor", icon: LayoutDashboard, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/lesson-plans", label: "RPP", originalLabel: "RPP", icon: BookOpenText, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/annual-programs", label: "PROTA", originalLabel: "PROTA", icon: CalendarDays, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/semester-programs", label: "Promes", originalLabel: "Promes", icon: CalendarClock, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/ai-assistant", label: "AI", originalLabel: "AI", icon: Sparkles, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"] },
  { href: "/settings", label: "Atur", originalLabel: "Atur", icon: SettingsIcon, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] }, 
];


export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { defaultCurriculum } = useCurriculum(); // Get defaultCurriculum

  const visibleNavItems = user 
    ? mobileNavItemsData
        .map(item => {
          if (item.href === "/lesson-plans" && defaultCurriculum === "Kurikulum Merdeka") {
            return { ...item, label: "ATP" };
          }
          return { ...item, label: item.originalLabel || item.label }; // Reset to originalLabel or current label
        })
        .filter(item => !item.roles || item.roles.includes(user.role))
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

