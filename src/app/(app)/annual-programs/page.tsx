"use client";

import { useState, useEffect } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import { CurriculumFormDialog } from "@/components/curriculum/CurriculumFormDialog";
import type { AnnualProgram, AnyCurriculumItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search } from "lucide-react";

const initialAnnualPrograms: AnnualProgram[] = [
  {
    id: "prota1",
    type: "PROTA",
    title: "Program Matematika 2023/2024",
    subject: "Matematika",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    year: "2023/2024",
    semester1Topics: ["Dasar-Dasar Aljabar", "Fundamental Geometri"],
    semester2Topics: ["Statistika", "Aljabar Lanjutan"],
    createdAt: new Date("2023-08-15T00:00:00Z").toISOString(),
    updatedAt: new Date("2023-08-20T00:00:00Z").toISOString(),
  },
  {
    id: "prota2",
    type: "PROTA",
    title: "Kurikulum IPA Fase D",
    subject: "IPA",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    year: "2023/2024",
    semester1Topics: ["Fisika: Gerak & Gaya", "Kimia: Unsur & Senyawa"],
    semester2Topics: ["Biologi: Ekosistem", "Ilmu Bumi: Lempeng Tektonik"],
    createdAt: new Date("2023-08-10T00:00:00Z").toISOString(),
    updatedAt: new Date("2023-08-18T00:00:00Z").toISOString(),
  },
];

export default function AnnualProgramsPage() {
  const [annualPrograms, setAnnualPrograms] = useState<AnnualProgram[]>(initialAnnualPrograms);
  const [editingItem, setEditingItem] = useState<AnnualProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCreateOrUpdate = (itemData: AnyCurriculumItem) => {
    const newItem = itemData as AnnualProgram;
    if (editingItem) {
      setAnnualPrograms(annualPrograms.map(ap => ap.id === newItem.id ? newItem : ap));
    } else {
      setAnnualPrograms([newItem, ...annualPrograms]);
    }
    setEditingItem(null);
  };

  const handleEdit = (item: AnyCurriculumItem) => {
    setEditingItem(item as AnnualProgram);
  };

  const handleDelete = (itemToDelete: AnyCurriculumItem) => {
     if (window.confirm(`Apakah Anda yakin ingin menghapus "${itemToDelete.title}"?`)) {
      setAnnualPrograms(annualPrograms.filter(ap => ap.id !== itemToDelete.id));
    }
  };

  const handleView = (item: AnyCurriculumItem) => {
    // Replace alert with a modal or a dedicated view component for better UX
    const prettyPrintJson = JSON.stringify(item, null, 2);
    const newWindow = window.open();
    newWindow?.document.write(`<pre>${prettyPrintJson}</pre>`);
    newWindow?.document.close();
    // alert(`Melihat: ${item.title}\n\nRincian:\n${JSON.stringify(item, null, 2)}`);
  };

  const filteredAnnualPrograms = isClient ? annualPrograms.filter(ap =>
    ap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ap.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ap.year.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (!isClient) {
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
          <CardDescription>Kelola program tahun ajaran Anda. Rencanakan tujuan dan struktur kurikulum jangka panjang.</CardDescription>
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
                <Button variant="outline" className="flex-1 sm:flex-none">
                    <FileUp className="mr-2 h-4 w-4" /> Impor
                </Button>
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
                <CurriculumFormDialog
                triggerButtonText="Buat Program Baru"
                dialogTitle="Buat Program Tahunan Baru"
                dialogDescription="Definisikan struktur untuk seluruh tahun ajaran (PROTA)."
                itemType="PROTA"
                onSubmit={handleCreateOrUpdate}
                initialData={null}
                />
            </div>
          </div>
          <CurriculumDataTable
            items={filteredAnnualPrograms}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setEditingItem(null)} />
      )}
      {editingItem && (
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
      )}
    </div>
  );
}
