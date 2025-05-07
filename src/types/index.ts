export interface CurriculumItem {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface LessonPlan extends CurriculumItem {
  type: 'RPP';
  topic: string;
  learningObjectives: string[];
  activities: string[];
  assessment: string;
  materials?: string;
}

export interface AnnualProgram extends CurriculumItem {
  type: 'PROTA';
  year: string;
  semester1Topics: string[];
  semester2Topics: string[];
}

export interface SemesterProgram extends CurriculumItem {
  type: 'Promes';
  semester: '1' | '2';
  year: string; // e.g. "2023/2024"
  weeklyBreakdown: { week: number; topic: string; activities: string }[];
}

export type AnyCurriculumItem = LessonPlan | AnnualProgram | SemesterProgram;

// For AI flow outputs - already defined in AI flow files, but useful to have centralized if expanded
export type { GenerateLessonPlanOutput } from '@/ai/flows/generate-lesson-plan-from-topic';
export type { SuggestLessonPlanImprovementsOutput } from '@/ai/flows/suggest-lesson-plan-improvements';
