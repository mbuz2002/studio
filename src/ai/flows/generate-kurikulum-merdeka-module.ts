
// src/ai/flows/generate-kurikulum-merdeka-module.ts
'use server';

/**
 * @fileOverview Membuat draf Modul Ajar lengkap untuk Kurikulum Merdeka berdasarkan topik, jenjang, dan mata pelajaran.
 *
 * - generateKurikulumMerdekaModule - Fungsi utama yang menghasilkan Modul Ajar.
 * - GenerateKurikulumMerdekaModuleInput - Tipe input untuk fungsi generateKurikulumMerdekaModule.
 * - GenerateKurikulumMerdekaModuleOutput - Tipe return (struktur Modul Ajar) untuk fungsi generateKurikulumMerdekaModule.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { 
    GenerateKurikulumMerdekaModuleOutput as OutputType, 
    ModulAjarIdentitas,
    ModulAjarKomponenInti,
    ModulAjarLampiran
} from '@/types';

const GenerateKurikulumMerdekaModuleInputSchema = z.object({
  topic: z.string().describe('Topik utama atau lingkup materi Modul Ajar.'),
  jenjangFaseKelas: z.string().describe('Jenjang, Fase, dan Kelas sasaran (misalnya, "SMA Fase F Kelas XI", "SMP Fase D Kelas VII").'),
  subject: z.string().describe('Mata pelajaran.'),
  alokasiWaktuTotal: z.string().optional().describe('Estimasi total alokasi waktu untuk modul ini (misal "12 JP" atau "3 Pertemuan @ 4JP"). Jika kosong, AI akan menyarankan.'),
  capaianPembelajaranElemen: z.array(z.string()).optional().describe('Elemen-elemen Capaian Pembelajaran (CP) spesifik yang ingin dicapai melalui modul ini. Jika ada, AI akan fokus pada CP ini.'),
  namaPenyusun: z.string().optional().describe('Nama penyusun modul. Jika kosong, AI akan menggunakan placeholder.'),
  institusi: z.string().optional().describe('Nama institusi/sekolah. Jika kosong, AI akan menggunakan placeholder.'),
  tahunAjar: z.string().optional().describe('Tahun Ajaran (misal "2024/2025"). Jika kosong, AI akan menggunakan placeholder.'),
});
export type GenerateKurikulumMerdekaModuleInput = z.infer<typeof GenerateKurikulumMerdekaModuleInputSchema>;

const ModulAjarIdentitasSchema = z.object({
  namaPenyusun: z.string(),
  institusi: z.string(),
  tahunAjar: z.string(),
  jenjangSekolah: z.string(),
  fase: z.string(),
  kelasSemester: z.string(),
  alokasiWaktu: z.string(),
  mataPelajaran: z.string(),
  elemenCapaianPembelajaran: z.array(z.string()).optional(),
});

const ModulAjarKomponenIntiSchema = z.object({
  tujuanPembelajaran: z.array(z.string()),
  pemahamanBermakna: z.array(z.string()),
  pertanyaanPemantik: z.array(z.string()),
  kegiatanPembelajaran: z.object({
    pendahuluan: z.array(z.string()),
    inti: z.array(z.object({
        langkah: z.string().describe("Judul atau nama singkat kegiatan inti, misal 'Eksplorasi Konsep', 'Diskusi Kelompok', 'Praktik Mandiri'"),
        detailAktivitas: z.array(z.string().describe("Rincian langkah-langkah aktivitas dalam kegiatan inti tersebut.")),
    })),
    penutup: z.array(z.string()),
  }),
  asesmen: z.object({
    diagnostik: z.string().optional(),
    formatif: z.string(),
    sumatif: z.string(),
  }),
  pengayaanRemedial: z.object({
    pengayaan: z.string(),
    remedial: z.string(),
  }).optional(),
  refleksiPesertaDidikGuru: z.object({
    refleksiPesertaDidik: z.string(),
    refleksiGuru: z.string(),
  }).optional(),
});

const ModulAjarLampiranSchema = z.object({
  lembarKerjaPesertaDidik: z.string().optional().describe("Deskripsi atau konten ringkas LKPD. Bisa berupa poin-poin utama."),
  bahanBacaanGuruSiswa: z.array(z.string()).optional(),
  glosarium: z.array(z.object({ istilah: z.string(), penjelasan: z.string() })).optional(),
  daftarPustaka: z.array(z.string()).optional(),
});

const GenerateKurikulumMerdekaModuleOutputSchema = z.object({
  judulModul: z.string(),
  identitasModul: ModulAjarIdentitasSchema,
  kompetensiAwal: z.array(z.string()).optional(),
  profilPelajarPancasila: z.array(z.string()),
  saranaPrasarana: z.array(z.string()),
  targetPesertaDidik: z.string(),
  modelPembelajaran: z.string(),
  komponenInti: ModulAjarKomponenIntiSchema,
  lampiran: ModulAjarLampiranSchema.optional(),
});
export type GenerateKurikulumMerdekaModuleOutput = z.infer<typeof GenerateKurikulumMerdekaModuleOutputSchema>;


export async function generateKurikulumMerdekaModule(input: GenerateKurikulumMerdekaModuleInput): Promise<OutputType> {
  return generateKurikulumMerdekaModuleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKurikulumMerdekaModulePrompt',
  input: { schema: GenerateKurikulumMerdekaModuleInputSchema },
  output: { schema: GenerateKurikulumMerdekaModuleOutputSchema },
  prompt: `Anda adalah seorang ahli perancangan kurikulum yang bertugas membuat draf MODUL AJAR LENGKAP untuk Kurikulum Merdeka.
Buatlah draf Modul Ajar untuk:

Topik Utama/Materi: {{{topic}}}
Mata Pelajaran: {{{subject}}}
Jenjang/Fase/Kelas: {{{jenjangFaseKelas}}}
{{#if alokasiWaktuTotal}}Estimasi Alokasi Waktu Total: {{{alokasiWaktuTotal}}}{{/if}}
{{#if namaPenyusun}}Nama Penyusun: {{{namaPenyusun}}}{{/if}}
{{#if institusi}}Institusi: {{{institusi}}}{{/if}}
{{#if tahunAjar}}Tahun Ajar: {{{tahunAjar}}}{{/if}}
{{#if capaianPembelajaranElemen.length}}
Fokus Elemen Capaian Pembelajaran (CP):
{{#each capaianPembelajaranElemen}}
- {{{this}}}
{{/each}}
{{/if}}

Modul Ajar harus mencakup komponen-komponen berikut, sesuai dengan struktur Kurikulum Merdeka:
1.  **Judul Modul**: Judul yang menarik dan mencerminkan topik.
2.  **Identitas Modul**:
    *   Nama Penyusun: (gunakan input {{{namaPenyusun}}}, atau "Nama Guru Mata Pelajaran" jika kosong)
    *   Institusi: (gunakan input {{{institusi}}}, atau "Nama Sekolah" jika kosong)
    *   Tahun Ajar: (gunakan input {{{tahunAjar}}}, atau tahun berjalan jika kosong)
    *   Jenjang Sekolah: (Ekstrak dari {{{jenjangFaseKelas}}}, misal "SMA", "SMP")
    *   Fase: (Ekstrak dari {{{jenjangFaseKelas}}}, misal "Fase F", "Fase D")
    *   Kelas/Semester: (Ekstrak dari {{{jenjangFaseKelas}}} dan tentukan semester yang paling relevan dengan topik, misal "XI / Ganjil")
    *   Alokasi Waktu: (gunakan input {{{alokasiWaktuTotal}}}, atau sarankan alokasi yang sesuai jika kosong)
    *   Mata Pelajaran: {{{subject}}}
    *   Elemen Capaian Pembelajaran: (jika {{{capaianPembelajaranElemen}}} diberikan, gunakan itu. Jika tidak, AI boleh menyarankan elemen CP yang relevan dengan topik dan fase)
3.  **Kompetensi Awal** (Opsional): Pengetahuan atau keterampilan prasyarat.
4.  **Profil Pelajar Pancasila**: Dimensi Profil Pelajar Pancasila yang dikembangkan. Minimal 2.
5.  **Sarana dan Prasarana**: Media, alat, bahan, dan sumber belajar yang dibutuhkan.
6.  **Target Peserta Didik**: Misal "Reguler/Tipikal", "Dengan Kesulitan Belajar", "Dengan Pencapaian Tinggi".
7.  **Model Pembelajaran**: Model pembelajaran yang digunakan (misal Tatap Muka, PJJ Daring, PJJ Luring, Blended Learning, Project-Based Learning, Discovery Learning, dll.).
8.  **Komponen Inti**:
    *   Tujuan Pembelajaran (TP): Rumuskan beberapa TP yang jelas dan terukur, turunan dari CP (jika ada) atau relevan dengan topik. Minimal 3 TP.
    *   Pemahaman Bermakna: Kalimat yang menjelaskan manfaat pembelajaran bagi siswa.
    *   Pertanyaan Pemantik: Pertanyaan yang memicu rasa ingin tahu dan diskusi.
    *   Kegiatan Pembelajaran: Rincikan kegiatan secara sistematis (Pendahuluan, Inti, Penutup).
        *   Pendahuluan: Aktivitas pembuka (salam, doa, apersepsi, motivasi, penyampaian tujuan).
        *   Inti: Rincikan langkah-langkah kegiatan inti. Setiap langkah utama dalam kegiatan inti harus memiliki judul/nama singkat (field 'langkah') dan detail aktivitasnya (field 'detailAktivitas'). Buat minimal 2-3 langkah utama dalam kegiatan inti.
        *   Penutup: Aktivitas penutup (refleksi, kesimpulan, umpan balik, tindak lanjut).
    *   Asesmen:
        *   Diagnostik (Opsional): Bagaimana asesmen diagnostik dilakukan.
        *   Formatif: Bagaimana kemajuan siswa dipantau selama pembelajaran.
        *   Sumatif: Bagaimana ketercapaian TP diukur di akhir modul/unit.
    *   Pengayaan dan Remedial (Opsional): Strategi untuk siswa yang cepat paham dan yang membutuhkan bantuan.
    *   Refleksi Peserta Didik dan Guru (Opsional): Pertanyaan reflektif untuk siswa dan guru.
9.  **Lampiran** (Opsional, buat deskripsi singkat atau poin-poin utama jika konten penuh terlalu panjang):
    *   Lembar Kerja Peserta Didik (LKPD).
    *   Bahan Bacaan Guru dan Peserta Didik.
    *   Glosarium.
    *   Daftar Pustaka.

Pastikan output yang dihasilkan sesuai dengan skema JSON yang diharapkan dan menggunakan Bahasa Indonesia yang baik dan benar.
Untuk Kegiatan Pembelajaran Inti, setiap 'langkah' harus merupakan judul dari sebuah sub-kegiatan, dan 'detailAktivitas' berisi poin-poin konkret tentang apa yang dilakukan siswa dan guru pada sub-kegiatan tersebut.
Buat konten yang kaya dan relevan dengan topik serta jenjang/fase yang diberikan. Jika {{{capaianPembelajaranElemen}}} tidak diberikan, AI harus mencoba merumuskan Elemen CP yang sesuai.
`,
});

const generateKurikulumMerdekaModuleFlow = ai.defineFlow(
  {
    name: 'generateKurikulumMerdekaModuleFlow',
    inputSchema: GenerateKurikulumMerdekaModuleInputSchema,
    outputSchema: GenerateKurikulumMerdekaModuleOutputSchema,
  },
  async (input: GenerateKurikulumMerdekaModuleInput) => {
    const { output } = await prompt(input);
    return output!;
  }
);
