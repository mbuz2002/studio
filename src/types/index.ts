
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
  title: string; // For ATP, this will be "ALUR TUJUAN PEMBELAJARAN KONSENTRASI KEAHLIAN..."
  subject: string; // Mata Pelajaran
  gradeLevel: string; // Fase for Kurikulum Merdeka
  createdAt: string; 
  updatedAt: string; 
  createdByUserId?: string; 
  curriculumType: CurriculumFramework; 
}

export interface LessonPlan extends CurriculumItem {
  type: 'RPP'; // Remains RPP, but content structure changes for Kurikulum Merdeka to ATP/Modul Ajar
  topic: string; // For ATP (Kurikulum Merdeka): Konsentrasi Keahlian or main theme. For RPP: Topic.
  learningObjectives: string[]; // For Kurikulum Merdeka (ATP): Array of Tujuan Pembelajaran (TP). For K-13/KTSP: Standard learning objectives.
  alokasiWaktuJP?: string; 
  
  // Kurikulum Merdeka specific (for Modul Ajar / ATP context)
  bidangKeahlian?: string; // e.g., Seni dan Ekonomi Kreatif
  programKeahlian?: string; // e.g., Animasi (also used in ATP title for Konsentrasi Keahlian)
  capaianPembelajaran?: string[]; // Capaian Pembelajaran (CP) relevant to the Modul Ajar/ATP.
  pemahamanBermakna?: string[]; 
  pertanyaanPemantik?: string[]; 
  differentiationStrategies?: string[]; 
  profilPelajarPancasilaFocus?: string[]; // Profil Pelajar Pancasila focus areas

  // KTSP 2006 / K-13 specific
  standarKompetensi?: string[]; // SK (KTSP)
  kompetensiInti?: string[]; // KI (K-13)
  kompetensiDasar?: string[]; // KD (KTSP, K-13)
  indikatorPencapaianKompetensi?: string[]; // IPK (KTSP, K-13)
  metodePembelajaran?: string[]; // Metode (KTSP, K-13)
  
  // Common for Modul Ajar / RPP (can be brief for ATP context)
  langkahPembelajaran: { 
    pendahuluan: string[]; 
    kegiatanInti: string[]; 
    penutup: string[]; 
  };
  assessment: string; 
  materials?: string; 
}

export interface AnnualProgramComponent {
  topic: string; 
  elemenCapaianPembelajaran?: string[]; // For Kurikulum Merdeka: Elemen CP; For KTSP/K13: Kompetensi Dasar (KD)
  alokasiWaktu: string; 
}

export interface AnnualProgram extends CurriculumItem {
  type: 'PROTA'; 
  year: string; 
  capaianPembelajaran?: string[]; // Capaian Pembelajaran Umum for the year (Kurikulum Merdeka focus).
  semester1Components: AnnualProgramComponent[];
  semester2Components: AnnualProgramComponent[];
  profilPelajarPancasilaFocus?: string[]; 
}

export interface WeeklyUnit {
  mingguKe: number;
  bulan?: string; 
  materiPokokAtauTujuanPembelajaran: string; // Materi Pokok/Tema (KTSP/K13) or Tujuan Pembelajaran (Kurikulum Merdeka)
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
  capaianPembelajaranUmum?: string; // CP (Merdeka) / SK-KD Rangkuman (KTSP/K13) - This field is used for input to AI
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
  
  // RPP/Modul Ajar/ATP common
  showRPPLearningObjectives: boolean; // TPs for ATP, Objectives for RPP
  showRPPAlokasiWaktu?: boolean;

  // RPP/Modul Ajar (Kurikulum Merdeka) specific
  showRPPCapaianPembelajaran?: boolean; 
  showRPPPemahamanBermakna: boolean;
  showRPPPertanyaanPemantik: boolean;
  showRPPDifferentiationStrategies: boolean;
  showRPPProfilPelajarPancasila?: boolean;
  showRPPBidangKeahlian?: boolean; // For ATP
  showRPPProgramKeahlian?: boolean; // For ATP


  // RPP KTSP/K-13 specific
  showRPPSK?: boolean; 
  showRPPKI?: boolean; 
  showRPPKD?: boolean; 
  showRPPIPK?: boolean; 
  showRPPMetodePembelajaran?: boolean;

  // Common for RPP/Modul Ajar, maybe less for pure ATP print
  showRPPLangkahPendahuluan: boolean;
  showRPPLangkahKegiatanInti: boolean;
  showRPPLangkahPenutup: boolean;
  showRPPAssessment: boolean;
  showRPPMaterials: boolean;

  // PROTA specific 
  showPROTACapaianPembelajaran?: boolean; 
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
  // RPP/Modul Ajar/ATP
  showRPPLearningObjectives: true,
  showRPPAlokasiWaktu: true, 
  showRPPCapaianPembelajaran: true, 
  showRPPLangkahPendahuluan: true,
  showRPPLangkahKegiatanInti: true,
  showRPPLangkahPenutup: true,
  showRPPAssessment: true,
  showRPPMaterials: true,
  showRPPPemahamanBermakna: true,
  showRPPPertanyaanPemantik: true,
  showRPPDifferentiationStrategies: true,
  showRPPProfilPelajarPancasila: true,
  showRPPBidangKeahlian: true,
  showRPPProgramKeahlian: true,
  showRPPSK: true,
  showRPPKI: true,
  showRPPKD: true,
  showRPPIPK: true,
  showRPPMetodePembelajaran: true,
  // PROTA
  showPROTACapaianPembelajaran: true,
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
}
