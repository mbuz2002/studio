

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


export type AnyCurriculumItem = LessonPlan | AnnualProgram | SemesterProgram;

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
  schoolProfile: SchoolProfile | null;
  appUsers: User[];
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
