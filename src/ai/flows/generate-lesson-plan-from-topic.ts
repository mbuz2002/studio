
// src/ai/flows/generate-lesson-plan-from-topic.ts
'use server';

/**
 * @fileOverview Membuat draf rencana pembelajaran (Modul Ajar/RPP/ATP) dari informasi yang diberikan.
 * Jika Kurikulum Merdeka dipilih, akan menghasilkan Alur Tujuan Pembelajaran (ATP) dan komponen Modul Ajar dasar.
 *
 * - generateLessonPlanFromTopic - Fungsi yang membuat rencana pembelajaran.
 * - GenerateLessonPlanInput - Tipe input untuk fungsi generateLessonPlanFromTopic.
 * - GenerateLessonPlanOutput - Tipe return untuk fungsi generateLessonPlanFromTopic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CurriculumFramework } from '@/types';

const GenerateLessonPlanInputSchema = z.object({
  topic: z.string().describe('Untuk Kurikulum Merdeka: Konsentrasi Keahlian atau Tema Utama ATP/Modul Ajar. Untuk kurikulum lain: Topik atau materi pembelajaran RPP.'),
  jenjangFaseKelas: z.string().describe('Jenjang, fase, atau kelas sasaran (misalnya, "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)", "Kelas VII SMP").'),
  curriculumType: z.enum(["Kurikulum Merdeka", "K-13", "KTSP 2006"]).describe("Jenis kurikulum yang digunakan sebagai acuan."),
  subject: z.string().optional().describe("Mata pelajaran."), // Added subject as optional input
  bidangKeahlian: z.string().optional().describe("Bidang Keahlian (khususnya untuk SMK di Kurikulum Merdeka, contoh: Teknologi Informasi)."),
  programKeahlian: z.string().optional().describe("Program Keahlian (khususnya untuk SMK di Kurikulum Merdeka, contoh: Rekayasa Perangkat Lunak). Ini akan menjadi bagian dari judul ATP."),
  capaianPembelajaran: z.array(z.string()).optional().describe("Capaian Pembelajaran (CP) yang relevan. Untuk Kurikulum Merdeka, ini akan menjadi dasar utama untuk merumuskan Alur Tujuan Pembelajaran (ATP).")
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
  title: z.string().describe('Judul Modul Ajar/RPP/ATP yang menarik dan relevan.'),
  subject: z.string().optional().describe("Mata Pelajaran."),
  bidangKeahlian: z.string().optional().describe("Bidang Keahlian (Kurikulum Merdeka)."),
  programKeahlian: z.string().optional().describe("Program Keahlian (Kurikulum Merdeka)."),
  learningObjectives: z.array(z.string()).describe('Untuk Kurikulum Merdeka (ATP): Daftar Tujuan Pembelajaran (TP). Untuk K-13/KTSP (RPP): Daftar Tujuan Pembelajaran.'),
  alokasiWaktuJP: z.string().optional().describe("Estimasi alokasi waktu total dalam Jam Pelajaran, contoh: '72 JP' untuk ATP atau '2 JP' untuk RPP."),
  profilPelajarPancasilaFocus: z.array(z.string()).optional().describe('Fokus Profil Pelajar Pancasila (Kurikulum Merdeka).'),
  
  // Modul Ajar (Kurikulum Merdeka) / RPP (K-13, KTSP) components
  pemahamanBermakna: z.array(z.string()).optional().describe('Deskripsi pemahaman bermakna.'),
  pertanyaanPemantik: z.array(z.string()).optional().describe('Pertanyaan-pertanyaan pemantik.'),
  differentiationStrategies: z.array(z.string()).optional().describe('Strategi diferensiasi.'),

  // KTSP & K-13 specific (for RPP)
  standarKompetensi: z.array(z.string()).optional().describe("Standar Kompetensi (SK) - KTSP."),
  kompetensiInti: z.array(z.string()).optional().describe("Kompetensi Inti (KI) - K-13."),
  kompetensiDasar: z.array(z.string()).optional().describe("Kompetensi Dasar (KD) - KTSP dan K-13."),
  indikatorPencapaianKompetensi: z.array(z.string()).optional().describe("Indikator Pencapaian Kompetensi (IPK) - KTSP dan K-13."),
  metodePembelajaran: z.array(z.string()).optional().describe("Metode pembelajaran yang digunakan (KTSP, K-13)."),

  // Common for Modul Ajar / RPP (can be brief/omitted if primarily generating ATP)
  langkahPembelajaran: z.object({
    pendahuluan: z.array(z.string()).describe('Rangkaian kegiatan pembuka pembelajaran.'),
    kegiatanInti: z.array(z.string()).describe('Rangkaian kegiatan inti pembelajaran.'),
    penutup: z.array(z.string()).describe('Rangkaian kegiatan penutup pembelajaran.'),
  }).optional().describe('Struktur langkah-langkah kegiatan pembelajaran.'),
  assessmentStrategies: z.array(z.string()).optional().describe('Strategi dan ide-ide asesmen yang relevan (diagnostik, formatif, sumatif).'),
  materials: z.string().optional().describe('Media/Sumber Belajar yang disarankan.'),
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
  prompt: `Anda adalah seorang ahli perancangan kurikulum. Buatlah draf dokumen pembelajaran berdasarkan informasi berikut:

Jenis Kurikulum: {{{curriculumType}}}
Jenjang/Fase/Kelas: {{{jenjangFaseKelas}}}
{{#if subject}}Mata Pelajaran: {{{subject}}}{{/if}}
{{#if isKurikulumMerdeka}}
Konsentrasi Keahlian / Tema Utama: {{{topic}}}
{{#if bidangKeahlian}}Bidang Keahlian: {{{bidangKeahlian}}}{{/if}}
{{#if programKeahlian}}Program Keahlian: {{{programKeahlian}}}{{/if}}
{{#if capaianPembelajaran.length}}
Capaian Pembelajaran (CP) yang diberikan (gunakan sebagai acuan utama):
{{#each capaianPembelajaran}}
- {{{this}}}
{{/each}}
{{/if}}
{{else}}
Topik/Materi Pembelajaran: {{{topic}}}
{{/if}}

Spesifikasi Output:
{{#if isKurikulumMerdeka}}
1.  **Dokumen Utama**: ALUR TUJUAN PEMBELAJARAN (ATP) / MODUL AJAR SEDERHANA.
2.  **Judul Dokumen**: Format sebagai "ALUR TUJUAN PEMBELAJARAN KONSENTRASI KEAHLIAN {{{programKeahlian}}}" jika programKeahlian diisi, atau "MODUL AJAR {{{topic}}}" jika tidak. Sesuaikan dengan konteks SMK atau umum.
3.  **Identitas Dokumen**:
    *   Sertakan "Mata Pelajaran: {{{subject}}}" (jika diberikan).
    *   Sertakan "Bidang Keahlian: {{{bidangKeahlian}}}" (jika diberikan dan relevan).
    *   Sertakan "Program Keahlian: {{{programKeahlian}}}" (jika diberikan dan relevan).
4.  **Tujuan Pembelajaran (TP)** (field 'learningObjectives'): Rumuskan serangkaian Tujuan Pembelajaran (TP) yang membentuk Alur Tujuan Pembelajaran (ATP). TP ini harus merupakan turunan dari Capaian Pembelajaran (CP) yang diberikan. Jika CP tidak diberikan, buatlah TP yang relevan dengan Konsentrasi Keahlian/Tema dan Fase. Minimal 3-5 TP.
5.  **Alokasi Waktu (JP)** (field 'alokasiWaktuJP'): Estimasi total alokasi waktu untuk ATP/Modul Ajar ini (misal "72 JP" atau "3 JP per pertemuan").
6.  **Fokus Profil Pelajar Pancasila** (field 'profilPelajarPancasilaFocus'): Sebutkan beberapa dimensi yang relevan (opsional).
7.  **Komponen Modul Ajar Tambahan (Opsional, buat ringkas jika fokus ATP)**:
    *   Pemahaman Bermakna (field 'pemahamanBermakna').
    *   Pertanyaan Pemantik (field 'pertanyaanPemantik').
    *   Strategi Asesmen (field 'assessmentStrategies', berupa daftar ide).
    *   Strategi Diferensiasi (field 'differentiationStrategies').
    *   Langkah Pembelajaran (field 'langkahPembelajaran', buat sangat ringkas jika fokus ATP, misal hanya poin utama).
    *   Media/Sumber Belajar (field 'materials').
{{else}}
1.  **Dokumen Utama**: RENCANA PELAKSANAAN PEMBELAJARAN (RPP).
2.  **Judul Dokumen**: Judul RPP yang menarik dan relevan dengan topik.
3.  **Tujuan Pembelajaran** (field 'learningObjectives'): Rumuskan tujuan pembelajaran berdasarkan Indikator Pencapaian Kompetensi (IPK) yang diturunkan dari Kompetensi Dasar (KD).
4.  **Alokasi Waktu (JP)** (field 'alokasiWaktuJP'): Estimasi alokasi waktu total untuk RPP.
5.  **Komponen RPP ({{#if isKTSP2006}}KTSP{{else}}K-13{{/if}})**:
    *   {{#if isKTSP2006}}Standar Kompetensi (SK) (field 'standarKompetensi').{{/if}}
    *   {{#if isK13}}Kompetensi Inti (KI) (field 'kompetensiInti').{{/if}}
    *   Kompetensi Dasar (KD) (field 'kompetensiDasar').
    *   Indikator Pencapaian Kompetensi (IPK) (field 'indikatorPencapaianKompetensi').
    *   Metode Pembelajaran (field 'metodePembelajaran').
6.  **Langkah-langkah Pembelajaran** (field 'langkahPembelajaran'): Rincikan kegiatan (Pendahuluan, Kegiatan Inti, Penutup).
7.  **Strategi Asesmen** (field 'assessmentStrategies', berupa daftar ide/bentuk asesmen).
8.  **Media/Sumber Belajar** (field 'materials').
{{/if}}

Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan, menggunakan Bahasa Indonesia yang baik dan benar, serta istilah-istilah yang lazim dalam kurikulum yang dipilih. Kosongkan field opsional jika tidak relevan atau tidak dapat dihasilkan.
Untuk Kurikulum Merdeka, jika fokusnya adalah ATP murni, komponen Modul Ajar tambahan seperti Pemahaman Bermakna, Langkah Pembelajaran, dll., dapat dibuat sangat ringkas atau diisi dengan placeholder yang menandakan perlu dikembangkan lebih lanjut. Namun, TP (learningObjectives) dan identitas ATP (judul, bidang, program, fase) harus lengkap.
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
        output.subject = promptInputWithFlags.subject || output.subject; // Ensure subject is passed through or set
        if (promptInputWithFlags.isKurikulumMerdeka) {
            output.bidangKeahlian = promptInputWithFlags.bidangKeahlian || output.bidangKeahlian;
            output.programKeahlian = promptInputWithFlags.programKeahlian || output.programKeahlian;
            // Fields for K-13/KTSP should be undefined for Kurikulum Merdeka
            delete output.standarKompetensi;
            delete output.kompetensiInti;
            delete output.kompetensiDasar;
            delete output.indikatorPencapaianKompetensi;
            delete output.metodePembelajaran;
        } else { // K-13 or KTSP
            // Fields for Kurikulum Merdeka should be undefined
            delete output.bidangKeahlian;
            delete output.programKeahlian;
            delete output.profilPelajarPancasilaFocus;
            delete output.pemahamanBermakna; // Pemahaman Bermakna is more KM specific
            delete output.pertanyaanPemantik; // Pertanyaan Pemantik is more KM specific
            // differentiationStrategies can be relevant for K13 too, so we might keep it or make it conditional based on more nuanced K13 RPP Plus
            // For now, let's remove if not KM, to simplify.
            delete output.differentiationStrategies; 

            if (promptInputWithFlags.curriculumType !== "KTSP 2006") {
                delete output.standarKompetensi;
            }
            if (promptInputWithFlags.curriculumType !== "K-13") {
                delete output.kompetensiInti;
            }
        }
    }
    return output!;
  }
);
