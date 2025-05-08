
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, UserCircle, Shield } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const roleDisplayNames: Record<string, string> = {
  Admin: "Administrator",
  KepalaSekolah: "Kepala Sekolah",
  WakaKurikulum: "Waka Kurikulum",
  TataUsaha: "Tata Usaha",
  Guru: "Guru",
};

export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) {
    return null; 
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  const avatarSrc = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=random&color=fff&font-size=0.5`;


  return (
    <div className="mt-auto p-1 group-data-[state=collapsed]:md:p-0 group-data-[state=collapsed]:md:flex group-data-[state=collapsed]:md:justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-2.5 p-2 hover:bg-sidebar-accent group-data-[state=collapsed]:md:size-9 group-data-[state=collapsed]:md:justify-center group-data-[state=collapsed]:md:p-0 rounded-md">
            <Avatar className="h-8 w-8 border-2 border-sidebar-primary-foreground/50">
              <AvatarImage src={avatarSrc} alt={user.name} data-ai-hint="user avatar" />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {user.name ? getInitials(user.name) : <UserCircle size={20} />}
              </AvatarFallback>
            </Avatar>
            <div className="hidden group-data-[state=expanded]:md:flex flex-col items-start text-sidebar-foreground">
              <span className="text-sm font-semibold truncate max-w-[120px]">{user.name}</span>
              <span className="text-xs text-sidebar-foreground/80 truncate max-w-[120px]">{roleDisplayNames[user.role] || user.role}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-60 mb-2 ml-2 shadow-xl rounded-lg">
          <DropdownMenuLabel className="font-medium truncate text-base">{user.name}</DropdownMenuLabel>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground -mt-1.5 truncate">{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {user.role === 'Admin' && (
             <DropdownMenuItem asChild>
              <Link href="/admin/system-settings">
                <Shield className="mr-2 h-4 w-4" />
                <span>Pengaturan Sistem</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan Akun</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Keluar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
