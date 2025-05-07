// src/ai/flows/generate-lesson-plan-from-topic.ts
'use server';

/**
 * @fileOverview Membuat draf rencana pembelajaran dari topik dan jenjang/fase/kelas yang diberikan, sesuai Kurikulum Merdeka.
 *
 * - generateLessonPlanFromTopic - Fungsi yang membuat rencana pembelajaran.
 * - GenerateLessonPlanInput - Tipe input untuk fungsi generateLessonPlanFromTopic.
 * - GenerateLessonPlanOutput - Tipe return untuk fungsi generateLessonPlanFromTopic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonPlanInputSchema = z.object({
  topic: z.string().describe('Topik atau materi pembelajaran.'),
  jenjangFaseKelas: z.string().describe('Jenjang, fase, atau kelas sasaran (misalnya, "Fase D (Kelas 7 SMP)", "PAUD", "Kelas 10 SMAK").'),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
  title: z.string().describe('Judul rencana pembelajaran yang menarik dan relevan.'),
  learningObjectives: z.array(z.string()).describe('Tujuan pembelajaran atau Capaian Pembelajaran (CP) yang ingin dicapai, dirumuskan dengan jelas dan terukur.'),
  suggestedActivities: z.array(z.string()).describe('Saran kegiatan pembelajaran yang variatif, menarik, dan berpusat pada peserta didik, sesuai dengan prinsip Kurikulum Merdeka (misalnya, proyek, diskusi, eksplorasi).'),
  assessmentIdeas: z.array(z.string()).describe('Ide-ide asesmen formatif dan sumatif yang relevan dengan tujuan pembelajaran dan kegiatan, mendukung pembelajaran berdiferensiasi.'),
  differentiationStrategies: z.array(z.string()).describe('Strategi diferensiasi untuk mengakomodasi kebutuhan belajar peserta didik yang beragam.'),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

export async function generateLessonPlanFromTopic(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanFromTopicPrompt',
  input: {schema: GenerateLessonPlanInputSchema},
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `Anda adalah seorang guru berpengalaman yang ahli dalam menyusun Rencana Pelaksanaan Pembelajaran (RPP) atau Modul Ajar sesuai dengan prinsip-prinsip Kurikulum Merdeka di Indonesia.
Buatlah draf rencana pembelajaran untuk topik dan jenjang/fase/kelas berikut:

Topik: {{{topic}}}
Jenjang/Fase/Kelas: {{{jenjangFaseKelas}}}

Rencana pembelajaran harus mencakup:
1.  Judul yang menarik dan relevan dengan topik.
2.  Tujuan Pembelajaran atau Capaian Pembelajaran (CP) yang jelas, spesifik, terukur, dapat dicapai, relevan, dan berbatas waktu (SMART), jika memungkinkan. Fokus pada kompetensi yang ingin dikembangkan.
3.  Saran Kegiatan Pembelajaran yang inovatif, interaktif, kolaboratif, dan berpusat pada peserta didik. Integrasikan elemen Profil Pelajar Pancasila jika relevan. Pertimbangkan pembelajaran berdiferensiasi.
4.  Ide Asesmen/Penilaian yang beragam (formatif dan sumatif) untuk mengukur ketercapaian Tujuan Pembelajaran. Sertakan contoh instrumen atau teknik penilaian.
5.  Strategi Diferensiasi untuk mendukung peserta didik dengan berbagai kebutuhan belajar (misalnya, konten, proses, produk).

Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan dan menggunakan Bahasa Indonesia yang baik dan benar.
`,
});

const generateLessonPlanFromTopicFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFromTopicFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async (input: GenerateLessonPlanInput) => { // Ensure input is explicitly typed for clarity
    const {output} = await prompt(input);
    return output!;
  }
);


    