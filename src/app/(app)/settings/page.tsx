
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cog, UserCircle, ShieldCheck, Database, Building, Users as UsersIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SchoolProfileForm } from "@/components/settings/SchoolProfileForm";
import { UserManagementSection } from "@/components/settings/UserManagementSection";

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
       <div className="space-y-6 py-8">
        <Card>
          <CardHeader><CardTitle>Memuat Pengaturan...</CardTitle></CardHeader>
          <CardContent><p>Silakan tunggu...</p></CardContent>
        </Card>
      </div>
    );
  }

  // Define which roles can see which settings cards
  const canSeeProfileSettings = ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"].includes(user.role);
  const canSeeAppSettings = ["Admin", "KepalaSekolah", "WakaKurikulum", "TataUsaha", "Guru"].includes(user.role);
  
  const canManageSchoolProfile = ["Admin", "TataUsaha"].includes(user.role);
  const canManageUsers = ["Admin", "TataUsaha"].includes(user.role);
  
  const canSeeDataManagement = ["Admin", "WakaKurikulum"].includes(user.role);
  const canSeeSystemSettings = user.role === "Admin";

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
              <Cog className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">Pengaturan</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Kelola preferensi aplikasi, profil sekolah, pengguna, dan pengaturan akun Anda.
          </CardDescription>
        </CardHeader>
      </Card>

      {canManageSchoolProfile && (
        <div className="mt-6">
          <SchoolProfileForm />
        </div>
      )}

      {canManageUsers && (
        <div className="mt-6">
          <UserManagementSection />
        </div>
      )}
      
      <Card className="mt-6">
        <CardHeader>
            <CardTitle className="text-xl">Pengaturan Umum & Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {canSeeProfileSettings && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-6 w-6 text-primary" />
                    <CardTitle>Informasi Profil Pengguna</CardTitle>
                  </div>
                  <CardDescription>Perbarui rincian pribadi Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nama:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Peran:</strong> {user.role}</p>
                  <Button variant="outline" className="mt-2" onClick={() => alert("Fitur edit profil pengguna belum diimplementasikan.")}>Edit Profil (Contoh)</Button>
                </CardContent>
              </Card>
            )}

            {canSeeAppSettings && (
              <Card>
                <CardHeader>
                 <div className="flex items-center gap-2">
                    <Cog className="h-6 w-6 text-primary" />
                    <CardTitle>Preferensi Aplikasi</CardTitle>
                  </div>
                  <CardDescription>Sesuaikan pengalaman EduAI Planner Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Pengaturan tema, notifikasi, dan preferensi lainnya akan dikelola di sini.</p>
                   <Button variant="outline" className="mt-2" onClick={() => alert("Fitur preferensi aplikasi belum diimplementasikan.")}>Atur Preferensi (Contoh)</Button>
                </CardContent>
              </Card>
            )}

            {canSeeDataManagement && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="h-6 w-6 text-primary" />
                    <CardTitle>Manajemen Data Kurikulum</CardTitle>
                  </div>
                  <CardDescription>Ekspor atau impor data kurikulum secara massal.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Opsi untuk mengekspor semua data atau mengimpor dari format yang didukung akan ada di sini.</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" onClick={() => alert("Fitur ekspor data belum diimplementasikan.")}>Ekspor Data (Contoh)</Button>
                    <Button variant="outline" onClick={() => alert("Fitur impor data belum diimplementasikan.")}>Impor Data (Contoh)</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {canSeeSystemSettings && (
                <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <CardTitle>Pengaturan Sistem (Khusus Admin)</CardTitle>
                    </div>
                    <CardDescription>Konfigurasi tingkat lanjut untuk aplikasi.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Pengaturan integrasi, log audit, dan konfigurasi sistem lainnya.</p>
                    <Button className="mt-2" onClick={() => alert("Panel Admin belum diimplementasikan.")}>Akses Panel Admin (Contoh)</Button>
                </CardContent>
                </Card>
            )}
            
          </div>
           {!(canSeeProfileSettings || canSeeAppSettings || canSeeDataManagement || canSeeSystemSettings) && 
            !canManageSchoolProfile && !canManageUsers && ( // Check if no settings sections are visible at all
              <p className="text-muted-foreground">Tidak ada pengaturan yang tersedia untuk peran Anda saat ini.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
