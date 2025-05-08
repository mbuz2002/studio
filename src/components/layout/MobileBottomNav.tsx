
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, Sparkles } from 'lucide-react';
import type { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth to respect roles

interface MobileNavItemData {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: UserRole[]; // Roles that can see this item
}

// Define the specific items for the bottom nav
const mobileNavItemsData: MobileNavItemData[] = [
  { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/lesson-plans", label: "RPP", icon: BookOpenText, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/annual-programs", label: "PROTA", icon: CalendarDays, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/semester-programs", label: "Promes", icon: CalendarClock, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/ai-assistant", label: "AI", icon: Sparkles, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"] },
  // Settings are typically not in bottom nav, but can be accessed via profile/sidebar.
  // If a "More" or "Settings" icon is desired here, it can be added.
];


export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Filter items based on user role
  const visibleNavItems = user 
    ? mobileNavItemsData.filter(item => !item.roles || item.roles.includes(user.role))
    : [];

  if (!user || visibleNavItems.length === 0) {
    return null; // Don't render if no user or no items for their role
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch justify-around border-t border-border bg-background shadow-t-lg sm:hidden">
      {visibleNavItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-1 rounded-md text-xs font-medium transition-colors flex-1 text-center", // flex-1 to distribute space
              isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className={cn("h-5 w-5 mb-0.5", isActive ? "text-primary" : "")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

