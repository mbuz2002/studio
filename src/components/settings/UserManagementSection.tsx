
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit2, Trash2, Users, UserPlus } from "lucide-react";
import type { User, UserRole } from "@/types";
import { AddUserDialog } from "./AddUserDialog";
import { useToast } from "@/hooks/use-toast";

const initialUsers: User[] = [
  { id: "user-1", name: "Admin User", email: "admin@sekolah.id", role: "Admin", avatarUrl: "https://picsum.photos/seed/admin/100/100" },
  { id: "user-2", name: "Kepala Sekolah", email: "kepsek@sekolah.id", role: "KepalaSekolah", avatarUrl: "https://picsum.photos/seed/kepsek/100/100" },
  { id: "user-3", name: "Waka Kurikulum", email: "waka@sekolah.id", role: "WakaKurikulum", avatarUrl: "https://picsum.photos/seed/waka/100/100" },
  { id: "user-4", name: "Guru Matematika", email: "guru.mat@sekolah.id", role: "Guru", avatarUrl: "https://picsum.photos/seed/gurumat/100/100" },
  { id: "user-5", name: "Staff TU", email: "tu@sekolah.id", role: "TataUsaha", avatarUrl: "https://picsum.photos/seed/tu/100/100" },
];


export function UserManagementSection() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const { toast } = useToast();

  // Simulate fetching users
  useEffect(() => {
    const storedUsers = localStorage.getItem("appUsers");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      localStorage.setItem("appUsers", JSON.stringify(initialUsers)); // Initialize if not present
    }
  }, []);

  const handleAddUser = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("appUsers", JSON.stringify(updatedUsers));
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
        toast({ title: "Aksi Ditolak", description: "Tidak dapat menghapus pengguna terakhir.", variant: "destructive"});
        return;
    }
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini? Aksi ini tidak dapat diurungkan.")) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem("appUsers", JSON.stringify(updatedUsers));
      toast({ title: "Pengguna Dihapus", description: "Pengguna telah berhasil dihapus." });
    }
  };
  
  const handleEditUser = (userId: string) => {
    // For demo, just show a toast. In a real app, this would open an edit dialog.
    const user = users.find(u => u.id === userId);
    toast({ title: "Fitur Edit", description: `Fitur untuk mengedit pengguna ${user?.name} belum diimplementasikan.` });
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle>Manajemen Pengguna</CardTitle>
            </div>
            <CardDescription>Kelola akun pengguna yang memiliki akses ke sistem.</CardDescription>
        </div>
        <AddUserDialog onUserAdded={handleAddUser} />
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Nama</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    Tidak ada pengguna ditemukan.
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                     <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt={user.name} className="h-8 w-8 rounded-full" data-ai-hint="user avatar" />
                    {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive" disabled={users.length <=1}>
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
