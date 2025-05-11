"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, UserCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { User, School } from "@/types";
import { APP_USERS_STORAGE_KEY, SCHOOLS_STORAGE_KEY } from "@/types";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GlobalUserManagementPage() {
  const { user: superAdminUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading) {
      if (superAdminUser?.role !== "SuperAdmin") {
        router.push("/dashboard");
        return;
      }
      
      const storedUsers = localStorage.getItem(APP_USERS_STORAGE_KEY);
      if (storedUsers) setAllUsers(JSON.parse(storedUsers));

      const storedSchools = localStorage.getItem(SCHOOLS_STORAGE_KEY);
      if (storedSchools) setSchools(JSON.parse(storedSchools));
    }
  }, [superAdminUser, authLoading, router]);

  const schoolMap = useMemo(() => new Map(schools.map(s => [s.id, s.name])), [schools]);

  const filteredUsers = useMemo(() => {
    if (!isClient) return [];
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.schoolId && (schoolMap.get(user.schoolId) || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [isClient, allUsers, searchTerm, schoolMap]);

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  if (authLoading || !superAdminUser || superAdminUser.role !== "SuperAdmin") {
    return <LoadingSpinner message="Memuat Manajemen Pengguna Global..." icon={<Users className="h-12 w-12 animate-pulse text-primary mb-4"/>} />;
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary-foreground drop-shadow" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">Manajemen Pengguna Global</CardTitle>
              <CardDescription className="text-primary-foreground/90 mt-1">
                Lihat semua pengguna terdaftar di seluruh sistem GUMPLA AI.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari pengguna (nama, email, peran, sekolah)..."
                className="pl-10 w-full text-base md:text-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] px-3 sm:px-4 py-3 text-sm">Nama Pengguna</TableHead>
                  <TableHead className="min-w-[200px] px-3 sm:px-4 py-3 text-sm hidden md:table-cell">Email</TableHead>
                  <TableHead className="min-w-[120px] px-3 sm:px-4 py-3 text-sm">Peran</TableHead>
                  <TableHead className="min-w-[180px] px-3 sm:px-4 py-3 text-sm hidden lg:table-cell">Sekolah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground px-3 sm:px-4 text-base">
                      Tidak ada pengguna ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 flex-shrink-0">
                              <AvatarImage src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=random&color=fff`} alt={user.name} data-ai-hint="user avatar" />
                              <AvatarFallback className="text-xs">{getInitials(user.name) || <UserCircle2 size={14}/>}</AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[150px]">{user.name}</span>
                        </div>
                        <div className="md:hidden text-xs text-muted-foreground mt-0.5">{user.email}</div>
                         <div className="lg:hidden text-xs text-muted-foreground mt-0.5">
                           Sekolah: {user.schoolId ? schoolMap.get(user.schoolId) || 'N/A' : 'Global (SA)'}
                         </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm hidden md:table-cell">{user.email}</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm">
                        <Badge variant={user.role === "SuperAdmin" ? "destructive" : user.role === "Admin" ? "default" : "secondary"} className="text-xs">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top text-sm hidden lg:table-cell">
                        {user.schoolId ? schoolMap.get(user.schoolId) || 'Tidak Diketahui' : <span className="italic text-muted-foreground">Global (Super Admin)</span>}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Halaman ini hanya menampilkan data pengguna. Pengelolaan pengguna dilakukan per sekolah atau melalui fitur khusus (jika ada).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
