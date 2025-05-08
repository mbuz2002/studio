

export type UserRole = "Admin" | "KepalaSekolah" | "WakaKurikulum" | "TataUsaha" | "Guru";
export type CurriculumFramework = "Kurikulum Merdeka" | "K-13" | "KTSP 2006";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  schoolId?: string; 
  updatedAt?: string; 
}

export interface SchoolProfile {
  id: string;
  namaSekolah: string;
  alamat: string;
  nomorTelepon: string;
  emailSekolah: string;
  namaKepalaSekolah: string;
  npsn?: string; 
  logoUrl?: string; 
  updatedAt: string;
}

export interface CurriculumItem {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string; 
  createdAt: string; 
  updatedAt: string; 
  createdByUserId?: string; 
  curriculumType: CurriculumFramework; // Added curriculum type
}

export interface LessonPlan extends CurriculumItem {
  type: 'RPP'; 
  topic: string; 
  learningObjectives: string[]; 
  
  // Kurikulum Merdeka specific
  pemahamanBermakna?: string[]; 
  pertanyaanPemantik?: string[]; 
  differentiationStrategies?: string[]; 
  
  // KTSP 2006 / K-13 specific
  standarKompetensi?: string[]; // SK (KTSP)
  kompetensiInti?: string[]; // KI (K-13)
  kompetensiDasar?: string[]; // KD (KTSP, K-13)
  indikatorPencapaianKompetensi?: string[]; // IPK (KTSP, K-13)
  metodePembelajaran?: string[]; // Metode (KTSP, K-13)
  
  // Common
  langkahPembelajaran: { 
    pendahuluan: string[]; 
    kegiatanInti: string[]; 
    penutup: string[]; 
  };
  assessment: string; 
  materials?: string; 
}

export interface AnnualProgramComponent {
  topic: string; // Materi Pokok/Tema for KTSP/K13
  elemenCapaianPembelajaran?: string[]; // CP (Merdeka) / KD (KTSP/K13) - AI will adapt
  alokasiWaktu: string; 
}

export interface AnnualProgram extends CurriculumItem {
  type: 'PROTA'; 
  year: string; 
  semester1Components: AnnualProgramComponent[];
  semester2Components: AnnualProgramComponent[];
  profilPelajarPancasilaFocus?: string[]; // Primarily Merdeka, but can be adapted
}

export interface WeeklyUnit {
  mingguKe: number;
  bulan?: string; 
  materiPokokAtauTujuanPembelajaran: string; // Materi Pokok (KTSP/K13) / TP (Merdeka)
  alokasiWaktu: string; 
  metodeStrategi?: string[]; 
  sumberBelajar?: string[]; 
  rencanaAsesmen?: string[]; 
  catatanIntegrasiP5?: string; 
}

export interface SemesterProgram extends CurriculumItem {
  type: 'Promes'; 
  semester: '1' | '2'; 
  year: string; 
  capaianPembelajaranUmum?: string; // CP (Merdeka) / SK-KD Rangkuman (KTSP/K13)
  alokasiWaktuTotalSemester?: string; 
  komponenMingguan: WeeklyUnit[];
}


export type AnyCurriculumItem = LessonPlan | AnnualProgram | SemesterProgram;

// For AI flow outputs
export type { GenerateLessonPlanInput, GenerateLessonPlanOutput } from '@/ai/flows/generate-lesson-plan-from-topic';
export type { SuggestLessonPlanImprovementsOutput } from '@/ai/flows/suggest-lesson-plan-improvements';
export type { GenerateTeachingMaterialInput, GenerateTeachingMaterialOutput, SuggestedSourceSchema as AISuggestedSource } from '@/ai/flows/generate-teaching-material';


export interface PrintOptions {
  showKopSurat: boolean;
  
  // RPP common
  showRPPLearningObjectives: boolean; // For Tujuan Pembelajaran
  showRPPLangkahPendahuluan: boolean;
  showRPPLangkahKegiatanInti: boolean;
  showRPPLangkahPenutup: boolean;
  showRPPAssessment: boolean;
  showRPPMaterials: boolean;

  // RPP Kurikulum Merdeka specific
  showRPPPemahamanBermakna: boolean;
  showRPPPertanyaanPemantik: boolean;
  showRPPDifferentiationStrategies: boolean;
  
  // RPP KTSP/K-13 specific
  showRPPSK?: boolean; // Standar Kompetensi (KTSP)
  showRPPKI?: boolean; // Kompetensi Inti (K-13)
  showRPPKD?: boolean; // Kompetensi Dasar (KTSP, K-13)
  showRPPIPK?: boolean; // Indikator Pencapaian Kompetensi (KTSP, K-13)
  showRPPMetodePembelajaran?: boolean;

  // PROTA specific (mostly generic, content varies by curriculum)
  showPROTAFokusP5: boolean; // More for Merdeka, but can be adapted
  showPROTASemester1: boolean;
  showPROTASemester2: boolean;
  
  // Promes specific (mostly generic, content varies by curriculum)
  showPromesCapaianUmum: boolean;
  showPromesAlokasiTotal: boolean;
  showPromesKomponenMingguan: boolean;
}

export const defaultPrintOptions: PrintOptions = {
  showKopSurat: true,
  // RPP
  showRPPLearningObjectives: true,
  showRPPLangkahPendahuluan: true,
  showRPPLangkahKegiatanInti: true,
  showRPPLangkahPenutup: true,
  showRPPAssessment: true,
  showRPPMaterials: true,
  showRPPPemahamanBermakna: true,
  showRPPPertanyaanPemantik: true,
  showRPPDifferentiationStrategies: true,
  showRPPSK: true,
  showRPPKI: true,
  showRPPKD: true,
  showRPPIPK: true,
  showRPPMetodePembelajaran: true,
  // PROTA
  showPROTAFokusP5: true,
  showPROTASemester1: true,
  showPROTASemester2: true,
  // Promes
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
  // Add global curriculum setting if needed for export/import
  // defaultCurriculum?: CurriculumFramework; 
}

// Default data structures will be updated in their respective page files.
// For example, in lesson-plans/page.tsx, initialLessonPlansData will add curriculumType.
