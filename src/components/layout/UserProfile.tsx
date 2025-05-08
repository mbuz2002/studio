
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const roleDisplayNames: Record<string, string> = {
  Admin: "Admin",
  KepalaSekolah: "Kepala Sekolah",
  WakaKurikulum: "Waka Kurikulum",
  TataUsaha: "Tata Usaha",
  Guru: "Guru",
};

export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) {
    return null; // Or a login button if preferred in this state
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  return (
    <div className="mt-auto p-2 group-data-[state=collapsed]:md:p-0 group-data-[state=collapsed]:md:flex group-data-[state=collapsed]:md:justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-2 p-2 group-data-[state=collapsed]:md:size-8 group-data-[state=collapsed]:md:justify-center group-data-[state=collapsed]:md:p-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/100/100`} alt={user.name} data-ai-hint="user avatar" />
              <AvatarFallback>
                {user.name ? getInitials(user.name) : <UserCircle size={32} />}
              </AvatarFallback>
            </Avatar>
            <div className="hidden group-data-[state=expanded]:md:flex flex-col items-start">
              <span className="text-sm font-medium truncate max-w-[120px]">{user.name}</span>
              <span className="text-xs text-sidebar-foreground/70 truncate max-w-[120px]">{roleDisplayNames[user.role] || user.role}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56 mb-2 ml-2">
          <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground -mt-1 truncate">{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
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
