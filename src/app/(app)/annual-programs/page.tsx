
"use client";

import { useState, useEffect } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import { CurriculumFormDialog } from "@/components/curriculum/CurriculumFormDialog";
import type { AnnualProgram, AnyCurriculumItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const initialAnnualProgramsData: AnnualProgram[] = [
  {
    id: "prota1",
    type: "PROTA",
    title: "PROTA Matematika Fase D 2024/2025",
    subject: "Matematika",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    year: "2024/2025",
    semester1Components: [
      { topic: "Bilangan", elemenCapaianPembelajaran: ["Memahami sifat-sifat bilangan", "Operasi hitung"], alokasiWaktu: "30 JP" },
      { topic: "Aljabar", elemenCapaianPembelajaran: ["Ekspresi aljabar", "Persamaan linear"], alokasiWaktu: "36 JP" },
    ],
    semester2Components: [
      { topic: "Geometri", elemenCapaianPembelajaran: ["Bangun datar", "Bangun ruang"], alokasiWaktu: "30 JP" },
      { topic: "Data dan Peluang", elemenCapaianPembelajaran: ["Penyajian data", "Analisis data sederhana"], alokasiWaktu: "24 JP" },
    ],
    profilPelajarPancasilaFocus: ["Bernalar Kritis", "Kreatif"],
    createdAt: new Date("2024-07-01T00:00:00Z").toISOString(),
    updatedAt: new Date("2024-07-05T00:00:00Z").toISOString(),
    createdByUserId: "user-3" 
  },
  {
    id: "prota2",
    type: "PROTA",
    title: "PROTA IPA Fase E 2024/2025",
    subject: "IPA (Fisika, Kimia, Biologi)",
    gradeLevel: "Fase E (Kelas 10 SMA/SMK)",
    year: "2024/2025",
    semester1Components: [
      { topic: "Fisika: Pengukuran dan Kinematika", elemenCapaianPembelajaran: ["Besaran dan satuan", "Gerak lurus"], alokasiWaktu: "24 JP" },
      { topic: "Kimia: Struktur Atom dan Ikatan Kimia", elemenCapaianPembelajaran: ["Model atom", "Jenis ikatan"], alokasiWaktu: "20 JP" },
      { topic: "Biologi: Keanekaragaman Hayati", elemenCapaianPembelajaran: ["Klasifikasi makhluk hidup", "Peran ekosistem"], alokasiWaktu: "20 JP" },
    ],
    semester2Components: [
      { topic: "Fisika: Dinamika dan Usaha Energi", elemenCapaianPembelajaran: ["Hukum Newton", "Konsep energi"], alokasiWaktu: "24 JP" },
      { topic: "Kimia: Stoikiometri dan Larutan", elemenCapaianPembelajaran: ["Konsep mol", "Sifat larutan"], alokasiWaktu: "20 JP" },
      { topic: "Biologi: Ekologi dan Perubahan Lingkungan", elemenCapaianPembelajaran: ["Interaksi dalam ekosistem", "Dampak aktivitas manusia"], alokasiWaktu: "20 JP" },
    ],
    profilPelajarPancasilaFocus: ["Gotong Royong", "Mandiri"],
    createdAt: new Date("2024-07-02T00:00:00Z").toISOString(),
    updatedAt: new Date("2024-07-06T00:00:00Z").toISOString(),
    createdByUserId: "user-1" 
  },
];

const ANNUAL_PROGRAMS_STORAGE_KEY = "appAnnualPrograms";

export default function AnnualProgramsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [annualPrograms, setAnnualPrograms] = useState<AnnualProgram[]>([]);
  const [editingItem, setEditingItem] = useState<AnnualProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      try {
        const storedAnnualPrograms = localStorage.getItem(ANNUAL_PROGRAMS_STORAGE_KEY);
        if (storedAnnualPrograms) {
          setAnnualPrograms(JSON.parse(storedAnnualPrograms));
        } else {
          setAnnualPrograms(initialAnnualProgramsData);
          localStorage.setItem(ANNUAL_PROGRAMS_STORAGE_KEY, JSON.stringify(initialAnnualProgramsData));
        }
      } catch (error) {
        console.error("Failed to access or parse localStorage for annual programs:", error);
        setAnnualPrograms(initialAnnualProgramsData); // Fallback
        toast({
          title: "Gagal Memuat Data Lokal",
          description: "Menggunakan data PROTA standar. Perubahan mungkin tidak tersimpan dengan benar.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const canCreate = user && (user.role === "Admin" || user.role === "WakaKurikulum");
  const canEdit = user && (user.role === "Admin" || user.role === "WakaKurikulum");
  const canDelete = user && (user.role === "Admin" || user.role === "WakaKurikulum");
  const canImport = user && (user.role === "Admin" || user.role === "WakaKurikulum");

  const handleCreateOrUpdate = (itemData: AnyCurriculumItem) => {
    const newItem = itemData as AnnualProgram;
    let updatedAnnualPrograms;

     if (!newItem.id) {
        newItem.id = `prota-${Date.now()}`;
        newItem.createdAt = new Date().toISOString();
    }
    newItem.updatedAt = new Date().toISOString();

    if (!newItem.createdByUserId && user) { 
        newItem.createdByUserId = user.id;
    }

    if (editingItem) {
      if (!canEdit) { 
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit PROTA.", variant: "destructive" });
        return;
      }
      updatedAnnualPrograms = annualPrograms.map(ap => ap.id === newItem.id ? newItem : ap);
    } else {
      if (!canCreate) { 
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk membuat PROTA baru.", variant: "destructive" });
        return;
      }
      updatedAnnualPrograms = [newItem, ...annualPrograms];
    }
    setAnnualPrograms(updatedAnnualPrograms);
    localStorage.setItem(ANNUAL_PROGRAMS_STORAGE_KEY, JSON.stringify(updatedAnnualPrograms));
    setEditingItem(null);
    setIsFormOpen(false);
    toast({ title: editingItem ? "PROTA Diperbarui" : "PROTA Dibuat", description: `"${newItem.title}" telah berhasil disimpan.`});
  };

  const handleEdit = (item: AnyCurriculumItem) => {
    if (!canEdit) { 
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit PROTA.", variant: "destructive" });
        return;
    }
    setEditingItem(item as AnnualProgram);
    setIsFormOpen(true);
  };

  const handleDelete = (itemToDelete: AnyCurriculumItem) => {
    if (!canDelete) { 
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk menghapus PROTA.", variant: "destructive" });
        return;
    }
     if (window.confirm(`Apakah Anda yakin ingin menghapus "${itemToDelete.title}"?`)) {
      const updatedAnnualPrograms = annualPrograms.filter(ap => ap.id !== itemToDelete.id);
      setAnnualPrograms(updatedAnnualPrograms);
      localStorage.setItem(ANNUAL_PROGRAMS_STORAGE_KEY, JSON.stringify(updatedAnnualPrograms));
      toast({ title: "PROTA Dihapus", description: `"${itemToDelete.title}" telah berhasil dihapus.`});
    }
  };

  const handleView = (item: AnyCurriculumItem) => {
    const prettyPrintJson = JSON.stringify(item, null, 2);
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    newWindow?.document.write(`<pre>${prettyPrintJson}</pre>`);
    newWindow?.document.close();
  };

  const filteredAnnualPrograms = isClient ? annualPrograms.filter(ap =>
    ap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ap.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ap.year.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (!isClient || !user) {
    return (
      <div className="space-y-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Memuat Program Tahunan...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Silakan tunggu...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Program Tahunan (PROTA)</CardTitle>
          <CardDescription>
            Kelola program tahun ajaran Anda. 
            {user.role === "KepalaSekolah" || user.role === "WakaKurikulum" || user.role === "TataUsaha" ? " Anda dapat melihat semua PROTA." : ""}
            {user.role === "Guru" ? " Lihat PROTA yang telah disusun." : ""}
            {(user.role === "Admin" || user.role === "WakaKurikulum") && " Anda dapat membuat, mengedit, dan menghapus PROTA."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
             <div className="flex-grow w-full relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari program tahunan..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none">
                <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
                {canImport && (
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => toast({title: "Fitur Belum Tersedia", description: "Impor PROTA akan segera hadir!"})}>
                      <FileUp className="mr-2 h-4 w-4" /> Impor
                  </Button>
                )}
            </div>
            {canCreate && (
              <div className="w-full sm:w-auto mt-2 sm:mt-0">
                  <CurriculumFormDialog
                  triggerButtonText="Buat Program Baru"
                  dialogTitle="Buat Program Tahunan Baru (PROTA)"
                  dialogDescription="Definisikan struktur untuk seluruh tahun ajaran sesuai Kurikulum Merdeka."
                  itemType="PROTA"
                  onSubmit={handleCreateOrUpdate}
                  initialData={null}
                  forceOpen={isFormOpen && !editingItem}
                  onOpenChange={(open) => {
                    if (!open) {
                      setEditingItem(null);
                    }
                    setIsFormOpen(open);
                  }}
                  />
              </div>
            )}
          </div>
          <CurriculumDataTable
            items={filteredAnnualPrograms}
            onView={handleView}
            onEdit={canEdit ? handleEdit : undefined} 
            onDelete={canDelete ? handleDelete : undefined} 
            canEdit={() => canEdit} 
            canDelete={() => canDelete} 
            itemTypeForExport="PROTA"
          />
        </CardContent>
      </Card>
      {editingItem && canEdit && (
         <CurriculumFormDialog
            triggerButtonText="Pemicu Edit Tersembunyi"
            dialogTitle={`Edit Program Tahunan: ${editingItem.title}`}
            dialogDescription="Perbarui rincian untuk program tahunan ini."
            itemType="PROTA"
            initialData={editingItem}
            onSubmit={handleCreateOrUpdate}
            forceOpen={isFormOpen && !!editingItem}
            onOpenChange={(open) => {
              if (!open) {
                setEditingItem(null);
              }
              setIsFormOpen(open);
            }}
        />
      )}
    </div>
  );
}
