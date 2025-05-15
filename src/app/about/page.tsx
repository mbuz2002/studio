
import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Info, Users, Lightbulb, Zap, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Tentang Kami - GUMPLA AI',
  description: 'Pelajari lebih lanjut tentang GUMPLA AI, platform cerdas untuk perencanaan kurikulum dan manajemen pendidikan di Indonesia.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans">
      <LandingHeader appName="GUMPLA AI" appLogoUrl={null} /> {/* Assuming no dynamic logo here for simplicity */}
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <section className="text-center mb-16 pt-8">
          <Info className="h-20 w-20 text-sky-400 mx-auto mb-6 animate-subtle-bob" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-sky-300 tracking-tight mb-4">
            Tentang GUMPLA AI
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light">
            Inovasi Teknologi untuk Kemajuan Pendidikan Indonesia.
          </p>
        </section>

        <Separator className="my-12 bg-slate-700" />

        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
                <Lightbulb className="h-8 w-8 text-amber-400" /> Misi Kami
              </h2>
              <p className="text-slate-300 leading-relaxed text-lg font-light">
                Menyediakan alat bantu perencanaan kurikulum yang cerdas, efisien, dan mudah digunakan bagi para pendidik di semua jenjang pendidikan. Kami bertujuan agar para pendidik dapat lebih fokus pada pengembangan kualitas pengajaran dan interaksi yang bermakna dengan siswa, didukung oleh teknologi AI yang inovatif.
              </p>
              <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2 mt-8">
                <Zap className="h-8 w-8 text-teal-400" /> Visi Kami
              </h2>
              <p className="text-slate-300 leading-relaxed text-lg font-light">
                Menjadi platform digital terdepan dalam mendukung transformasi pendidikan di Indonesia. Kami bercita-cita untuk memajukan ekosistem pendidikan melalui pemanfaatan teknologi kecerdasan artifisial (AI) yang bertanggung jawab, etis, dan memberikan dampak positif yang berkelanjutan.
              </p>
            </div>
            <div>
              <Image 
                src="https://placehold.co/700x500.png" 
                alt="Ilustrasi Misi dan Visi GUMPLA AI" 
                width={700} 
                height={500} 
                className="rounded-xl shadow-2xl object-cover"
                data-ai-hint="mission vision"
              />
            </div>
          </div>
        </section>

        <Separator className="my-12 bg-slate-700" />

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-slate-100 flex items-center justify-center gap-2">
            <Users className="h-8 w-8 text-purple-400" /> Untuk Siapa GUMPLA AI?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Guru", description: "Membuat RPP, ATP, Modul Ajar, dan materi ajar dengan lebih cepat dan berkualitas." },
              { title: "Kepala Sekolah", description: "Memantau perencanaan kurikulum, memastikan keselarasan, dan meningkatkan mutu sekolah." },
              { title: "Waka Kurikulum", description: "Mengelola dan menyusun program tahunan, semester, serta dokumen kurikulum lainnya secara terstruktur." },
              { title: "Tata Usaha", description: "Membantu administrasi data sekolah, pengguna, dan jadwal pelajaran dengan efisien." },
              { title: "Lembaga Pendidikan", description: "Platform komprehensif untuk digitalisasi manajemen kurikulum di semua jenjang." },
              { title: "Pendidik Inovatif", description: "Siapapun yang ingin memanfaatkan AI untuk meningkatkan proses belajar mengajar." }
            ].map(item => (
              <Card key={item.title} className="bg-slate-800/70 border-slate-700 shadow-lg hover:shadow-sky-500/20 transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-sky-300">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 font-light">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <Separator className="my-12 bg-slate-700" />

        <section>
            <h2 className="text-3xl font-bold text-center mb-10 text-slate-100">
                Nilai Inti Kami
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {[
                    {title: "Inovasi", icon: Lightbulb, desc: "Selalu mencari solusi kreatif dan memanfaatkan teknologi terbaru."},
                    {title: "Kolaborasi", icon: Users, desc: "Bekerja sama dengan pendidik untuk menciptakan platform terbaik."},
                    {title: "Kualitas", icon: CheckCircle, desc: "Berkomitmen pada standar tertinggi dalam setiap fitur dan layanan."},
                    {title: "Pemberdayaan", icon: Zap, desc: "Memberikan alat yang memberdayakan pendidik untuk mencapai potensi penuh."}
                ].map(value => (
                    <div key={value.title} className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                        <value.icon className="h-10 w-10 text-amber-400 mx-auto mb-3"/>
                        <h3 className="text-xl font-semibold text-slate-200 mb-1">{value.title}</h3>
                        <p className="text-sm text-slate-400 font-light">{value.desc}</p>
                    </div>
                ))}
            </div>
        </section>

      </main>
      
      <LandingFooter appName="GUMPLA AI" />
    </div>
  );
}

