
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
import { Building, Save, UploadCloud, Link2, Info } from "lucide-react";
import { useLog } from "@/contexts/LogContext";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  id: "school-profile-main", // Ensure a unique ID
  namaSekolah: "Nama Sekolah Anda",
  jenjangPendidikan: "SMA/MA", 
  alamat: "Jl. Contoh No. 123",
  nomorTelepon: "021-000000",
  emailSekolah: "kontak@sekolahanda.sch.id",
  namaKepalaSekolah: "Nama Kepala Sekolah",
  npsn: "10000000",
  logoUrl: "", // Default to no logo
  kotaSekolah: "Kota Anda",
  updatedAt: new Date().toISOString(),
};

export function SchoolProfileForm() {
  const [profile, setProfile] = useState<SchoolProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addLog } = useLog();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoInputMethod, setLogoInputMethod] = useState<'url' | 'upload'>('url');
  const [activeTab, setActiveTab] = useState("infoUmum");

  useEffect(() => {
    const source = "SchoolProfileForm-Init";
    const fetchedProfile = localStorage.getItem(SCHOOL_PROFILE_STORAGE_KEY);
    if (fetchedProfile) {
      try {
        const parsedProfile = JSON.parse(fetchedProfile) as SchoolProfile;
        // Ensure all fields are present, falling back to initialProfile defaults
        const completeProfile = { ...initialProfile, ...parsedProfile };
        setProfile(completeProfile);
        setLogoPreview(completeProfile.logoUrl || null);
        if (completeProfile.logoUrl && completeProfile.logoUrl.startsWith("data:image")) {
            setLogoInputMethod("upload");
        } else if (completeProfile.logoUrl) {
            setLogoInputMethod("url");
        }
        addLog("INFO", "Profil sekolah dimuat dari penyimpanan lokal.", source);
      } catch (error) {
        console.error("Failed to parse school profile from localStorage", error);
        addLog("ERROR", `Gagal memuat profil sekolah dari penyimpanan lokal: ${error instanceof Error ? error.message : String(error)}`, source);
        localStorage.removeItem(SCHOOL_PROFILE_STORAGE_KEY);
        setProfile(initialProfile); 
        setLogoPreview(initialProfile.logoUrl || null);
      }
    } else {
      setProfile(initialProfile); 
      setLogoPreview(initialProfile.logoUrl || null);
      addLog("INFO", "Tidak ada profil sekolah di penyimpanan lokal, menggunakan data awal.", source);
    }
  }, [addLog]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (name === "logoUrl" && logoInputMethod === 'url') {
      setLogoPreview(value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfile(prev => ({ ...prev, [name]: value as EducationLevel }));
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
        if (fileInputRef.current) fileInputRef.current.value = ""; 
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
    
    const finalProfileData = { ...profile, logoUrl: logoPreview, updatedAt: new Date().toISOString() };
    
    localStorage.setItem(SCHOOL_PROFILE_STORAGE_KEY, JSON.stringify(finalProfileData));
    setProfile(finalProfileData); // Update state with potentially cleaned logoUrl from preview
    setIsLoading(false);
    toast({
      title: "Profil Sekolah Diperbarui",
      description: "Informasi profil sekolah berhasil disimpan.",
    });
    addLog("INFO", `Profil sekolah berhasil diperbarui oleh ${user?.email}.`, source);
  };
  
  const canEdit = user && (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "TataUsaha" || user.role === "KepalaSekolah");

  return (
    <Card className="rounded-lg shadow-xl">
      <CardHeader className="rounded-t-lg bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-primary-foreground drop-shadow" />
          <div>
            <CardTitle className="text-2xl md:text-3xl">Profil & Kop Surat Sekolah</CardTitle>
            <CardDescription className="text-primary-foreground/90 mt-1">
              Kelola informasi umum sekolah dan pengaturan kop surat.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-6">
            <TabsTrigger value="infoUmum">Informasi Umum Sekolah</TabsTrigger>
            <TabsTrigger value="kopSurat">Pengaturan Kop Surat</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="infoUmum" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="namaSekolah">Nama Sekolah</Label>
                  <Input id="namaSekolah" name="namaSekolah" value={profile.namaSekolah || ""} onChange={handleChange} required disabled={!canEdit} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jenjangPendidikan">Jenjang Pendidikan</Label>
                  <Select 
                    name="jenjangPendidikan" 
                    value={profile.jenjangPendidikan || ""} 
                    onValueChange={(value) => handleSelectChange('jenjangPendidikan', value)}
                    disabled={!canEdit}
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
              <div className="space-y-1.5">
                <Label htmlFor="alamat">Alamat Sekolah</Label>
                <Textarea id="alamat" name="alamat" value={profile.alamat || ""} onChange={handleChange} required rows={3} disabled={!canEdit} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="npsn">NPSN</Label>
                  <Input id="npsn" name="npsn" value={profile.npsn || ""} onChange={handleChange} disabled={!canEdit} />
                </div>
                 <div className="space-y-1.5">
                  <Label htmlFor="kotaSekolah">Kota/Kabupaten Sekolah (untuk Kop Surat)</Label>
                  <Input id="kotaSekolah" name="kotaSekolah" value={profile.kotaSekolah || ""} onChange={handleChange} placeholder="cth., Kota Surabaya" disabled={!canEdit}/>
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="nomorTelepon">Nomor Telepon</Label>
                  <Input id="nomorTelepon" name="nomorTelepon" type="tel" value={profile.nomorTelepon || ""} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="emailSekolah">Email Sekolah</Label>
                  <Input id="emailSekolah" name="emailSekolah" type="email" value={profile.emailSekolah || ""} onChange={handleChange} disabled={!canEdit} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="namaKepalaSekolah">Nama Kepala Sekolah (untuk TTD)</Label>
                <Input id="namaKepalaSekolah" name="namaKepalaSekolah" value={profile.namaKepalaSekolah || ""} onChange={handleChange} disabled={!canEdit} />
              </div>
              <Alert variant="default" className="border-primary/30 shadow-sm">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle className="font-semibold">Informasi Jenjang Pendidikan</AlertTitle>
                <AlertDescription className="text-sm">
                  Pemilihan jenjang pendidikan akan mempengaruhi opsi tingkatan/fase yang tersedia saat membuat dokumen kurikulum (RPP, PROTA, Promes, Kelas).
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="kopSurat" className="space-y-6">
              <div className="space-y-1.5">
                <Label>Logo Sekolah (Untuk Kop Surat)</Label>
                <Tabs value={logoInputMethod} onValueChange={(value) => setLogoInputMethod(value as 'url' | 'upload')} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
                    <TabsTrigger value="url" disabled={!canEdit}><Link2 className="mr-2 h-4 w-4" /> Masukkan URL</TabsTrigger>
                    <TabsTrigger value="upload" disabled={!canEdit}><UploadCloud className="mr-2 h-4 w-4" /> Unggah File</TabsTrigger>
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
                        disabled={!canEdit || logoInputMethod !== 'url'}
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
                        accept="image/png, image/jpeg, image/svg+xml, image/gif, image/webp" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        disabled={!canEdit || logoInputMethod !== 'upload'}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">Format yang didukung: PNG, JPG, SVG, GIF, WebP. Maksimal 2MB.</p>
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
                                onErrorCapture={(e) => {
                                  console.warn("Image preview error for:", logoPreview, e);
                                  setLogoPreview(null); // Clear preview on error
                                }}
                                data-ai-hint="school logo"
                            />
                        </div>
                    </div>
                )}
                {!logoPreview && (
                   <div className="mt-4">
                        <Label>Pratinjau Logo:</Label>
                        <div className="mt-2 w-32 h-32 border rounded-md p-2 flex items-center justify-center bg-muted/30 text-muted-foreground text-xs text-center">
                           <ImageIcon className="h-8 w-8 mb-1 text-muted-foreground/70" />
                            Tidak ada logo atau URL tidak valid.
                        </div>
                    </div>
                )}
              </div>
              <Alert variant="default" className="border-accent/30 shadow-sm">
                <Info className="h-5 w-5 text-accent" />
                <AlertTitle className="font-semibold">Pengaturan Kop Surat</AlertTitle>
                <AlertDescription className="text-sm">
                  Nama Sekolah, Alamat, NPSN, Nomor Telepon, Email Sekolah, dan Logo akan digunakan untuk membuat kop surat pada dokumen yang dicetak. Kota/Kabupaten Sekolah akan digunakan pada bagian tanda tangan.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            {canEdit && (
              <div className="pt-6 border-t">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Menyimpan..." : "Simpan Profil & Pengaturan Kop"}
                </Button>
              </div>
            )}
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
