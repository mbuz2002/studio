
import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FileBadgeIcon, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan - GUMPLA AI',
  description: 'Syarat dan ketentuan penggunaan platform GUMPLA AI. Harap baca dengan saksama.',
};

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans">
      <LandingHeader appName="GUMPLA AI" appLogoUrl={null} />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <section className="text-center mb-16 pt-8">
          <FileBadgeIcon className="h-20 w-20 text-indigo-400 mx-auto mb-6 animate-subtle-bob" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-300 tracking-tight mb-4">
            Syarat & Ketentuan Layanan GUMPLA AI
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light">
            Persetujuan ini mengatur penggunaan Anda atas platform GUMPLA AI.
          </p>
          <p className="text-sm text-slate-400 mt-2">Terakhir diperbarui: 1 Agustus 2024</p>
        </section>

        <Separator className="my-12 bg-slate-700" />

        <section className="max-w-4xl mx-auto prose prose-invert prose-lg prose-headings:text-slate-100 prose-p:text-slate-300 prose-p:font-light prose-strong:text-slate-200 prose-a:text-sky-400 hover:prose-a:text-sky-300 prose-li:text-slate-300 prose-li:font-light">
          <h2>1. Penerimaan Persyaratan</h2>
          <p>Dengan mengakses atau menggunakan platform GUMPLA AI ("Layanan"), Anda setuju untuk terikat oleh Syarat & Ketentuan Layanan ini ("Persyaratan"). Jika Anda tidak menyetujui semua persyaratan ini, maka Anda tidak boleh mengakses atau menggunakan Layanan.</p>

          <h2>2. Deskripsi Layanan</h2>
          <p>GUMPLA AI adalah platform digital yang menyediakan alat bantu berbasis kecerdasan buatan (AI) untuk perencanaan kurikulum, pembuatan dokumen pembelajaran (RPP, ATP, PROTA, Promes, Modul Ajar), manajemen data sekolah, dan fitur terkait lainnya untuk institusi pendidikan.</p>

          <h2>3. Akun Pengguna</h2>
          <p>Untuk menggunakan sebagian besar fitur Layanan, Anda harus mendaftar dan membuat akun. Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun Anda, termasuk kata sandi Anda. Anda setuju untuk segera memberitahu kami tentang penggunaan akun Anda yang tidak sah.</p>
          <p>Untuk versi demo ini, data akun disimpan secara lokal di browser Anda dan tidak ada validasi kata sandi yang ketat. Dalam versi produksi, mekanisme keamanan standar industri akan diterapkan.</p>

          <h2>4. Penggunaan Layanan</h2>
          <p>Anda setuju untuk menggunakan Layanan hanya untuk tujuan yang sah dan sesuai dengan Persyaratan ini. Anda tidak boleh menggunakan Layanan:</p>
          <ul>
            <li>Dengan cara apa pun yang melanggar hukum atau peraturan yang berlaku.</li>
            <li>Untuk tujuan mengeksploitasi, merugikan, atau mencoba mengeksploitasi atau merugikan anak di bawah umur dengan cara apa pun.</li>
            <li>Untuk mengirim, secara sadar menerima, mengunggah, mengunduh, menggunakan, atau menggunakan kembali materi apa pun yang tidak sesuai dengan Persyaratan ini.</li>
            <li>Untuk terlibat dalam perilaku lain apa pun yang membatasi atau menghambat penggunaan atau kenikmatan Layanan oleh siapa pun, atau yang, sebagaimana ditentukan oleh kami, dapat merugikan GUMPLA AI atau pengguna Layanan, atau membuat mereka bertanggung jawab.</li>
          </ul>
          
          <h2>5. Konten yang Dihasilkan AI</h2>
          <p>Layanan menggunakan teknologi AI untuk menghasilkan draf konten (misalnya, RPP, materi ajar). Konten yang dihasilkan AI adalah sebagai alat bantu dan draf awal. Anda bertanggung jawab penuh untuk meninjau, memverifikasi keakuratan, kelengkapan, relevansi, dan menyesuaikan semua konten yang dihasilkan AI sebelum digunakan dalam proses pembelajaran atau pengambilan keputusan apa pun. GUMPLA AI tidak bertanggung jawab atas keakuratan atau kesesuaian konten yang dihasilkan AI.</p>

          <h2>6. Kekayaan Intelektual</h2>
          <p>Layanan dan konten aslinya (tidak termasuk konten yang disediakan oleh pengguna atau dihasilkan AI sebagai draf untuk pengguna), fitur, dan fungsionalitas adalah dan akan tetap menjadi milik eksklusif GUMPLA AI dan pemberi lisensinya. Layanan dilindungi oleh hak cipta, merek dagang, dan hukum lainnya baik di Indonesia maupun di luar negeri.</p>
          
          <h2>7. Langganan dan Pembayaran (Untuk Versi Produksi)</h2>
          <p>Beberapa bagian dari Layanan mungkin tersedia berdasarkan langganan. Jika Anda memilih untuk berlangganan, Anda akan dikenakan biaya sesuai dengan paket yang Anda pilih. Rincian mengenai paket, harga, dan siklus penagihan akan disediakan secara terpisah. Untuk versi demo ini, fitur langganan disimulasikan dan tidak melibatkan pembayaran nyata.</p>

          <h2>8. Pengakhiran</h2>
          <p>Kami dapat menghentikan atau menangguhkan akses Anda ke Layanan kami segera, tanpa pemberitahuan atau tanggung jawab sebelumnya, untuk alasan apa pun, termasuk namun tidak terbatas pada jika Anda melanggar Persyaratan.</p>
          <p>Semua ketentuan Persyaratan yang menurut sifatnya harus tetap berlaku setelah pengakhiran akan tetap berlaku setelah pengakhiran, termasuk, tanpa batasan, ketentuan kepemilikan, penafian jaminan, ganti rugi, dan batasan tanggung jawab.</p>

          <h2>9. Penafian Jaminan</h2>
          <p>Layanan ini disediakan "SEBAGAIMANA ADANYA" dan "SEBAGAIMANA TERSEDIA" tanpa jaminan apa pun, baik tersurat maupun tersirat, termasuk, namun tidak terbatas pada, jaminan tersirat atas kelayakan untuk diperdagangkan, kesesuaian untuk tujuan tertentu, non-pelanggaran, atau pelaksanaan.</p>

          <h2>10. Batasan Tanggung Jawab</h2>
          <p>Dalam keadaan apa pun GUMPLA AI, maupun direktur, karyawan, mitra, agen, pemasok, atau afiliasinya, tidak akan bertanggung jawab atas kerugian tidak langsung, insidental, khusus, konsekuensial, atau hukuman, termasuk namun tidak terbatas pada, hilangnya keuntungan, data, penggunaan, niat baik, atau kerugian tidak berwujud lainnya, yang diakibatkan oleh (i) akses Anda ke atau penggunaan atau ketidakmampuan untuk mengakses atau menggunakan Layanan; (ii) setiap perilaku atau konten pihak ketiga mana pun di Layanan; (iii) setiap konten yang diperoleh dari Layanan; dan (iv) akses, penggunaan, atau perubahan yang tidak sah atas transmisi atau konten Anda, baik berdasarkan jaminan, kontrak, perbuatan melawan hukum (termasuk kelalaian) atau teori hukum lainnya, baik kami telah diberitahu tentang kemungkinan kerusakan tersebut atau tidak, dan bahkan jika upaya perbaikan yang ditetapkan di sini ditemukan telah gagal dari tujuan esensialnya.</p>

          <h2>11. Perubahan Persyaratan</h2>
          <p>Kami berhak, atas kebijakan kami sendiri, untuk mengubah atau mengganti Persyaratan ini kapan saja. Jika revisi bersifat material, kami akan berusaha memberikan pemberitahuan setidaknya 30 hari sebelum persyaratan baru berlaku. Apa yang merupakan perubahan material akan ditentukan atas kebijakan kami sendiri.</p>
          <p>Dengan terus mengakses atau menggunakan Layanan kami setelah revisi tersebut berlaku, Anda setuju untuk terikat oleh persyaratan yang direvisi. Jika Anda tidak menyetujui persyaratan baru, Anda tidak lagi diizinkan untuk menggunakan Layanan.</p>

          <h2>12. Hukum yang Mengatur</h2>
          <p>Persyaratan ini akan diatur dan ditafsirkan sesuai dengan hukum Negara Republik Indonesia, tanpa memperhatikan pertentangan ketentuan hukumnya.</p>

          <h2>13. Kontak Kami</h2>
          <p>Jika Anda memiliki pertanyaan tentang Persyaratan ini, silakan hubungi kami melalui email di [alamat email kontak Anda] atau melalui WhatsApp di [nomor WhatsApp kontak Anda].</p>

          <Separator className="my-8 bg-slate-700" />
          <div className="text-center">
            <ShieldCheck className="h-10 w-10 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Terima kasih telah menggunakan GUMPLA AI!</p>
          </div>
        </section>
      </main>
      
      <LandingFooter appName="GUMPLA AI" />
    </div>
  );
}
