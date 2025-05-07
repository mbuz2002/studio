"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const router = useRouter();

  const handleLogout = () => {
    // Handle logout logic
    router.push("/login");
  };

  return (
    <div className="mt-auto p-2 group-data-[state=collapsed]:md:p-0 group-data-[state=collapsed]:md:flex group-data-[state=collapsed]:md:justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-2 p-2 group-data-[state=collapsed]:md:size-8 group-data-[state=collapsed]:md:justify-center group-data-[state=collapsed]:md:p-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://picsum.photos/100/100" alt="User Avatar" data-ai-hint="user avatar" />
              <AvatarFallback>
                <UserCircle size={32} />
              </AvatarFallback>
            </Avatar>
            <div className="hidden group-data-[state=expanded]:md:flex flex-col items-start">
              <span className="text-sm font-medium">Nama Guru</span>
              <span className="text-xs text-sidebar-foreground/70">guru@contoh.com</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56 mb-2 ml-2">
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Keluar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
