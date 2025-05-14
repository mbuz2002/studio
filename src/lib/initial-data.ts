
import type { LessonPlan, AnnualProgram, SemesterProgram, ModulAjar, Subject, Teacher, SchoolClass, User, School, AcademicEvent } from '@/types';
import { DEFAULT_FEATURE_SETTINGS } from '@/types';

export const DEFAULT_SCHOOL_ID = "default-school-001";
export const SUPERADMIN_ID = "superadmin-001";


export const initialSuperAdminUser: User = {
  id: SUPERADMIN_ID,
  name: "Super Admin Utama",
  email: "admin",
  role: "SuperAdmin",
  avatarUrl: `https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff&font-size=0.45`,
  updatedAt: new Date().toISOString(),
  // No schoolId
};

const today = new Date();
const oneYearFromToday = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

export const initialDefaultSchool: School = {
  id: DEFAULT_SCHOOL_ID,
  name: "Sekolah GUMPLA AI (Contoh)",
  jenjangPendidikan: "SMA/MA",
  alamat: "Jl. Demo Digital No. 1",
  nomorTelepon: "021-123-4567",
  emailSekolah: "info@sekolahgumpla.ai",
  namaKepalaSekolah: "Bpk. Demo Kasek",
  npsn: "00000000",
  logoUrl: "",
  kotaSekolah: "Kota Digital",
  subscriptionStatus: 'trial',
  subscriptionStartDate: today.toISOString(),
  subscriptionEndDate: oneYearFromToday.toISOString(),
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  adminEmail: 'admin@sekolahgumpla.ai',
  featureSettings: { ...DEFAULT_FEATURE_SETTINGS },
};

// Demo Users for the Default School
export const initialDemoAdminUser: User = {
  id: `user-admin-${DEFAULT_SCHOOL_ID}`,
  name: "Admin Sekolah Demo",
  email: "admin@sekolahgumpla.ai",
  role: "Admin",
  schoolId: DEFAULT_SCHOOL_ID,
  avatarUrl: `https://ui-avatars.com/api/?name=Admin+Sekolah&background=random&color=fff`,
  updatedAt: new Date().toISOString(),
};

export const initialDemoKepsekUser: User = {
  id: `user-kepsek-${DEFAULT_SCHOOL_ID}`,
  name: "Kepala Sekolah Demo",
  email: "kepsek@sekolahgumpla.ai",
  role: "KepalaSekolah",
  schoolId: DEFAULT_SCHOOL_ID,
  avatarUrl: `https://ui-avatars.com/api/?name=Kepala+Sekolah&background=random&color=fff`,
  updatedAt: new Date().toISOString(),
};

export const initialDemoWakaUser: User = {
  id: `user-waka-${DEFAULT_SCHOOL_ID}`,
  name: "Waka Kurikulum Demo",
  email: "waka@sekolahgumpla.ai",
  role: "WakaKurikulum",
  schoolId: DEFAULT_SCHOOL_ID,
  avatarUrl: `https://ui-avatars.com/api/?name=Waka+Kurikulum&background=random&color=fff`,
  updatedAt: new Date().toISOString(),
};

export const initialDemoGuruUser: User = {
  id: `user-guru-${DEFAULT_SCHOOL_ID}`,
  name: "Guru Demo",
  email: "guru@sekolahgumpla.ai",
  role: "Guru",
  schoolId: DEFAULT_SCHOOL_ID,
  avatarUrl: `https://ui-avatars.com/api/?name=Guru+Demo&background=random&color=fff`,
  updatedAt: new Date().toISOString(),
};

export const initialDemoTUUser: User = {
  id: `user-tu-${DEFAULT_SCHOOL_ID}`,
  name: "Tata Usaha Demo",
  email: "tu@sekolahgumpla.ai",
  role: "TataUsaha",
  schoolId: DEFAULT_SCHOOL_ID,
  avatarUrl: `https://ui-avatars.com/api/?name=Tata+Usaha&background=random&color=fff`,
  updatedAt: new Date().toISOString(),
};


export const initialLessonPlansData: LessonPlan[] = [];
export const initialAnnualProgramsData: AnnualProgram[] = [];
export const initialSemesterProgramsData: SemesterProgram[] = [];
export const initialModulAjarData: ModulAjar[] = [];

export const initialSubjectsData: Subject[] = [
  { id: "subj-demo-1", name: "Matematika Contoh", code: "MTK-DEMO", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: initialDemoAdminUser.id, schoolId: DEFAULT_SCHOOL_ID },
  { id: "subj-demo-2", name: "Bahasa Indonesia Contoh", code: "IND-DEMO", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: initialDemoAdminUser.id, schoolId: DEFAULT_SCHOOL_ID },
];
export const initialTeachersData: Teacher[] = [
  { id: "teacher-demo-1", name: "Guru Matematika Demo", nip: "111222333", subjectIds: ["subj-demo-1"], userId: initialDemoGuruUser.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: initialDemoAdminUser.id, schoolId: DEFAULT_SCHOOL_ID },
];
export const initialClassesData: SchoolClass[] = [
  { id: "class-demo-1", name: "Kelas X Demo", gradeLevel: "Kelas X SMA/MA", homeroomTeacherId: "teacher-demo-1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdByUserId: initialDemoAdminUser.id, schoolId: DEFAULT_SCHOOL_ID },
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
    createdByUserId: initialDemoAdminUser.id,
    schoolId: DEFAULT_SCHOOL_ID,
  },
];
