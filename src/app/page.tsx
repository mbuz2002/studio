
"use client";

import * as React from "react"; 
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Sparkles, LayoutDashboard, BookOpenText, CalendarDays, CalendarClock, BrainCircuit, Database, Users, Settings, BarChart3, MessageCircle, ShieldCheck, CheckCircle, ArrowRight, Zap, Star, Palette, Target, TrendingUp, Lightbulb, Info, HelpCircle, FileTextIcon, FileBadgeIcon } from 'lucide-react';
import Image from 'next/image';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { useEffect, useState } from 'react';
import type { AppSettings } from '@/types';
import { SAAS_APP_SETTINGS_STORAGE_KEY } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AboutSection } from '@/components/landing/AboutSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { DocumentationSection } from '@/components/landing/DocumentationSection';
import { TermsOfServiceSection } from '@/components/landing/TermsOfServiceSection';


const features = [
  {
    icon: <BookOpenText className="h-10 w-10 text-sky-400" />,
    title: "Perencanaan Kurikulum Komprehensif",
    description: "Buat RPP, ATP (Kurikulum Merdeka), PROTA, Promes, hingga Modul Ajar dengan mudah dan terstruktur, sesuai standar terbaru.",
    color: "sky",
  },
  {
    icon: <Sparkles className="h-10 w-10 text-purple-400" />,
    title: "Asisten AI Cerdas",
    description: "Dapatkan bantuan AI untuk membuat draf konten, menyarankan perbaikan, dan menghasilkan materi ajar inovatif dan relevan.",
    color: "purple",
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-teal-400" />,
    title: "Modul Ajar Kurikulum Merdeka",
    description: "Rancang Modul Ajar yang lengkap dan sesuai dengan panduan Kurikulum Merdeka, didukung oleh AI untuk efisiensi maksimal.",
    color: "teal",
  },
  {
    icon: <Database className="h-10 w-10 text-emerald-400" />,
    title: "Manajemen Master Data Terpusat",
    description: "Kelola data penting sekolah seperti Mata Pelajaran, Guru, dan Kelas secara terpusat, rapi, dan mudah diakses.",
    color: "emerald",
  },
  {
    icon: <CalendarClock className="h-10 w-10 text-rose-400" />,
    title: "Jadwal Pelajaran Interaktif & Efisien",
    description: "Susun dan visualisasikan jadwal pelajaran dengan mudah, terintegrasi dengan data guru, mapel, dan perhitungan JP otomatis.",
    color: "rose",
  },
  {
    icon: <CalendarDays className="h-10 w-10 text-amber-400" />,
    title: "Kalender Pendidikan Dinamis & Informatif",
    description: "Atur dan pantau semua kegiatan akademik, hari libur nasional, dan agenda sekolah dalam satu kalender terpadu.",
    color: "amber",
  },
  {
    icon: <Users className="h-10 w-10 text-indigo-400" />,
    title: "Manajemen Pengguna & Peran Fleksibel",
    description: "Atur hak akses untuk setiap peran pengguna (Admin, Kepsek, Guru, dll.) demi keamanan data dan efisiensi operasional.",
    color: "indigo",
  },
  {
    icon: <Palette className="h-10 w-10 text-pink-400" />,
    title: "Preferensi Tampilan Kustom & Nyaman",
    description: "Pilih dari berbagai tema tampilan (termasuk tema gelap dan terang profesional) untuk kenyamanan visual Anda.",
    color: "pink",
  },
];

const testimonials = [
  {
    quote: "GUMPLA AI mengubah cara kami merencanakan kurikulum. Fitur AI-nya sangat membantu menghemat waktu dan meningkatkan kualitas RPP kami!",
    name: "Ibu Aisyah Rahman, S.Pd.",
    role: "Waka Kurikulum, SMA Teladan Bangsa",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    quote: "Membuat Modul Ajar Kurikulum Merdeka jadi lebih mudah dan terstruktur. Siswa juga lebih antusias dengan materi yang relevan!",
    name: "Bapak Budi Santoso, S.Ag.",
    role: "Guru Kelas V, SD Ceria Pelita",
    avatar: "https://i.pravatar.cc/150?img=2"
  },
  {
    quote: "Sebagai Kepala Sekolah, saya bisa memantau semua perencanaan dengan mudah dan memastikan keselarasan kurikulum. Sangat direkomendasikan!",
    name: "Dr. H. Chandra Wijaya, M.M.",
    role: "Kepala Sekolah, SMP Maju Jaya Bersama",
    avatar: "https://i.pravatar.cc/150?img=3"
  }
];

const benefits = [
  {
    icon: <Zap className="h-8 w-8 text-sky-400" />, 
    title: "Efisiensi Waktu Maksimal",
    description: "Otomatisasi tugas rutin perencanaan dan pembuatan dokumen kurikulum, bebaskan waktu Anda untuk fokus pada pengajaran."
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-emerald-400" />, 
    title: "Peningkatan Kualitas Pembelajaran",
    description: "Buat materi ajar yang lebih relevan, inovatif, dan sesuai dengan kebutuhan siswa berkat bantuan AI dan analisis data."
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-amber-400" />, 
    title: "Inovasi Berbasis AI",
    description: "Manfaatkan teknologi AI terkini untuk mendapatkan ide-ide segar, saran perbaikan, dan otomatisasi cerdas dalam setiap aspek kurikulum."
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-teal-400" />, 
    title: "Kepatuhan Kurikulum Terjamin",
    description: "Pastikan semua dokumen Anda (RPP, ATP, Modul Ajar) selalu sesuai dengan standar kurikulum terbaru (Merdeka, K-13, KTSP)."
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
        <section className="relative py-24 md:py-40 bg-gradient-to-br from-slate-900 via-gray-900/80 to-slate-800 overflow-hidden">
          <div className="absolute inset-0 opacity-5 animate-pulse-slow">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="heroGrid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(100, 116, 139, 0.4)" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#heroGrid)" /></svg>
          </div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="mb-6 md:mb-8 flex justify-center animate-fade-in-up [animation-delay:0.1s]">
              {isClient && appLogoUrl ? (
                 <Image src={appLogoUrl} alt={`${appName} Logo`} width={120} height={120} className="h-24 w-24 md:h-28 md:w-28 object-contain rounded-full shadow-2xl bg-slate-700/50 p-2 border-2 border-sky-500/50 animate-subtle-bob" data-ai-hint="app logo" />
              ) : (
                 <GraduationCap className="h-24 w-24 md:h-28 md:w-28 text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.7)] animate-subtle-bob" />
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6 animate-fade-in-up [animation-delay:0.2s]">
              <span className="animated-gradient-text">
                {isClient ? appName : "GUMPLA AI"}
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-up [animation-delay:0.3s]">
              Solusi Cerdas untuk Transformasi Digital Perencanaan Kurikulum. Lebih Efisien, Inovatif, dan Sesuai Standar Pendidikan Terkini.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up [animation-delay:0.4s]">
              <Button asChild size="lg" className="text-lg px-10 py-6 bg-sky-500 hover:bg-sky-600 text-white shadow-xl hover:shadow-sky-500/60 transition-all duration-300 transform hover:scale-105 rounded-lg font-semibold">
                <Link href="/signup">Daftar Gratis Sekarang!</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 text-slate-200 shadow-lg hover:shadow-slate-500/40 transition-all duration-300 transform hover:scale-105 rounded-lg font-semibold">
                <Link href="#features">Jelajahi Fitur Unggulan</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Introduction Section (Simplified) */}
        <section className="py-16 md:py-24 bg-slate-800/50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <Target className="h-16 w-16 text-sky-400 mx-auto mb-6 animate-subtle-bob [animation-delay:0.5s]" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-sky-300 tracking-tight animate-fade-in-up [animation-delay:0.6s]">
                Selamat Datang di Masa Depan Perencanaan Pendidikan
              </h2>
              <p className="text-md md:text-lg text-slate-300 leading-relaxed mb-8 font-light animate-fade-in-up [animation-delay:0.7s]">
                {isClient ? appName : "GUMPLA AI"} adalah platform digital terpadu yang dirancang khusus untuk para pendidik di Indonesia. Kami memberdayakan Anda dengan alat bantu cerdas (AI) untuk menyederhanakan proses perencanaan pembelajaran, pembuatan dokumen kurikulum (RPP, ATP, PROTA, Promes, Modul Ajar), manajemen data sekolah, hingga penjadwalan. Tingkatkan kualitas dan efisiensi kerja Anda, serta fokus pada hal terpenting: menginspirasi siswa.
              </p>
               <div className="flex justify-center items-center gap-4 text-slate-400 text-sm animate-fade-in-up [animation-delay:0.8s]">
                  <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-teal-400"/> Kurikulum Merdeka</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-teal-400"/> K-13 & KTSP</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-teal-400"/> Semua Jenjang</span>
               </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-slate-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-sky-300 tracking-tight animate-fade-in-up">Mengapa Memilih {isClient ? appName : "GUMPLA AI"}?</h2>
              <p className="text-md md:text-lg text-slate-400 max-w-2xl mx-auto font-light animate-fade-in-up [animation-delay:0.1s]">
                Platform kami dirancang untuk memberikan dampak nyata pada produktivitas dan kualitas pengajaran Anda.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-slate-800/60 border-slate-700 shadow-lg rounded-xl p-6 text-center hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <div className="flex justify-center mb-5">
                    <div className="p-3 rounded-full bg-slate-700 shadow-inner">
                      {React.cloneElement(benefit.icon, { className: `${benefit.icon.props.className} animate-subtle-bob` })}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-100 mb-2">{benefit.title}</CardTitle>
                  <CardContent className="p-0">
                    <p className="text-sm text-slate-400 leading-relaxed font-light">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-slate-800/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-sky-300 tracking-tight animate-fade-in-up">Fitur Unggulan {isClient ? appName : "GUMPLA AI"}</h2>
              <p className="text-md md:text-lg text-slate-400 max-w-2xl mx-auto font-light animate-fade-in-up [animation-delay:0.1s]">
                Semua yang Anda butuhkan untuk perencanaan pembelajaran modern dan manajemen kurikulum yang efektif, didukung teknologi AI.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* About Section Preview */}
        <AboutSection />

        {/* FAQ Section Preview */}
        <FAQSection />

        {/* Documentation Section Preview */}
        <DocumentationSection />
        
        {/* Terms of Service Section Preview */}
        <TermsOfServiceSection />

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-slate-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-sky-300 tracking-tight animate-fade-in-up">Apa Kata Para Pendidik?</h2>
              <p className="text-md md:text-lg text-slate-400 max-w-2xl mx-auto font-light animate-fade-in-up [animation-delay:0.1s]">
                Pengalaman nyata dari para pengguna {isClient ? appName : "GUMPLA AI"} yang telah merasakan manfaatnya.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-slate-800/70 border-slate-700 shadow-xl rounded-xl p-6 md:p-8 flex flex-col items-center text-center hover:shadow-sky-500/30 transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <Image src={testimonial.avatar} alt={testimonial.name} width={80} height={80} className="rounded-full mb-5 border-4 border-slate-600 shadow-lg" data-ai-hint="user avatar" />
                  <blockquote className="text-slate-300 italic mb-5 text-md leading-relaxed font-light">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                  <Separator className="w-1/4 mx-auto my-4 bg-slate-600" />
                  <p className="font-semibold text-sky-400 text-lg">{testimonial.name}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{testimonial.role}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-slate-900 via-cyan-900/40 to-slate-800">
          <div className="container mx-auto px-6 text-center">
             <Star className="h-16 w-16 text-amber-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-subtle-bob [animation-duration:1.5s]" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-slate-100 tracking-tight animate-fade-in-up">Siap Merevolusi Cara Anda Mengajar?</h2>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light animate-fade-in-up [animation-delay:0.1s]">
              Bergabunglah dengan ribuan pendidik inovatif lainnya dan rasakan kemudahan serta kekuatan perencanaan kurikulum berbasis AI dengan {isClient ? appName : "GUMPLA AI"}. <br/>Daftar sekarang dan dapatkan masa uji coba gratis!
            </p>
            <Button asChild size="lg" className="text-xl px-12 py-8 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-xl hover:shadow-amber-500/60 transition-all duration-300 transform hover:scale-105 rounded-xl animate-fade-in-up [animation-delay:0.2s]">
              <Link href="/signup">Mulai Uji Coba Gratis <ArrowRight className="ml-2.5 h-6 w-6" /></Link>
            </Button>
            <p className="mt-8 text-sm text-slate-400 animate-fade-in-up [animation-delay:0.3s]">
              Punya pertanyaan lebih lanjut? <Link href="https://wa.me/6282131100121?text=Halo%2C%20saya%20tertarik%20dengan%20GUMPLA%20AI%20dan%20ingin%20bertanya." target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline font-medium">Hubungi Tim Kami via WhatsApp</Link>.
            </p>
          </div>
        </section>
      </main>

      <LandingFooter appName={isClient ? appName : "GUMPLA AI"} />
    </div>
  );
}
