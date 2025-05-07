// src/ai/flows/generate-lesson-plan-from-topic.ts
'use server';

/**
 * @fileOverview Membuat draf rencana pembelajaran (Modul Ajar) dari topik dan jenjang/fase/kelas yang diberikan, sesuai Kurikulum Merdeka.
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
  title: z.string().describe('Judul modul ajar yang menarik dan relevan.'),
  learningObjectives: z.array(z.string()).describe('Tujuan pembelajaran atau Capaian Pembelajaran (CP)/Alur Tujuan Pembelajaran (ATP) yang ingin dicapai, dirumuskan dengan jelas dan terukur.'),
  pemahamanBermakna: z.array(z.string()).describe('Deskripsi pemahaman bermakna yang akan dibangun oleh peserta didik setelah mengikuti pembelajaran.'),
  pertanyaanPemantik: z.array(z.string()).describe('Pertanyaan-pertanyaan yang dirancang untuk memantik rasa ingin tahu dan proses berpikir kritis peserta didik terkait topik.'),
  langkahPembelajaran: z.object({
    pendahuluan: z.array(z.string()).describe('Rangkaian kegiatan pembuka pembelajaran (misalnya, salam, doa, apersepsi, motivasi, penyampaian tujuan dan cakupan materi, pertanyaan pemantik).'),
    kegiatanInti: z.array(z.string()).describe('Rangkaian kegiatan inti pembelajaran yang berpusat pada peserta didik, mencakup eksplorasi konsep, diskusi, praktik, penerapan, dan asesmen formatif terintegrasi.'),
    penutup: z.array(z.string()).describe('Rangkaian kegiatan penutup pembelajaran (misalnya, refleksi, kesimpulan, umpan balik, informasi tindak lanjut atau pembelajaran berikutnya).'),
  }).describe('Struktur langkah-langkah kegiatan pembelajaran yang rinci, meliputi pendahuluan, kegiatan inti, dan penutup.'),
  assessmentStrategies: z.array(z.string()).describe('Strategi dan ide-ide asesmen diagnostik, formatif, dan sumatif yang relevan dengan tujuan pembelajaran dan kegiatan, mendukung pembelajaran berdiferensiasi (misalnya, observasi, kinerja, portofolio, tes).'),
  differentiationStrategies: z.array(z.string()).describe('Strategi diferensiasi untuk mengakomodasi kebutuhan belajar peserta didik yang beragam (konten, proses, produk, lingkungan belajar).'),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

export async function generateLessonPlanFromTopic(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanFromTopicPrompt',
  input: {schema: GenerateLessonPlanInputSchema},
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `Anda adalah seorang guru berpengalaman yang ahli dalam menyusun Modul Ajar (MA) atau Rencana Pelaksanaan Pembelajaran (RPP) Plus sesuai dengan prinsip-prinsip Kurikulum Merdeka di Indonesia.
Buatlah draf Modul Ajar untuk topik dan jenjang/fase/kelas berikut:

Topik: {{{topic}}}
Jenjang/Fase/Kelas: {{{jenjangFaseKelas}}}

Modul Ajar harus mencakup komponen inti berikut:
1.  **Judul Modul Ajar**: Judul yang menarik, jelas, dan relevan dengan topik serta jenjang.
2.  **Tujuan Pembelajaran**: Rumuskan Tujuan Pembelajaran (TP) yang merupakan turunan dari Capaian Pembelajaran (CP) atau Alur Tujuan Pembelajaran (ATP). TP harus jelas, spesifik, terukur, dapat dicapai, relevan, dan berbatas waktu (SMART), serta fokus pada kompetensi yang ingin dikembangkan.
3.  **Pemahaman Bermakna**: Jelaskan manfaat atau pemahaman penting yang akan diperoleh peserta didik setelah mempelajari topik ini dan bagaimana hal tersebut relevan dengan kehidupan mereka.
4.  **Pertanyaan Pemantik**: Susun beberapa pertanyaan yang dapat memantik rasa ingin tahu, diskusi, dan pemikiran kritis peserta didik terkait topik pembelajaran.
5.  **Langkah-langkah Pembelajaran**: Rincikan kegiatan pembelajaran secara sistematis, meliputi:
    *   **Pendahuluan**: Kegiatan awal seperti salam, doa, pengecekan kehadiran, apersepsi (menghubungkan dengan materi sebelumnya atau pengalaman peserta didik), motivasi, penyampaian tujuan pembelajaran, dan cakupan materi. Bisa juga memasukkan pertanyaan pemantik di sini.
    *   **Kegiatan Inti**: Kegiatan utama yang melibatkan peserta didik secara aktif dalam proses belajar (misalnya, eksplorasi materi, diskusi kelompok, eksperimen, pengerjaan proyek, pemecahan masalah, presentasi). Integrasikan elemen Profil Pelajar Pancasila secara eksplisit atau implisit. Terapkan pembelajaran berdiferensiasi.
    *   **Penutup**: Kegiatan akhir seperti refleksi bersama peserta didik mengenai proses dan hasil belajar, pemberian umpan balik, penyimpulan materi, dan informasi mengenai tindak lanjut atau pembelajaran berikutnya.
6.  **Strategi Asesmen**: Jelaskan berbagai strategi asesmen yang akan digunakan, meliputi:
    *   Asesmen Diagnostik (jika relevan, di awal).
    *   Asesmen Formatif (selama proses pembelajaran, misalnya observasi, tanya jawab, tugas singkat, presentasi).
    *   Asesmen Sumatif (di akhir unit pembelajaran, misalnya tes tulis, proyek, portofolio, produk).
    Sertakan contoh jenis instrumen atau teknik penilaian yang sesuai.
7.  **Strategi Diferensiasi**: Jelaskan strategi diferensiasi yang akan diterapkan untuk mendukung peserta didik dengan berbagai kebutuhan belajar (misalnya, diferensiasi konten, proses, produk, dan/atau lingkungan belajar).

Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan dan menggunakan Bahasa Indonesia yang baik dan benar, serta istilah-istilah yang lazim dalam Kurikulum Merdeka.
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
    return output!;
  }
);
