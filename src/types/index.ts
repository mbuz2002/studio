export interface CurriculumItem {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string; // e.g., "Fase A (Kelas 1-2 SD)", "PAUD", "Kelas 10 SMA"
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface LessonPlan extends CurriculumItem {
  type: 'RPP'; // Rencana Pelaksanaan Pembelajaran
  topic: string; // Topik atau Materi Pembelajaran
  learningObjectives: string[]; // Tujuan Pembelajaran / Capaian Pembelajaran
  activities: string[]; // Kegiatan Pembelajaran
  assessment: string; // Asesmen / Penilaian
  materials?: string; // Media / Sumber Belajar
}

export interface AnnualProgram extends CurriculumItem {
  type: 'PROTA'; // Program Tahunan
  year: string; // Tahun Ajaran, e.g., "2023/2024"
  semester1Topics: string[]; // Alokasi Waktu atau Topik Semester Ganjil
  semester2Topics: string[]; // Alokasi Waktu atau Topik Semester Genap
}

export interface SemesterProgram extends CurriculumItem {
  type: 'Promes'; // Program Semester
  semester: '1' | '2'; // 1 for Ganjil, 2 for Genap
  year: string; // Tahun Ajaran, e.g. "2023/2024"
  weeklyBreakdown: { week: number; topic: string; activities: string }[]; // Rincian Mingguan
}

export type AnyCurriculumItem = LessonPlan | AnnualProgram | SemesterProgram;

// For AI flow outputs - already defined in AI flow files, but useful to have centralized if expanded
export type { GenerateLessonPlanOutput } from '@/ai/flows/generate-lesson-plan-from-topic';
export type { SuggestLessonPlanImprovementsOutput } from '@/ai/flows/suggest-lesson-plan-improvements';
