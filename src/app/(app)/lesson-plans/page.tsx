
"use client";

import { useState, useEffect } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import { CurriculumFormDialog } from "@/components/curriculum/CurriculumFormDialog";
import type { LessonPlan, AnyCurriculumItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const initialLessonPlans: LessonPlan[] = [
  {
    id: "rpp1",
    type: "RPP",
    title: "Pengenalan Aljabar Kurikulum Merdeka",
    subject: "Matematika",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    topic: "Ekspresi Aljabar Dasar dan Pola Bilangan",
    learningObjectives: ["Memahami konsep variabel, koefisien, dan konstanta", "Mengidentifikasi dan melanjutkan pola bilangan", "Menyelesaikan persamaan linear satu variabel sederhana"],
    pemahamanBermakna: ["Aljabar membantu kita memodelkan situasi dunia nyata.", "Pola bilangan ada di sekitar kita dan dapat diprediksi."],
    pertanyaanPemantik: ["Apa yang terjadi jika kita tidak tahu suatu nilai?", "Bagaimana kita bisa menemukan angka berikutnya dalam suatu barisan?"],
    langkahPembelajaran: {
      pendahuluan: ["Salam dan doa", "Apersepsi: Mengaitkan dengan teka-teki angka", "Menyampaikan tujuan pembelajaran"],
      kegiatanInti: ["Diskusi kelompok: Mengidentifikasi variabel dalam soal cerita", "Eksplorasi: Menemukan pola pada barisan bilangan", "Latihan individu: Menyelesaikan persamaan sederhana"],
      penutup: ["Refleksi: Apa yang paling menarik hari ini?", "Kesimpulan bersama", "Informasi tugas proyek kecil"],
    },
    assessment: "Observasi selama diskusi, lembar kerja individu, kuis singkat di akhir sesi.",
    differentiationStrategies: ["Memberikan soal tantangan untuk siswa yang cepat paham", "Memberikan bantuan scaffolding untuk siswa yang kesulitan"],
    materials: "Papan tulis, spidol, lembar kerja, kartu pola bilangan",
    createdAt: new Date("2023-09-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2023-09-05T14:30:00Z").toISOString(),
    createdByUserId: "guru-rpp1" // Example user ID
  },
  {
    id: "rpp2",
    type: "RPP",
    title: "Proses Fotosintesis dalam Ekosistem",
    subject: "IPA",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    topic: "Memahami Fotosintesis dan Perannya",
    learningObjectives: ["Menjelaskan proses fotosintesis secara rinci", "Mengidentifikasi komponen kunci yang terlibat dalam fotosintesis", "Menganalisis peran fotosintesis dalam jaring-jaring makanan"],
    pemahamanBermakna: ["Tumbuhan membuat makanannya sendiri melalui fotosintesis.", "Fotosintesis adalah dasar kehidupan di Bumi."],
    pertanyaanPemantik: ["Dari mana tumbuhan mendapatkan makanannya?", "Apa yang akan terjadi jika tidak ada tumbuhan?"],
    langkahPembelajaran: {
      pendahuluan: ["Salam, doa, presensi", "Menunjukkan gambar ekosistem, bertanya tentang sumber energi", "Menyampaikan tujuan dan pentingnya materi"],
      kegiatanInti: ["Studi literatur: Proses fotosintesis", "Diskusi kelompok: Bahan dan hasil fotosintesis", "Membuat diagram alur fotosintesis", "Presentasi hasil diskusi"],
      penutup: ["Kuis interaktif tentang fotosintesis", "Refleksi: Bagaimana fotosintesis mempengaruhi kita?", "Tugas: Mengamati tumbuhan di sekitar rumah"],
    },
    assessment: "Laporan praktikum (jika ada), presentasi kelompok, partisipasi diskusi, kuis.",
    materials: "Buku teks IPA, video animasi fotosintesis, gambar ekosistem, kertas plano, spidol",
    createdAt: new Date("2023-10-10T09:00:00Z").toISOString(),
    updatedAt: new Date("2023-10-12T11:00:00Z").toISOString(),
    createdByUserId: "guru-rpp2" // Example user ID
  },
];

export default function LessonPlansPage() {
  const { user } = useAuth();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(initialLessonPlans);
  const [editingItem, setEditingItem] = useState<LessonPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // In a real app, fetch lesson plans based on user role.
    // For KepalaSekolah/WakaKurikulum, fetch all. For Guru, fetch their own.
    // For this demo, all users see the initial global list.
  }, []);

  // Role-based permissions
  // KepalaSekolah and WakaKurikulum can view all. Others (Guru) can view theirs (if data was user-specific).
  // Admin and WakaKurikulum have broader edit/delete. Guru can edit/delete their own.
  const canCreate = user && (user.role === "Admin" || user.role === "WakaKurikulum" || user.role === "Guru");
  
  // Edit: Admin, Waka, or Guru if it's their own item.
  // (Simplified for demo: Admin & Waka can edit all, Guru can edit any shown - in real app, check createdByUserId)
  const canEditItem = (item: LessonPlan): boolean => {
    if (!user) return false;
    if (user.role === "Admin" || user.role === "WakaKurikulum") return true;
    // if (user.role === "Guru" && item.createdByUserId === user.id) return true; // Full implementation
    if (user.role === "Guru") return true; // Simplified for demo - Guru can edit any shown RPP
    return false;
  };

  // Delete: Admin, Waka. (Guru potentially their own, but stricter for demo)
  const canDeleteItem = (item: LessonPlan): boolean => {
     if (!user) return false;
    if (user.role === "Admin" || user.role === "WakaKurikulum") return true;
    // if (user.role === "Guru" && item.createdByUserId === user.id) return true; // Full implementation
    return false; // Guru cannot delete in this simplified demo setup for RPPs shown
  };

  const canImport = user && (user.role === "Admin" || user.role === "WakaKurikulum");


  const handleCreateOrUpdate = (itemData: AnyCurriculumItem) => {
    const newItem = itemData as LessonPlan; 
    if (!newItem.createdByUserId && user) { // Assign creator if new
        newItem.createdByUserId = user.id;
    }

    if (editingItem) {
      if (!canEditItem(editingItem)) {
        alert("Anda tidak memiliki izin untuk mengedit item ini.");
        return;
      }
      setLessonPlans(lessonPlans.map(lp => lp.id === newItem.id ? newItem : lp));
    } else {
      if (!canCreate) {
        alert("Anda tidak memiliki izin untuk membuat item baru.");
        return;
      }
      setLessonPlans([newItem, ...lessonPlans]);
    }
    setEditingItem(null);
  };

  const handleEdit = (item: AnyCurriculumItem) => {
    if (!canEditItem(item as LessonPlan)) { // Pass the item to check specific edit permission
        alert("Anda tidak memiliki izin untuk mengedit item ini.");
        return;
    }
    setEditingItem(item as LessonPlan);
  };

  const handleDelete = (itemToDelete: AnyCurriculumItem) => {
    if (!canDeleteItem(itemToDelete as LessonPlan)) { // Pass the item to check specific delete permission
        alert("Anda tidak memiliki izin untuk menghapus item ini.");
        return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${itemToDelete.title}"?`)) {
      setLessonPlans(lessonPlans.filter(lp => lp.id !== itemToDelete.id));
    }
  };
  
  const handleView = (item: AnyCurriculumItem) => {
    const prettyPrintJson = JSON.stringify(item, null, 2);
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    newWindow?.document.write(`<pre>${prettyPrintJson}</pre>`);
    newWindow?.document.close();
  };

  const filteredLessonPlans = isClient ? lessonPlans.filter(lp =>
    lp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lp.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (!isClient || !user) {
    return (
      <div className="space-y-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Memuat Rencana Pembelajaran...</CardTitle>
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
          <CardTitle className="text-2xl">Rencana Pembelajaran (RPP/Modul Ajar)</CardTitle>
          <CardDescription>
            Kelola rencana pembelajaran Anda. 
            {user.role === "KepalaSekolah" || user.role === "WakaKurikulum" ? " Anda dapat melihat semua RPP yang dibuat." : ""}
            {user.role === "Guru" ? " Buat baru, edit, atau lihat rincian RPP Anda." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
            <div className="flex-grow w-full relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari rencana pembelajaran..."
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
                    triggerButtonText="Buat Rencana Baru"
                    dialogTitle="Buat Rencana Pembelajaran Baru"
                    dialogDescription="Isi rincian untuk rencana pembelajaran baru Anda (RPP/Modul Ajar)."
                    itemType="RPP"
                    onSubmit={handleCreateOrUpdate}
                    initialData={null}
                    />
                </div>
             )}
          </div>
          <CurriculumDataTable
            items={filteredLessonPlans}
            onView={handleView}
            onEdit={handleEdit} // DataTable will internally check canEdit prop based on item
            onDelete={handleDelete} // DataTable will internally check canDelete prop based on item
            canEdit={(item) => canEditItem(item as LessonPlan)} // Pass permission check function
            canDelete={(item) => canDeleteItem(item as LessonPlan)} // Pass permission check function
            itemTypeForExport="RPP"
          />
        </CardContent>
      </Card>
      {editingItem && canEditItem(editingItem) && ( // Ensure dialog only shows if user can edit this specific item
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setEditingItem(null)} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-2xl">
                <CurriculumFormDialog
                    triggerButtonText="Pemicu Edit Tersembunyi" 
                    dialogTitle={`Edit Rencana Pembelajaran: ${editingItem.title}`}
                    dialogDescription="Perbarui rincian untuk rencana pembelajaran ini."
                    itemType="RPP"
                    initialData={editingItem}
                    onSubmit={handleCreateOrUpdate}
                />
            </div>
        </>
      )}

    </div>
  );
}
