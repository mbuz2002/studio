"use client";

import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { School, EducationLevel, CustomDomainStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Link2, UploadCloud, Calendar as CalendarIcon, Globe, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface SchoolFormFieldsProps {
  formData: Partial<School>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleLogoUrlChange: (url: string) => void;
  adminPassword?: string;
  handleAdminPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

const customDomainStatusOptions: { value: CustomDomainStatus; label: string }[] = [
  { value: "unconfigured", label: "Belum Dikonfigurasi" },
  { value: "pending_verification", label: "Menunggu Verifikasi DNS" },
  { value: "active", label: "Aktif & Terverifikasi" },
  { value: "configuration_error", label: "Kesalahan Konfigurasi DNS" },
  { value: "ssl_error", label: "Kesalahan SSL" },
];

const slugify = (text: string = ""): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '') 
    .replace(/--+/g, '-') 
    .replace(/^-+/, '') 
    .replace(/-+$/, '') 
    .substring(0, 50); 
};


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

  const [startDate, setStartDate] = useState<Date | undefined>(formData.subscriptionStartDate ? parseISO(formData.subscriptionStartDate) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(formData.subscriptionEndDate ? parseISO(formData.subscriptionEndDate) : undefined);


  useEffect(() => {
    setLogoPreview(formData.logoUrl || null);
    if (formData.logoUrl && formData.logoUrl.startsWith("data:image")) {
      setLogoInputMethod("upload");
    } else if (formData.logoUrl) {
      setLogoInputMethod("url");
    } else {
      setLogoInputMethod("url");
    }
    setStartDate(formData.subscriptionStartDate ? parseISO(formData.subscriptionStartDate) : undefined);
    setEndDate(formData.subscriptionEndDate ? parseISO(formData.subscriptionEndDate) : undefined);
  }, [formData.logoUrl, formData.subscriptionStartDate, formData.subscriptionEndDate]);


  const onLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Ukuran File Logo Terlalu Besar", description: "Maksimal 2MB.", variant: "destructive" });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setLogoPreview(dataUri);
        handleLogoUrlChange(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const onLogoUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    if (logoInputMethod === 'url') {
      setLogoPreview(e.target.value);
      handleLogoUrlChange(e.target.value);
    }
  };

  const handleDateChange = (date: Date | undefined, fieldName: 'subscriptionStartDate' | 'subscriptionEndDate') => {
    if (fieldName === 'subscriptionStartDate') {
      setStartDate(date);
      handleSelectChange(fieldName, date ? date.toISOString() : "");
      if (endDate && date && isBefore(endDate, date)) {
        setEndDate(undefined);
        handleSelectChange('subscriptionEndDate', "");
      }
    } else if (fieldName === 'subscriptionEndDate') {
      setEndDate(date);
      handleSelectChange(fieldName, date ? date.toISOString() : "");
    }
  };

  const isBefore = (date1: Date, date2: Date) => date1 < date2;
  
  const generatedSubdomain = formData.name ? `${slugify(formData.name)}.gumpla.ai` : "subdomain.gumpla.ai";
  const isCustomDomainEmpty = !formData.customDomain || formData.customDomain.trim() === "";


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
          disabled={isEditMode}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="subscriptionStartDate">Tanggal Mulai Langganan</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal h-10"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", {locale: indonesianLocale}) : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => handleDateChange(date, 'subscriptionStartDate')}
                initialFocus
                locale={indonesianLocale}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subscriptionEndDate">Tanggal Akhir Langganan</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal h-10"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP", {locale: indonesianLocale}) : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => handleDateChange(date, 'subscriptionEndDate')}
                initialFocus
                locale={indonesianLocale}
                disabled={ startDate ? { before: startDate } : undefined}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="paymentDetails">Catatan Pembayaran (Manual)</Label>
        <Textarea id="paymentDetails" name="paymentDetails" value={formData.paymentDetails || ""} onChange={handleChange} placeholder="cth., Pembayaran terakhir tanggal X, via Transfer Bank ABC untuk periode Y bulan/tahun" rows={2}/>
      </div>

      <hr className="my-6"/>
      <h3 className="text-lg font-semibold mb-3">Pengaturan Domain</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="customDomain">Domain Kustom (Opsional)</Label>
          <Input id="customDomain" name="customDomain" value={formData.customDomain || ""} onChange={handleChange} placeholder="cth., kurikulum.sekolahanda.sch.id" />
           {!formData.customDomain && (
            <p className="text-xs text-muted-foreground mt-1">
              Jika kosong, akan menggunakan subdomain: <strong className="text-primary">{generatedSubdomain}</strong>
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="customDomainStatus">Status Domain Kustom</Label>
          <Select 
            name="customDomainStatus" 
            value={isCustomDomainEmpty ? "unconfigured" : (formData.customDomainStatus || "unconfigured")} 
            onValueChange={(value) => handleSelectChange('customDomainStatus', value)}
            disabled={isCustomDomainEmpty}
          >
            <SelectTrigger id="customDomainStatus">
              <SelectValue placeholder={isCustomDomainEmpty ? "Subdomain (Otomatis Aktif)" : "Pilih Status Domain"} />
            </SelectTrigger>
            <SelectContent>
              {customDomainStatusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value} disabled={isCustomDomainEmpty && opt.value !== "unconfigured"}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Alert variant="default" className="mt-4 border-accent/30">
        <Globe className="h-5 w-5 text-accent" />
        <AlertTitle className="font-semibold text-accent">Informasi Pengaturan Domain</AlertTitle>
        <AlertDescription className="text-sm">
          Jika Anda ingin menggunakan domain kustom, masukkan nama domain di atas. Kemudian, Anda perlu mengkonfigurasi CNAME record domain kustom Anda (misalnya, `kurikulum.sekolahanda.sch.id`) untuk diarahkan ke `app.gumpla.ai` (atau target yang disediakan).
          Status domain akan diatur oleh Super Admin setelah verifikasi DNS.
          Jika kolom domain kustom dikosongkan, sekolah akan otomatis dapat diakses melalui subdomain yang dibuat berdasarkan nama sekolah (contoh: <strong>{generatedSubdomain}</strong>) dan status domain akan otomatis menjadi "unconfigured".
        </AlertDescription>
      </Alert>

    </>
  );
}
