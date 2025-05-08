
"use client";

import { useState, useEffect } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import { CurriculumFormDialog } from "@/components/curriculum/CurriculumFormDialog";
import type { AnnualProgram, AnyCurriculumItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const initialAnnualPrograms: AnnualProgram[] = [
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
    createdByUserId: "waka-prota1"
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
    createdByUserId: "admin-prota2"
  },
];

export default function AnnualProgramsPage() {
  const { user } = useAuth();
  const [annualPrograms, setAnnualPrograms] = useState<AnnualProgram[]>(initialAnnualPrograms);
  const [editingItem, setEditingItem] = useState<AnnualProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // For KepalaSekolah/WakaKurikulum/TataUsaha/Admin, fetch all. Gurus view only (or their own if applicable).
     if (user && (user.role === "KepalaSekolah" || user.role === "WakaKurikulum" || user.role === "TataUsaha" || user.role === "Admin")) {
        setAnnualPrograms(initialAnnualPrograms);
    } else if (user && user.role === "Guru") {
        // PROTA/Promes are typically not user-specific to one Guru in the same way RPPs are.
        // Gurus would typically view PROTA/Promes relevant to their subject/grade.
        // For demo, they see all.
        setAnnualPrograms(initialAnnualPrograms);
    }
  }, [user]);

  // Role-based permissions for PROTA
  // Create, Edit, Delete: Admin, WakaKurikulum.
  // View: All roles (Admin, KepalaSekolah, WakaKurikulum, TataUsaha, Guru).
  const canCreate = user && (user.role === "Admin" || user.role === "WakaKurikulum");
  const canEdit = user && (user.role === "Admin" || user.role === "WakaKurikulum");
  const canDelete = user && (user.role === "Admin" || user.role === "WakaKurikulum");
  const canImport = user && (user.role === "Admin" || user.role === "WakaKurikulum");

  const handleCreateOrUpdate = (itemData: AnyCurriculumItem) => {
    const newItem = itemData as AnnualProgram;
     if (!newItem.createdByUserId && user) { 
        newItem.createdByUserId = user.id;
    }

    if (editingItem) {
      if (!canEdit) { // Checks Admin/Waka permission for PROTA
        alert("Anda tidak memiliki izin untuk mengedit PROTA.");
        return;
      }
      setAnnualPrograms(annualPrograms.map(ap => ap.id === newItem.id ? newItem : ap));
    } else {
      if (!canCreate) { // Checks Admin/Waka permission for PROTA
        alert("Anda tidak memiliki izin untuk membuat PROTA baru.");
        return;
      }
      setAnnualPrograms([newItem, ...annualPrograms]);
    }
    setEditingItem(null);
  };

  const handleEdit = (item: AnyCurriculumItem) => {
    if (!canEdit) { // Checks Admin/Waka permission for PROTA
        alert("Anda tidak memiliki izin untuk mengedit PROTA.");
        return;
    }
    setEditingItem(item as AnnualProgram);
  };

  const handleDelete = (itemToDelete: AnyCurriculumItem) => {
    if (!canDelete) { // Checks Admin/Waka permission for PROTA
        alert("Anda tidak memiliki izin untuk menghapus PROTA.");
        return;
    }
     if (window.confirm(`Apakah Anda yakin ingin menghapus "${itemToDelete.title}"?`)) {
      setAnnualPrograms(annualPrograms.filter(ap => ap.id !== itemToDelete.id));
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
            {user.role === "Admin" && " Anda dapat membuat, mengedit, dan menghapus PROTA."}
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
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => alert("Fitur impor belum diimplementasikan.")}>
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
                  />
              </div>
            )}
          </div>
          <CurriculumDataTable
            items={filteredAnnualPrograms}
            onView={handleView}
            onEdit={canEdit ? handleEdit : undefined} // Pass function or undefined
            onDelete={canDelete ? handleDelete : undefined} // Pass function or undefined
            canEdit={() => canEdit} // Pass explicit permission check for PROTA
            canDelete={() => canDelete} // Pass explicit permission check for PROTA
            itemTypeForExport="PROTA"
          />
        </CardContent>
      </Card>
      {editingItem && canEdit && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setEditingItem(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-2xl">
              <CurriculumFormDialog
                  triggerButtonText="Pemicu Edit Tersembunyi" 
                  dialogTitle={`Edit Program Tahunan: ${editingItem.title}`}
                  dialogDescription="Perbarui rincian untuk program tahunan ini."
                  itemType="PROTA"
                  initialData={editingItem}
                  onSubmit={handleCreateOrUpdate}
              />
          </div>
        </>
      )}
    </div>
  );
}
