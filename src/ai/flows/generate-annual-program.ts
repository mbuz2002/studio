
// src/ai/flows/generate-annual-program.ts
'use server';

/**
 * @fileOverview Membuat draf Program Tahunan (PROTA) dari tema, jenjang, tahun ajaran, dan jenis kurikulum.
 *
 * - generateAnnualProgram - Fungsi yang membuat PROTA.
 * - GenerateAnnualProgramInput - Tipe input untuk fungsi generateAnnualProgram.
 * - GenerateAnnualProgramOutput - Tipe return untuk fungsi generateAnnualProgram.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CurriculumFramework } from '@/types';

const AnnualProgramComponentSchema = z.object({
  topic: z.string().describe('Judul topik atau unit pembelajaran utama (atau Materi Pokok/Tema untuk KTSP/K-13). Untuk SD Kurikulum Merdeka, bisa berupa tema besar atau mata pelajaran jika diajarkan terpisah.'),
  elemenCapaianPembelajaran: z.array(z.string()).optional().describe('Elemen-elemen Capaian Pembelajaran (CP) untuk Kurikulum Merdeka, atau daftar Kompetensi Dasar (KD) yang relevan untuk KTSP/K-13.'),
  alokasiWaktu: z.string().describe('Estimasi alokasi waktu untuk topik ini dalam Jam Pelajaran (JP), contoh: "24 JP" atau "4 Minggu x 6 JP".'),
});

const GenerateAnnualProgramInputSchema = z.object({
  subject: z.string().describe('Mata pelajaran atau tema utama PROTA (misalnya Matematika, Bahasa Indonesia, atau "Tematik" untuk SD).'),
  jenjangFaseKelas: z.string().describe('Jenjang, fase, atau kelas sasaran.'),
  year: z.string().describe('Tahun ajaran, misalnya "2024/2025".'),
  curriculumType: z.enum(["Kurikulum Merdeka", "K-13", "KTSP 2006"]).describe("Jenis kurikulum yang digunakan sebagai acuan."),
  capaianPembelajaran: z.array(z.string()).optional().describe("Capaian Pembelajaran (CP) umum untuk tahun ajaran ini, khusus untuk Kurikulum Merdeka. Akan digunakan AI untuk mengaitkannya dengan elemen CP per topik jika disediakan.")
});
export type GenerateAnnualProgramInput = z.infer<typeof GenerateAnnualProgramInputSchema>;

const PromptInputSchema = GenerateAnnualProgramInputSchema.extend({
    isKurikulumMerdeka: z.boolean(),
    isSekolahDasar: z.boolean().optional().describe("Menandakan apakah jenjang yang dipilih adalah Sekolah Dasar (Fase A, B, C)."),
    capaianPembelajaran: z.array(z.string()).optional(), 
});

const GenerateAnnualProgramOutputSchema = z.object({
  title: z.string().describe('Judul Program Tahunan yang menarik dan informatif.'),
  semester1Components: z.array(AnnualProgramComponentSchema).describe('Daftar komponen pembelajaran untuk Semester 1.'),
  semester2Components: z.array(AnnualProgramComponentSchema).describe('Daftar komponen pembelajaran untuk Semester 2.'),
  profilPelajarPancasilaFocus: z.array(z.string()).optional().describe('Dimensi Profil Pelajar Pancasila yang menjadi fokus (Utamanya Kurikulum Merdeka, bisa diadaptasi untuk kurikulum lain jika relevan).'),
});
export type GenerateAnnualProgramOutput = z.infer<typeof GenerateAnnualProgramOutputSchema>;

export async function generateAnnualProgram(input: GenerateAnnualProgramInput): Promise<GenerateAnnualProgramOutput> {
  const curriculumFlags = {
      isKurikulumMerdeka: input.curriculumType === "Kurikulum Merdeka",
  };
  
  const jenjang = input.jenjangFaseKelas.toLowerCase();
  const isSD = curriculumFlags.isKurikulumMerdeka && (jenjang.includes("sd/mi") || jenjang.includes("fase a") || jenjang.includes("fase b") || jenjang.includes("fase c"));

  const promptInputWithFlags = { 
      ...input, 
      ...curriculumFlags,
      isSekolahDasar: isSD,
      capaianPembelajaran: input.capaianPembelajaran || [] 
  };
  return generateAnnualProgramFlow(promptInputWithFlags);
}

const prompt = ai.definePrompt({
  name: 'generateAnnualProgramPrompt',
  input: {schema: PromptInputSchema}, 
  output: {schema: GenerateAnnualProgramOutputSchema},
  prompt: `Anda adalah seorang ahli perancang kurikulum yang bertugas membuat draf Program Tahunan (PROTA).
Buatlah draf PROTA untuk:

Mata Pelajaran/Tema Utama: {{{subject}}}
Jenjang/Fase/Kelas: {{{jenjangFaseKelas}}}
Tahun Ajaran: {{{year}}}
Kurikulum Acuan: {{{curriculumType}}}

{{#if isKurikulumMerdeka}}
  {{#if isSekolahDasar}}
  Perhatian Khusus untuk Sekolah Dasar (Fase A, B, C) - Kurikulum Merdeka:
  -   Topik/unit pembelajaran sebaiknya bersifat tematik dan terpadu, relevan dengan dunia anak-anak serta pengalaman sehari-hari mereka. Jika mata pelajaran diajarkan terpisah, pastikan topiknya sesuai.
  -   Elemen Capaian Pembelajaran harus dirumuskan dengan bahasa yang sederhana dan konkret, sesuai dengan tingkat perkembangan kognitif anak usia SD, dan mencerminkan kompetensi yang diharapkan pada fase tersebut.
  -   Pertimbangkan integrasi antar mata pelajaran dalam penyusunan topik/unit pembelajaran jika {{{subject}}} adalah "Tematik" atau mencakup beberapa muatan pelajaran.
  -   Alokasi waktu harus realistis dan memperhatikan rentang konsentrasi anak SD.
  {{/if}}
  {{#if capaianPembelajaran.length}}
  Capaian Pembelajaran (CP) Umum Tahunan yang diberikan (gunakan sebagai acuan utama):
  {{#each capaianPembelajaran}}
  - {{{this}}}
  {{/each}}
  {{/if}}
{{/if}}

PROTA harus mencakup:
1.  **Judul Program Tahunan**: Judul yang jelas, relevan, dan menarik.
2.  **Komponen Semester 1**: Daftar topik/unit pembelajaran utama (atau Materi Pokok/Tema untuk KTSP/K-13) untuk semester ganjil. Untuk setiap komponen:
    *   Sebutkan topik/unitnya.
    *   {{#if isKurikulumMerdeka}}
        Sebutkan elemen-elemen Capaian Pembelajaran (CP) yang terkait dengan topik/unit tersebut. {{#if capaianPembelajaran.length}}Cobalah untuk mengaitkan elemen CP ini dengan CP Umum Tahunan yang diberikan.{{else}}Jika CP Umum tidak diberikan, buatlah elemen CP yang sesuai dengan fase dan topik.{{/if}}
        {{else}}
        Sebutkan Kompetensi Dasar (KD) yang relevan dengan topik tersebut.
        {{/if}}
    *   Berikan estimasi alokasi waktu (dalam Jam Pelajaran (JP), contoh: "24 JP").
3.  **Komponen Semester 2**: Sama seperti Semester 1, namun untuk semester genap.
4.  **Fokus Profil Pelajar Pancasila (Opsional)**: {{#if isKurikulumMerdeka}}Sebutkan beberapa dimensi Profil Pelajar Pancasila yang relevan.{{else}}Jika relevan, sebutkan aspek karakter atau nilai yang ditekankan.{{/if}}

Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan dan menggunakan Bahasa Indonesia yang baik dan benar. Buatlah minimal 2-3 komponen per semester sebagai contoh.
Istilah "elemenCapaianPembelajaran" pada output akan berisi CP jika Kurikulum Merdeka, atau KD jika K-13/KTSP.
Untuk SD Kurikulum Merdeka, jika subjeknya adalah mata pelajaran spesifik (misal, Matematika Fase A), maka topik dan elemen CP harus spesifik untuk mata pelajaran tersebut. Jika subjeknya "Tematik", maka topik bisa berupa tema-tema (misal, "Aku dan Kebutuhanku", "Lingkungan Sekitarku") dan elemen CP bisa mencakup beberapa mata pelajaran yang terintegrasi.
`,
});

const generateAnnualProgramFlow = ai.defineFlow(
  {
    name: 'generateAnnualProgramFlow',
    inputSchema: PromptInputSchema, 
    outputSchema: GenerateAnnualProgramOutputSchema,
  },
  async (promptInputWithFlags: z.infer<typeof PromptInputSchema>) => { 
    const {output} = await prompt(promptInputWithFlags);
    
    if (output && promptInputWithFlags.curriculumType !== "Kurikulum Merdeka") {
        delete output.profilPelajarPancasilaFocus; 
    }
    return output!;
  }
);

