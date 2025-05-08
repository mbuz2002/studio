

export type UserRole = "Admin" | "KepalaSekolah" | "WakaKurikulum" | "TataUsaha" | "Guru";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  schoolId?: string; // Optional: to associate user with a specific school profile
  updatedAt?: string; // ISO date string, optional
}

export interface SchoolProfile {
  id: string;
  namaSekolah: string;
  alamat: string;
  nomorTelepon: string;
  emailSekolah: string;
  namaKepalaSekolah: string;
  npsn?: string; // Nomor Pokok Sekolah Nasional (Optional)
  logoUrl?: string; // URL to school logo (Optional)
  updatedAt: string;
}

export interface CurriculumItem {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string; // e.g., "Fase A (Kelas 1-2 SD)", "PAUD", "Kelas 10 SMA"
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdByUserId?: string; // Optional: to track who created the item
}

export interface LessonPlan extends CurriculumItem {
  type: 'RPP'; // Rencana Pelaksanaan Pembelajaran
  topic: string; // Topik atau Materi Pembelajaran
  learningObjectives: string[]; // Tujuan Pembelajaran / Capaian Pembelajaran
  pemahamanBermakna?: string[]; // Pemahaman Bermakna yang akan dibangun
  pertanyaanPemantik?: string[]; // Pertanyaan Pemantik untuk memantik rasa ingin tahu
  langkahPembelajaran: { // Menggantikan suggestedActivities
    pendahuluan: string[]; // Kegiatan pendahuluan
    kegiatanInti: string[]; // Kegiatan inti pembelajaran
    penutup: string[]; // Kegiatan penutup
  };
  assessment: string; // Asesmen / Penilaian (bisa diubah jadi array jika perlu rincian)
  differentiationStrategies?: string[]; // Strategi Diferensiasi (opsional)
  materials?: string; // Media / Sumber Belajar (opsional)
}

export interface AnnualProgramComponent {
  topic: string;
  elemenCapaianPembelajaran?: string[]; // Elemen Capaian Pembelajaran, e.g., ["Bilangan", "Aljabar"]
  alokasiWaktu: string; // e.g., "24 JP" (Jam Pelajaran)
}

export interface AnnualProgram extends CurriculumItem {
  type: 'PROTA'; // Program Tahunan
  year: string; // Tahun Ajaran, e.g., "2023/2024"
  semester1Components: AnnualProgramComponent[];
  semester2Components: AnnualProgramComponent[];
  profilPelajarPancasilaFocus?: string[]; // Fokus dimensi P5, e.g., ["Gotong Royong", "Kreatif"]
}

export interface WeeklyUnit {
  mingguKe: number;
  bulan?: string; // Optional: e.g., "Juli Minggu ke-3"
  materiPokokAtauTujuanPembelajaran: string; // Bisa Materi Pokok atau Tujuan Pembelajaran dari ATP
  alokasiWaktu: string; // e.g., "3 JP x 2 Pertemuan"
  metodeStrategi?: string[]; // e.g., ["Diskusi Kelompok", "Project Based Learning"]
  sumberBelajar?: string[]; // e.g., ["Buku Siswa Hal. 10-15", "Video YouTube XYZ"]
  rencanaAsesmen?: string[]; // e.g., ["Formatif: Observasi Diskusi", "Sumatif: Ulangan Harian Bab 1"]
  catatanIntegrasiP5?: string; // Catatan bagaimana P5 diintegrasikan, e.g., "Diskusi kelompok menekankan gotong royong."
}

export interface SemesterProgram extends CurriculumItem {
  type: 'Promes'; // Program Semester
  semester: '1' | '2'; // 1 for Ganjil, 2 for Genap
  year: string; // Tahun Ajaran, e.g. "2023/2024"
  capaianPembelajaranUmum?: string; // Deskripsi CP umum untuk semester tersebut (opsional)
  alokasiWaktuTotalSemester?: string; // e.g., "18 Minggu Efektif x 6 JP/Minggu = 108 JP"
  komponenMingguan: WeeklyUnit[];
}


export type AnyCurriculumItem = LessonPlan | AnnualProgram | SemesterProgram;

// For AI flow outputs - already defined in AI flow files, but useful to have centralized if expanded
export type { GenerateLessonPlanInput, GenerateLessonPlanOutput } from '@/ai/flows/generate-lesson-plan-from-topic';
export type { SuggestLessonPlanImprovementsOutput } from '@/ai/flows/suggest-lesson-plan-improvements';


export interface PrintOptions {
  showKopSurat: boolean;
  // RPP specific
  showRPPTujuanPembelajaran: boolean;
  showRPPPemahamanBermakna: boolean;
  showRPPPertanyaanPemantik: boolean;
  showRPPLangkahPendahuluan: boolean;
  showRPPLangkahKegiatanInti: boolean;
  showRPPLangkahPenutup: boolean;
  showRPPAsesmen: boolean;
  showRPPStrategiDiferensiasi: boolean;
  showRPPMediaSumberBelajar: boolean;
  // PROTA specific
  showPROTAFokusP5: boolean;
  showPROTASemester1: boolean;
  showPROTASemester2: boolean;
  // Promes specific
  showPromesCapaianUmum: boolean;
  showPromesAlokasiTotal: boolean;
  showPromesKomponenMingguan: boolean;
}

export const defaultPrintOptions: PrintOptions = {
  showKopSurat: true,
  showRPPTujuanPembelajaran: true,
  showRPPPemahamanBermakna: true,
  showRPPPertanyaanPemantik: true,
  showRPPLangkahPendahuluan: true,
  showRPPLangkahKegiatanInti: true,
  showRPPLangkahPenutup: true,
  showRPPAsesmen: true,
  showRPPStrategiDiferensiasi: true,
  showRPPMediaSumberBelajar: true,
  showPROTAFokusP5: true,
  showPROTASemester1: true,
  showPROTASemester2: true,
  showPromesCapaianUmum: true,
  showPromesAlokasiTotal: true,
  showPromesKomponenMingguan: true,
};


export interface ExportedCurriculumData {
  lessonPlans: LessonPlan[];
  annualPrograms: AnnualProgram[];
  semesterPrograms: SemesterProgram[];
  schoolProfile: SchoolProfile | null;
  appUsers: User[];
}

```