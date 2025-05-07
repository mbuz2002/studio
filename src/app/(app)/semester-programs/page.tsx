
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
          <CardDescription>Rincikan rencana pengajaran Anda untuk setiap semester sesuai Kurikulum Merdeka. Atur topik dan kegiatan mingguan.</CardDescription>
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
                dialogTitle="Buat Program Semester Baru (Promes)"
                dialogDescription="Rancang kurikulum Anda untuk semester tertentu sesuai Kurikulum Merdeka."
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
                triggerButtonText="Pemicu Edit Tersembunyi" // This instance is programmatically opened
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

