

export type UserRole = "Admin" | "KepalaSekolah" | "WakaKurikulum" | "TataUsaha" | "Guru";
export type CurriculumFramework = "Kurikulum Merdeka" | "K-13" | "KTSP 2006";
export type EducationLevel = "PAUD" | "SD/MI" | "SMP/MTs" | "SMA/MA" | "SMK/MAK" | "SLB" | "PKBM/Kesetaraan";


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
  jenjangPendidikan: EducationLevel;
  alamat: string;
  nomorTelepon: string;
  emailSekolah: string;
  namaKepalaSekolah: string;
  npsn?: string; 
  logoUrl?: string; 
  kotaSekolah?: string;
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
  curriculumType: CurriculumFramework; 
}

export interface LessonPlan extends CurriculumItem {
  type: 'RPP'; 
  topic: string; 
  learningObjectives: string[]; 
  alokasiWaktuJP?: string; 
  
  bidangKeahlian?: string; 
  programKeahlian?: string; 
  capaianPembelajaran?: string[]; 
  pemahamanBermakna?: string[]; 
  pertanyaanPemantik?: string[]; 
  differentiationStrategies?: string[]; 
  profilPelajarPancasilaFocus?: string[]; 

  standarKompetensi?: string[]; 
  kompetensiInti?: string[]; 
  kompetensiDasar?: string[]; 
  indikatorPencapaianKompetensi?: string[]; 
  metodePembelajaran?: string[]; 
  
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
  elemenCapaianPembelajaran?: string[]; 
  alokasiWaktu: string; 
}

export interface AnnualProgram extends CurriculumItem {
  type: 'PROTA'; 
  year: string; 
  capaianPembelajaran?: string[]; 
  semester1Components: AnnualProgramComponent[];
  semester2Components: AnnualProgramComponent[];
  profilPelajarPancasilaFocus?: string[]; 
}

export interface WeeklyUnit {
  mingguKe: number;
  bulan?: string; 
  materiPokokAtauTujuanPembelajaran: string; 
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
  capaianPembelajaranUmum?: string; 
  alokasiWaktuTotalSemester?: string; 
  komponenMingguan: WeeklyUnit[];
}

// For AI Kurikulum Merdeka Module Generation
export interface ModulAjarIdentitas {
  namaPenyusun: string;
  institusi: string;
  tahunAjar: string;
  jenjangSekolah: string; // e.g., SMA, SMK
  fase: string; // e.g., Fase E, Fase F
  kelasSemester: string; // e.g., X / Ganjil
  alokasiWaktu: string; // e.g., 12 JP (3 Pertemuan @4JP)
  mataPelajaran: string;
  elemenCapaianPembelajaran?: string[]; // (Optional) Specific CP elements targeted
}

export interface ModulAjarKomponenInti {
  tujuanPembelajaran: string[];
  pemahamanBermakna: string[];
  pertanyaanPemantik: string[];
  kegiatanPembelajaran: {
    pendahuluan: string[]; // Detail steps
    inti: {
      langkah: string; // e.g., "Kegiatan 1: Eksplorasi Konsep"
      detailAktivitas: string[];
    }[];
    penutup: string[]; // Detail steps
  };
  asesmen: {
    diagnostik?: string;
    formatif: string;
    sumatif: string;
  };
  pengayaanRemedial?: {
    pengayaan: string;
    remedial: string;
  };
  refleksiPesertaDidikGuru?: {
    refleksiPesertaDidik: string;
    refleksiGuru: string;
  };
}

export interface ModulAjarLampiran {
  lembarKerjaPesertaDidik?: string; // Could be detailed or a general description
  bahanBacaanGuruSiswa?: string[];
  glosarium?: { istilah: string; penjelasan: string }[];
  daftarPustaka?: string[];
}

export interface GenerateKurikulumMerdekaModuleOutput {
  judulModul: string;
  identitasModul: ModulAjarIdentitas;
  kompetensiAwal?: string[];
  profilPelajarPancasila: string[]; // Dimensi yang dikembangkan
  saranaPrasarana: string[];
  targetPesertaDidik: string;
  modelPembelajaran: string; // e.g., Tatap Muka, PJJ Daring, Blended Learning
  komponenInti: ModulAjarKomponenInti;
  lampiran?: ModulAjarLampiran;
}

// Stored Modul Ajar Type
export interface ModulAjar extends GenerateKurikulumMerdekaModuleOutput {
  id: string;
  type: 'ModulAjar'; // To distinguish in AnyCurriculumItem
  title: string; // Alias for judulModul for CurriculumDataTable compatibility
  subject: string; // Alias for identitasModul.mataPelajaran
  gradeLevel: string; // Alias for identitasModul.fase or kelasSemester
  curriculumType: "Kurikulum Merdeka";
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
}


export type AnyCurriculumItem = LessonPlan | AnnualProgram | SemesterProgram | ModulAjar;

// For AI flow outputs
export type { GenerateLessonPlanInput, GenerateLessonPlanOutput } from '@/ai/flows/generate-lesson-plan-from-topic';
export type { SuggestLessonPlanImprovementsOutput } from '@/ai/flows/suggest-lesson-plan-improvements';
export type { GenerateTeachingMaterialInput, GenerateTeachingMaterialOutput, SuggestedSourceSchema as AISuggestedSource } from '@/ai/flows/generate-teaching-material';


export interface PrintOptions {
  showKopSurat: boolean;
  
  showRPPLearningObjectives: boolean; 
  showRPPAlokasiWaktu?: boolean;

  showRPPCapaianPembelajaran?: boolean; 
  showRPPPemahamanBermakna: boolean;
  showRPPPertanyaanPemantik: boolean;
  showRPPDifferentiationStrategies: boolean;
  showRPPProfilPelajarPancasila?: boolean;
  showRPPBidangKeahlian?: boolean; 
  showRPPProgramKeahlian?: boolean; 


  showRPPSK?: boolean; 
  showRPPKI?: boolean; 
  showRPPKD?: boolean; 
  showRPPIPK?: boolean; 
  showRPPMetodePembelajaran?: boolean;

  showRPPLangkahPendahuluan: boolean;
  showRPPLangkahKegiatanInti: boolean;
  showRPPLangkahPenutup: boolean;
  showRPPAssessment: boolean;
  showRPPMaterials: boolean;
 
  showPROTACapaianPembelajaran?: boolean; 
  showPROTAFokusP5: boolean; 
  showPROTASemester1: boolean;
  showPROTASemester2: boolean;
  
  showPromesCapaianUmum: boolean;
  showPromesAlokasiTotal: boolean;
  showPromesKomponenMingguan: boolean;
}

export const defaultPrintOptions: PrintOptions = {
  showKopSurat: true,
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
  showPROTACapaianPembelajaran: true,
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
  modulAjar?: ModulAjar[];
  schoolProfile: SchoolProfile | null;
  appUsers: User[];
  subjects?: Subject[];
  teachers?: Teacher[];
  timetables?: TimetableEntry[];
  schoolClasses?: SchoolClass[]; // New
  teachingPeriodSettings?: TeachingPeriodSettings;
}


// Print Options for Modul Ajar Kurikulum Merdeka
export interface PrintOptionsModulAjar {
  showKopSurat: boolean;
  showMAIdentitas: boolean;
  showMAKompetensiAwal: boolean;
  showMAProfilPelajarPancasila: boolean;
  showMASaranaPrasarana: boolean;
  showMATargetPesertaDidik: boolean;
  showMAModelPembelajaran: boolean;
  // Komponen Inti
  showMAKomponenInti_TujuanPembelajaran: boolean;
  showMAKomponenInti_PemahamanBermakna: boolean;
  showMAKomponenInti_PertanyaanPemantik: boolean;
  showMAKomponenInti_KegiatanPembelajaran: boolean; // Sub-options for Pendahuluan, Inti, Penutup
  showMAKomponenInti_Kegiatan_Pendahuluan: boolean;
  showMAKomponenInti_Kegiatan_Inti: boolean;
  showMAKomponenInti_Kegiatan_Penutup: boolean;
  showMAKomponenInti_Asesmen: boolean; // Sub-options for Diagnostik, Formatif, Sumatif
  showMAKomponenInti_Asesmen_Diagnostik: boolean;
  showMAKomponenInti_Asesmen_Formatif: boolean;
  showMAKomponenInti_Asesmen_Sumatif: boolean;
  showMAKomponenInti_PengayaanRemedial: boolean;
  showMAKomponenInti_Refleksi: boolean;
  // Lampiran
  showMALampiran_LKPD: boolean;
  showMALampiran_BahanBacaan: boolean;
  showMALampiran_Glosarium: boolean;
  showMALampiran_DaftarPustaka: boolean;
}

export const defaultPrintOptionsModulAjar: PrintOptionsModulAjar = {
  showKopSurat: true,
  showMAIdentitas: true,
  showMAKompetensiAwal: true,
  showMAProfilPelajarPancasila: true,
  showMASaranaPrasarana: true,
  showMATargetPesertaDidik: true,
  showMAModelPembelajaran: true,
  showMAKomponenInti_TujuanPembelajaran: true,
  showMAKomponenInti_PemahamanBermakna: true,
  showMAKomponenInti_PertanyaanPemantik: true,
  showMAKomponenInti_KegiatanPembelajaran: true,
  showMAKomponenInti_Kegiatan_Pendahuluan: true,
  showMAKomponenInti_Kegiatan_Inti: true,
  showMAKomponenInti_Kegiatan_Penutup: true,
  showMAKomponenInti_Asesmen: true,
  showMAKomponenInti_Asesmen_Diagnostik: true,
  showMAKomponenInti_Asesmen_Formatif: true,
  showMAKomponenInti_Asesmen_Sumatif: true,
  showMAKomponenInti_PengayaanRemedial: true,
  showMAKomponenInti_Refleksi: true,
  showMALampiran_LKPD: true,
  showMALampiran_BahanBacaan: true,
  showMALampiran_Glosarium: true,
  showMALampiran_DaftarPustaka: true,
};

// New Types for Master Data and Timetable
export interface Subject {
  id: string;
  name: string;
  code?: string; // e.g., MTK-01
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  nip?: string; // Nomor Induk Pegawai
  subjectIds: string[]; // Array of Subject IDs they teach
  userId?: string; // Optional: link to a User account
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // e.g., "07:00"
  endTime: string; // e.g., "07:45"
  // jpDurationMinutes will determine the length implicitly
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  timeSlotId?: string; // Reference to a TimeSlot or just store start/end times directly
  startTime: string; // e.g., 07:00
  endTime: string;   // e.g., 07:45
  subjectId: string;
  teacherId: string;
  classOrGrade: string; // e.g., "Kelas X-A" or "Fase E Grup 1" // Can be SchoolClass.id
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g., "Kelas X IPA 1", "Fase A Kelompok A"
  gradeLevel: string; // e.g., "X", "Fase A", "VII" (can be more specific than SchoolProfile.jenjangPendidikan)
  homeroomTeacherId?: string; // Wali Kelas (Teacher ID)
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
}


export interface TeachingPeriodSettings {
  jpDurationMinutes: number;
}

// Storage Keys
export const MODUL_AJAR_STORAGE_KEY = "appModulAjar";
export const SUBJECTS_STORAGE_KEY = "appSubjects";
export const TEACHERS_STORAGE_KEY = "appTeachers";
export const TIMETABLES_STORAGE_KEY = "appTimetables";
export const SCHOOL_CLASSES_STORAGE_KEY = "appSchoolClasses"; // New
export const TEACHING_PERIOD_SETTINGS_KEY = "appTeachingPeriodSettings";
export const LESSON_PLANS_STORAGE_KEY = "appLessonPlans";
export const ANNUAL_PROGRAMS_STORAGE_KEY = "appAnnualPrograms";
export const SEMESTER_PROGRAMS_STORAGE_KEY = "appSemesterPrograms";
export const SCHOOL_PROFILE_STORAGE_KEY = "schoolProfile"; // Same as SCHOOL_SETTINGS_STORAGE_KEY
export const SCHOOL_SETTINGS_STORAGE_KEY = "schoolProfile"; // Alias for clarity
export const APP_USERS_STORAGE_KEY = "appUsers";
export const CURRICULUM_STORAGE_KEY = "app-default-curriculum";
export const THEME_STORAGE_KEY = "app-theme";

