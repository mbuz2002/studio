export type UserRole = "Admin" | "KepalaSekolah" | "WakaKurikulum" | "TataUsaha" | "Guru" | "SuperAdmin";
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

export interface SchoolFeatureSettings {
  aiToolsEnabled: boolean;
  academicCalendarEnabled: boolean;
  timetableManagementEnabled: boolean;
  masterDataManagementEnabled: boolean;
}

export const DEFAULT_FEATURE_SETTINGS: SchoolFeatureSettings = {
  aiToolsEnabled: true,
  academicCalendarEnabled: true,
  timetableManagementEnabled: true,
  masterDataManagementEnabled: true,
};
export interface School {
  id: string;
  name: string; 
  jenjangPendidikan: EducationLevel;
  alamat: string;
  nomorTelepon: string;
  emailSekolah: string;
  namaKepalaSekolah: string;
  npsn?: string; 
  logoUrl?: string; 
  kotaSekolah?: string;
  adminEmail?: string; 
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  paymentDetails?: string; 
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  featureSettings?: SchoolFeatureSettings; // Added feature settings
}

export interface AppSettings {
  appLogoUrl?: string;
  appName?: string;
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
  schoolId?: string; // Make schoolId optional for items that might not be school-specific or for initial demo data
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

export interface ModulAjarIdentitas {
  namaPenyusun: string;
  institusi: string;
  tahunAjar: string;
  jenjangSekolah: string; 
  fase: string; 
  kelasSemester: string; 
  alokasiWaktu: string; 
  mataPelajaran: string;
  elemenCapaianPembelajaran?: string[];
}

export interface ModulAjarKomponenInti {
  tujuanPembelajaran: string[];
  pemahamanBermakna: string[];
  pertanyaanPemantik: string[];
  kegiatanPembelajaran: {
    pendahuluan: string[]; 
    inti: {
      langkah: string; 
      detailAktivitas: string[];
    }[];
    penutup: string[]; 
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
  lembarKerjaPesertaDidik?: string; 
  bahanBacaanGuruSiswa?: string[];
  glosarium?: { istilah: string; penjelasan: string }[];
  daftarPustaka?: string[];
}

export interface GenerateKurikulumMerdekaModuleOutput {
  judulModul: string;
  identitasModul: ModulAjarIdentitas;
  kompetensiAwal?: string[];
  profilPelajarPancasila: string[]; 
  saranaPrasarana: string[];
  targetPesertaDidik: string;
  modelPembelajaran: string; 
  komponenInti: ModulAjarKomponenInti;
  lampiran?: ModulAjarLampiran;
}

export interface ModulAjar extends GenerateKurikulumMerdekaModuleOutput, Omit<CurriculumItem, 'title' | 'subject' | 'gradeLevel' | 'curriculumType'> {
  id: string;
  type: 'ModulAjar';
  title: string; 
  subject: string; 
  gradeLevel: string; 
  curriculumType: "Kurikulum Merdeka";
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
  schoolId?: string; 
}


export type AnyCurriculumItem = LessonPlan | AnnualProgram | SemesterProgram | ModulAjar;

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
  schoolProfile: SchoolProfile | null; // Updated to allow null if no profile
  schools?: School[]; // For SuperAdmin export/import
  appUsers: User[];
  subjects?: Subject[];
  teachers?: Teacher[];
  timetables?: TimetableEntry[];
  schoolClasses?: SchoolClass[]; 
  teachingPeriodSettings?: TeachingPeriodSettings | null; // Updated to allow null
  academicEvents?: AcademicEvent[]; 
  appSettings?: AppSettings | null; // Updated to allow null
}


export interface PrintOptionsModulAjar {
  showKopSurat: boolean;
  showMAIdentitas: boolean;
  showMAKompetensiAwal: boolean;
  showMAProfilPelajarPancasila: boolean;
  showMASaranaPrasarana: boolean;
  showMATargetPesertaDidik: boolean;
  showMAModelPembelajaran: boolean;
  showMAKomponenInti_TujuanPembelajaran: boolean;
  showMAKomponenInti_PemahamanBermakna: boolean;
  showMAKomponenInti_PertanyaanPemantik: boolean;
  showMAKomponenInti_KegiatanPembelajaran: boolean; 
  showMAKomponenInti_Kegiatan_Pendahuluan: boolean;
  showMAKomponenInti_Kegiatan_Inti: boolean;
  showMAKomponenInti_Kegiatan_Penutup: boolean;
  showMAKomponenInti_Asesmen: boolean; 
  showMAKomponenInti_Asesmen_Diagnostik: boolean;
  showMAKomponenInti_Asesmen_Formatif: boolean;
  showMAKomponenInti_Asesmen_Sumatif: boolean;
  showMAKomponenInti_PengayaanRemedial: boolean;
  showMAKomponenInti_Refleksi: boolean;
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

export interface Subject {
  id: string;
  name: string;
  code?: string; 
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
  schoolId?: string; 
}

export interface Teacher {
  id: string;
  name: string;
  nip?: string; 
  subjectIds: string[]; 
  userId?: string; 
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
  schoolId?: string; 
}

export interface TimeSlot {
  id: string;
  startTime: string; 
  endTime: string; 
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  timeSlotId?: string; 
  startTime: string; 
  endTime: string;   
  subjectId: string;
  teacherId: string;
  classOrGrade: string; 
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
  schoolId?: string; 
}

export interface SchoolClass {
  id: string;
  name: string; 
  gradeLevel: string; 
  homeroomTeacherId?: string; 
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
  schoolId?: string; 
}


export interface TeachingPeriodSettings {
  jpDurationMinutes: number; 
}

export type AcademicEventType = 'Libur Nasional' | 'Libur Semester' | 'Ujian Sekolah' | 'Kegiatan Sekolah' | 'Tanggal Penting' | 'Periode Semester Aktif' | 'Lainnya';

export interface AcademicEvent {
  id: string;
  title: string;
  date: string; 
  endDate?: string; 
  description?: string;
  type: AcademicEventType;
  isNationalHoliday?: boolean; 
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
  schoolId?: string; 
}


// Storage Keys
export const MODUL_AJAR_STORAGE_KEY = "appModulAjar";
export const SUBJECTS_STORAGE_KEY = "appSubjects";
export const TEACHERS_STORAGE_KEY = "appTeachers";
export const TIMETABLES_STORAGE_KEY = "appTimetables";
export const SCHOOL_CLASSES_STORAGE_KEY = "appSchoolClasses"; 
export const TEACHING_PERIOD_SETTINGS_KEY = "appTeachingPeriodSettings";
export const LESSON_PLANS_STORAGE_KEY = "appLessonPlans";
export const ANNUAL_PROGRAMS_STORAGE_KEY = "appAnnualPrograms";
export const SEMESTER_PROGRAMS_STORAGE_KEY = "appSemesterPrograms";
export const SCHOOL_PROFILE_STORAGE_KEY = "schoolProfile"; 
export const SCHOOLS_STORAGE_KEY = "appSchools"; 
export const APP_USERS_STORAGE_KEY = "appUsers";
export const CURRICULUM_STORAGE_KEY = "app-default-curriculum";
export const THEME_STORAGE_KEY = "app-theme";
export const ACADEMIC_EVENTS_STORAGE_KEY = "appAcademicEvents";
export const SAAS_APP_SETTINGS_STORAGE_KEY = "appSaasSettings"; 

