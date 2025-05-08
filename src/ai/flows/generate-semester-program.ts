
// src/ai/flows/generate-semester-program.ts
'use server';

/**
 * @fileOverview Membuat draf Program Semester (Promes) dari informasi mata pelajaran, jenjang, tahun, semester, dan jenis kurikulum.
 *
 * - generateSemesterProgram - Fungsi yang membuat Promes.
 * - GenerateSemesterProgramInput - Tipe input untuk fungsi generateSemesterProgram.
 * - GenerateSemesterProgramOutput - Tipe return untuk fungsi generateSemesterProgram.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CurriculumFramework } from '@/types';

const WeeklyUnitSchema = z.object({
  mingguKe: z.number().int().positive().describe('Nomor urut minggu dalam semester.'),
  bulan: z.string().optional().describe('Nama bulan (misalnya, "Juli", "Agustus"). Opsional.'),
  materiPokokAtauTujuanPembelajaran: z.string().describe('Materi pokok/Tema (KTSP/K-13) atau Tujuan Pembelajaran spesifik (Kurikulum Merdeka) untuk minggu tersebut.'),
  alokasiWaktu: z.string().describe('Alokasi waktu untuk minggu tersebut dalam Jam Pelajaran (JP), contoh: "6 JP" atau "2 Pertemuan x 3 JP".'),
  metodeStrategi: z.array(z.string()).optional().describe('Contoh metode atau strategi pembelajaran yang disarankan.'),
  sumberBelajar: z.array(z.string()).optional().describe('Contoh sumber belajar yang dapat digunakan.'),
  rencanaAsesmen: z.array(z.string()).optional().describe('Ide atau rencana asesmen formatif/sumatif.'),
  catatanIntegrasiP5: z.string().optional().describe('Catatan singkat mengenai integrasi Profil Pelajar Pancasila (utamanya Kurikulum Merdeka).'),
});

const GenerateSemesterProgramInputSchema = z.object({
  subject: z.string().describe('Mata pelajaran.'),
  jenjangFaseKelas: z.string().describe('Jenjang, fase, atau kelas sasaran.'),
  year: z.string().describe('Tahun ajaran, misalnya "2024/2025".'),
  semester: z.enum(['1', '2']).describe('Semester (1 untuk Ganjil, 2 untuk Genap).'),
  curriculumType: z.enum(["Kurikulum Merdeka", "K-13", "KTSP 2006"]).describe("Jenis kurikulum yang digunakan sebagai acuan."),
  capaianPembelajaranUmumInput: z.string().optional().describe('Input Capaian Pembelajaran umum (Kurikulum Merdeka) atau rangkuman SK/KD (KTSP/K-13) untuk semester ini. Jika diisi, AI akan menggunakannya sebagai acuan utama. Jika kosong, AI akan mencoba membuatkannya.'),
});
export type GenerateSemesterProgramInput = z.infer<typeof GenerateSemesterProgramInputSchema>;

const GenerateSemesterProgramOutputSchema = z.object({
  title: z.string().describe('Judul Program Semester yang informatif dan menarik.'),
  capaianPembelajaranUmum: z.string().describe('Deskripsi Capaian Pembelajaran (CP) umum (Kurikulum Merdeka) atau rangkuman SK/KD (KTSP/K-13) untuk semester ini.'),
  alokasiWaktuTotalSemester: z.string().describe('Estimasi alokasi waktu total untuk semester ini dalam Jam Pelajaran (JP), contoh: "18 Minggu Efektif x 4 JP/Minggu = 72 JP".'),
  komponenMingguan: z.array(WeeklyUnitSchema).describe('Daftar rincian unit mingguan untuk beberapa minggu awal semester (misalnya 3-5 minggu pertama sebagai contoh).'),
});
export type GenerateSemesterProgramOutput = z.infer<typeof GenerateSemesterProgramOutputSchema>;

export async function generateSemesterProgram(input: GenerateSemesterProgramInput): Promise<GenerateSemesterProgramOutput> {
  return generateSemesterProgramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSemesterProgramPrompt',
  input: {schema: GenerateSemesterProgramInputSchema},
  output: {schema: GenerateSemesterProgramOutputSchema},
  prompt: `Anda adalah seorang ahli perancang kurikulum yang bertugas membuat draf Program Semester (Promes).
Buatlah draf Promes untuk:

Mata Pelajaran: {{{subject}}}
Jenjang/Fase/Kelas: {{{jenjangFaseKelas}}}
Tahun Ajaran: {{{year}}}
Semester: {{{semester}}} (1 = Ganjil, 2 = Genap)
Kurikulum Acuan: {{{curriculumType}}}
{{#if capaianPembelajaranUmumInput}}
{{#eq curriculumType "Kurikulum Merdeka"}}Capaian Pembelajaran (CP) Umum Semester yang diberikan (gunakan sebagai acuan utama):{{{/eq}}
{{#not (eq curriculumType "Kurikulum Merdeka")}}Rangkuman SK/KD yang diberikan:{{{/not}}
{{{capaianPembelajaranUmumInput}}}
{{/if}}

Promes harus mencakup:
1.  **Judul Program Semester**: Judul yang jelas dan relevan.
2.  **Capaian Pembelajaran Umum Semester**: 
    *   Untuk Kurikulum Merdeka: Deskripsikan Capaian Pembelajaran (CP) umum yang ingin dicapai dalam satu semester ini.
    *   Untuk K-13/KTSP: Deskripsikan rangkuman Standar Kompetensi (SK) dan Kompetensi Dasar (KD) utama yang akan dicakup.
    {{#if capaianPembelajaranUmumInput}}Gunakan atau adaptasi dari input yang diberikan.{{else}}Jika tidak ada input CP/SK-KD yang diberikan, buatlah satu yang sesuai.{{/if}}
3.  **Alokasi Waktu Total Semester**: Berikan estimasi perhitungan total alokasi waktu dalam Jam Pelajaran (JP), contoh: "18 Minggu Efektif x 4 JP/Minggu = 72 JP".
4.  **Komponen Mingguan**: Rincikan rencana pembelajaran untuk **3 sampai 5 minggu pertama** sebagai contoh. Untuk setiap minggu:
    *   \\\`mingguKe\\\`: Nomor minggu.
    *   \\\`bulan\\\`: Perkiraan bulan.
    *   \\\`materiPokokAtauTujuanPembelajaran\\\`: Materi pokok/Tema (KTSP/K-13) atau Tujuan Pembelajaran spesifik (Kurikulum Merdeka).
    *   \\\`alokasiWaktu\\\`: Alokasi waktu untuk minggu itu (misal "6 JP").
    *   \\\`metodeStrategi\\\` (opsional): Beberapa contoh metode/strategi.
    *   \\\`sumberBelajar\\\` (opsional): Beberapa contoh sumber belajar.
    *   \\\`rencanaAsesmen\\\` (opsional): Ide singkat untuk asesmen.
    *   \\\`catatanIntegrasiP5\\\` (opsional): Catatan singkat tentang integrasi Profil Pelajar Pancasila (utamanya untuk Kurikulum Merdeka, atau nilai karakter untuk KTSP/K-13 jika relevan).

Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan dan menggunakan Bahasa Indonesia yang baik dan benar.
`,
});

const generateSemesterProgramFlow = ai.defineFlow(
  {
    name: 'generateSemesterProgramFlow',
    inputSchema: GenerateSemesterProgramInputSchema,
    outputSchema: GenerateSemesterProgramOutputSchema,
  },
  async (input: GenerateSemesterProgramInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);

