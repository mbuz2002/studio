
// src/ai/flows/generate-lesson-plan-from-topic.ts
'use server';

/**
 * @fileOverview Membuat draf rencana pembelajaran (Modul Ajar/RPP) dari topik, jenjang, dan jenis kurikulum yang diberikan.
 * Jika Kurikulum Merdeka dipilih, akan menghasilkan Alur Tujuan Pembelajaran (ATP) yang terintegrasi.
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
  curriculumType: z.enum(["Kurikulum Merdeka", "K-13", "KTSP 2006"]).describe("Jenis kurikulum yang digunakan sebagai acuan (Kurikulum Merdeka, K-13, KTSP 2006)."),
  capaianPembelajaran: z.array(z.string()).optional().describe("Capaian Pembelajaran (CP) yang relevan dengan topik. Untuk Kurikulum Merdeka, ini akan digunakan sebagai dasar utama untuk merumuskan Alur Tujuan Pembelajaran (ATP). Untuk kurikulum lain, ini dapat diabaikan atau digunakan sebagai konteks tambahan jika relevan.")
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

// Schema for the data passed to the prompt, including boolean flags
const PromptInputSchema = GenerateLessonPlanInputSchema.extend({
  isKurikulumMerdeka: z.boolean(),
  isK13: z.boolean(),
  isKTSP2006: z.boolean(),
  isK13OrKTSP: z.boolean(),
});


const GenerateLessonPlanOutputSchema = z.object({
  title: z.string().describe('Judul modul ajar/RPP yang menarik dan relevan.'),
  learningObjectives: z.array(z.string()).describe('Untuk Kurikulum Merdeka: Daftar Tujuan Pembelajaran (TP) yang membentuk Alur Tujuan Pembelajaran (ATP). Untuk K-13/KTSP: Daftar Tujuan Pembelajaran yang diturunkan dari IPK.'),
  alokasiWaktuJP: z.string().optional().describe("Estimasi alokasi waktu total untuk RPP/Modul Ajar ini dalam Jam Pelajaran, contoh: '2 JP' atau '3 x 40 menit'."),
  
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
  const curriculumFlags = {
    isKurikulumMerdeka: input.curriculumType === "Kurikulum Merdeka",
    isK13: input.curriculumType === "K-13",
    isKTSP2006: input.curriculumType === "KTSP 2006",
    isK13OrKTSP: input.curriculumType === "K-13" || input.curriculumType === "KTSP 2006",
  };
  const promptInputWithFlags = { 
    ...input, 
    ...curriculumFlags,
    capaianPembelajaran: input.capaianPembelajaran || [], 
  };
  return generateLessonPlanFromTopicFlow(promptInputWithFlags);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanFromTopicPrompt',
  input: {schema: PromptInputSchema}, 
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `Anda adalah seorang guru berpengalaman yang ahli dalam menyusun Modul Ajar (MA) untuk Kurikulum Merdeka atau Rencana Pelaksanaan Pembelajaran (RPP) Plus untuk K-13/KTSP.
Buatlah draf Modul Ajar/RPP untuk:

Topik: {{{topic}}}
Jenjang/Fase/Kelas: {{{jenjangFaseKelas}}}
Kurikulum Acuan: {{{curriculumType}}}
{{#if capaianPembelajaran.length}}
Capaian Pembelajaran (CP) yang diberikan (gunakan sebagai acuan utama):
{{#each capaianPembelajaran}}
- {{{this}}}
{{/each}}
{{/if}}

Modul Ajar/RPP harus mencakup komponen inti berikut, disesuaikan dengan kurikulum yang dipilih:

1.  **Judul Modul Ajar/RPP**: Judul yang menarik, jelas, dan relevan.
2.  **{{#if isKurikulumMerdeka}}Alur Tujuan Pembelajaran (ATP){{else}}Tujuan Pembelajaran{{/if}}**: 
    *   Untuk Kurikulum Merdeka: Rumuskan Alur Tujuan Pembelajaran (ATP) yang terdiri dari serangkaian Tujuan Pembelajaran (TP). TP ini harus merupakan turunan dari Capaian Pembelajaran (CP) yang diberikan. Jika CP tidak diberikan, buatlah TP yang relevan dengan topik dan jenjang. Sajikan TP ini sebagai daftar dalam field 'learningObjectives'.
    *   Untuk K-13/KTSP: Rumuskan tujuan pembelajaran berdasarkan Indikator Pencapaian Kompetensi (IPK) yang diturunkan dari Kompetensi Dasar (KD). Sajikan tujuan ini sebagai daftar dalam field 'learningObjectives'.
3.  **Alokasi Waktu (JP)**: Berikan estimasi alokasi waktu total untuk RPP/Modul Ajar ini dalam Jam Pelajaran (JP), contoh: "2 JP" atau "3 x 45 menit".
4.  {{#if isKurikulumMerdeka}}
    **Pemahaman Bermakna**: Jelaskan manfaat atau pemahaman penting yang akan diperoleh peserta didik.
    **Pertanyaan Pemantik**: Susun beberapa pertanyaan yang dapat memantik rasa ingin tahu.
    {{/if}}
5.  {{#if isK13OrKTSP}}
    {{#if isKTSP2006}}
    **Standar Kompetensi (SK)**: Sebutkan SK yang relevan.
    {{/if}}
    {{#if isK13}}
    **Kompetensi Inti (KI)**: Sebutkan KI yang relevan (KI-1, KI-2, KI-3, KI-4).
    {{/if}}
    **Kompetensi Dasar (KD)**: Sebutkan KD yang relevan dengan topik.
    **Indikator Pencapaian Kompetensi (IPK)**: Turunkan IPK dari KD.
    **Metode Pembelajaran**: Sebutkan metode yang akan digunakan.
    {{/if}}
6.  **Langkah-langkah Pembelajaran**: Rincikan kegiatan pembelajaran secara sistematis (Pendahuluan, Kegiatan Inti, Penutup).
    *   Untuk Kurikulum Merdeka: Integrasikan elemen Profil Pelajar Pancasila dan terapkan pembelajaran berdiferensiasi dalam Kegiatan Inti.
7.  **Strategi Asesmen**: Jelaskan berbagai strategi asesmen (diagnostik, formatif, sumatif) yang relevan.
    {{#if isKurikulumMerdeka}}
8.  **Strategi Diferensiasi**: Jelaskan strategi diferensiasi yang akan diterapkan (konten, proses, produk, lingkungan belajar).
    {{/if}}

Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan, menggunakan Bahasa Indonesia yang baik dan benar, serta istilah-istilah yang lazim dalam kurikulum yang dipilih. Kosongkan field opsional jika tidak relevan dengan kurikulum atau tidak dapat dihasilkan.
Contoh: 'pemahamanBermakna' hanya untuk 'Kurikulum Merdeka'. 'standarKompetensi' hanya untuk 'KTSP 2006'. 'kompetensiInti' hanya untuk 'K-13'.
Field 'learningObjectives' harus berisi daftar Tujuan Pembelajaran (TP) jika Kurikulum Merdeka, atau daftar Tujuan Pembelajaran reguler jika K-13/KTSP.
`,
});

const generateLessonPlanFromTopicFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFromTopicFlow',
    inputSchema: PromptInputSchema, 
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async (promptInputWithFlags: z.infer<typeof PromptInputSchema>) => { 
    const {output} = await prompt(promptInputWithFlags);
    
    if (output) {
        if (promptInputWithFlags.curriculumType !== "Kurikulum Merdeka") {
            delete output.pemahamanBermakna;
            delete output.pertanyaanPemantik;
            delete output.differentiationStrategies;
        }
        if (promptInputWithFlags.curriculumType !== "KTSP 2006") {
            delete output.standarKompetensi;
        }
        if (promptInputWithFlags.curriculumType !== "K-13") {
            delete output.kompetensiInti;
        }
        if (promptInputWithFlags.curriculumType === "Kurikulum Merdeka") {
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

