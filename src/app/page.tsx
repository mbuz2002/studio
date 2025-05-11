"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Sparkles, LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, BrainCircuit, Database, Users, Settings, BarChart3, MessageCircle, ShieldCheck, CheckCircle, ArrowRight, Zap, Star, Palette } from 'lucide-react';
import Image from 'next/image';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { useAuth } from '@/contexts/AuthContext'; // To get appName
import { useEffect, useState } from 'react';
import type { AppSettings } from '@/types';
import { SAAS_APP_SETTINGS_STORAGE_KEY } from '@/types';

const features = [
  {
    icon: <BookOpenText className="h-10 w-10 text-sky-400" />,
    title: "Perencanaan Kurikulum Komprehensif",
    description: "Buat RPP, ATP (Kurikulum Merdeka), PROTA, Promes, hingga Modul Ajar dengan mudah dan terstruktur.",
    color: "sky",
  },
  {
    icon: <Sparkles className="h-10 w-10 text-purple-400" />,
    title: "Asisten AI Cerdas",
    description: "Dapatkan bantuan AI untuk membuat draf konten, menyarankan perbaikan, dan menghasilkan materi ajar inovatif.",
    color: "purple",
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-teal-400" />,
    title: "Modul Ajar Kurikulum Merdeka",
    description: "Rancang Modul Ajar yang lengkap dan sesuai dengan panduan Kurikulum Merdeka, didukung oleh AI.",
    color: "teal",
  },
  {
    icon: <Database className="h-10 w-10 text-emerald-400" />,
    title: "Manajemen Master Data",
    description: "Kelola data penting sekolah seperti Mata Pelajaran, Guru, dan Kelas secara terpusat dan efisien.",
    color: "emerald",
  },
  {
    icon: <CalendarClock className="h-10 w-10 text-rose-400" />,
    title: "Jadwal Pelajaran Interaktif",
    description: "Susun dan visualisasikan jadwal pelajaran dengan mudah, terintegrasi dengan data guru dan mapel.",
    color: "rose",
  },
  {
    icon: <CalendarDays className="h-10 w-10 text-amber-400" />,
    title: "Kalender Pendidikan Dinamis",
    description: "Atur dan pantau semua kegiatan akademik dan hari libur sekolah dalam satu kalender terpadu.",
    color: "amber",
  },
  {
    icon: <Users className="h-10 w-10 text-indigo-400" />,
    title: "Manajemen Pengguna & Peran",
    description: "Atur hak akses untuk setiap peran pengguna (Admin, Kepsek, Guru, dll.) demi keamanan dan efisiensi.",
    color: "indigo",
  },
  {
    icon: <Palette className="h-10 w-10 text-pink-400" />,
    title: "Preferensi Tampilan Kustom",
    description: "Pilih dari berbagai tema tampilan (termasuk tema gelap dan terang) untuk kenyamanan visual Anda.",
    color: "pink",
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-red-400" />,
    title: "Super Admin & SAAS Ready",
    description: "Kelola banyak sekolah, langganan, dan pengaturan global aplikasi dengan fitur Super Admin.",
    color: "red",
  },
];

const testimonials = [
  {
    quote: "GUMPLA AI mengubah cara kami merencanakan kurikulum. Fitur AI-nya sangat membantu menghemat waktu!",
    name: "Ibu Aisyah",
    role: "Waka Kurikulum, SMA Teladan",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    quote: "Membuat Modul Ajar Kurikulum Merdeka jadi lebih mudah dan terstruktur. Siswa juga lebih antusias!",
    name: "Bapak Budi",
    role: "Guru Kelas V, SD Ceria",
    avatar: "https://i.pravatar.cc/150?img=2"
  },
  {
    quote: "Sebagai Kepala Sekolah, saya bisa memantau semua perencanaan dengan mudah. Sangat direkomendasikan!",
    name: "Dr. H. Chandra",
    role: "Kepala Sekolah, SMP Maju Jaya",
    avatar: "https://i.pravatar.cc/150?img=3"
  }
];

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);
  const [appName, setAppName] = useState("GUMPLA AI");
  const [appLogoUrl, setAppLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const storedSettings = localStorage.getItem(SAAS_APP_SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      try {
        const parsedSettings: AppSettings = JSON.parse(storedSettings);
        if (parsedSettings.appName) setAppName(parsedSettings.appName);
        if (parsedSettings.appLogoUrl) setAppLogoUrl(parsedSettings.appLogoUrl);
      } catch (e) {
        // console.error("Failed to parse app settings for landing page", e);
      }
    }
  }, []);


  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans">
      <LandingHeader appName={isClient ? appName : "GUMPLA AI"} appLogoUrl={isClient ? appLogoUrl : null} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {/* Subtle background pattern or graphic */}
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="gamingGrid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(51, 65, 85, 0.5)" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#gamingGrid)" /></svg>
          </div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="mb-8 flex justify-center">
              {isClient && appLogoUrl ? (
                 <Image src={appLogoUrl} alt={`${appName} Logo`} width={100} height={100} className="h-20 w-20 md:h-24 md:w-24 object-contain rounded-full shadow-2xl bg-slate-700 p-2" data-ai-hint="app logo" />
              ) : (
                 <GraduationCap className="h-20 w-20 md:h-24 md:w-24 text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="animated-gradient-text bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400">
                {isClient ? appName : "GUMPLA AI"}
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Revolusikan Perencanaan Pembelajaran & Manajemen Kurikulum Anda dengan Kekuatan AI. Lebih Cepat, Efisien, dan Inovatif!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white shadow-lg hover:shadow-sky-500/50 transition-all duration-300 transform hover:scale-105 rounded-lg">
                <Link href="/signup">Daftar Sekarang Gratis!</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 border-slate-600 hover:bg-slate-700 hover:border-slate-500 text-slate-200 shadow-md hover:shadow-slate-500/30 transition-all duration-300 transform hover:scale-105 rounded-lg">
                <Link href="#features">Lihat Fitur Unggulan</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 md:py-24 bg-slate-800">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-sky-300">
                Apa itu {isClient ? appName : "GUMPLA AI"}?
              </h2>
              <p className="text-md md:text-lg text-slate-300 leading-relaxed mb-8">
                {isClient ? appName : "GUMPLA AI"} adalah platform digital terpadu yang dirancang khusus untuk para pendidik di Indonesia. Kami memberdayakan Anda dengan alat bantu cerdas (AI) untuk menyederhanakan proses perencanaan pembelajaran, pembuatan dokumen kurikulum (RPP, ATP, PROTA, Promes, Modul Ajar), manajemen data sekolah, hingga penjadwalan. Tingkatkan kualitas dan efisiensi kerja Anda, serta fokus pada hal terpenting: menginspirasi siswa.
              </p>
               <Zap className="h-12 w-12 text-amber-400 mx-auto mb-4 animate-pulse" />
               <p className="text-md md:text-lg text-slate-300 leading-relaxed">
                  Cocok untuk semua jenjang pendidikan dan berbagai jenis kurikulum (Kurikulum Merdeka, K-13, KTSP 2006).
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-slate-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-sky-300">Fitur Unggulan {isClient ? appName : "GUMPLA AI"}</h2>
              <p className="text-md md:text-lg text-slate-400 max-w-2xl mx-auto">
                Semua yang Anda butuhkan untuk perencanaan pembelajaran modern dan manajemen kurikulum yang efektif.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section - Placeholder */}
        <section className="py-16 md:py-24 bg-slate-800">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-sky-300">Apa Kata Mereka?</h2>
              <p className="text-md md:text-lg text-slate-400 max-w-2xl mx-auto">
                Pengalaman para pendidik yang telah merasakan manfaat {isClient ? appName : "GUMPLA AI"}.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-slate-700/50 border-slate-600 shadow-xl rounded-lg p-6 flex flex-col items-center text-center hover:shadow-sky-500/20 transition-shadow">
                  <Image src={testimonial.avatar} alt={testimonial.name} width={80} height={80} className="rounded-full mb-4 border-2 border-sky-400" data-ai-hint="user avatar" />
                  <blockquote className="text-slate-300 italic mb-4 text-sm leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                  <p className="font-semibold text-sky-400 text-md">{testimonial.name}</p>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-32 bg-gradient-to-br from-slate-900 via-cyan-900/30 to-slate-800">
          <div className="container mx-auto px-6 text-center">
             <Star className="h-16 w-16 text-amber-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.7)] animate-pulse" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-slate-100">Siap Meningkatkan Efisiensi Anda?</h2>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Bergabunglah dengan ribuan pendidik lainnya dan rasakan kemudahan perencanaan kurikulum dengan {isClient ? appName : "GUMPLA AI"}. Mulai uji coba gratis Anda sekarang!
            </p>
            <Button asChild size="lg" className="text-lg px-10 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold shadow-lg hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 rounded-lg">
              <Link href="/signup">Coba Gratis Sekarang <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <p className="mt-6 text-sm text-slate-400">
              Ada pertanyaan? <Link href="https://wa.me/6282131100121?text=Halo%2C%20saya%20tertarik%20dengan%20GUMPLA%20AI." target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Hubungi kami via WhatsApp</Link>.
            </p>
          </div>
        </section>
      </main>

      <LandingFooter appName={isClient ? appName : "GUMPLA AI"} />
    </div>
  );
}
