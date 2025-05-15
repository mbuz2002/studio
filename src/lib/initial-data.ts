
import type { LessonPlan, AnnualProgram, SemesterProgram, ModulAjar, Subject, Teacher, SchoolClass, User, School, AcademicEvent } from '@/types';
import { DEFAULT_FEATURE_SETTINGS } from '@/types';

export const DEFAULT_SCHOOL_ID = "default-school-001";
export const SUPERADMIN_ID = "superadmin-001";


export const initialSuperAdminUser: User = {
  id: SUPERADMIN_ID,
  name: "Super Admin Utama",
  email: "admin", // SuperAdmin username is 'admin'
  role: "SuperAdmin",
  avatarUrl: `https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff&font-size=0.45`,
  updatedAt: new Date().toISOString(),
  // No schoolId
};

const today = new Date();
const oneYearFromToday = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

export const initialDefaultSchool: School = {
  id: DEFAULT_SCHOOL_ID,
  name: "Sekolah GUMPLA AI (Contoh SD)",
  jenjangPendidikan: "SD/MI", // Changed to SD/MI
  alamat: "Jl. Demo Digital No. 1, Kelurahan Cerdas, Kecamatan Inovasi",
  nomorTelepon: "021-123-4567",
  emailSekolah: "info@sekolahdasargumpla.ai",
  namaKepalaSekolah: "Ibu Teladan, S.Pd.",
  npsn: "00000001", // Example NPSN for SD
  logoUrl: "",
  kotaSekolah: "Kota Digital",
  subscriptionStatus: 'trial',
  subscriptionStartDate: today.toISOString(),
  subscriptionEndDate: oneYearFromToday.toISOString(),
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  adminEmail: 'admin.sd@sekolahgumpla.ai', // Changed admin email for SD example
  featureSettings: { ...DEFAULT_FEATURE_SETTINGS },
};

// Demo Users for the Default School
export const initialDemoAdminUser: User = {
  id: `user-admin-${DEFAULT_SCHOOL_ID}`,
  name: "Admin Sekolah Demo (SD)",
  email: "admin.sd@sekolahgumpla.ai", // Changed email
  role: "Admin",
  schoolId: DEFAULT_SCHOOL_ID,
  avatarUrl: `https://ui-avatars.com/api/?name=Admin+SD&background=random&color=fff`,
  updatedAt: new Date().toISOString(),
};

export const initialDemoKepsekUser: User = {
  id: `user-kepsek-${DEFAULT_SCHOOL_ID}`,
  name: "Kepala Sekolah Demo (SD)",
  email: "kepsek.sd@sekolahgumpla.ai", // Changed email
  role: "KepalaSekolah",
  schoolId: DEFAULT_SCHOOL_ID,
  avatarUrl: `https://ui-avatars.com/api/?name=Kepala+Sekolah+SD&background=random&color=fff`,
  updatedAt: new Date().toISOString(),
};

export const initialDemoWakaUser: User = {
  id: `user-waka-${DEFAULT_SCHOOL_ID}`,
  name: "Waka Kurikulum Demo (SD)",
  email: "waka.sd@sekolahgumpla.ai", // Changed email
  role: "WakaKurikulum",
  schoolId: DEFAULT_SCHOOL_ID,
  avatarUrl: `https://ui-avatars.com/api/?name=Waka+Kurikulum+SD&background=random&color=fff`,
  updatedAt: new Date().toISOString(),
};

export const initialDemoGuruUser: User = {
  id: `user-guru-${DEFAULT_SCHOOL_ID}`,
  name: "Guru Kelas Demo (SD)",
  email: "guru.sd@sekolahgumpla.ai", // Changed email
  role: "Guru",
  schoolId: DEFAULT_SCHOOL_ID,
  avatarUrl: `https://ui-avatars.com/api/?name=Guru+SD&background=random&color=fff`,
  updatedAt: new Date().toISOString(),
};

export const initialDemoTUUser: User = {
  id: `user-tu-${DEFAULT_SCHOOL_ID}`,
  name: "Tata Usaha Demo (SD)",
  email: "tu.sd@sekolahgumpla.ai", // Changed email
  role: "TataUsaha",
  schoolId: DEFAULT_SCHOOL_ID,
  avatarUrl: `https://ui-avatars.com/api/?name=Tata+Usaha+SD&background=random&color=fff`,
  updatedAt: new Date().toISOString(),
};


export const initialLessonPlansData: LessonPlan[] = [];
export const initialAnnualProgramsData: AnnualProgram[] = [];
export const initialSemesterProgramsData: SemesterProgram[] = [];
export const initialModulAjarData: ModulAjar[] = [];

export const initialSubjectsData: Subject[] = [
  { id: "subj-demo-1", name: "Matematika (SD)", code: "MTK-SD-DEMO", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: initialDemoAdminUser.id, schoolId: DEFAULT_SCHOOL_ID },
  { id: "subj-demo-2", name: "Bahasa Indonesia (SD)", code: "IND-SD-DEMO", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: initialDemoAdminUser.id, schoolId: DEFAULT_SCHOOL_ID },
  { id: "subj-demo-3", name: "Tematik (SD)", code: "TEMATIK-SD-DEMO", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: initialDemoAdminUser.id, schoolId: DEFAULT_SCHOOL_ID },
];
export const initialTeachersData: Teacher[] = [
  { id: "teacher-demo-1", name: "Guru Kelas 1 Demo", nip: "111222333001", subjectIds: ["subj-demo-3"], userId: initialDemoGuruUser.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: initialDemoAdminUser.id, schoolId: DEFAULT_SCHOOL_ID },
  { id: "teacher-demo-2", name: "Guru Matematika SD Demo", nip: "111222333002", subjectIds: ["subj-demo-1"], userId: `user-guru-math-sd-${DEFAULT_SCHOOL_ID}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: initialDemoAdminUser.id, schoolId: DEFAULT_SCHOOL_ID },
];
export const initialClassesData: SchoolClass[] = [
  { id: "class-demo-1", name: "Kelas 1A (SD)", gradeLevel: "Fase A (Kelas 1-2 SD/MI)", homeroomTeacherId: "teacher-demo-1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: initialDemoAdminUser.id, schoolId: DEFAULT_SCHOOL_ID },
  { id: "class-demo-2", name: "Kelas 4B (SD)", gradeLevel: "Fase B (Kelas 3-4 SD/MI)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: initialDemoAdminUser.id, schoolId: DEFAULT_SCHOOL_ID },
];
export const initialAcademicEventsData: AcademicEvent[] = [
    {
    id: "holiday-demo-1",
    title: "Hari Kemerdekaan (Demo)",
    date: `${new Date().getFullYear()}-08-17`,
    type: "Libur Nasional",
    isNationalHoliday: true,
    description: "Peringatan Proklamasi Kemerdekaan Indonesia (Data Demo).",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: initialDemoAdminUser.id, // Should be global or use a system ID if truly global
    // schoolId can be undefined for national holidays
  },
   {
    id: "semester-start-demo",
    title: "Awal Semester Ganjil (Demo SD)",
    date: `${new Date().getFullYear()}-07-15`,
    endDate: `${new Date().getFullYear() + 1}-06-30`, // Example active period for a year
    type: "Periode Semester Aktif",
    description: "Periode pembelajaran aktif untuk semester ganjil.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: initialDemoAdminUser.id,
    schoolId: DEFAULT_SCHOOL_ID,
  },
];
