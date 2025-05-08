
"use client";

import { useState, useEffect, type FormEvent, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { SchoolProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Building, Save, UploadCloud, Link2 } from "lucide-react";
import { useLog } from "@/contexts/LogContext";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialProfile: SchoolProfile = {
  id: "school-profile-1",
  namaSekolah: "Sekolah Penggerak Contoh",
  alamat: "Jl. Pendidikan No. 1, Kota Pelajar",
  nomorTelepon: "021-1234567",
  emailSekolah: "info@sekolahpenggerak.sch.id",
  namaKepalaSekolah: "Dr. Budi Santoso, M.Pd.",
  npsn: "12345678",
  logoUrl: "https://picsum.photos/seed/schoollogo/200/200",
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
    const fetchedProfile = localStorage.getItem("schoolProfile");
    if (fetchedProfile) {
      try {
        const parsedProfile = JSON.parse(fetchedProfile);
        setProfile(parsedProfile);
        setLogoPreview(parsedProfile.logoUrl || null);
        addLog("INFO", "Profil sekolah dimuat dari penyimpanan lokal.", source);
      } catch (error) {
        console.error("Failed to parse school profile from localStorage", error);
        addLog("ERROR", `Gagal memuat profil sekolah dari penyimpanan lokal: ${error instanceof Error ? error.message : String(error)}`, source);
        localStorage.removeItem("schoolProfile");
        setLogoPreview(initialProfile.logoUrl || null);
      }
    } else {
      setLogoPreview(initialProfile.logoUrl || null);
      addLog("INFO", "Tidak ada profil sekolah di penyimpanan lokal, menggunakan data awal.", source);
    }
  }, [addLog]);

  useEffect(() => {
    // Update preview if profile.logoUrl changes externally or on initial load
    setLogoPreview(profile.logoUrl || null);
  }, [profile.logoUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (name === "logoUrl" && logoInputMethod === 'url') {
      setLogoPreview(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for demo
        toast({
          title: "Ukuran File Terlalu Besar",
          description: "Ukuran file logo maksimal 2MB.",
          variant: "destructive",
        });
        addLog("WARN", `Gagal unggah logo: File terlalu besar (${(file.size / (1024*1024)).toFixed(2)}MB). Oleh ${user?.email}.`, "SchoolProfileForm-LogoUpload");
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
    
    // Ensure logoUrl from preview is what's saved if it's a data URI
    // If it's an http/https URL from input, it's already in profile.logoUrl
    const finalLogoUrl = logoPreview;

    await new Promise(resolve => setTimeout(resolve, 1000));
    const updatedProfile = { ...profile, logoUrl: finalLogoUrl, updatedAt: new Date().toISOString() };
    
    setProfile(updatedProfile);
    localStorage.setItem("schoolProfile", JSON.stringify(updatedProfile));
    setIsLoading(false);
    toast({
      title: "Profil Sekolah Diperbarui",
      description: "Informasi profil sekolah berhasil disimpan.",
    });
    addLog("INFO", `Profil sekolah berhasil diperbarui oleh ${user?.email}.`, source);
  };

  return (
    <Card className="rounded-lg">
      <CardHeader className="rounded-t-lg bg-gradient-to-r from-secondary to-muted text-foreground">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-primary drop-shadow" />
          <CardTitle>Profil Sekolah dan Pengaturan Kop Surat</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Kelola informasi umum mengenai sekolah Anda. Informasi ini juga akan digunakan untuk Kop Surat (Letterhead) pada dokumen yang dicetak.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="space-y-2">
            <Label>Logo Sekolah (Untuk Kop Surat)</Label>
            <Tabs value={logoInputMethod} onValueChange={(value) => setLogoInputMethod(value as 'url' | 'upload')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
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
                    value={logoInputMethod === 'url' ? (profile.logoUrl || '') : ''} // Only bind to profile.logoUrl if method is 'url'
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
                              // If URL fails to load (e.g. invalid URL), clear preview
                              // For data URIs, this is less likely but good practice
                              if (logoPreview?.startsWith('http')) setLogoPreview(null);
                            }}
                            data-ai-hint="school logo"
                        />
                    </div>
                </div>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto mt-6 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground shadow-md hover:shadow-lg transition-shadow">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Menyimpan..." : "Simpan Perubahan Profil Sekolah"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
