
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
  topic: z.string().describe('Judul topik atau unit pembelajaran utama (atau Materi Pokok/Tema untuk KTSP/K-13).'),
  elemenCapaianPembelajaran: z.array(z.string()).optional().describe('Elemen-elemen Capaian Pembelajaran (CP) untuk Kurikulum Merdeka, atau daftar Kompetensi Dasar (KD) yang relevan untuk KTSP/K-13.'),
  alokasiWaktu: z.string().describe('Estimasi alokasi waktu untuk topik ini dalam Jam Pelajaran (JP), contoh: "24 JP" atau "4 Minggu x 6 JP".'),
});

const GenerateAnnualProgramInputSchema = z.object({
  subject: z.string().describe('Mata pelajaran atau tema utama PROTA.'),
  jenjangFaseKelas: z.string().describe('Jenjang, fase, atau kelas sasaran.'),
  year: z.string().describe('Tahun ajaran, misalnya "2024/2025".'),
  curriculumType: z.enum(["Kurikulum Merdeka", "K-13", "KTSP 2006"]).describe("Jenis kurikulum yang digunakan sebagai acuan."),
  capaianPembelajaran: z.array(z.string()).optional().describe("Capaian Pembelajaran (CP) umum untuk tahun ajaran ini, khusus untuk Kurikulum Merdeka. Akan digunakan AI untuk mengaitkannya dengan elemen CP per topik jika disediakan.")
});
export type GenerateAnnualProgramInput = z.infer<typeof GenerateAnnualProgramInputSchema>;

const PromptInputSchema = GenerateAnnualProgramInputSchema.extend({
    isKurikulumMerdeka: z.boolean(),
    capaianPembelajaran: z.array(z.string()).optional(), // Ensure it's here for the prompt
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
  const promptInputWithFlags = { 
      ...input, 
      ...curriculumFlags,
      capaianPembelajaran: input.capaianPembelajaran || [] // Ensure array for prompt
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
        Sebutkan elemen-elemen Capaian Pembelajaran (CP) yang terkait. {{#if capaianPembelajaran.length}}Cobalah untuk mengaitkan elemen CP ini dengan CP Umum Tahunan yang diberikan.{{else}}Jika CP Umum tidak diberikan, buatlah elemen CP yang sesuai.{{/if}}
        {{else}}
        Sebutkan Kompetensi Dasar (KD) yang relevan dengan topik tersebut.
        {{/if}}
    *   Berikan estimasi alokasi waktu (dalam Jam Pelajaran (JP), contoh: "24 JP").
3.  **Komponen Semester 2**: Sama seperti Semester 1, namun untuk semester genap.
4.  **Fokus Profil Pelajar Pancasila (Opsional)**: {{#if isKurikulumMerdeka}}Sebutkan beberapa dimensi Profil Pelajar Pancasila yang relevan.{{else}}Jika relevan, sebutkan aspek karakter atau nilai yang ditekankan.{{/if}}

Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan dan menggunakan Bahasa Indonesia yang baik dan benar. Buatlah minimal 2-3 komponen per semester sebagai contoh.
Istilah "elemenCapaianPembelajaran" pada output akan berisi CP jika Kurikulum Merdeka, atau KD jika K-13/KTSP.
`,
});

const generateAnnualProgramFlow = ai.defineFlow(
  {
    name: 'generateAnnualProgramFlow',
    inputSchema: PromptInputSchema, 
    outputSchema: GenerateAnnualProgramOutputSchema,
  },
  async (promptInputWithFlags: z.infer<typeof PromptInputSchema>) => { // Use correct input type
    const {output} = await prompt(promptInputWithFlags);
    
    if (output && promptInputWithFlags.curriculumType !== "Kurikulum Merdeka") {
        delete output.profilPelajarPancasilaFocus; 
    }
    return output!;
  }
);

