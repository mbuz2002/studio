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
import type { LessonPlan } from '@/types'; // Assuming LessonPlan type is defined here

// Define the Zod schema for LessonPlan if not already centrally available for Genkit
// This should mirror the structure of your LessonPlan type.
const LessonPlanSchema = z.object({
  id: z.string(),
  type: z.literal('RPP'),
  title: z.string(),
  subject: z.string(),
  gradeLevel: z.string(),
  topic: z.string(),
  learningObjectives: z.array(z.string()),
  pemahamanBermakna: z.array(z.string()).describe("Pemahaman bermakna yang akan dibangun oleh siswa.").optional(),
  pertanyaanPemantik: z.array(z.string()).describe("Pertanyaan pemantik untuk diskusi.").optional(),
  langkahPembelajaran: z.object({
    pendahuluan: z.array(z.string()),
    kegiatanInti: z.array(z.string()),
    penutup: z.array(z.string()),
  }),
  assessment: z.string(), // Or z.array(z.string()) if it's multiple ideas
  differentiationStrategies: z.array(z.string()).optional(),
  materials: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ExportRppToTextInputSchema = LessonPlanSchema; // Input is a full LessonPlan object
export type ExportRppToTextInput = z.infer<typeof ExportRppToTextInputSchema>;

const ExportRppToTextOutputSchema = z.object({
  documentContent: z.string().describe('Konten RPP/Modul Ajar dalam format teks terstruktur, siap untuk diunduh atau disalin.'),
});
export type ExportRppToTextOutput = z.infer<typeof ExportRppToTextOutputSchema>;

export async function exportRppToText(input: ExportRppToTextInput): Promise<ExportRppToTextOutput> {
  return exportRppToTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'exportRppToTextPrompt',
  input: { schema: ExportRppToTextInputSchema },
  output: { schema: ExportRppToTextOutputSchema },
  prompt: `Anda adalah asisten yang bertugas mengubah data Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar (MA) dari format JSON menjadi dokumen teks yang terstruktur dengan baik dan rapi. Gunakan Bahasa Indonesia.
Format output harus jelas, mudah dibaca, dan siap untuk disalin ke editor teks atau diunduh sebagai file .txt.
Gunakan markdown sederhana untuk pen Überschriften (##, ###), Listen (*), und Fettgedrucktem (**Wichtige Begriffe**).

Berikut adalah data RPP/MA yang perlu diformat:

**MODUL AJAR / RENCANA PELAKSANAAN PEMBELAJARAN (RPP)**

**Judul:** {{{title}}}
**Mata Pelajaran:** {{{subject}}}
**Jenjang/Fase/Kelas:** {{{gradeLevel}}}
**Topik/Materi:** {{{topic}}}

---

**A. TUJUAN PEMBELAJARAN**
{{#each learningObjectives}}
- {{{this}}}
{{/each}}

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

**D. LANGKAH-LANGKAH PEMBELAJARAN**

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

**E. ASESMEN/PENILAIAN**
{{{assessment}}}
{{#if assessmentStrategies}} {{!-- This assumes assessmentStrategies might be passed if 'assessment' is simple string --}}
  {{#each assessmentStrategies}}
  - {{{this}}}
  {{/each}}
{{/if}}


{{#if differentiationStrategies.length}}
**F. STRATEGI DIFERENSIASI**
{{#each differentiationStrategies}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if materials}}
**G. MEDIA/SUMBER BELAJAR**
- {{{materials}}}
{{/if}}

---
*Dokumen ini dibuat pada: {{updatedAt}} (Data terakhir diperbarui)*
Pastikan semua bagian terisi sesuai data yang diberikan. Jika ada data opsional yang tidak ada atau kosong, jangan tampilkan bagian tersebut.
`,
});


const exportRppToTextFlow = ai.defineFlow(
  {
    name: 'exportRppToTextFlow',
    inputSchema: ExportRppToTextInputSchema,
    outputSchema: ExportRppToTextOutputSchema,
  },
  async (input: ExportRppToTextInput) => {
    // Ensure all expected fields by the prompt are present, even if empty arrays/strings for optional ones
    const preparedInput = {
      ...input,
      pemahamanBermakna: input.pemahamanBermakna || [],
      pertanyaanPemantik: input.pertanyaanPemantik || [],
      differentiationStrategies: input.differentiationStrategies || [],
      materials: input.materials || "",
    };
    const { output } = await prompt(preparedInput);
    return output!;
  }
);

