
import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FileTextIcon, BookOpen, Users, Settings, Sparkles, CalendarDays, CalendarClock, BrainCircuit, Database, ListChecks, ClipboardList, CalendarCheck, Home, ShieldCheck, CreditCard, LayoutDashboard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Dokumentasi - GUMPLA AI',
  description: 'Panduan lengkap penggunaan platform GUMPLA AI untuk perencanaan kurikulum dan manajemen pendidikan.',
};

const documentationSections = [
  {
    id: "pengenalan",
    title: "Pengenalan GUMPLA AI",
    icon: LayoutDashboard,
    content: [
      "Selamat datang di dokumentasi GUMPLA AI! Platform ini dirancang untuk membantu Anda sebagai pendidik dalam merencanakan dan mengelola kurikulum dengan lebih efektif menggunakan bantuan teknologi AI.",
      "Dokumentasi ini akan memandu Anda melalui fitur-fitur utama, cara penggunaan, dan tips untuk memaksimalkan potensi GUMPLA AI.",
    ],
  },
  {
    id: "memulai",
    title: "Memulai dengan GUMPLA AI",
    icon: Settings,
    content: [
      "**1. Pendaftaran & Login:** Buat akun sekolah Anda atau masuk jika sudah terdaftar. Super Admin akan mendaftarkan sekolah dan admin awal. Admin sekolah kemudian dapat menambahkan pengguna lain (Kepala Sekolah, Waka Kurikulum, Guru, Tata Usaha).",
      "**2. Profil Sekolah:** Lengkapi profil sekolah Anda di menu Pengaturan > Profil Sekolah. Informasi ini penting untuk kop surat dan data umum.",
      "**3. Pengaturan Kurikulum Default:** Admin atau Waka Kurikulum dapat mengatur kurikulum default (Kurikulum Merdeka, K-13, atau KTSP 2006) melalui Pengaturan Akun. Ini akan mempengaruhi template awal saat membuat dokumen baru.",
      "**4. Master Data:** Isi Master Data Mata Pelajaran, Guru, dan Kelas untuk digunakan dalam perencanaan.",
    ],
  },
  {
    id: "fitur-kurikulum",
    title: "Fitur Perencanaan Kurikulum",
    icon: BookOpenText,
    content: [
      "GUMPLA AI menyediakan modul untuk membuat dan mengelola berbagai dokumen kurikulum:",
      "**RPP/ATP:** Buat Rencana Pelaksanaan Pembelajaran (untuk K-13/KTSP) atau Alur Tujuan Pembelajaran (untuk Kurikulum Merdeka). Manfaatkan AI untuk draf awal berdasarkan topik, jenjang, dan CP (jika Kurikulum Merdeka).",
      "**PROTA (Program Tahunan):** Rencanakan alokasi waktu dan materi untuk satu tahun ajaran. AI dapat membantu menyusun draf komponen semester.",
      "**Promes (Program Semester):** Rincikan PROTA ke dalam program semester yang lebih detail per minggu. AI dapat membantu menyusun CP umum semester dan komponen mingguan awal.",
      "**Modul Ajar (Kurikulum Merdeka):** Khusus untuk Kurikulum Merdeka, buat Modul Ajar yang komprehensif dengan bantuan AI, mencakup semua komponen yang dipersyaratkan.",
      "Semua dokumen dapat dicetak dan diekspor ke format teks.",
    ],
  },
  {
    id: "asisten-ai",
    title: "Asisten AI Pembuatan Materi",
    icon: Sparkles,
    content: [
      "Fitur Asisten AI Materi memungkinkan Anda menghasilkan draf materi ajar untuk topik tertentu pada jenjang/fase yang dipilih.",
      "AI akan menyajikan konten materi dalam format markdown dan menyarankan beberapa sumber referensi yang relevan.",
      "**Penting:** Selalu verifikasi dan sesuaikan konten yang dihasilkan AI sebelum digunakan.",
    ],
  },
   {
    id: "manajemen-data",
    title: "Manajemen Data Sekolah",
    icon: Database,
    content: [
      "**Master Data:** Admin, Kepala Sekolah, atau Waka Kurikulum dapat mengelola:",
      "  - Mata Pelajaran: Tambah, edit, hapus mata pelajaran.",
      "  - Data Guru: Tambah, edit, hapus data guru, dan tautkan dengan akun pengguna serta mata pelajaran yang diampu.",
      "  - Data Kelas/Rombel: Tambah, edit, hapus kelas atau rombongan belajar, dan tentukan wali kelas.",
      "**Kalender Pendidikan:** Lihat dan kelola agenda sekolah, hari libur nasional/semester, dan tanggal penting lainnya. Admin, Kepsek, dan Waka Kurikulum dapat menambahkan/mengedit acara sekolah.",
      "**Jadwal Pelajaran:** Susun dan kelola jadwal pelajaran per kelas atau per guru. Terintegrasi dengan data master dan perhitungan JP otomatis (jika durasi JP diatur).",
    ],
  },
  {
    id: "pengaturan-pengguna",
    title: "Pengaturan Pengguna & Aplikasi",
    icon: Users,
    content: [
      "**Pengaturan Akun (Semua Pengguna):** Ubah profil pribadi, kata sandi (simulasi), dan preferensi tema tampilan aplikasi.",
      "**Manajemen Pengguna (Admin & TU):** Tambah, edit, dan hapus akun pengguna di sekolah Anda. Atur peran untuk setiap pengguna.",
      "**Pengaturan Sistem Sekolah (Admin):** Kelola mode perawatan (simulasi), bersihkan cache (simulasi), lihat log sistem, dan atur durasi JP default.",
      "**Profil Sekolah (Admin, Kepsek, TU):** Atur informasi detail sekolah yang akan digunakan pada kop surat dan data umum.",
    ],
  },
  {
    id: "superadmin",
    title: "Fitur Super Admin (SAAS)",
    icon: ShieldCheck,
    content: [
      "Super Admin memiliki akses tertinggi untuk mengelola seluruh platform SaaS GUMPLA AI:",
      "**Manajemen Sekolah:** Mendaftarkan sekolah baru, mengedit detail sekolah, mengaktifkan/menonaktifkan sekolah.",
      "**Pengaturan Aplikasi Global:** Mengatur nama aplikasi dan logo global yang akan tampil jika sekolah belum mengatur logo sendiri.",
      "**Manajemen Langganan:** Mengelola status langganan setiap sekolah (aktif, trial, nonaktif), periode langganan, catatan pembayaran, dan fitur yang diaktifkan untuk tiap sekolah.",
      "**Manajemen Pengguna Global:** Melihat semua pengguna terdaftar di semua sekolah (tanpa bisa mengedit langsung data pengguna sekolah).",
      "**Analitik & Laporan Global:** (Fitur Mendatang) Melihat statistik penggunaan aplikasi secara keseluruhan.",
      "**Log Aktivitas Global:** (Fitur Mendatang) Memantau aktivitas penting di seluruh sistem.",
    ],
  },
];

export default function DocumentationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans">
      <LandingHeader appName="GUMPLA AI" appLogoUrl={null} />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <section className="text-center mb-16 pt-8">
          <FileTextIcon className="h-20 w-20 text-teal-400 mx-auto mb-6 animate-subtle-bob" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-teal-300 tracking-tight mb-4">
            Dokumentasi GUMPLA AI
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light">
            Panduan lengkap untuk membantu Anda memaksimalkan penggunaan platform GUMPLA AI.
          </p>
        </section>

        <Separator className="my-12 bg-slate-700" />

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 lg:sticky lg:top-24 self-start mb-8 lg:mb-0">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-slate-200">Daftar Isi</CardTitle>
              </CardHeader>
              <CardContent>
                <nav>
                  <ul className="space-y-2">
                    {documentationSections.map(section => (
                      <li key={section.id}>
                        <a 
                          href={`#${section.id}`} 
                          className="block p-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-sky-300 transition-colors duration-200"
                        >
                          <section.icon className="inline h-4 w-4 mr-2" />{section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </CardContent>
            </Card>
          </aside>

          <article className="lg:col-span-3 prose prose-invert prose-lg max-w-none prose-headings:text-slate-100 prose-headings:tracking-tight prose-p:text-slate-300 prose-p:font-light prose-strong:text-slate-200 prose-a:text-sky-400 hover:prose-a:text-sky-300 prose-li:text-slate-300 prose-ul:list-disc prose-ul:pl-6 prose-li:font-light">
            {documentationSections.map(section => (
              <section key={section.id} id={section.id} className="mb-12 scroll-mt-24">
                <h2 className="flex items-center gap-3 !text-3xl !mb-6 !pb-2 !border-b !border-slate-700">
                  <section.icon className="h-7 w-7 text-teal-400" />
                  {section.title}
                </h2>
                {section.content.map((paragraph, index) => {
                  if (paragraph.startsWith("**") && paragraph.endsWith(":**")) {
                    const parts = paragraph.split(":**");
                    return <h3 key={index} className="!text-2xl !font-semibold !text-slate-200 !mt-6 !mb-3">{parts[0].replace(/\*\*/g, "")}: <span className="text-slate-300 font-light">{parts[1]}</span></h3>;
                  }
                  if (paragraph.startsWith("**") && paragraph.includes(":**")) {
                     const parts = paragraph.split(":**");
                     return <p key={index}><strong className="text-slate-200">{parts[0].replace(/\*\*/g, "")}:</strong>{parts[1]}</p>;
                  }
                   if (paragraph.startsWith("  - ")) {
                    return <li key={index} className="ml-4 !my-1">{paragraph.substring(4)}</li>;
                  }
                  return <p key={index}>{paragraph}</p>;
                })}
              </section>
            ))}
            <Separator className="my-12 bg-slate-700" />
            <div className="text-center">
                <p className="text-slate-300">Butuh bantuan lebih lanjut?</p>
                <Button asChild size="lg" className="mt-4 bg-sky-500 hover:bg-sky-600 text-white">
                    <Link href="https://wa.me/6282131100121?text=Halo%2C%20saya%20membutuhkan%20bantuan%20terkait%20GUMPLA%20AI." target="_blank" rel="noopener noreferrer">Hubungi Dukungan Teknis</Link>
                </Button>
            </div>
          </article>
        </div>
      </main>
      
      <LandingFooter appName="GUMPLA AI" />
    </div>
  );
}
