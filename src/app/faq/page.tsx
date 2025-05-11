
import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'FAQ - GUMPLA AI',
  description: 'Temukan jawaban atas pertanyaan yang sering diajukan mengenai GUMPLA AI, platform perencanaan kurikulum cerdas.',
};

const faqItems = [
  {
    id: "faq-1",
    question: "Apa itu GUMPLA AI secara lebih detail?",
    answer: "GUMPLA AI (Guru Mengajar Penuh Cinta dengan AI) adalah sebuah platform digital komprehensif yang dirancang untuk merevolusi cara pendidik merencanakan, mengelola, dan melaksanakan kegiatan pembelajaran. Kami mengintegrasikan teknologi kecerdasan buatan (AI) untuk membantu guru dan staf sekolah dalam membuat dokumen kurikulum berkualitas (seperti RPP, ATP, PROTA, Promes, Modul Ajar), mengelola master data sekolah (mata pelajaran, guru, kelas), menyusun jadwal pelajaran, dan memantau kalender akademik. Tujuannya adalah untuk efisiensi, peningkatan kualitas, dan inovasi dalam pendidikan.",
  },
  {
    id: "faq-2",
    question: "Kurikulum apa saja yang didukung dan bagaimana GUMPLA AI mengakomodasinya?",
    answer: "GUMPLA AI dirancang untuk fleksibel dan saat ini secara penuh mendukung Kurikulum Merdeka, Kurikulum 2013 (K-13), dan Kurikulum Tingkat Satuan Pendidikan (KTSP 2006). Untuk setiap kurikulum, platform menyediakan template, alur kerja, dan fitur AI yang disesuaikan. Misalnya, untuk Kurikulum Merdeka, kami memiliki fitur khusus pembuatan Alur Tujuan Pembelajaran (ATP) dan Modul Ajar yang komprehensif. Pengguna dapat memilih kurikulum default untuk sekolahnya, dan platform akan menyesuaikan antarmuka serta opsi yang tersedia.",
  },
  {
    id: "faq-3",
    question: "Bagaimana model penetapan harga dan langganan GUMPLA AI?",
    answer: "GUMPLA AI menawarkan model Freemium. Setiap sekolah baru yang mendaftar akan mendapatkan masa uji coba gratis (trial) untuk mengakses sebagian besar fitur. Setelah masa uji coba berakhir, sekolah dapat memilih paket berlangganan yang paling sesuai dengan kebutuhan dan anggaran mereka. Kami menyediakan berbagai tingkatan paket dengan fitur yang berbeda. Untuk informasi detail mengenai harga dan paket, silakan hubungi tim penjualan kami melalui WhatsApp atau email yang tertera di halaman kontak.",
  },
  {
    id: "faq-4",
    question: "Apakah saya bisa mengimpor data yang sudah ada ke GUMPLA AI?",
    answer: "Ya, GUMPLA AI menyediakan fitur impor data untuk beberapa jenis data penting seperti daftar mata pelajaran, guru, dan siswa (fitur siswa sedang dalam pengembangan). Kami terus berupaya untuk memperluas kemampuan impor data agar transisi ke platform kami menjadi semudah mungkin. Format file yang didukung biasanya adalah CSV atau Excel. Panduan detail mengenai format impor tersedia di bagian dokumentasi.",
  },
  {
    id: "faq-5",
    question: "Seberapa amankah data sekolah dan pengguna yang disimpan di GUMPLA AI?",
    answer: "Keamanan dan privasi data adalah prioritas utama kami. GUMPLA AI dibangun dengan praktik keamanan standar industri. Untuk versi demo ini, data disimpan secara lokal di browser Anda (localStorage). Dalam versi produksi penuh, kami akan menggunakan enkripsi data, kontrol akses berbasis peran yang ketat, dan infrastruktur server yang aman untuk memastikan data Anda terlindungi dari akses tidak sah. Kami juga akan mematuhi semua regulasi privasi data yang berlaku di Indonesia.",
  },
  {
    id: "faq-6",
    question: "Bagaimana jika saya membutuhkan bantuan atau dukungan teknis?",
    answer: "Tim GUMPLA AI siap membantu Anda! Kami menyediakan beberapa saluran dukungan, termasuk dokumentasi online yang lengkap, tutorial video (akan datang), dan layanan pelanggan melalui email atau WhatsApp. Untuk pengguna paket berlangganan tertentu, kami juga menawarkan dukungan prioritas dan sesi pelatihan khusus.",
  },
  {
    id: "faq-7",
    question: "Bisakah GUMPLA AI diakses dari perangkat seluler?",
    answer: "Ya, GUMPLA AI dirancang untuk responsif dan dapat diakses melalui berbagai perangkat, termasuk desktop, tablet, dan smartphone. Tampilan akan menyesuaikan dengan ukuran layar perangkat Anda untuk memastikan pengalaman pengguna yang optimal di mana saja dan kapan saja.",
  },
  {
    id: "faq-8",
    question: "Apakah GUMPLA AI akan terus dikembangkan dengan fitur-fitur baru?",
    answer: "Tentu saja! Kami berkomitmen untuk terus mengembangkan GUMPLA AI dengan fitur-fitur baru yang inovatif berdasarkan umpan balik pengguna dan perkembangan teknologi pendidikan terkini. Kami percaya pada perbaikan berkelanjutan untuk selalu memberikan solusi terbaik bagi para pendidik di Indonesia.",
  }
];

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans">
      <LandingHeader appName="GUMPLA AI" appLogoUrl={null} />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <section className="text-center mb-16 pt-8">
          <HelpCircle className="h-20 w-20 text-sky-400 mx-auto mb-6 animate-subtle-bob" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-sky-300 tracking-tight mb-4">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light">
            Jawaban untuk pertanyaan umum tentang GUMPLA AI. Jika Anda tidak menemukan jawaban di sini, jangan ragu untuk menghubungi kami.
          </p>
        </section>

        <Separator className="my-12 bg-slate-700" />

        <section className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-md transition-all hover:border-sky-500/50">
                <AccordionTrigger className="text-left text-xl font-semibold text-slate-100 hover:text-sky-400 px-6 py-5 transition-colors duration-200">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-300 text-base leading-relaxed font-light px-6 pb-6 pt-0">
                  <p className="whitespace-pre-line">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      
      <LandingFooter appName="GUMPLA AI" />
    </div>
  );
}
