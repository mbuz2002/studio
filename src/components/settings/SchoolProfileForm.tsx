
"use client";

import { useState, useEffect, type FormEvent, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { SchoolProfile, EducationLevel } from "@/types";
import { SCHOOL_PROFILE_STORAGE_KEY } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Building, Save, UploadCloud, Link2 } from "lucide-react";
import { useLog } from "@/contexts/LogContext";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const educationLevels: { value: EducationLevel; label: string }[] = [
  { value: "PAUD", label: "Pendidikan Anak Usia Dini (PAUD)" },
  { value: "SD/MI", label: "Sekolah Dasar / Madrasah Ibtidaiyah (SD/MI)" },
  { value: "SMP/MTs", label: "Sekolah Menengah Pertama / Madrasah Tsanawiyah (SMP/MTs)" },
  { value: "SMA/MA", label: "Sekolah Menengah Atas / Madrasah Aliyah (SMA/MA)" },
  { value: "SMK/MAK", label: "Sekolah Menengah Kejuruan / Madrasah Aliyah Kejuruan (SMK/MAK)" },
  { value: "SLB", label: "Sekolah Luar Biasa (SLB)" },
  { value: "PKBM/Kesetaraan", label: "Pusat Kegiatan Belajar Masyarakat (PKBM) / Pendidikan Kesetaraan" },
];

const initialProfile: SchoolProfile = {
  id: "school-profile-1",
  namaSekolah: "Sekolah Penggerak Contoh",
  jenjangPendidikan: "SMA/MA", // Default jenjang
  alamat: "Jl. Pendidikan No. 1, Kota Pelajar",
  nomorTelepon: "021-1234567",
  emailSekolah: "info@sekolahpenggerak.sch.id",
  namaKepalaSekolah: "Dr. Budi Santoso, M.Pd.",
  npsn: "12345678",
  logoUrl: "https://picsum.photos/seed/schoollogo/200/200",
  kotaSekolah: "Kota Pelajar",
  updatedAt: new Date().toISOString(),
};

export function SchoolProfileForm() {
  const [profile, setProfile] = useState<SchoolProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addLog } = useLog();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(profile.logoUrl || null);
  const [logoInputMethod, setLogoInputMethod] = useState<'url' | 'upload'>('url');

  useEffect(() => {
    const source = "SchoolProfileForm-Init";
    const fetchedProfile = localStorage.getItem(SCHOOL_PROFILE_STORAGE_KEY);
    if (fetchedProfile) {
      try {
        const parsedProfile = JSON.parse(fetchedProfile);
        setProfile(parsedProfile);
        setLogoPreview(parsedProfile.logoUrl || null);
        addLog("INFO", "Profil sekolah dimuat dari penyimpanan lokal.", source);
      } catch (error) {
        console.error("Failed to parse school profile from localStorage", error);
        addLog("ERROR", `Gagal memuat profil sekolah dari penyimpanan lokal: ${error instanceof Error ? error.message : String(error)}`, source);
        localStorage.removeItem(SCHOOL_PROFILE_STORAGE_KEY);
        setProfile(initialProfile); // Reset to initial if parsing fails
        setLogoPreview(initialProfile.logoUrl || null);
      }
    } else {
      setProfile(initialProfile); // Use initial if not found
      setLogoPreview(initialProfile.logoUrl || null);
      addLog("INFO", "Tidak ada profil sekolah di penyimpanan lokal, menggunakan data awal.", source);
    }
  }, [addLog]);

  useEffect(() => {
    setLogoPreview(profile.logoUrl || null);
  }, [profile.logoUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (name === "logoUrl" && logoInputMethod === 'url') {
      setLogoPreview(value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        toast({
          title: "Ukuran File Terlalu Besar",
          description: "Ukuran file logo maksimal 2MB.",
          variant: "destructive",
        });
        addLog("WARN", `Gagal unggah logo: File terlalu besar (${(file.size / (1024*1024)).toFixed(2)}MB). Oleh ${user?.email}.`, "SchoolProfileForm-LogoUpload");
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setProfile((prev) => ({ ...prev, logoUrl: dataUri }));
        setLogoPreview(dataUri);
        addLog("INFO", `Logo baru dipilih untuk diunggah: ${file.name}. Oleh ${user?.email}.`, "SchoolProfileForm-LogoUpload");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const source = "SchoolProfileForm-Submit";
    addLog("INFO", `Pengguna ${user?.email} memulai pembaruan profil sekolah.`, source);
    
    const finalLogoUrl = logoPreview;

    await new Promise(resolve => setTimeout(resolve, 1000));
    const updatedProfile = { ...profile, logoUrl: finalLogoUrl, updatedAt: new Date().toISOString() };
    
    setProfile(updatedProfile);
    localStorage.setItem(SCHOOL_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    setIsLoading(false);
    toast({
      title: "Profil Sekolah Diperbarui",
      description: "Informasi profil sekolah berhasil disimpan.",
    });
    addLog("INFO", `Profil sekolah berhasil diperbarui oleh ${user?.email}.`, source);
  };

  return (
    <Card className="rounded-lg shadow-xl">
      <CardHeader className="rounded-t-lg bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-primary-foreground drop-shadow" />
          <div>
            <CardTitle className="text-2xl md:text-3xl">Profil Sekolah dan Kop Surat</CardTitle>
            <CardDescription className="text-primary-foreground/90 mt-1">
              Kelola informasi umum sekolah Anda. Informasi ini akan digunakan untuk Kop Surat.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="namaSekolah">Nama Sekolah</Label>
              <Input id="namaSekolah" name="namaSekolah" value={profile.namaSekolah || ""} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="jenjangPendidikan">Jenjang Pendidikan</Label>
              <Select 
                name="jenjangPendidikan" 
                value={profile.jenjangPendidikan || ""} 
                onValueChange={(value) => handleSelectChange('jenjangPendidikan', value)}
              >
                <SelectTrigger id="jenjangPendidikan">
                  <SelectValue placeholder="Pilih Jenjang Pendidikan" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="alamat">Alamat Sekolah</Label>
            <Textarea id="alamat" name="alamat" value={profile.alamat || ""} onChange={handleChange} required rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="npsn">NPSN</Label>
              <Input id="npsn" name="npsn" value={profile.npsn || ""} onChange={handleChange} />
            </div>
             <div className="space-y-1">
              <Label htmlFor="kotaSekolah">Kota/Kabupaten Sekolah</Label>
              <Input id="kotaSekolah" name="kotaSekolah" value={profile.kotaSekolah || ""} onChange={handleChange} placeholder="cth., Kota Surabaya"/>
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="nomorTelepon">Nomor Telepon</Label>
              <Input id="nomorTelepon" name="nomorTelepon" type="tel" value={profile.nomorTelepon || ""} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="emailSekolah">Email Sekolah</Label>
              <Input id="emailSekolah" name="emailSekolah" type="email" value={profile.emailSekolah || ""} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="namaKepalaSekolah">Nama Kepala Sekolah</Label>
            <Input id="namaKepalaSekolah" name="namaKepalaSekolah" value={profile.namaKepalaSekolah || ""} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label>Logo Sekolah (Untuk Kop Surat)</Label>
            <Tabs value={logoInputMethod} onValueChange={(value) => setLogoInputMethod(value as 'url' | 'upload')} className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
                <TabsTrigger value="url"><Link2 className="mr-2 h-4 w-4" /> Masukkan URL</TabsTrigger>
                <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4" /> Unggah File</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="pt-2">
                <div className="space-y-1">
                  <Label htmlFor="logoUrl">URL Logo</Label>
                  <Input 
                    id="logoUrl" 
                    name="logoUrl" 
                    type="url" 
                    value={logoInputMethod === 'url' ? (profile.logoUrl || '') : ''} 
                    onChange={handleChange} 
                    placeholder="https://contoh.com/logo.png" 
                  />
                </div>
              </TabsContent>
              <TabsContent value="upload" className="pt-2">
                <div className="space-y-1">
                  <Label htmlFor="logoFile">Pilih File Logo</Label>
                  <Input 
                    id="logoFile" 
                    name="logoFile" 
                    type="file" 
                    accept="image/png, image/jpeg, image/svg+xml, image/gif" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                  />
                  <p className="text-xs text-muted-foreground">Format yang didukung: PNG, JPG, SVG, GIF. Maksimal 2MB.</p>
                </div>
              </TabsContent>
            </Tabs>
            
            {logoPreview && (
                <div className="mt-4">
                    <Label>Pratinjau Logo:</Label>
                    <div className="mt-2 w-32 h-32 relative border rounded-md p-2 flex items-center justify-center bg-muted/30">
                        <Image 
                            src={logoPreview} 
                            alt="Pratinjau Logo Sekolah" 
                            fill
                            style={{objectFit:"contain"}}
                            className="rounded"
                            onError={() => {
                              if (logoPreview?.startsWith('http')) setLogoPreview(null);
                            }}
                            data-ai-hint="school logo"
                        />
                    </div>
                </div>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto mt-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Menyimpan..." : "Simpan Profil Sekolah"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

