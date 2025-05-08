
"use client";
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { AppLogo } from '@/components/layout/AppLogo';
import { UserProfile } from '@/components/layout/UserProfile';
import { LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, Sparkles, Settings as SettingsIcon, ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import type { UserRole } from '@/types';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[]; 
  isSystemSetting?: boolean; // If true, only Admin can access, even if listed in roles
  isHiddenFromSidebar?: boolean; // Explicitly hide from sidebar even if role matches
}

const allNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/lesson-plans", label: "Rencana Pembelajaran", icon: BookOpenText, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/annual-programs", label: "Program Tahunan", icon: CalendarDays, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/semester-programs", label: "Program Semester", icon: CalendarClock, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/ai-assistant", label: "Asisten AI", icon: Sparkles, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"] },
  { href: "/settings", label: "Pengaturan Akun", icon: SettingsIcon, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/admin/system-settings", label: "Pengaturan Sistem", icon: ShieldCheck, roles: ["Admin"], isSystemSetting: true },
  { href: "/admin/system-logs", label: "Log Sistem", icon: Activity, roles: ["Admin"], isSystemSetting: true, isHiddenFromSidebar: true },
];

export default function AppLayout({ children }: PropsWithChildren) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const filteredNavItems = useMemo(() => {
    if (!user) return [];
    return allNavItems.filter(item => 
        item.roles.includes(user.role) && 
        !item.isHiddenFromSidebar && // Hide if explicitly marked
        (!item.isSystemSetting || user.role === 'Admin') // Only show system settings to Admin in sidebar if not hidden
    );
  }, [user]);

   useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const currentNavItem = allNavItems.find(item => pathname.startsWith(item.href));
      
      if (pathname.startsWith('/settings')) { // General settings page
        const settingsBaseAccess = allNavItems.find(item => item.href === "/settings" && item.roles.includes(user.role));
        if (!settingsBaseAccess) {
            router.push("/dashboard"); // Redirect if no access to base /settings
        }
      } else if (currentNavItem) {
        // Check role access for the current item
        if (!currentNavItem.roles.includes(user.role)) {
          const dashboardAccess = allNavItems.find(item => item.href === "/dashboard" && item.roles.includes(user.role));
          if (dashboardAccess) router.push("/dashboard"); else logout();
          return;
        }
        // Specifically for system settings or system logs, ensure user is Admin
        if (currentNavItem.isSystemSetting && user.role !== 'Admin') {
           router.push("/dashboard"); 
        }
      }
      // If no currentNavItem matched (e.g. 404), Next.js handles it.
    }
  }, [loading, isAuthenticated, user, pathname, router, logout]);


  if (loading || !isAuthenticated || !user) { 
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p>Memuat sesi pengguna...</p>
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
        <SidebarHeader className="border-b p-3">
          <AppLogo />
        </SidebarHeader>
        <ScrollArea className="flex-1">
        <SidebarContent className="p-2">
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton 
                    className="w-full" 
                    tooltip={{children: item.label, className: "ml-1"}}
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
        <SidebarFooter className="border-t p-3 mt-auto">
          <UserProfile />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <MobileBottomNav />
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 sm:pb-6"> {/* Adjusted padding */}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
