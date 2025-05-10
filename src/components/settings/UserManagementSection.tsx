
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit2, Trash2, Users, UserPlus, UserCircle2 } from "lucide-react";
import type { User, UserRole } from "@/types";
import { AddUserDialog } from "./AddUserDialog";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext"; // Import useLog
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth for current admin user
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const initialUsers: User[] = [
  { id: "user-1", name: "Admin User", email: "admin@sekolah.id", role: "Admin", avatarUrl: "https://picsum.photos/seed/admin/100/100" },
  { id: "user-2", name: "Kepala Sekolah", email: "kepsek@sekolah.id", role: "KepalaSekolah", avatarUrl: "https://picsum.photos/seed/kepsek/100/100" },
  { id: "user-3", name: "Waka Kurikulum", email: "waka@sekolah.id", role: "WakaKurikulum", avatarUrl: "https://picsum.photos/seed/waka/100/100" },
  { id: "user-4", name: "Guru Matematika", email: "guru.mat@sekolah.id", role: "Guru", avatarUrl: "https://picsum.photos/seed/gurumat/100/100" },
  { id: "user-5", name: "Staff Tata Usaha", email: "tu@sekolah.id", role: "TataUsaha", avatarUrl: "https://picsum.photos/seed/tu/100/100" },
];


export function UserManagementSection() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const { toast } = useToast();
  const { addLog } = useLog();
  const { user: adminUser } = useAuth();
  const logSource = "UserManagement";

  useEffect(() => {
    const storedUsers = localStorage.getItem("appUsers");
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
        addLog("INFO", "Daftar pengguna dimuat dari penyimpanan lokal.", logSource);
      } catch(e) {
        addLog("ERROR", `Gagal memuat daftar pengguna dari penyimpanan lokal: ${e instanceof Error ? e.message : String(e)}. Menggunakan data awal.`, logSource);
        localStorage.setItem("appUsers", JSON.stringify(initialUsers));
      }
    } else {
      localStorage.setItem("appUsers", JSON.stringify(initialUsers)); 
      addLog("INFO", "Tidak ada daftar pengguna di penyimpanan lokal, menggunakan data awal.", logSource);
    }
  }, [addLog]);

  const handleAddUser = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("appUsers", JSON.stringify(updatedUsers));
    addLog("INFO", `Pengguna baru '${newUser.email}' (Peran: ${newUser.role}) ditambahkan oleh ${adminUser?.email}.`, logSource);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    if (users.length <= 1) {
        toast({ title: "Aksi Ditolak", description: "Tidak dapat menghapus pengguna terakhir.", variant: "destructive"});
        addLog("WARN", `Gagal menghapus pengguna ${userToDelete.email}: Pengguna terakhir tidak dapat dihapus. Oleh: ${adminUser?.email}.`, logSource);
        return;
    }
    if (userToDelete.id === adminUser?.id) {
        toast({ title: "Aksi Ditolak", description: "Anda tidak dapat menghapus akun Anda sendiri.", variant: "destructive"});
        addLog("WARN", `Gagal menghapus pengguna ${userToDelete.email}: Admin mencoba menghapus akun sendiri. Oleh: ${adminUser?.email}.`, logSource);
        return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${userToDelete.name}" (${userToDelete.email})? Aksi ini tidak dapat diurungkan.`)) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem("appUsers", JSON.stringify(updatedUsers));
      toast({ title: "Pengguna Dihapus", description: `Pengguna "${userToDelete.name}" telah berhasil dihapus.` });
      addLog("WARN", `Pengguna ${userToDelete.email} (Peran: ${userToDelete.role}) dihapus oleh ${adminUser?.email}.`, logSource);
    } else {
       addLog("INFO", `Penghapusan pengguna ${userToDelete.email} dibatalkan oleh ${adminUser?.email}.`, logSource);
    }
  };
  
  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    toast({ title: "Fitur Edit Pengguna", description: `Dialog untuk mengedit pengguna ${userToEdit?.name} akan terbuka di sini. Fitur ini sedang dikembangkan.` });
    addLog("INFO", `Admin ${adminUser?.email} mencoba mengedit pengguna ${userToEdit?.email}. (Fitur edit dialog belum terimplementasi penuh).`, logSource);
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  return (
    <Card className="rounded-lg">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-t-lg bg-gradient-to-r from-secondary to-muted text-foreground p-4 sm:p-6">
        <div className="flex-grow">
            <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary drop-shadow" />
                <CardTitle className="text-xl sm:text-2xl">Manajemen Pengguna</CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base text-muted-foreground mt-1">Kelola akun pengguna yang memiliki akses ke sistem.</CardDescription>
        </div>
        <div className="w-full sm:w-auto">
          <AddUserDialog onUserAdded={handleAddUser} />
        </div>
      </CardHeader>
      <CardContent className="pt-4 p-2 sm:p-6">
        <div className="rounded-lg border shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px] px-3 sm:px-4 py-3 text-sm">Nama</TableHead>
                <TableHead className="min-w-[180px] px-3 sm:px-4 py-3 text-sm hidden md:table-cell">Email</TableHead>
                <TableHead className="px-3 sm:px-4 py-3 text-sm">Peran</TableHead>
                <TableHead className="text-right px-3 sm:px-4 py-3 text-sm">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground px-3 sm:px-4 py-3 text-base">
                    Tidak ada pengguna ditemukan.
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium px-3 sm:px-4 py-2 sm:py-3 align-top">
                    <div className="flex items-center gap-3">
                       <Avatar className="h-8 w-8 flex-shrink-0">
                           <AvatarImage 
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&font-size=0.45`} 
                                alt={user.name}
                                data-ai-hint="user avatar" 
                            />
                           <AvatarFallback className="text-xs">
                               {getInitials(user.name) || <UserCircle2 size={16} />}
                           </AvatarFallback>
                       </Avatar>
                       <div className="flex flex-col">
                          <span className="text-sm font-semibold">{user.name}</span>
                          <span className="text-xs text-muted-foreground md:hidden">{user.email}</span>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm hidden md:table-cell">{user.email}</TableCell>
                  <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top">
                    <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'} className="text-xs">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-3 sm:px-4 py-2 sm:py-3 align-top">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user.id)} className="text-sm">
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)} 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive text-sm" 
                            disabled={users.length <=1 || user.id === adminUser?.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
