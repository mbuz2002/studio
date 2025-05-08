
// src/ai/flows/generate-teaching-material.ts
'use server';

/**
 * @fileOverview Membuat materi pembelajaran beserta sumber referensi berdasarkan topik dan jenjang/fase/kelas.
 *
 * - generateTeachingMaterial - Fungsi yang membuat materi pembelajaran dan sumbernya.
 * - GenerateTeachingMaterialInput - Tipe input untuk fungsi generateTeachingMaterial.
 * - GenerateTeachingMaterialOutput - Tipe return untuk fungsi generateTeachingMaterial.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTeachingMaterialInputSchema = z.object({
  topic: z.string().describe('Topik atau materi pembelajaran yang ingin dibuatkan materi ajarannya.'),
  jenjangFaseKelas: z.string().describe('Jenjang, fase, atau kelas sasaran (misalnya, "Fase D (Kelas 7 SMP)", "PAUD", "Kelas 10 SMAK").'),
  detailLevel: z.enum(['ringkas', 'standar', 'mendalam']).optional().default('standar').describe('Tingkat kedetailan materi yang diinginkan: ringkas, standar, atau mendalam.'),
});
export type GenerateTeachingMaterialInput = z.infer<typeof GenerateTeachingMaterialInputSchema>;

const SuggestedSourceSchema = z.object({
    type: z.enum(['buku', 'jurnal', 'artikel online', 'video', 'website edukasi', 'lainnya']).describe('Jenis sumber referensi.'),
    title: z.string().describe('Judul sumber referensi (misal, judul buku, artikel, atau video).'),
    authorOrPublisher: z.string().optional().describe('Penulis atau penerbit sumber (jika ada).'),
    url: z.string().optional().describe('URL jika sumber online (misal, link ke artikel atau video). Harap pastikan ini adalah URL yang valid jika memungkinkan.'),
    description: z.string().optional().describe('Deskripsi singkat mengapa sumber ini relevan atau bagaimana menggunakannya.'),
});

const GenerateTeachingMaterialOutputSchema = z.object({
  materialTitle: z.string().describe('Judul materi pembelajaran yang menarik dan relevan dengan topik.'),
  materialContent: z.string().describe('Konten materi pembelajaran yang terstruktur dengan baik, menggunakan format markdown sederhana (misal, heading, list, bold). Konten harus sesuai dengan topik, jenjang, dan tingkat kedetailan yang diminta.'),
  suggestedSources: z.array(SuggestedSourceSchema).describe('Daftar sumber referensi yang relevan dan kredibel untuk mendukung materi pembelajaran yang dibuat. Sertakan minimal 2-3 sumber.'),
});
export type GenerateTeachingMaterialOutput = z.infer<typeof GenerateTeachingMaterialOutputSchema>;

export async function generateTeachingMaterial(input: GenerateTeachingMaterialInput): Promise<GenerateTeachingMaterialOutput> {
  return generateTeachingMaterialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTeachingMaterialPrompt',
  input: {schema: GenerateTeachingMaterialInputSchema},
  output: {schema: GenerateTeachingMaterialOutputSchema},
  prompt: `Anda adalah seorang ahli pembuat konten edukasi dan kurikulum yang berpengalaman, bertugas membuat materi pembelajaran yang informatif dan menarik sesuai Kurikulum Merdeka, beserta daftar sumber referensi yang relevan.

Buatlah materi pembelajaran untuk:
Topik: {{{topic}}}
Jenjang/Fase/Kelas: {{{jenjangFaseKelas}}}
Tingkat Kedetailan: {{{detailLevel}}}

Materi pembelajaran harus:
1.  **Judul Materi**: Buat judul yang menarik dan sesuai dengan topik.
2.  **Konten Materi**:
    *   Sajikan konten yang terstruktur dengan baik, mudah dipahami, dan relevan dengan topik serta jenjang yang diberikan.
    *   Gunakan format markdown sederhana (misalnya, heading ## atau ###, daftar *, -, atau 1., **teks tebal**).
    *   Pastikan kedalaman materi sesuai dengan tingkat kedetailan yang diminta (ringkas, standar, atau mendalam).
    *   Fokus pada konsep-konsep kunci dan relevansinya dalam Kurikulum Merdeka.

3.  **Sumber Referensi yang Disarankan**:
    *   Sediakan minimal 2-3 sumber referensi yang kredibel dan relevan.
    *   Untuk setiap sumber, sebutkan jenisnya (buku, artikel online, video, dll.), judul, penulis/penerbit (jika ada), URL (jika online), dan deskripsi singkat mengapa sumber tersebut berguna.
    *   Prioritaskan sumber-sumber yang mudah diakses oleh guru atau siswa di Indonesia (misalnya, situs Kemdikbud, platform edukasi lokal, buku teks yang umum).
    *   Jika URL disediakan, pastikan itu adalah URL yang berfungsi dan valid.

Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan dan menggunakan Bahasa Indonesia yang baik dan benar.
`,
});

const generateTeachingMaterialFlow = ai.defineFlow(
  {
    name: 'generateTeachingMaterialFlow',
    inputSchema: GenerateTeachingMaterialInputSchema,
    outputSchema: GenerateTeachingMaterialOutputSchema,
  },
  async (input: GenerateTeachingMaterialInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);

    

