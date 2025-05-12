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


export const initialLessonPlansData: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [];
export const initialAnnualProgramsData: Omit<AnnualProgram, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [];
export const initialSemesterProgramsData: Omit<SemesterProgram, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [];
export const initialModulAjarData: Omit<ModulAjar, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId' | 'curriculumType' | 'type'>[] = [];
export const initialSubjectsData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [];
export const initialTeachersData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [];
export const initialClassesData: Omit<SchoolClass, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [];
export const initialAcademicEventsData: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [];