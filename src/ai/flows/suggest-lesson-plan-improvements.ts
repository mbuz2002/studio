// src/ai/flows/suggest-lesson-plan-improvements.ts
'use server';

/**
 * @fileOverview File ini mendefinisikan alur Genkit yang memberikan saran berbasis AI untuk meningkatkan rencana pembelajaran, dengan fokus pada Kurikulum Merdeka.
 *
 * - suggestLessonPlanImprovements - Fungsi yang menerima draf rencana pembelajaran dan mengembalikan saran perbaikan.
 * - SuggestLessonPlanImprovementsInput - Tipe input untuk fungsi suggestLessonPlanImprovements.
 * - SuggestLessonPlanImprovementsOutput - Tipe return untuk fungsi suggestLessonPlanImprovements.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLessonPlanImprovementsInputSchema = z.object({
  lessonPlan: z
    .string()
    .describe('Draf rencana pembelajaran (RPP atau Modul Ajar) yang akan ditingkatkan, dalam Bahasa Indonesia.'),
  jenjangFaseKelas: z.string().optional().describe('Jenjang, fase, atau kelas sasaran (misalnya, "Fase D (Kelas 7 SMP)"). Opsional, namun membantu memberikan saran yang lebih kontekstual.'),
});
export type SuggestLessonPlanImprovementsInput = z.infer<typeof SuggestLessonPlanImprovementsInputSchema>;

const SuggestLessonPlanImprovementsOutputSchema = z.object({
  tujuanPembelajaran: z
    .string()
    .describe('Saran perbaikan untuk tujuan pembelajaran atau Capaian Pembelajaran (CP) agar lebih jelas, terukur, dan selaras dengan Kurikulum Merdeka.'),
  kegiatanPembelajaran: z
    .string()
    .describe('Saran perbaikan untuk kegiatan pembelajaran agar lebih inovatif, interaktif, berpusat pada peserta didik, dan relevan dengan konteks Kurikulum Merdeka.'),
  asesmen: z
    .string()
    .describe('Saran perbaikan untuk asesmen (formatif dan sumatif) agar lebih variatif, autentik, dan mampu mengukur ketercapaian tujuan pembelajaran secara efektif.'),
  pembelajaranBerdiferensiasi: z
    .string()
    .describe('Saran strategi pembelajaran berdiferensiasi (konten, proses, produk) untuk mengakomodasi kebutuhan belajar peserta didik yang beragam.'),
  integrasiProfilPelajarPancasila: z
    .string()
    .describe('Saran cara mengintegrasikan dimensi-dimensi Profil Pelajar Pancasila ke dalam rencana pembelajaran.'),
  penggunaanMediaSumberBelajar: z
    .string()
    .describe('Saran penggunaan media atau sumber belajar yang relevan, menarik, dan mendukung pencapaian tujuan pembelajaran.'),
});
export type SuggestLessonPlanImprovementsOutput = z.infer<typeof SuggestLessonPlanImprovementsOutputSchema>;

export async function suggestLessonPlanImprovements(
  input: SuggestLessonPlanImprovementsInput
): Promise<SuggestLessonPlanImprovementsOutput> {
  return suggestLessonPlanImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLessonPlanImprovementsPrompt',
  input: {schema: SuggestLessonPlanImprovementsInputSchema},
  output: {schema: SuggestLessonPlanImprovementsOutputSchema},
  prompt: `Anda adalah seorang konsultan ahli Kurikulum Merdeka yang bertugas membantu guru meningkatkan kualitas Rencana Pelaksanaan Pembelajaran (RPP) atau Modul Ajar mereka.
Analisis rencana pembelajaran berikut dan berikan saran perbaikan yang konstruktif dan actionable dalam Bahasa Indonesia.
{{#if jenjangFaseKelas}}
Rencana ini ditujukan untuk jenjang/fase/kelas: {{{jenjangFaseKelas}}}.
{{/if}}

Draf Rencana Pembelajaran:
{{{lessonPlan}}}

Fokuskan saran Anda pada aspek-aspek berikut, sesuai dengan prinsip Kurikulum Merdeka:
1.  **Tujuan Pembelajaran/CP**: Apakah sudah jelas, terukur, dan relevan? Bagaimana cara meningkatkannya?
2.  **Kegiatan Pembelajaran**: Apakah sudah berpusat pada peserta didik, interaktif, dan mendorong kemandirian belajar? Bagaimana membuatnya lebih menarik dan bermakna?
3.  **Asesmen**: Apakah sudah variatif (formatif dan sumatif) dan autentik? Bagaimana memastikan asesmen mengukur kompetensi yang diharapkan?
4.  **Pembelajaran Berdiferensiasi**: Bagaimana strategi diferensiasi (konten, proses, produk) dapat diterapkan atau ditingkatkan untuk melayani keberagaman peserta didik?
5.  **Integrasi Profil Pelajar Pancasila**: Bagaimana dimensi Profil Pelajar Pancasila dapat diintegrasikan secara lebih eksplisit dan bermakna?
6.  **Penggunaan Media/Sumber Belajar**: Apakah media/sumber belajar sudah optimal dan relevan? Adakah saran media/sumber lain yang lebih inovatif?

Berikan saran yang spesifik dan praktis. Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan.
`,
});

const suggestLessonPlanImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestLessonPlanImprovementsFlow',
    inputSchema: SuggestLessonPlanImprovementsInputSchema,
    outputSchema: SuggestLessonPlanImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
