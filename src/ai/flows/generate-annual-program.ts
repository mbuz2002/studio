
// src/ai/flows/generate-annual-program.ts
'use server';

/**
 * @fileOverview Membuat draf Program Tahunan (PROTA) dari tema, jenjang, dan tahun ajaran, sesuai Kurikulum Merdeka.
 *
 * - generateAnnualProgram - Fungsi yang membuat PROTA.
 * - GenerateAnnualProgramInput - Tipe input untuk fungsi generateAnnualProgram.
 * - GenerateAnnualProgramOutput - Tipe return untuk fungsi generateAnnualProgram.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnnualProgramComponentSchema = z.object({
  topic: z.string().describe('Judul topik atau unit pembelajaran utama.'),
  elemenCapaianPembelajaran: z.array(z.string()).optional().describe('Elemen-elemen Capaian Pembelajaran (CP) yang relevan dengan topik ini. Jika CP umum, bisa berupa poin-poin kompetensi.'),
  alokasiWaktu: z.string().describe('Estimasi alokasi waktu untuk topik ini, contoh: "24 JP" atau "4 Minggu".'),
});

const GenerateAnnualProgramInputSchema = z.object({
  subject: z.string().describe('Mata pelajaran atau tema utama PROTA (misalnya, "Matematika", "Bahasa Indonesia", "Projek Penguatan Profil Pelajar Pancasila").'),
  jenjangFaseKelas: z.string().describe('Jenjang, fase, atau kelas sasaran (misalnya, "Fase D (Kelas 7 SMP)", "PAUD", "Kelas 10 SMAK").'),
  year: z.string().describe('Tahun ajaran, misalnya "2024/2025".'),
});
export type GenerateAnnualProgramInput = z.infer<typeof GenerateAnnualProgramInputSchema>;

const GenerateAnnualProgramOutputSchema = z.object({
  title: z.string().describe('Judul Program Tahunan yang menarik dan informatif.'),
  semester1Components: z.array(AnnualProgramComponentSchema).describe('Daftar komponen pembelajaran untuk Semester 1.'),
  semester2Components: z.array(AnnualProgramComponentSchema).describe('Daftar komponen pembelajaran untuk Semester 2.'),
  profilPelajarPancasilaFocus: z.array(z.string()).optional().describe('Dimensi Profil Pelajar Pancasila yang menjadi fokus utama dalam program tahunan ini (misalnya, "Bernalar Kritis", "Gotong Royong").'),
});
export type GenerateAnnualProgramOutput = z.infer<typeof GenerateAnnualProgramOutputSchema>;

export async function generateAnnualProgram(input: GenerateAnnualProgramInput): Promise<GenerateAnnualProgramOutput> {
  return generateAnnualProgramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnnualProgramPrompt',
  input: {schema: GenerateAnnualProgramInputSchema},
  output: {schema: GenerateAnnualProgramOutputSchema},
  prompt: `Anda adalah seorang ahli perancang kurikulum yang bertugas membuat draf Program Tahunan (PROTA) sesuai dengan prinsip Kurikulum Merdeka di Indonesia.
Buatlah draf PROTA untuk mata pelajaran/tema, jenjang, dan tahun ajaran berikut:

Mata Pelajaran/Tema Utama: {{{subject}}}
Jenjang/Fase/Kelas: {{{jenjangFaseKelas}}}
Tahun Ajaran: {{{year}}}

PROTA harus mencakup:
1.  **Judul Program Tahunan**: Judul yang jelas, relevan, dan menarik.
2.  **Komponen Semester 1**: Daftar topik/unit pembelajaran utama untuk semester ganjil. Untuk setiap topik:
    *   Sebutkan topik/unitnya.
    *   Sebutkan elemen-elemen Capaian Pembelajaran (CP) yang terkait (bisa berupa poin-poin kompetensi umum jika CP spesifik tidak langsung tersedia).
    *   Berikan estimasi alokasi waktu (misalnya, dalam Jam Pelajaran (JP) atau minggu).
3.  **Komponen Semester 2**: Sama seperti Semester 1, namun untuk semester genap.
4.  **Fokus Profil Pelajar Pancasila (Opsional)**: Sebutkan beberapa dimensi Profil Pelajar Pancasila yang relevan dan akan ditekankan selama tahun ajaran tersebut.

Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan dan menggunakan Bahasa Indonesia yang baik dan benar. Buatlah minimal 2-3 komponen per semester sebagai contoh.
`,
});

const generateAnnualProgramFlow = ai.defineFlow(
  {
    name: 'generateAnnualProgramFlow',
    inputSchema: GenerateAnnualProgramInputSchema,
    outputSchema: GenerateAnnualProgramOutputSchema,
  },
  async (input: GenerateAnnualProgramInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);

    