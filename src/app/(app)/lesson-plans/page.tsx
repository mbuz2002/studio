"use client";

import { useState } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import { CurriculumFormDialog } from "@/components/curriculum/CurriculumFormDialog";
import type { LessonPlan, AnyCurriculumItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search } from "lucide-react";

const initialLessonPlans: LessonPlan[] = [
  {
    id: "rpp1",
    type: "RPP",
    title: "Pengenalan Aljabar",
    subject: "Matematika",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    topic: "Ekspresi Aljabar Dasar",
    learningObjectives: ["Memahami variabel", "Menyelesaikan persamaan sederhana"],
    activities: ["Ceramah", "Kerja kelompok", "Kuis"],
    assessment: "Lembar kerja dan kuis",
    createdAt: new Date("2023-09-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2023-09-05T14:30:00Z").toISOString(),
  },
  {
    id: "rpp2",
    type: "RPP",
    title: "Proses Fotosintesis",
    subject: "IPA",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    topic: "Memahami Fotosintesis",
    learningObjectives: ["Menjelaskan proses", "Mengidentifikasi komponen kunci"],
    activities: ["Eksperimen", "Presentasi", "Diskusi"],
    assessment: "Laporan praktikum",
    materials: "Tanaman, sumber cahaya, buku teks",
    createdAt: new Date("2023-10-10T09:00:00Z").toISOString(),
    updatedAt: new Date("2023-10-12T11:00:00Z").toISOString(),
  },
];

export default function LessonPlansPage() {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(initialLessonPlans);
  const [editingItem, setEditingItem] = useState<LessonPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateOrUpdate = (itemData: AnyCurriculumItem) => {
    const newItem = itemData as LessonPlan; 
    if (editingItem) {
      setLessonPlans(lessonPlans.map(lp => lp.id === newItem.id ? newItem : lp));
    } else {
      setLessonPlans([newItem, ...lessonPlans]);
    }
    setEditingItem(null);
  };

  const handleEdit = (item: AnyCurriculumItem) => {
    setEditingItem(item as LessonPlan);
  };

  const handleDelete = (itemToDelete: AnyCurriculumItem) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${itemToDelete.title}"?`)) {
      setLessonPlans(lessonPlans.filter(lp => lp.id !== itemToDelete.id));
    }
  };
  
  const handleView = (item: AnyCurriculumItem) => {
    alert(`Melihat: ${item.title}\n\nRincian:\n${JSON.stringify(item, null, 2)}`);
  };

  const filteredLessonPlans = lessonPlans.filter(lp =>
    lp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lp.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Rencana Pembelajaran (RPP)</CardTitle>
          <CardDescription>Kelola rencana pembelajaran harian dan mingguan Anda. Buat rencana baru, edit yang sudah ada, atau lihat rincian.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-grow relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari rencana pembelajaran..."
                className="pl-8 sm:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
             <Button variant="outline">
                <FileUp className="mr-2 h-4 w-4" /> Impor Data
            </Button>
            <CurriculumFormDialog
              triggerButtonText="Buat Rencana Pembelajaran Baru"
              dialogTitle="Buat Rencana Pembelajaran Baru"
              dialogDescription="Isi rincian untuk rencana pembelajaran baru Anda (RPP)."
              itemType="RPP"
              onSubmit={handleCreateOrUpdate}
              initialData={editingItem} 
            />
          </div>
          <CurriculumDataTable
            items={filteredLessonPlans}
            onView={handleView}
            onEdit={handleEdit} 
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditingItem(null)} />
      )}
      {editingItem && (
         <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <CurriculumFormDialog
                triggerButtonText="Pemicu Edit Tersembunyi" 
                dialogTitle={`Edit Rencana Pembelajaran: ${editingItem.title}`}
                dialogDescription="Perbarui rincian untuk rencana pembelajaran ini."
                itemType="RPP"
                initialData={editingItem}
                onSubmit={handleCreateOrUpdate}
            />
         </div>
      )}

    </div>
  );
}
