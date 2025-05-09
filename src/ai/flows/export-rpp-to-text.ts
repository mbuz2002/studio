
// src/ai/flows/export-rpp-to-text.ts
'use server';

/**
 * @fileOverview Mengekspor Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar / Alur Tujuan Pembelajaran (ATP) ke format teks terstruktur.
 *
 * - exportRppToText - Fungsi yang menghasilkan konten teks.
 * - ExportRppToTextInput - Tipe input untuk fungsi exportRppToText.
 * - ExportRppToTextOutput - Tipe return untuk fungsi exportRppToText.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { LessonPlan, CurriculumFramework } from '@/types'; 
import { format } from 'date-fns';
import { id as indonesianLocale } from 'date-fns';

const LessonPlanSchema = z.object({
  id: z.string(),
  type: z.literal('RPP'), // Keep as RPP for generic type, but content will vary
  title: z.string(),
  subject: z.string(),
  gradeLevel: z.string(),
  curriculumType: z.enum(["Kurikulum Merdeka", "K-13", "KTSP 2006"]), 
  topic: z.string().describe("Untuk Kurikulum Merdeka (ATP): Konsentrasi Keahlian atau Tema Utama. Untuk RPP: Topik."),
  learningObjectives: z.array(z.string()).describe("Untuk Kurikulum Merdeka (ATP): Daftar Tujuan Pembelajaran (TP). Untuk K-13/KTSP: Daftar Tujuan Pembelajaran."),
  alokasiWaktuJP: z.string().optional(),
  
  // Kurikulum Merdeka specific
  bidangKeahlian: z.string().optional().describe("Bidang Keahlian (Kurikulum Merdeka)."),
  programKeahlian: z.string().optional().describe("Program Keahlian (Kurikulum Merdeka)."),
  capaianPembelajaran: z.array(z.string()).optional().describe("Capaian Pembelajaran (CP) yang relevan."),
  pemahamanBermakna: z.array(z.string()).optional().describe("Pemahaman bermakna yang akan dibangun oleh siswa."),
  pertanyaanPemantik: z.array(z.string()).optional().describe("Pertanyaan pemantik untuk diskusi."),
  differentiationStrategies: z.array(z.string()).optional(),
  profilPelajarPancasilaFocus: z.array(z.string()).optional().describe("Fokus Profil Pelajar Pancasila."),
  
  // KTSP / K-13 specific
  standarKompetensi: z.array(z.string()).optional(),
  kompetensiInti: z.array(z.string()).optional(),
  kompetensiDasar: z.array(z.string()).optional(),
  indikatorPencapaianKompetensi: z.array(z.string()).optional(),
  metodePembelajaran: z.array(z.string()).optional(),
  
  // Common
  langkahPembelajaran: z.object({
    pendahuluan: z.array(z.string()),
    kegiatanInti: z.array(z.string()),
    penutup: z.array(z.string()),
  }).optional(), // Optional as pure ATP might not have detailed steps
  assessment: z.string().optional(), 
  materials: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PromptInputSchema = LessonPlanSchema.extend({
  isKurikulumMerdeka: z.boolean(),
  isK13: z.boolean(),
  isKTSP2006: z.boolean(),
  formattedUpdatedAt: z.string(),
});

export type ExportRppToTextInput = z.infer<typeof LessonPlanSchema>;

const ExportRppToTextOutputSchema = z.object({
  documentContent: z.string().describe('Konten Dokumen Pembelajaran (RPP/Modul Ajar/ATP) dalam format teks terstruktur.'),
});
export type ExportRppToTextOutput = z.infer<typeof ExportRppToTextOutputSchema>;

export async function exportRppToText(input: ExportRppToTextInput): Promise<ExportRppToTextOutput> {
  return exportRppToTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'exportRppToTextPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: ExportRppToTextOutputSchema },
  prompt: `Anda adalah asisten yang bertugas mengubah data dokumen pembelajaran (RPP/Modul Ajar/ATP) dari format JSON menjadi dokumen teks yang terstruktur dengan baik dan rapi. Gunakan Bahasa Indonesia.
Format output harus jelas, mudah dibaca, dan siap untuk disalin ke editor teks atau diunduh sebagai file .txt.
Gunakan markdown sederhana untuk judul (##, ###), daftar (* atau -), dan penekanan (**teks tebal**).

{{#if isKurikulumMerdeka}}
**ALUR TUJUAN PEMBELAJARAN (ATP) / MODUL AJAR**
{{#if programKeahlian}}
KONSENTRASI KEAHLIAN: {{{programKeahlian}}}
{{else}}
{{#if topic}}TEMA UTAMA: {{{topic}}}{{/if}}
{{/if}}
------------------------------------------------------
**Judul Dokumen:** {{{title}}}
{{#if bidangKeahlian}}**Bidang Keahlian:** {{{bidangKeahlian}}}{{/if}}
{{#if programKeahlian}}**Program Keahlian:** {{{programKeahlian}}}{{/if}}
**Mata Pelajaran:** {{{subject}}}
**Fase:** {{{gradeLevel}}}
{{else}}
**RENCANA PELAKSANAAN PEMBELAJARAN (RPP)**
------------------------------------------------------
**Judul RPP:** {{{title}}}
**Mata Pelajaran:** {{{subject}}}
**Jenjang/Kelas:** {{{gradeLevel}}}
**Topik/Materi Pembelajaran:** {{{topic}}}
{{/if}}
**Kurikulum:** {{{curriculumType}}}
{{#if alokasiWaktuJP}}
**Alokasi Waktu:** {{{alokasiWaktuJP}}}
{{/if}}

---
{{#if isKurikulumMerdeka}}
  {{#if capaianPembelajaran.length}}
  **A. CAPAIAN PEMBELAJARAN (CP)**
  {{#each capaianPembelajaran}}
  - {{{this}}}
  {{/each}}
  {{/if}}

  **{{#if capaianPembelajaran.length}}B{{else}}A{{/if}}. TUJUAN PEMBELAJARAN (TP)**
  {{#each learningObjectives}}
  - {{{this}}}
  {{/each}}

  {{#if profilPelajarPancasilaFocus.length}}
  **{{#if capaianPembelajaran.length}}{{#if learningObjectives.length}}C{{else}}B{{/if}}{{else}}B{{/if}}. FOKUS PROFIL PELAJAR PANCASILA**
  {{#each profilPelajarPancasilaFocus}}
  - {{{this}}}
  {{/each}}
  {{/if}}

  {{#if pemahamanBermakna.length}}
  **{{#if capaianPembelajaran.length}}{{#if learningObjectives.length}}{{#if profilPelajarPancasilaFocus.length}}D{{else}}C{{/if}}{{else}}C{{/if}}{{else}}{{#if profilPelajarPancasilaFocus.length}}C{{else}}B{{/if}}{{/if}}. PEMAHAMAN BERMAKNA**
  {{#each pemahamanBermakna}}
  - {{{this}}}
  {{/each}}
  {{/if}}

  {{#if pertanyaanPemantik.length}}
  **{{#if capaianPembelajaran.length}}{{#if learningObjectives.length}}{{#if profilPelajarPancasilaFocus.length}}{{#if pemahamanBermakna.length}}E{{else}}D{{/if}}{{else}}D{{/if}}{{else}}D{{/if}}{{else}}{{#if profilPelajarPancasilaFocus.length}}{{#if pemahamanBermakna.length}}D{{else}}C{{/if}}{{else}}C{{/if}}{{/if}}. PERTANYAAN PEMANTIK**
  {{#each pertanyaanPemantik}}
  - {{{this}}}
  {{/each}}
  {{/if}}

{{else}} {{! Not Kurikulum Merdeka }}
  **A. TUJUAN PEMBELAJARAN**
  {{#each learningObjectives}}
  - {{{this}}}
  {{/each}}

  {{#if isKTSP2006}}
      {{#if standarKompetensi.length}}
      **B. STANDAR KOMPETENSI (SK)**
      {{#each standarKompetensi}}
      - {{{this}}}
      {{/each}}
      {{/if}}
  {{/if}}
  {{#if isK13}}
      {{#if kompetensiInti.length}}
      **B. KOMPETENSI INTI (KI)**
      {{#each kompetensiInti}}
      - {{{this}}}
      {{/each}}
      {{/if}}
  {{/if}}

  {{#if kompetensiDasar.length}}
  **C. KOMPETENSI DASAR (KD)**
  {{#each kompetensiDasar}}
  - {{{this}}}
  {{/each}}
  {{/if}}

  {{#if indikatorPencapaianKompetensi.length}}
  **D. INDIKATOR PENCAPAIAN KOMPETENSI (IPK)**
  {{#each indikatorPencapaianKompetensi}}
  - {{{this}}}
  {{/each}}
  {{/if}}

  {{#if metodePembelajaran.length}}
  **E. METODE PEMBELAJARAN**
  {{#each metodePembelajaran}}
  - {{{this}}}
  {{/each}}
  {{/if}}
{{/if}}

{{#if langkahPembelajaran}}
**{{#if isKurikulumMerdeka}}
  {{#if capaianPembelajaran.length}}{{#if learningObjectives.length}}{{#if profilPelajarPancasilaFocus.length}}{{#if pemahamanBermakna.length}}{{#if pertanyaanPemantik.length}}F{{else}}E{{/if}}{{else}}E{{/if}}{{else}}E{{/if}}{{else}}E{{/if}}{{else}}E{{/if}}
{{else}}
  F
{{/if}}. LANGKAH-LANGKAH PEMBELAJARAN (jika ada)**
  {{#if langkahPembelajaran.pendahuluan.length}}
  **1. Pendahuluan:**
  {{#each langkahPembelajaran.pendahuluan}}
    - {{{this}}}
  {{/each}}
  {{/if}}
  {{#if langkahPembelajaran.kegiatanInti.length}}
  **2. Kegiatan Inti:**
  {{#each langkahPembelajaran.kegiatanInti}}
    - {{{this}}}
  {{/each}}
  {{/if}}
  {{#if langkahPembelajaran.penutup.length}}
  **3. Penutup:**
  {{#each langkahPembelajaran.penutup}}
    - {{{this}}}
  {{/each}}
  {{/if}}
{{/if}}

{{#if assessment}}
**{{#if isKurikulumMerdeka}}
  {{#if capaianPembelajaran.length}}{{#if learningObjectives.length}}{{#if profilPelajarPancasilaFocus.length}}{{#if pemahamanBermakna.length}}{{#if pertanyaanPemantik.length}}{{#if langkahPembelajaran}}G{{else}}F{{/if}}{{else}}F{{/if}}{{else}}F{{/if}}{{else}}F{{/if}}{{else}}F{{/if}}
{{else}}
  G
{{/if}}. ASESMEN/PENILAIAN**
{{{assessment}}}
{{/if}}

{{#if isKurikulumMerdeka}}
    {{#if differentiationStrategies.length}}
    **{{#if capaianPembelajaran.length}}{{#if learningObjectives.length}}{{#if profilPelajarPancasilaFocus.length}}{{#if pemahamanBermakna.length}}{{#if pertanyaanPemantik.length}}{{#if langkahPembelajaran}}{{#if assessment}}H{{else}}G{{/if}}{{else}}G{{/if}}{{else}}G{{/if}}{{else}}G{{/if}}{{else}}G{{/if}}
{{else}}
  H
{{/if}}. STRATEGI DIFERENSIASI**
    {{#each differentiationStrategies}}
    - {{{this}}}
    {{/each}}
    {{/if}}
{{/if}}

{{#if materials}}
**{{#if isKurikulumMerdeka}}
  {{#if capaianPembelajaran.length}}{{#if learningObjectives.length}}{{#if profilPelajarPancasilaFocus.length}}{{#if pemahamanBermakna.length}}{{#if pertanyaanPemantik.length}}{{#if langkahPembelajaran}}{{#if assessment}}{{#if differentiationStrategies.length}}I{{else}}H{{/if}}{{else}}H{{/if}}{{else}}H{{/if}}{{else}}H{{/if}}{{else}}H{{/if}}
{{else}}
  H
{{/if}}. MEDIA/SUMBER BELAJAR**
- {{{materials}}}
{{/if}}

---
*Dokumen ini terakhir diperbarui pada: {{{formattedUpdatedAt}}}*

Pastikan semua bagian terisi sesuai data yang diberikan dan jenis kurikulum. Jika ada data opsional yang tidak ada atau kosong, atau tidak relevan dengan jenis kurikulum yang dipilih, maka jangan tampilkan bagian (heading dan konten) tersebut sama sekali.
Untuk Kurikulum Merdeka, jika fokusnya adalah ATP, komponen seperti Langkah Pembelajaran, Asesmen, dll., mungkin lebih ringkas.
`,
});


const exportRppToTextFlow = ai.defineFlow(
  {
    name: 'exportRppToTextFlow',
    inputSchema: LessonPlanSchema,
    outputSchema: ExportRppToTextOutputSchema,
  },
  async (input: ExportRppToTextInput) => {
    const preparedInput = {
      ...input,
      bidangKeahlian: input.bidangKeahlian || undefined,
      programKeahlian: input.programKeahlian || undefined,
      capaianPembelajaran: input.capaianPembelajaran || [],
      pemahamanBermakna: input.pemahamanBermakna || [],
      pertanyaanPemantik: input.pertanyaanPemantik || [],
      profilPelajarPancasilaFocus: input.profilPelajarPancasilaFocus || [],
      standarKompetensi: input.standarKompetensi || [],
      kompetensiInti: input.kompetensiInti || [],
      kompetensiDasar: input.kompetensiDasar || [],
      indikatorPencapaianKompetensi: input.indikatorPencapaianKompetensi || [],
      metodePembelajaran: input.metodePembelajaran || [],
      langkahPembelajaran: input.langkahPembelajaran || undefined, // Keep undefined if not present
      assessment: input.assessment || undefined, 
      differentiationStrategies: input.differentiationStrategies || [],
      materials: input.materials || "", 
      formattedUpdatedAt: input.updatedAt ? format(new Date(input.updatedAt), "dd MMMM yyyy, HH:mm", { locale: indonesianLocale }) : "Data tidak tersedia"
    };

    const curriculumFlags = {
        isKurikulumMerdeka: preparedInput.curriculumType === "Kurikulum Merdeka",
        isK13: preparedInput.curriculumType === "K-13",
        isKTSP2006: preparedInput.curriculumType === "KTSP 2006",
    };

    const finalPromptInput = { ...preparedInput, ...curriculumFlags };
    
    const { output } = await prompt(finalPromptInput);
    return output!;
  }
);
