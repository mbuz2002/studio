
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { School, EducationLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Link2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Added Tabs
import { useToast } from "@/hooks/use-toast";

interface SchoolFormFieldsProps {
  formData: Partial<School>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleLogoUrlChange: (url: string) => void; // For direct URL input or data URI from upload
  adminPassword?: string; // Only for new school form
  handleAdminPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Only for new school form
  isEditMode: boolean;
}

const educationLevels: { value: EducationLevel; label: string }[] = [
  { value: "PAUD", label: "Pendidikan Anak Usia Dini (PAUD)" },
  { value: "SD/MI", label: "Sekolah Dasar / Madrasah Ibtidaiyah (SD/MI)" },
  { value: "SMP/MTs", label: "Sekolah Menengah Pertama / Madrasah Tsanawiyah (SMP/MTs)" },
  { value: "SMA/MA", label: "Sekolah Menengah Atas / Madrasah Aliyah (SMA/MA)" },
  { value: "SMK/MAK", label: "Sekolah Menengah Kejuruan / Madrasah Aliyah Kejuruan (SMK/MAK)" },
  { value: "SLB", label: "Sekolah Luar Biasa (SLB)" },
  { value: "PKBM/Kesetaraan", label: "Pusat Kegiatan Belajar Masyarakat (PKBM) / Pendidikan Kesetaraan" },
];

const subscriptionStatusOptions: { value: School['subscriptionStatus']; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Tidak Aktif" },
  { value: "trial", label: "Uji Coba (Trial)" },
];

export function SchoolFormFields({
  formData,
  handleChange,
  handleSelectChange,
  handleLogoUrlChange,
  adminPassword,
  handleAdminPasswordChange,
  isEditMode,
}: SchoolFormFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(formData.logoUrl || null);
  const [logoInputMethod, setLogoInputMethod] = useState<'url' | 'upload'>(
    formData.logoUrl && formData.logoUrl.startsWith("data:image") ? "upload" : "url"
  );
  const { toast } = useToast();

  useEffect(() => {
    setLogoPreview(formData.logoUrl || null);
    if (formData.logoUrl && formData.logoUrl.startsWith("data:image")) {
      setLogoInputMethod("upload");
    } else if (formData.logoUrl) {
      setLogoInputMethod("url");
    } else {
      setLogoInputMethod("url"); // Default to URL if no logo
    }
  }, [formData.logoUrl]);

  const onLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ title: "Ukuran File Logo Terlalu Besar", description: "Maksimal 2MB.", variant: "destructive" });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setLogoPreview(dataUri);
        handleLogoUrlChange(dataUri); // Update parent form state with data URI
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onLogoUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e); // Let parent handle general input change
    if (logoInputMethod === 'url') {
      setLogoPreview(e.target.value); // Update preview for URL input
      handleLogoUrlChange(e.target.value); // Update parent form state
    }
  };


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Sekolah</Label>
          <Input id="name" name="name" value={formData.name || ""} onChange={handleChange} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jenjangPendidikan">Jenjang Pendidikan</Label>
          <Select name="jenjangPendidikan" value={formData.jenjangPendidikan || ""} onValueChange={(value) => handleSelectChange('jenjangPendidikan', value)}>
            <SelectTrigger id="jenjangPendidikan"><SelectValue placeholder="Pilih Jenjang" /></SelectTrigger>
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
        <Textarea id="alamat" name="alamat" value={formData.alamat || ""} onChange={handleChange} rows={3} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="nomorTelepon">Nomor Telepon Sekolah</Label>
          <Input id="nomorTelepon" name="nomorTelepon" type="tel" value={formData.nomorTelepon || ""} onChange={handleChange} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="emailSekolah">Email Sekolah</Label>
          <Input id="emailSekolah" name="emailSekolah" type="email" value={formData.emailSekolah || ""} onChange={handleChange} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="npsn">NPSN</Label>
          <Input id="npsn" name="npsn" value={formData.npsn || ""} onChange={handleChange} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="namaKepalaSekolah">Nama Kepala Sekolah</Label>
          <Input id="namaKepalaSekolah" name="namaKepalaSekolah" value={formData.namaKepalaSekolah || ""} onChange={handleChange} />
        </div>
      </div>
       <div className="space-y-1.5">
          <Label htmlFor="kotaSekolah">Kota/Kabupaten Sekolah (untuk Kop Surat)</Label>
          <Input id="kotaSekolah" name="kotaSekolah" value={formData.kotaSekolah || ""} onChange={handleChange} placeholder="cth., Kota Surabaya"/>
        </div>

      <div className="space-y-1.5">
        <Label>Logo Sekolah</Label>
        <Tabs value={logoInputMethod} onValueChange={(value) => setLogoInputMethod(value as 'url' | 'upload')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url"><Link2 className="mr-2 h-4 w-4"/> Masukkan URL</TabsTrigger>
            <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4"/> Unggah File</TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="pt-2">
            <Input 
              name="logoUrl" 
              type="url" 
              placeholder="https://example.com/logo.png" 
              value={logoInputMethod === 'url' ? (formData.logoUrl || '') : ''} 
              onChange={onLogoUrlInputChange}
              disabled={logoInputMethod !== 'url'}
            />
          </TabsContent>
          <TabsContent value="upload" className="pt-2">
            <Input 
              type="file" 
              accept="image/png, image/jpeg, image/svg+xml, image/gif, image/webp" 
              ref={fileInputRef} 
              onChange={onLogoFileChange} 
              disabled={logoInputMethod !== 'upload'}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
             <p className="text-xs text-muted-foreground mt-1">Format: PNG, JPG, SVG, GIF, WebP. Maks: 2MB.</p>
          </TabsContent>
        </Tabs>
        {logoPreview && (
          <div className="mt-2 w-24 h-24 relative border rounded-md p-1 flex items-center justify-center bg-muted/30">
            <Image src={logoPreview} alt="Pratinjau Logo" fill style={{objectFit:"contain"}} className="rounded" onError={() => setLogoPreview(null)} data-ai-hint="school logo preview"/>
          </div>
        )}
         {!logoPreview && (
            <div className="mt-2 w-24 h-24 border rounded-md p-1 flex items-center justify-center bg-muted/30 text-muted-foreground text-xs text-center">
                <ImageIcon className="h-6 w-6 mb-1 text-muted-foreground/70" />
                Pratinjau Logo
            </div>
        )}
      </div>
      
      <hr className="my-6"/>
      <h3 className="text-lg font-semibold mb-3">Pengaturan Akun Admin Sekolah</h3>

      <div className="space-y-1.5">
        <Label htmlFor="adminEmail">Email Admin Sekolah</Label>
        <Input 
          id="adminEmail" 
          name="adminEmail" 
          type="email" 
          value={formData.adminEmail || ""} 
          onChange={handleChange} 
          required 
          disabled={isEditMode} // Disable editing admin email for existing schools for simplicity
        />
        {isEditMode && <p className="text-xs text-muted-foreground">Email admin tidak dapat diubah setelah sekolah dibuat.</p>}
      </div>

      {!isEditMode && handleAdminPasswordChange && (
        <div className="space-y-1.5">
          <Label htmlFor="adminPassword">Kata Sandi Admin Sekolah</Label>
          <Input 
            id="adminPassword" 
            name="adminPassword" 
            type="password" 
            value={adminPassword || ""} 
            onChange={handleAdminPasswordChange} 
            placeholder="Minimal 6 karakter"
            required 
            minLength={6}
          />
        </div>
      )}
      
      <hr className="my-6"/>
      <h3 className="text-lg font-semibold mb-3">Status & Langganan</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="subscriptionStatus">Status Langganan</Label>
          <Select name="subscriptionStatus" value={formData.subscriptionStatus || "trial"} onValueChange={(value) => handleSelectChange('subscriptionStatus', value)}>
            <SelectTrigger id="subscriptionStatus"><SelectValue /></SelectTrigger>
            <SelectContent>
              {subscriptionStatusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="isActive">Status Sekolah</Label>
          <Select name="isActive" value={formData.isActive === undefined ? "true" : String(formData.isActive)} onValueChange={(value) => handleSelectChange('isActive', value)}>
            <SelectTrigger id="isActive"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="paymentDetails">Catatan Pembayaran (Manual)</Label>
        <Textarea id="paymentDetails" name="paymentDetails" value={formData.paymentDetails || ""} onChange={handleChange} placeholder="cth., Pembayaran terakhir tanggal X, via Transfer Bank ABC" rows={2}/>
      </div>
    </>
  );
}

