
"use client";

import { useState, useEffect } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import { CurriculumFormDialog } from "@/components/curriculum/CurriculumFormDialog";
import type { SemesterProgram, AnyCurriculumItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search, Loader2, CalendarClock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const initialSemesterProgramsData: SemesterProgram[] = [
  {
    id: "promes1",
    type: "Promes",
    title: "Promes Matematika Fase D - Semester Ganjil 2024/2025",
    subject: "Matematika",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    semester: "1",
    year: "2024/2025",
    capaianPembelajaranUmum: "Peserta didik menunjukkan pemahaman dan intuisi bilangan (number sense) pada bilangan cacah sampai 1.000.000.",
    alokasiWaktuTotalSemester: "18 Minggu Efektif x 4 JP/Minggu = 72 JP",
    komponenMingguan: [
      { mingguKe: 1, bulan: "Juli", materiPokokAtauTujuanPembelajaran: "Orientasi dan Asesmen Diagnostik Awal", alokasiWaktu: "4 JP", metodeStrategi: ["Diskusi", "Tes diagnostik"], sumberBelajar: ["Modul Ajar"], rencanaAsesmen: ["Observasi", "Hasil tes"], catatanIntegrasiP5: "Pengenalan nilai-nilai P5."},
      { mingguKe: 2, bulan: "Juli", materiPokokAtauTujuanPembelajaran: "Bilangan: Membaca dan Menulis Bilangan Cacah", alokasiWaktu: "4 JP", metodeStrategi: ["Permainan kartu angka", "Latihan terbimbing"], sumberBelajar: ["Buku Siswa Bab 1"], rencanaAsesmen: ["Kinerja membaca bilangan", "Lembar kerja"], catatanIntegrasiP5: "Ketelitian (Mandiri)"},
      { mingguKe: 3, bulan: "Agustus", materiPokokAtauTujuanPembelajaran: "Bilangan: Nilai Tempat", alokasiWaktu: "4 JP", metodeStrategi: ["Media blok Dienes", "Diskusi kelompok"], sumberBelajar: ["Buku Siswa Bab 1"], rencanaAsesmen: ["Presentasi kelompok", "Tugas individu"], catatanIntegrasiP5: "Kerja sama (Gotong Royong)"},
    ],
    createdAt: new Date("2024-07-10T00:00:00Z").toISOString(),
    updatedAt: new Date("2024-07-12T00:00:00Z").toISOString(),
    createdByUserId: "user-3"
  },
  {
    id: "promes2",
    type: "Promes",
    title: "Promes IPA Fase D - Semester Genap 2024/2025",
    subject: "IPA",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    semester: "2",
    year: "2024/2025",
    capaianPembelajaranUmum: "Peserta didik mampu melakukan klasifikasi makhluk hidup dan benda berdasarkan karakteristik yang diamati.",
    alokasiWaktuTotalSemester: "16 Minggu Efektif x 5 JP/Minggu = 80 JP",
    komponenMingguan: [
      { mingguKe: 1, bulan: "Januari", materiPokokAtauTujuanPembelajaran: "Klasifikasi Materi: Unsur, Senyawa, Campuran", alokasiWaktu: "5 JP", metodeStrategi: ["Eksperimen sederhana", "Pengamatan"], sumberBelajar: ["Modul IPA", "Alat lab"], rencanaAsesmen: ["Laporan praktikum", "Kuis"], catatanIntegrasiP5: "Bernalar kritis saat menganalisis hasil eksperimen."},
      { mingguKe: 2, bulan: "Januari", materiPokokAtauTujuanPembelajaran: "Sistem Organisasi Kehidupan: Sel sebagai Unit Terkecil", alokasiWaktu: "5 JP", metodeStrategi: ["Studi gambar/video mikroskopis", "Membuat model sel"], sumberBelajar: ["Buku Teks Biologi"], rencanaAsesmen: ["Penilaian model sel", "Partisipasi diskusi"], catatanIntegrasiP5: "Kreatif dalam membuat model sel."},
    ],
    createdAt: new Date("2024-07-11T00:00:00Z").toISOString(),
    updatedAt: new Date("2024-07-15T00:00:00Z").toISOString(),
    createdByUserId: "user-1"
  },
];

const SEMESTER_PROGRAMS_STORAGE_KEY = "appSemesterPrograms";

export default function SemesterProgramsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [semesterPrograms, setSemesterPrograms] = useState<SemesterProgram[]>([]);
  const [editingItem, setEditingItem] = useState<SemesterProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      try {
        const storedSemesterPrograms = localStorage.getItem(SEMESTER_PROGRAMS_STORAGE_KEY);
        if (storedSemesterPrograms) {
          setSemesterPrograms(JSON.parse(storedSemesterPrograms));
        } else {
           const dataToStore = initialSemesterProgramsData.map(sp => ({
            ...sp,
            createdByUserId: sp.createdByUserId || (user ? user.id : 'user-demo-fallback')
          }));
          setSemesterPrograms(dataToStore);
          localStorage.setItem(SEMESTER_PROGRAMS_STORAGE_KEY, JSON.stringify(dataToStore));
        }
      } catch (error) {
        console.error("Failed to access or parse localStorage for semester programs:", error);
        setSemesterPrograms(initialSemesterProgramsData); 
        toast({
          title: "Gagal Memuat Data Lokal",
          description: "Menggunakan data Promes standar. Perubahan mungkin tidak tersimpan dengan benar.",
          variant: "destructive",
        });
      }
    }
  }, [toast, user]);

  const canCreate = user && (user.role === "Admin" || user.role === "WakaKurikulum");
  const canEdit = user && (user.role === "Admin" || user.role === "WakaKurikulum");
  const canDelete = user && (user.role === "Admin" || user.role === "WakaKurikulum");
  const canImport = user && (user.role === "Admin" || user.role === "WakaKurikulum");


  const handleCreateOrUpdate = (itemData: AnyCurriculumItem) => {
    const newItem = itemData as SemesterProgram;
    let updatedSemesterPrograms;

    if (!newItem.id) { 
        newItem.id = `promes-${Date.now()}`;
        newItem.createdAt = new Date().toISOString();
    }
    newItem.updatedAt = new Date().toISOString();

     if (!newItem.createdByUserId && user) { 
        newItem.createdByUserId = user.id;
    }

    if (editingItem) {
      if (!canEdit) { 
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit Promes.", variant: "destructive" });
        return;
      }
      updatedSemesterPrograms = semesterPrograms.map(sp => sp.id === newItem.id ? newItem : sp);
    } else {
       if (!canCreate) { 
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk membuat Promes baru.", variant: "destructive" });
        return;
      }
      updatedSemesterPrograms = [newItem, ...semesterPrograms];
    }
    setSemesterPrograms(updatedSemesterPrograms);
    localStorage.setItem(SEMESTER_PROGRAMS_STORAGE_KEY, JSON.stringify(updatedSemesterPrograms));
    setEditingItem(null);
    setIsFormOpen(false);
    toast({ title: editingItem ? "Promes Diperbarui" : "Promes Dibuat", description: `"${newItem.title}" telah berhasil disimpan.`});
  };

  const handleEdit = (item: AnyCurriculumItem) => {
    if (!canEdit) { 
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit Promes.", variant: "destructive" });
        return;
    }
    setEditingItem(item as SemesterProgram);
    setIsFormOpen(true);
  };

  const handleDelete = (itemToDelete: AnyCurriculumItem) => {
     if (!canDelete) { 
        toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk menghapus Promes.", variant: "destructive" });
        return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${itemToDelete.title}"?`)) {
      const updatedSemesterPrograms = semesterPrograms.filter(sp => sp.id !== itemToDelete.id);
      setSemesterPrograms(updatedSemesterPrograms);
      localStorage.setItem(SEMESTER_PROGRAMS_STORAGE_KEY, JSON.stringify(updatedSemesterPrograms));
      toast({ title: "Promes Dihapus", description: `"${itemToDelete.title}" telah berhasil dihapus.`});
    }
  };

  const handleView = (item: AnyCurriculumItem) => {
    const prettyPrintJson = JSON.stringify(item, null, 2);
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    newWindow?.document.write(`<pre>${prettyPrintJson}</pre>`);
    newWindow?.document.close();
  };

  const filteredSemesterPrograms = isClient ? semesterPrograms.filter(sp =>
    sp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `Semester ${sp.semester}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];


  if (!isClient || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat Program Semester...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-lg">
        <CardHeader className="p-6">
           <div className="flex items-center gap-3">
            <CalendarClock className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl md:text-3xl font-bold">Program Semester (Promes)</CardTitle>
          </div>
          <CardDescription className="text-base md:text-lg text-muted-foreground mt-2">
            Rincikan rencana pengajaran Anda untuk setiap semester. 
            {user.role === "KepalaSekolah" || user.role === "WakaKurikulum" || user.role === "TataUsaha" ? " Anda dapat melihat semua Promes." : ""}
            {user.role === "Guru" ? " Lihat Promes yang telah disusun." : ""}
            {(user.role === "Admin" || user.role === "WakaKurikulum") && " Anda dapat membuat, mengedit, dan menghapus Promes."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
            <div className="flex-grow w-full relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari program semester..."
                  className="pl-10 w-full text-base sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
                 {canImport && (
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => toast({title: "Fitur Belum Tersedia", description: "Impor Promes akan segera hadir!"})}>
                      <FileUp className="mr-2 h-4 w-4" /> Impor
                  </Button>
                 )}
              </div>
              {canCreate && (
                <div className="w-full sm:w-auto">
                  <CurriculumFormDialog
                  triggerButtonText="Buat Program Baru"
                  dialogTitle="Buat Program Semester Baru (Promes)"
                  dialogDescription="Rancang kurikulum Anda untuk semester tertentu sesuai Kurikulum Merdeka."
                  itemType="Promes"
                  onSubmit={handleCreateOrUpdate}
                  initialData={null}
                  forceOpen={isFormOpen && !editingItem}
                  onOpenChange={(open) => {
                     if (!open && editingItem) {
                      setEditingItem(null);
                    }
                    setIsFormOpen(open);
                  }}
                  />
                </div>
              )}
          </div>
          <CurriculumDataTable
            items={filteredSemesterPrograms}
            onView={handleView}
            onEdit={canEdit ? handleEdit : undefined} 
            onDelete={canDelete ? handleDelete : undefined} 
            canEdit={() => canEdit} 
            canDelete={() => canDelete} 
            itemTypeForExport="Promes"
          />
        </CardContent>
      </Card>
      {editingItem && canEdit && (
        <CurriculumFormDialog
            triggerButtonText="Pemicu Edit Tersembunyi"
            dialogTitle={`Edit Program Semester`} // Title set in form
            dialogDescription="Perbarui rincian untuk program semester ini."
            itemType="Promes"
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
