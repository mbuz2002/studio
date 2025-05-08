
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { SchoolProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Building, Save } from "lucide-react";

const initialProfile: SchoolProfile = {
  id: "school-profile-1",
  namaSekolah: "Sekolah Penggerak Contoh",
  alamat: "Jl. Pendidikan No. 1, Kota Pelajar",
  nomorTelepon: "021-1234567",
  emailSekolah: "info@sekolahpenggerak.sch.id",
  namaKepalaSekolah: "Dr. Budi Santoso, M.Pd.",
  npsn: "12345678",
  logoUrl: "https://picsum.photos/seed/schoollogo/200/200", // Placeholder logo
  updatedAt: new Date().toISOString(),
};

export function SchoolProfileForm() {
  const [profile, setProfile] = useState<SchoolProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simulate fetching existing profile data
  useEffect(() => {
    // In a real app, fetch this from a backend
    const fetchedProfile = localStorage.getItem("schoolProfile");
    if (fetchedProfile) {
      setProfile(JSON.parse(fetchedProfile));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate saving data
    await new Promise(resolve => setTimeout(resolve, 1000));
    const updatedProfile = { ...profile, updatedAt: new Date().toISOString() };
    setProfile(updatedProfile);
    localStorage.setItem("schoolProfile", JSON.stringify(updatedProfile));
    setIsLoading(false);
    toast({
      title: "Profil Sekolah Diperbarui",
      description: "Informasi profil sekolah berhasil disimpan.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          <CardTitle>Profil Sekolah</CardTitle>
        </div>
        <CardDescription>Kelola informasi umum mengenai sekolah Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="namaSekolah">Nama Sekolah</Label>
              <Input id="namaSekolah" name="namaSekolah" value={profile.namaSekolah} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="npsn">NPSN</Label>
              <Input id="npsn" name="npsn" value={profile.npsn || ""} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="alamat">Alamat Sekolah</Label>
            <Textarea id="alamat" name="alamat" value={profile.alamat} onChange={handleChange} required rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="nomorTelepon">Nomor Telepon</Label>
              <Input id="nomorTelepon" name="nomorTelepon" type="tel" value={profile.nomorTelepon} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="emailSekolah">Email Sekolah</Label>
              <Input id="emailSekolah" name="emailSekolah" type="email" value={profile.emailSekolah} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="namaKepalaSekolah">Nama Kepala Sekolah</Label>
            <Input id="namaKepalaSekolah" name="namaKepalaSekolah" value={profile.namaKepalaSekolah} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="logoUrl">URL Logo Sekolah (Opsional)</Label>
            <Input id="logoUrl" name="logoUrl" type="url" value={profile.logoUrl || ""} onChange={handleChange} placeholder="https://contoh.com/logo.png" />
            {profile.logoUrl && (
                <div className="mt-2">
                    <img src={profile.logoUrl} alt="Logo Sekolah" className="h-20 w-20 object-contain rounded border p-1" data-ai-hint="school logo" />
                </div>
            )}
          </div>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Menyimpan..." : "Simpan Perubahan Profil Sekolah"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
