
"use client";
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppLogo } from '@/components/layout/AppLogo';
import { UserProfile } from '@/components/layout/UserProfile';
import { LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, Sparkles, Settings as SettingsIcon, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import type { UserRole } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[]; // Roles that can see this nav item
}

const allNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
  { href: "/lesson-plans", label: "Rencana Pembelajaran", icon: BookOpenText, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"] },
  { href: "/annual-programs", label: "Program Tahunan", icon: CalendarDays, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"] },
  { href: "/semester-programs", label: "Program Semester", icon: CalendarClock, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"] },
  { href: "/ai-assistant", label: "Asisten AI", icon: Sparkles, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "Guru"] },
  // Example of Admin-specific pages (conceptual)
  // { href: "/admin/user-management", label: "Manajemen Pengguna", icon: Users, roles: ["Admin"] },
  // { href: "/admin/reports", label: "Laporan Sekolah", icon: FileText, roles: ["Admin", "KepalaSekolah"] },
  { href: "/settings", label: "Pengaturan", icon: SettingsIcon, roles: ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"] },
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
    return allNavItems.filter(item => item.roles.includes(user.role));
  }, [user]);

  // Redirect if user tries to access a page they don't have nav access to
   useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const currentNavItem = allNavItems.find(item => pathname.startsWith(item.href));
      if (currentNavItem && !currentNavItem.roles.includes(user.role)) {
        // If on a restricted page, redirect to dashboard or logout
        const dashboardAccess = allNavItems.find(item => item.href === "/dashboard" && item.roles.includes(user.role));
        if (dashboardAccess) {
          router.push("/dashboard");
        } else {
          logout(); // Or a generic "access denied" page
        }
      } else if (!currentNavItem && pathname !== '/dashboard') {
        // Potentially trying to access a sub-route of something not in nav, or a non-existent page.
        // For simplicity, if not dashboard and not explicitly allowed, consider redirecting.
        // This is a basic check; more robust routing protection might be needed.
      }
    }
  }, [loading, isAuthenticated, user, pathname, router, logout]);


  if (loading || !isAuthenticated) {
    // You can return a loading spinner or null
    return (
      <div className="flex h-screen items-center justify-center">
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
        <SidebarFooter className="border-t p-3">
          <UserProfile />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
          <SidebarTrigger className="sm:hidden" />
          {/* Add breadcrumbs or page title here if needed */}
        </header>
        <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
