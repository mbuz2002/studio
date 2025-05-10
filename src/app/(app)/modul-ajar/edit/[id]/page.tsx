
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { ModulAjar } from '@/types';
import { MODUL_AJAR_STORAGE_KEY } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLog } from '@/contexts/LogContext';

export default function EditModulAjarPage() {
  const params = useParams();
  const router = useRouter();
  const { id: modulAjarId } = params;
  const { user } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [modulAjar, setModulAjar] = useState<ModulAjar | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, [modulAjarId, user, router, toast, addLog]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat data Modul Ajar...</p>
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

  // Placeholder form - full implementation is complex and deferred
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Fitur Dalam Pengembangan", description: "Penyimpanan perubahan Modul Ajar akan segera hadir." });
    addLog("INFO", `Pengguna ${user?.email} mencoba menyimpan perubahan Modul Ajar "${modulAjar.title}" (ID: ${modulAjar.id}), fitur dalam pengembangan.`, "EditModulAjarPage");

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
            <p className="text-muted-foreground">
              Formulir edit Modul Ajar yang komprehensif akan tersedia di sini. Untuk saat ini, fitur ini masih dalam tahap pengembangan.
            </p>
            <div className="space-y-2">
                <Label htmlFor="editTitle">Judul Modul Ajar</Label>
                <Input id="editTitle" defaultValue={modulAjar.title} disabled />
            </div>
             <div className="space-y-2">
                <Label htmlFor="editSubject">Mata Pelajaran</Label>
                <Input id="editSubject" defaultValue={modulAjar.subject} disabled />
            </div>

            {/* Add more disabled fields or a message about editing details */}
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push('/modul-ajar')} className="w-full sm:w-auto">
                Kembali ke Daftar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                Simpan Perubahan (Pengembangan)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
