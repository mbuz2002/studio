
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Save } from 'lucide-react'; // Added Save
import type { ModulAjar } from '@/types';
import { MODUL_AJAR_STORAGE_KEY } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLog } from '@/contexts/LogContext';
import { Input } from '@/components/ui/input'; // Added Input
import { Label } from '@/components/ui/label'; // Added Label

export default function EditModulAjarPage() {
  const params = useParams();
  const router = useRouter();
  const { id: modulAjarId } = params;
  const { user, loading: authLoading } = useAuth(); // Added authLoading
  const { toast } = useToast();
  const { addLog } = useLog();

  const [modulAjar, setModulAjar] = useState<ModulAjar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Added isSaving state

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading

    if (!modulAjarId || !user) {
      router.push('/modul-ajar');
      return;
    }

    const storedItems = localStorage.getItem(MODUL_AJAR_STORAGE_KEY);
    if (storedItems) {
      const items: ModulAjar[] = JSON.parse(storedItems);
      const itemToEdit = items.find(item => item.id === modulAjarId);
      if (itemToEdit) {
        const canEdit = user.role === "Admin" || user.role === "WakaKurikulum" || (user.role === "Guru" && itemToEdit.createdByUserId === user.id);
        if (!canEdit) {
            toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit Modul Ajar ini.", variant: "destructive" });
            router.push("/modul-ajar");
            return;
        }
        setModulAjar(itemToEdit);
        addLog("INFO", `Memuat Modul Ajar "${itemToEdit.title}" (ID: ${modulAjarId}) untuk diedit oleh ${user.email}.`, "EditModulAjarPage");
      } else {
        toast({ title: "Modul Ajar Tidak Ditemukan", description: "Modul Ajar yang Anda cari tidak ada.", variant: "destructive" });
        router.push('/modul-ajar');
      }
    }
    setIsLoading(false);
  }, [modulAjarId, user, router, toast, addLog, authLoading]);

  if (isLoading || authLoading) {
    return (
      <div className="flex h-[calc(100vh-150px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Memuat data Modul Ajar...</p>
      </div>
    );
  }

  if (!modulAjar) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive text-lg">Modul Ajar tidak ditemukan.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Basic update for now, can be expanded
    if(modulAjar) {
        const updatedModulAjar = { ...modulAjar, updatedAt: new Date().toISOString() };
        
        const existingModules = JSON.parse(localStorage.getItem(MODUL_AJAR_STORAGE_KEY) || "[]") as ModulAjar[];
        const updatedModules = existingModules.map(m => m.id === modulAjar.id ? updatedModulAjar : m);
        localStorage.setItem(MODUL_AJAR_STORAGE_KEY, JSON.stringify(updatedModules));
        
        toast({ title: "Modul Ajar Diperbarui", description: `"${modulAjar.title}" telah berhasil diperbarui.` });
        addLog("INFO", `Modul Ajar "${modulAjar.title}" (ID: ${modulAjar.id}) diperbarui oleh ${user?.email}.`, "EditModulAjarPage");
        router.push("/modul-ajar");
    } else {
        toast({ title: "Gagal Menyimpan", description: "Data modul tidak ditemukan.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
             <ArrowLeft className="h-6 w-6 text-primary-foreground cursor-pointer hover:opacity-80" onClick={() => router.back()} />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Edit Modul Ajar</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1 truncate max-w-md sm:max-w-lg md:max-w-xl">
                {modulAjar.title}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-muted-foreground text-center py-4">
              Formulir edit Modul Ajar yang lebih detail akan tersedia di masa mendatang. <br/>
              Untuk saat ini, Anda dapat mengubah judul dan mata pelajaran.
            </p>
            <div className="space-y-2">
                <Label htmlFor="editTitle">Judul Modul Ajar</Label>
                <Input 
                    id="editTitle" 
                    value={modulAjar.title} 
                    onChange={(e) => setModulAjar(prev => prev ? {...prev, title: e.target.value, judulModul: e.target.value } : null)} 
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="editSubject">Mata Pelajaran</Label>
                <Input 
                    id="editSubject" 
                    value={modulAjar.subject} 
                    onChange={(e) => setModulAjar(prev => prev ? {...prev, subject: e.target.value, identitasModul: {...prev.identitasModul, mataPelajaran: e.target.value} } : null)} 
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="editFase">Fase</Label>
                <Input 
                    id="editFase" 
                    value={modulAjar.identitasModul.fase} 
                    onChange={(e) => setModulAjar(prev => prev ? {...prev, gradeLevel: e.target.value, identitasModul: {...prev.identitasModul, fase: e.target.value} } : null)} 
                />
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push('/modul-ajar')} className="w-full sm:w-auto" disabled={isSaving}>
                Kembali ke Daftar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
