
"use client";

import { useState, useEffect, type FormEvent, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, Save, UploadCloud, Link2, Image as ImageIcon } from "lucide-react";
import type { AppSettings } from "@/types";
import { SAAS_APP_SETTINGS_STORAGE_KEY } from "@/types";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useLog } from "@/contexts/LogContext";

const initialAppSettings: AppSettings = {
  appName: "GUMPLA AI",
  appLogoUrl: "", // Default to no logo, will show GraduationCap
};

export default function AppSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [settings, setSettings] = useState<AppSettings>(initialAppSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoInputMethod, setLogoInputMethod] = useState<'url' | 'upload'>('url');

  useEffect(() => {
    if (!authLoading) {
      if (user?.role !== "SuperAdmin") {
        toast({ title: "Akses Ditolak", variant: "destructive" });
        router.push("/dashboard");
        return;
      }
      
      const storedAppSettings = localStorage.getItem(SAAS_APP_SETTINGS_STORAGE_KEY);
      if (storedAppSettings) {
        try {
          const parsedSettings = JSON.parse(storedAppSettings);
          const completeSettings = { ...initialAppSettings, ...parsedSettings };
          setSettings(completeSettings);
          setLogoPreview(completeSettings.appLogoUrl || null);
           if (completeSettings.appLogoUrl && completeSettings.appLogoUrl.startsWith("data:image")) {
            setLogoInputMethod("upload");
          } else if (completeSettings.appLogoUrl) {
            setLogoInputMethod("url");
          }
        } catch (e) {
          console.error("Failed to parse app settings", e);
          setSettings(initialAppSettings); // Fallback to initial if parsing fails
        }
      } else {
        setSettings(initialAppSettings); // Use initial if nothing stored
      }
      setPageLoading(false);
    }
  }, [user, authLoading, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    if (name === "appLogoUrl" && logoInputMethod === 'url') {
      setLogoPreview(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit for app logo
        toast({ title: "Ukuran File Terlalu Besar", description: "Ukuran file logo maksimal 1MB.", variant: "destructive" });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setSettings((prev) => ({ ...prev, appLogoUrl: dataUri }));
        setLogoPreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const finalSettings = { ...settings, appLogoUrl: logoPreview };

    localStorage.setItem(SAAS_APP_SETTINGS_STORAGE_KEY, JSON.stringify(finalSettings));
    setIsLoading(false);
    toast({ title: "Pengaturan Aplikasi Disimpan", description: "Perubahan telah berhasil disimpan." });
    addLog("INFO", `SuperAdmin ${user?.email} memperbarui pengaturan aplikasi.`, "AppSettingsPage");
    // No redirect needed, stay on the page. Potentially trigger a context update if settings are used globally.
  };

  if (pageLoading || authLoading) {
    return <LoadingSpinner message="Memuat Pengaturan Aplikasi..." icon={<SlidersHorizontal className="h-12 w-12 animate-pulse text-primary mb-4"/>} />;
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-8 w-8 text-primary-foreground drop-shadow" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">Pengaturan Aplikasi Global</CardTitle>
              <CardDescription className="text-primary-foreground/90 mt-1">
                Konfigurasi nama aplikasi dan logo yang akan ditampilkan secara global.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="appName" className="text-lg font-medium">Nama Aplikasi</Label>
              <Input 
                id="appName" 
                name="appName" 
                value={settings.appName || ""} 
                onChange={handleChange} 
                className="text-base h-11"
                placeholder="Contoh: GUMPLA AI Anda"
              />
              <p className="text-sm text-muted-foreground">Nama ini akan muncul di header sidebar.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-lg font-medium">Logo Aplikasi</Label>
               <Tabs value={logoInputMethod} onValueChange={(value) => setLogoInputMethod(value as 'url' | 'upload')} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-4">
                    <TabsTrigger value="url"><Link2 className="mr-2 h-4 w-4" /> Masukkan URL Logo</TabsTrigger>
                    <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4" /> Unggah File Logo</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="pt-2">
                    <div className="space-y-1">
                      <Label htmlFor="appLogoUrl">URL Logo</Label>
                      <Input 
                        id="appLogoUrl" 
                        name="appLogoUrl" 
                        type="url" 
                        value={logoInputMethod === 'url' ? (settings.appLogoUrl || '') : ''} 
                        onChange={handleChange} 
                        placeholder="https://contoh.com/logoaplikasi.png" 
                        disabled={logoInputMethod !== 'url'}
                        className="text-base h-11"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="upload" className="pt-2">
                    <div className="space-y-1">
                      <Label htmlFor="appLogoFile">Pilih File Logo</Label>
                      <Input 
                        id="appLogoFile" 
                        name="appLogoFile" 
                        type="file" 
                        accept="image/png, image/jpeg, image/svg+xml, image/gif, image/webp" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        disabled={logoInputMethod !== 'upload'}
                        className="text-base h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">Format: PNG, JPG, SVG, GIF, WebP. Maks: 1MB.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              {logoPreview ? (
                <div className="mt-4">
                  <Label>Pratinjau Logo Aplikasi:</Label>
                  <div className="mt-2 w-28 h-28 relative border rounded-md p-2 flex items-center justify-center bg-muted/30">
                    <Image 
                      src={logoPreview} 
                      alt="Pratinjau Logo Aplikasi" 
                      fill 
                      style={{ objectFit: "contain" }} 
                      className="rounded"
                      onError={() => setLogoPreview(null)} // Clear preview on error
                      data-ai-hint="application logo"
                    />
                  </div>
                </div>
              ) : (
                 <div className="mt-4">
                    <Label>Pratinjau Logo Aplikasi:</Label>
                    <div className="mt-2 w-28 h-28 border rounded-md p-2 flex items-center justify-center bg-muted/30 text-muted-foreground text-xs text-center">
                        <ImageIcon className="h-8 w-8 mb-1 text-muted-foreground/70" />
                        Tidak ada logo atau URL tidak valid.
                    </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">Logo ini akan menggantikan logo default di sidebar.</p>
            </div>

            <div className="pt-6 border-t">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Menyimpan..." : "Simpan Pengaturan Aplikasi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
