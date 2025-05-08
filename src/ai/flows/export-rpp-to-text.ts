
// src/ai/flows/export-rpp-to-text.ts
'use server';

/**
 * @fileOverview Mengekspor Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar ke format teks terstruktur.
 *
 * - exportRppToText - Fungsi yang menghasilkan konten teks RPP.
 * - ExportRppToTextInput - Tipe input untuk fungsi exportRppToText.
 * - ExportRppToTextOutput - Tipe return untuk fungsi exportRppToText.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { LessonPlan, CurriculumFramework } from '@/types'; 
import { format } from 'date-fns';
import { id as indonesianLocale } from 'date-fns/locale';

// Define the Zod schema for LessonPlan if not already centrally available for Genkit
// This should mirror the structure of your LessonPlan type.
const LessonPlanSchema = z.object({
  id: z.string(),
  type: z.literal('RPP'),
  title: z.string(),
  subject: z.string(),
  gradeLevel: z.string(),
  curriculumType: z.enum(["Kurikulum Merdeka", "K-13", "KTSP 2006"]), 
  topic: z.string(),
  learningObjectives: z.array(z.string()),
  // Kurikulum Merdeka specific
  pemahamanBermakna: z.array(z.string()).describe("Pemahaman bermakna yang akan dibangun oleh siswa.").optional(),
  pertanyaanPemantik: z.array(z.string()).describe("Pertanyaan pemantik untuk diskusi.").optional(),
  differentiationStrategies: z.array(z.string()).optional(),
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
  }),
  assessment: z.string(), 
  materials: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Add boolean flags for curriculum type to the input schema for the prompt
const PromptInputSchema = LessonPlanSchema.extend({
  isKurikulumMerdeka: z.boolean(),
  isK13: z.boolean(),
  isKTSP2006: z.boolean(),
  formattedUpdatedAt: z.string(),
});

export type ExportRppToTextInput = z.infer<typeof LessonPlanSchema>; // External type remains the same

const ExportRppToTextOutputSchema = z.object({
  documentContent: z.string().describe('Konten RPP/Modul Ajar dalam format teks terstruktur, siap untuk diunduh atau disalin.'),
});
export type ExportRppToTextOutput = z.infer<typeof ExportRppToTextOutputSchema>;

export async function exportRppToText(input: ExportRppToTextInput): Promise<ExportRppToTextOutput> {
  return exportRppToTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'exportRppToTextPrompt',
  input: { schema: PromptInputSchema }, // Use the extended schema for the prompt
  output: { schema: ExportRppToTextOutputSchema },
  prompt: `Anda adalah asisten yang bertugas mengubah data Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar (MA) dari format JSON menjadi dokumen teks yang terstruktur dengan baik dan rapi. Gunakan Bahasa Indonesia.
Format output harus jelas, mudah dibaca, dan siap untuk disalin ke editor teks atau diunduh sebagai file .txt.
Gunakan markdown sederhana untuk judul (##, ###), daftar (* atau -), dan penekanan (**teks tebal**).

Berikut adalah data RPP/MA yang perlu diformat:

**MODUL AJAR / RENCANA PELAKSANAAN PEMBELAJARAN (RPP)**
------------------------------------------------------

**Judul:** {{{title}}}
**Kurikulum:** {{{curriculumType}}}
**Mata Pelajaran:** {{{subject}}}
**Jenjang/Fase/Kelas:** {{{gradeLevel}}}
**Topik/Materi Pembelajaran:** {{{topic}}}

---

**A. TUJUAN PEMBELAJARAN**
{{#each learningObjectives}}
- {{{this}}}
{{/each}}

{{#if isKurikulumMerdeka}}
    {{#if pemahamanBermakna.length}}
    **B. PEMAHAMAN BERMAKNA**
    {{#each pemahamanBermakna}}
    - {{{this}}}
    {{/each}}
    {{/if}}

    {{#if pertanyaanPemantik.length}}
    **C. PERTANYAAN PEMANTIK**
    {{#each pertanyaanPemantik}}
    - {{{this}}}
    {{/each}}
    {{/if}}
{{else}}
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

**{{#if isKurikulumMerdeka}}D{{else}}F{{/if}}. LANGKAH-LANGKAH PEMBELAJARAN**

  **1. Pendahuluan:**
  {{#each langkahPembelajaran.pendahuluan}}
    - {{{this}}}
  {{/each}}

  **2. Kegiatan Inti:**
  {{#each langkahPembelajaran.kegiatanInti}}
    - {{{this}}}
  {{/each}}

  **3. Penutup:**
  {{#each langkahPembelajaran.penutup}}
    - {{{this}}}
  {{/each}}

**{{#if isKurikulumMerdeka}}E{{else}}G{{/if}}. ASESMEN/PENILAIAN**
{{{assessment}}}

{{#if isKurikulumMerdeka}}
    {{#if differentiationStrategies.length}}
    **F. STRATEGI DIFERENSIASI**
    {{#each differentiationStrategies}}
    - {{{this}}}
    {{/each}}
    {{/if}}
{{/if}}

{{#if materials}}
**{{#if isKurikulumMerdeka}}G{{else}}H{{/if}}. MEDIA/SUMBER BELAJAR**
- {{{materials}}}
{{/if}}

---
*Dokumen ini terakhir diperbarui pada: {{{formattedUpdatedAt}}}*

Pastikan semua bagian terisi sesuai data yang diberikan dan jenis kurikulum. Jika ada data opsional yang tidak ada atau kosong, atau tidak relevan dengan jenis kurikulum yang dipilih, maka jangan tampilkan bagian (heading dan konten) tersebut sama sekali.
`,
});


const exportRppToTextFlow = ai.defineFlow(
  {
    name: 'exportRppToTextFlow',
    inputSchema: LessonPlanSchema, // Flow input remains original LessonPlan
    outputSchema: ExportRppToTextOutputSchema,
  },
  async (input: ExportRppToTextInput) => {
    const preparedInput = {
      ...input,
      pemahamanBermakna: input.pemahamanBermakna || [],
      pertanyaanPemantik: input.pertanyaanPemantik || [],
      standarKompetensi: input.standarKompetensi || [],
      kompetensiInti: input.kompetensiInti || [],
      kompetensiDasar: input.kompetensiDasar || [],
      indikatorPencapaianKompetensi: input.indikatorPencapaianKompetensi || [],
      metodePembelajaran: input.metodePembelajaran || [],
      langkahPembelajaran: input.langkahPembelajaran || { pendahuluan: [], kegiatanInti: [], penutup: []},
      assessment: input.assessment || "Belum dirinci.", 
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

