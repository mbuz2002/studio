"use client";

import { useState, useEffect } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import { CurriculumFormDialog } from "@/components/curriculum/CurriculumFormDialog";
import type { SemesterProgram, AnyCurriculumItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search } from "lucide-react";

const initialSemesterPrograms: SemesterProgram[] = [
  {
    id: "promes1",
    type: "Promes",
    title: "Matematika Fase D - Semester Ganjil",
    subject: "Matematika",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    semester: "1",
    year: "2023/2024",
    weeklyBreakdown: [
      { week: 1, topic: "Pengenalan Bilangan", activities: "Lembar Kerja" },
      { week: 2, topic: "Operasi Dasar", activities: "Proyek Kelompok" },
    ],
    createdAt: new Date("2023-08-25T00:00:00Z").toISOString(),
    updatedAt: new Date("2023-08-28T00:00:00Z").toISOString(),
  },
  {
    id: "promes2",
    type: "Promes",
    title: "IPA Fase D - Semester Genap",
    subject: "IPA",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    semester: "2",
    year: "2023/2024",
    weeklyBreakdown: [
      { week: 1, topic: "Dinamika Ekosistem", activities: "Kunjungan Lapangan" },
      { week: 2, topic: "Dampak Manusia terhadap Lingkungan", activities: "Debat" },
    ],
    createdAt: new Date("2024-01-10T00:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-15T00:00:00Z").toISOString(),
  },
];

export default function SemesterProgramsPage() {
  const [semesterPrograms, setSemesterPrograms] = useState<SemesterProgram[]>(initialSemesterPrograms);
  const [editingItem, setEditingItem] = useState<SemesterProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCreateOrUpdate = (itemData: AnyCurriculumItem) => {
    const newItem = itemData as SemesterProgram;
    if (editingItem) {
      setSemesterPrograms(semesterPrograms.map(sp => sp.id === newItem.id ? newItem : sp));
    } else {
      setSemesterPrograms([newItem, ...semesterPrograms]);
    }
    setEditingItem(null);
  };

  const handleEdit = (item: AnyCurriculumItem) => {
    setEditingItem(item as SemesterProgram);
  };

  const handleDelete = (itemToDelete: AnyCurriculumItem) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${itemToDelete.title}"?`)) {
      setSemesterPrograms(semesterPrograms.filter(sp => sp.id !== itemToDelete.id));
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

  const filteredSemesterPrograms = isClient ? semesterPrograms.filter(sp =>
    sp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `Semester ${sp.semester}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];


  if (!isClient) {
    return (
      <div className="space-y-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Memuat Program Semester...</CardTitle>
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
          <CardTitle className="text-2xl">Program Semester (Promes)</CardTitle>
          <CardDescription>Rincikan rencana pengajaran Anda untuk setiap semester. Atur topik dan kegiatan mingguan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
            <div className="flex-grow w-full relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari program semester..."
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
                dialogTitle="Buat Program Semester Baru"
                dialogDescription="Rancang kurikulum Anda untuk semester tertentu (Promes)."
                itemType="Promes"
                onSubmit={handleCreateOrUpdate}
                initialData={null}
                />
            </div>
          </div>
          <CurriculumDataTable
            items={filteredSemesterPrograms}
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
                dialogTitle={`Edit Program Semester: ${editingItem.title}`}
                dialogDescription="Perbarui rincian untuk program semester ini."
                itemType="Promes"
                initialData={editingItem}
                onSubmit={handleCreateOrUpdate}
            />
         </div>
      )}
    </div>
  );
}
