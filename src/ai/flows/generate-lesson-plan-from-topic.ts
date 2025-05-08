
// src/ai/flows/generate-lesson-plan-from-topic.ts
'use server';

/**
 * @fileOverview Membuat draf rencana pembelajaran (Modul Ajar/RPP) dari topik, jenjang, dan jenis kurikulum yang diberikan.
 *
 * - generateLessonPlanFromTopic - Fungsi yang membuat rencana pembelajaran.
 * - GenerateLessonPlanInput - Tipe input untuk fungsi generateLessonPlanFromTopic.
 * - GenerateLessonPlanOutput - Tipe return untuk fungsi generateLessonPlanFromTopic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CurriculumFramework } from '@/types';

const GenerateLessonPlanInputSchema = z.object({
  topic: z.string().describe('Topik atau materi pembelajaran.'),
  jenjangFaseKelas: z.string().describe('Jenjang, fase, atau kelas sasaran (misalnya, "Fase D (Kelas 7 SMP)", "PAUD", "Kelas 10 SMAK").'),
  curriculumType: z.enum(["Kurikulum Merdeka", "K-13", "KTSP 2006"]).describe("Jenis kurikulum yang digunakan sebagai acuan (Kurikulum Merdeka, K-13, KTSP 2006).")
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
  title: z.string().describe('Judul modul ajar/RPP yang menarik dan relevan.'),
  learningObjectives: z.array(z.string()).describe('Tujuan pembelajaran (atau Capaian Pembelajaran/TP untuk Kurikulum Merdeka, Tujuan Pembelajaran berbasis IPK untuk K-13/KTSP) yang ingin dicapai.'),
  
  // Kurikulum Merdeka specific
  pemahamanBermakna: z.array(z.string()).optional().describe('Deskripsi pemahaman bermakna (Kurikulum Merdeka).'),
  pertanyaanPemantik: z.array(z.string()).optional().describe('Pertanyaan-pertanyaan pemantik (Kurikulum Merdeka).'),
  differentiationStrategies: z.array(z.string()).optional().describe('Strategi diferensiasi (Kurikulum Merdeka).'),

  // KTSP & K-13 specific
  standarKompetensi: z.array(z.string()).optional().describe("Standar Kompetensi (SK) - relevan untuk KTSP."),
  kompetensiInti: z.array(z.string()).optional().describe("Kompetensi Inti (KI) - relevan untuk K-13."),
  kompetensiDasar: z.array(z.string()).optional().describe("Kompetensi Dasar (KD) - relevan untuk KTSP dan K-13."),
  indikatorPencapaianKompetensi: z.array(z.string()).optional().describe("Indikator Pencapaian Kompetensi (IPK) - relevan untuk KTSP dan K-13."),
  metodePembelajaran: z.array(z.string()).optional().describe("Metode pembelajaran yang digunakan (KTSP, K-13)."),

  // Common
  langkahPembelajaran: z.object({
    pendahuluan: z.array(z.string()).describe('Rangkaian kegiatan pembuka pembelajaran.'),
    kegiatanInti: z.array(z.string()).describe('Rangkaian kegiatan inti pembelajaran.'),
    penutup: z.array(z.string()).describe('Rangkaian kegiatan penutup pembelajaran.'),
  }).describe('Struktur langkah-langkah kegiatan pembelajaran.'),
  assessmentStrategies: z.array(z.string()).describe('Strategi dan ide-ide asesmen yang relevan (diagnostik, formatif, sumatif).'),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

export async function generateLessonPlanFromTopic(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanFromTopicPrompt',
  input: {schema: GenerateLessonPlanInputSchema},
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `Anda adalah seorang guru berpengalaman yang ahli dalam menyusun Modul Ajar (MA) atau Rencana Pelaksanaan Pembelajaran (RPP) Plus.
Buatlah draf Modul Ajar/RPP untuk:

Topik: {{{topic}}}
Jenjang/Fase/Kelas: {{{jenjangFaseKelas}}}
Kurikulum Acuan: {{{curriculumType}}}

Modul Ajar/RPP harus mencakup komponen inti berikut, disesuaikan dengan kurikulum yang dipilih:

1.  **Judul Modul Ajar/RPP**: Judul yang menarik, jelas, dan relevan.
2.  **Tujuan Pembelajaran**: 
    *   Untuk Kurikulum Merdeka: Rumuskan Tujuan Pembelajaran (TP) yang merupakan turunan dari Capaian Pembelajaran (CP) atau Alur Tujuan Pembelajaran (ATP).
    *   Untuk K-13/KTSP: Rumuskan tujuan pembelajaran berdasarkan Indikator Pencapaian Kompetensi (IPK) yang diturunkan dari Kompetensi Dasar (KD).
3.  {{#if (eq curriculumType "Kurikulum Merdeka")}}
    **Pemahaman Bermakna**: Jelaskan manfaat atau pemahaman penting yang akan diperoleh peserta didik.
    **Pertanyaan Pemantik**: Susun beberapa pertanyaan yang dapat memantik rasa ingin tahu.
    {{/if}}
4.  {{#if (or (eq curriculumType "KTSP 2006") (eq curriculumType "K-13"))}}
    {{#if (eq curriculumType "KTSP 2006")}}
    **Standar Kompetensi (SK)**: Sebutkan SK yang relevan.
    {{/if}}
    {{#if (eq curriculumType "K-13")}}
    **Kompetensi Inti (KI)**: Sebutkan KI yang relevan (KI-1, KI-2, KI-3, KI-4).
    {{/if}}
    **Kompetensi Dasar (KD)**: Sebutkan KD yang relevan dengan topik.
    **Indikator Pencapaian Kompetensi (IPK)**: Turunkan IPK dari KD.
    **Metode Pembelajaran**: Sebutkan metode yang akan digunakan.
    {{/if}}
5.  **Langkah-langkah Pembelajaran**: Rincikan kegiatan pembelajaran secara sistematis (Pendahuluan, Kegiatan Inti, Penutup).
    *   Untuk Kurikulum Merdeka: Integrasikan elemen Profil Pelajar Pancasila dan terapkan pembelajaran berdiferensiasi dalam Kegiatan Inti.
6.  **Strategi Asesmen**: Jelaskan berbagai strategi asesmen (diagnostik, formatif, sumatif) yang relevan.
    {{#if (eq curriculumType "Kurikulum Merdeka")}}
7.  **Strategi Diferensiasi**: Jelaskan strategi diferensiasi yang akan diterapkan (konten, proses, produk, lingkungan belajar).
    {{/if}}

Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan, menggunakan Bahasa Indonesia yang baik dan benar, serta istilah-istilah yang lazim dalam kurikulum yang dipilih. Kosongkan field opsional jika tidak relevan dengan kurikulum atau tidak dapat dihasilkan.
Misalnya, 'pemahamanBermakna' hanya untuk 'Kurikulum Merdeka'. 'standarKompetensi' hanya untuk 'KTSP 2006'. 'kompetensiInti' hanya untuk 'K-13'.
`,
});

const generateLessonPlanFromTopicFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFromTopicFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async (input: GenerateLessonPlanInput) => {
    const {output} = await prompt(input);
    // Clean up optional fields not relevant to the curriculum type
    if (output) {
        if (input.curriculumType !== "Kurikulum Merdeka") {
            delete output.pemahamanBermakna;
            delete output.pertanyaanPemantik;
            delete output.differentiationStrategies;
        }
        if (input.curriculumType !== "KTSP 2006") {
            delete output.standarKompetensi;
        }
        if (input.curriculumType !== "K-13") {
            delete output.kompetensiInti;
        }
        if (input.curriculumType === "Kurikulum Merdeka") {
            delete output.standarKompetensi;
            delete output.kompetensiInti;
            delete output.kompetensiDasar;
            delete output.indikatorPencapaianKompetensi;
            delete output.metodePembelajaran;
        }
    }
    return output!;
  }
);
