"use client";

import { useState, useEffect, type FormEvent, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { SchoolProfile, EducationLevel, School, CustomDomainStatus } from "@/types";
import { SCHOOL_PROFILE_STORAGE_KEY, SCHOOLS_STORAGE_KEY } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Building, Save, UploadCloud, Link2, Info, ImageIcon, Globe } from "lucide-react"; // ImageIcon
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

const customDomainStatusDisplayMap: Record<CustomDomainStatus, string> = {
  unconfigured: "Belum Dikonfigurasi (Gunakan Subdomain)",
  pending_verification: "Menunggu Verifikasi DNS",
  active: "Aktif & Terverifikasi",
  configuration_error: "Kesalahan Konfigurasi DNS",
  ssl_error: "Kesalahan SSL",
};


function slugify(text: string = ""): string {
  if (!text) return "sekolah-anda";
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '') 
    .replace(/--+/g, '-') 
    .replace(/^-+/, '') 
    .replace(/-+$/, '') 
    .substring(0, 50); 
}


const initialProfile: SchoolProfile = {
  id: "school-profile-main", 
  namaSekolah: "Nama Sekolah Anda",
  jenjangPendidikan: "SMA/MA", 
  alamat: "Jl. Contoh No. 123",
  nomorTelepon: "021-000000",
  emailSekolah: "kontak@sekolahanda.sch.id",
  namaKepalaSekolah: "Nama Kepala Sekolah",
  npsn: "10000000",
  logoUrl: "", 
  kotaSekolah: "Kota Anda",
  updatedAt: new Date().toISOString(),
  customDomain: "",
  customDomainStatus: "unconfigured",
};

export function SchoolProfileForm() {
  const [profile, setProfile] = useState<SchoolProfile>(initialProfile);
  const [initialLoadedProfile, setInitialLoadedProfile] = useState<SchoolProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addLog } = useLog();
  const { user, currentSchool } = useAuth(); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoInputMethod, setLogoInputMethod] = useState<'url' | 'upload'>('url');
  const [activeTab, setActiveTab] = useState("infoUmum");

  useEffect(() => {
    const source = "SchoolProfileForm-Init";
    let profileToLoad: SchoolProfile = { ...initialProfile };

    if (currentSchool && user && ["Admin", "KepalaSekolah", "TataUsaha"].includes(user.role)) {
      profileToLoad = {
        ...initialProfile, 
        id: currentSchool.id, 
        namaSekolah: currentSchool.name,
        jenjangPendidikan: currentSchool.jenjangPendidikan,
        alamat: currentSchool.alamat,
        nomorTelepon: currentSchool.nomorTelepon,
        emailSekolah: currentSchool.emailSekolah,
        namaKepalaSekolah: currentSchool.namaKepalaSekolah,
        npsn: currentSchool.npsn,
        logoUrl: currentSchool.logoUrl,
        kotaSekolah: currentSchool.kotaSekolah,
        customDomain: currentSchool.customDomain,
        customDomainStatus: currentSchool.customDomainStatus || "unconfigured",
        updatedAt: currentSchool.updatedAt || new Date().toISOString(),
      };
      addLog("INFO", `Profil sekolah "${currentSchool.name}" dimuat dari AuthContext (currentSchool).`, source);
    } else {
      const fetchedProfile = localStorage.getItem(SCHOOL_PROFILE_STORAGE_KEY);
      if (fetchedProfile) {
        try {
          const parsedProfile = JSON.parse(fetchedProfile) as SchoolProfile;
          profileToLoad = { ...initialProfile, ...parsedProfile };
          addLog("INFO", "Profil sekolah dimuat dari penyimpanan lokal (SCHOOL_PROFILE_STORAGE_KEY).", source);
        } catch (error) {
          console.error("Failed to parse school profile from localStorage", error);
          addLog("ERROR", `Gagal memuat profil sekolah dari penyimpanan lokal: ${error instanceof Error ? error.message : String(error)}`, source);
          localStorage.removeItem(SCHOOL_PROFILE_STORAGE_KEY);
        }
      } else {
        addLog("INFO", "Tidak ada profil sekolah di penyimpanan lokal, menggunakan data awal.", source);
      }
    }
    
    setProfile(profileToLoad);
    setInitialLoadedProfile(profileToLoad); // Store initial state for comparison on save
    setLogoPreview(profileToLoad.logoUrl || null);
    if (profileToLoad.logoUrl && profileToLoad.logoUrl.startsWith("data:image")) {
        setLogoInputMethod("upload");
    } else if (profileToLoad.logoUrl) {
        setLogoInputMethod("url");
    }

  }, [addLog, currentSchool, user]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (name === "logoUrl" && logoInputMethod === 'url') {
      setLogoPreview(value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
     if (name === "jenjangPendidikan") {
        setProfile(prev => ({ ...prev, [name]: value as EducationLevel }));
    } else {
       setProfile(prev => ({ ...prev, [name]: value }));
    }
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
    
    let newCustomDomainStatus: CustomDomainStatus = profile.customDomainStatus || 'unconfigured';
    if (profile.customDomain && profile.customDomain.trim() !== "") {
        // If domain is set/changed and was not already active by SA, or domain text changed
        if (profile.customDomain !== initialLoadedProfile?.customDomain || initialLoadedProfile?.customDomainStatus !== 'active') {
            newCustomDomainStatus = 'pending_verification';
        } else if (profile.customDomain === initialLoadedProfile?.customDomain && initialLoadedProfile?.customDomainStatus === 'active') {
            newCustomDomainStatus = 'active'; // Keep active if domain unchanged and was active
        }
    } else {
        newCustomDomainStatus = 'unconfigured';
    }

    const finalProfileData: SchoolProfile = { 
      ...profile, 
      logoUrl: logoPreview, 
      updatedAt: new Date().toISOString(),
      customDomain: profile.customDomain?.trim() || "", 
      customDomainStatus: newCustomDomainStatus,
    };
    
    localStorage.setItem(SCHOOL_PROFILE_STORAGE_KEY, JSON.stringify(finalProfileData));

    if (currentSchool && user && ["Admin", "KepalaSekolah", "TataUsaha"].includes(user.role)) {
      try {
        const allSchoolsData = localStorage.getItem(SCHOOLS_STORAGE_KEY);
        if (allSchoolsData) {
          let allSchools: School[] = JSON.parse(allSchoolsData);
          const schoolIndex = allSchools.findIndex(s => s.id === currentSchool.id);
          if (schoolIndex > -1) {
            allSchools[schoolIndex] = {
              ...allSchools[schoolIndex], 
              name: finalProfileData.namaSekolah,
              jenjangPendidikan: finalProfileData.jenjangPendidikan,
              alamat: finalProfileData.alamat,
              nomorTelepon: finalProfileData.nomorTelepon,
              emailSekolah: finalProfileData.emailSekolah,
              namaKepalaSekolah: finalProfileData.namaKepalaSekolah,
              npsn: finalProfileData.npsn,
              logoUrl: finalProfileData.logoUrl,
              kotaSekolah: finalProfileData.kotaSekolah,
              customDomain: finalProfileData.customDomain,
              customDomainStatus: finalProfileData.customDomainStatus,
              updatedAt: finalProfileData.updatedAt,
            };
            localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(allSchools));
            addLog("INFO", `Data sekolah "${currentSchool.name}" (ID: ${currentSchool.id}) di SCHOOLS_STORAGE_KEY juga diperbarui.`, source);
          }
        }
      } catch (error) {
         addLog("ERROR", `Gagal memperbarui data sekolah di SCHOOLS_STORAGE_KEY: ${error instanceof Error ? error.message : String(error)}`, source);
      }
    }

    setProfile(finalProfileData);
    setInitialLoadedProfile(finalProfileData); // Update initial loaded profile to current saved state
    setIsLoading(false);
    toast({
      title: "Profil Sekolah Diperbarui",
      description: "Informasi profil sekolah berhasil disimpan.",
    });
    addLog("INFO", `Profil sekolah berhasil diperbarui oleh ${user?.email}.`, source);
  };
  
  const canEdit = user && (user.role === "Admin" || user.role === "TataUsaha" || user.role === "KepalaSekolah");
  const generatedSubdomain = profile.namaSekolah ? `${slugify(profile.namaSekolah)}.gumpla.ai` : "subdomain-anda.gumpla.ai";

  return (
    <Card className="rounded-lg shadow-xl">
      <CardHeader className="rounded-t-lg bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-primary-foreground drop-shadow" />
          <div>
            <CardTitle className="text-2xl md:text-3xl">Profil & Pengaturan Sekolah</CardTitle>
            <CardDescription className="text-primary-foreground/90 mt-1">
              Kelola informasi umum, kop surat, dan domain sekolah Anda.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
            <TabsTrigger value="infoUmum">Informasi Umum</TabsTrigger>
            <TabsTrigger value="kopSurat">Pengaturan Kop Surat</TabsTrigger>
            <TabsTrigger value="domain">Pengaturan Domain</TabsTrigger>
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
                                  setLogoPreview(null); 
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

            <TabsContent value="domain" className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="customDomain">Domain Kustom (Opsional)</Label>
                <Input id="customDomain" name="customDomain" value={profile.customDomain || ""} onChange={handleChange} placeholder="cth., kurikulum.sekolahanda.sch.id" disabled={!canEdit} />
                {!profile.customDomain && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Alamat situs sekolah Anda akan menjadi: <strong className="text-primary">{generatedSubdomain}</strong>
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customDomainStatus">Status Domain Kustom</Label>
                 <Input 
                    id="customDomainStatus" 
                    name="customDomainStatus" 
                    value={customDomainStatusDisplayMap[profile.customDomainStatus || 'unconfigured']} 
                    disabled 
                    className="bg-muted/50 cursor-not-allowed"
                 />
                <p className="text-xs text-muted-foreground mt-1">
                  Status domain diatur oleh Super Admin setelah konfigurasi DNS. Jika domain kustom diubah, status akan menjadi "Menunggu Verifikasi DNS".
                </p>
              </div>
              <Alert variant="default" className="border-amber-500/50 shadow-sm">
                <Globe className="h-5 w-5 text-amber-500" />
                <AlertTitle className="font-semibold">Informasi Pengaturan Domain</AlertTitle>
                <AlertDescription className="text-sm">
                  Jika Anda ingin menggunakan domain kustom (misal, `kurikulum.sekolahanda.sch.id`), masukkan di atas. 
                  Anda kemudian perlu mengkonfigurasi CNAME record domain kustom Anda untuk diarahkan ke `app.gumpla.ai` (atau target yang disediakan oleh Super Admin).
                  Status domain ini mungkin perlu diverifikasi oleh Super Admin atau sistem.
                  Jika kolom domain kustom dikosongkan, sekolah akan otomatis dapat diakses melalui subdomain yang dibuat berdasarkan nama sekolah.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            {canEdit && (
              <div className="pt-6 border-t">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Menyimpan..." : "Simpan Profil & Pengaturan Sekolah"}
                </Button>
              </div>
            )}
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
