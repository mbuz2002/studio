
"use client";

import { BadgePercent, CheckCircle, XCircle, ShieldQuestion, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PricingSectionProps {
  appName: string;
}

const pricingTiers = [
  {
    name: "Paket Uji Coba",
    price: "Gratis",
    duration: "/ 7 Hari", // Updated from 30 to 7 days
    features: [
      { text: "Akses fitur dasar perencanaan", included: true },
      { text: "Pembuatan RPP/ATP, PROTA, Promes terbatas", included: true },
      { text: "Asisten AI (penggunaan terbatas)", included: true },
      { text: "Manajemen Master Data Dasar", included: true },
      { text: "Dukungan Komunitas", included: true },
    ],
    cta: "Mulai Uji Coba",
    href: "/signup",
    variant: "outline" as "outline" | "default",
    highlight: false,
    iconColor: "text-sky-400",
    borderColor: "border-sky-500/50",
    shadowColor: "hover:shadow-sky-500/30",
    buttonColor: "bg-sky-500 hover:bg-sky-600 text-white",
  },
  {
    name: "Sekolah Standar",
    price: "Hubungi Kami",
    duration: "",
    features: [
      { text: "Semua fitur Paket Uji Coba", included: true },
      { text: "Pembuatan Dokumen Kurikulum Tanpa Batas", included: true },
      { text: "Asisten AI (penggunaan standar)", included: true },
      { text: "Kalender & Jadwal Pelajaran Penuh", included: true },
      { text: "Manajemen Pengguna Sekolah", included: true },
      { text: "Dukungan Email & Chat", included: true },
    ],
    cta: "Konsultasi Sekarang",
    href: "https://wa.me/6282131100121?text=Halo%2C%20saya%20tertarik%20dengan%20Paket%20Sekolah%20Standar%20GUMPLA%20AI.",
    variant: "default" as "outline" | "default",
    highlight: true,
    iconColor: "text-teal-400",
    borderColor: "border-teal-500/70",
    shadowColor: "hover:shadow-teal-500/40",
    buttonColor: "bg-teal-500 hover:bg-teal-600 text-white",
  },
  {
    name: "Sekolah Premium",
    price: "Hubungi Kami",
    duration: "",
    features: [
      { text: "Semua fitur Paket Sekolah Standar", included: true },
      { text: "Modul Ajar AI Kurikulum Merdeka Penuh", included: true },
      { text: "Asisten AI (penggunaan prioritas)", included: true },
      { text: "Analitik & Laporan Sekolah", included: true },
      { text: "Dukungan Prioritas & Pelatihan", included: true },
      { text: "Opsi Kustomisasi Fitur", included: true },
    ],
    cta: "Dapatkan Penawaran",
    href: "https://wa.me/6282131100121?text=Halo%2C%20saya%20tertarik%20dengan%20Paket%20Sekolah%20Premium%20GUMPLA%20AI.",
    variant: "outline" as "outline" | "default",
    highlight: false,
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/50",
    shadowColor: "hover:shadow-amber-500/30",
    buttonColor: "bg-amber-500 hover:bg-amber-600 text-slate-900",
  },
];

export function PricingSection({ appName }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-slate-800/40">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <BadgePercent className="h-16 w-16 text-purple-400 mx-auto mb-6 animate-subtle-bob" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-purple-300 tracking-tight animate-fade-in-up">
            Paket & Harga {appName}
          </h2>
          <p className="text-md md:text-lg text-slate-300 max-w-2xl mx-auto font-light animate-fade-in-up [animation-delay:0.1s]">
            Pilih paket yang paling sesuai dengan kebutuhan sekolah Anda. Semua paket berbayar memerlukan konsultasi untuk penawaran harga terbaik.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {pricingTiers.map((tier, index) => (
            <Card 
              key={tier.name} 
              className={`flex flex-col bg-slate-800/70 border-2 ${tier.borderColor} ${tier.shadowColor} shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up ${tier.highlight ? 'ring-4 ring-offset-2 ring-offset-slate-900 ring-teal-500' : ''}`}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <CardHeader className="p-6 md:p-8 text-center border-b border-slate-700">
                <h3 className={`text-2xl font-semibold ${tier.iconColor} mb-2`}>{tier.name}</h3>
                <p className="text-4xl md:text-5xl font-bold text-slate-100">
                  {tier.price}
                  {tier.duration && <span className="text-lg font-normal text-slate-400">{tier.duration}</span>}
                </p>
                {tier.name === "Paket Uji Coba" && <p className="text-xs text-slate-400 mt-1">Tanpa kartu kredit, langsung pakai!</p>}
                 {tier.name !== "Paket Uji Coba" && <p className="text-xs text-slate-400 mt-1">Harga per sekolah, per bulan/tahun.</p>}
              </CardHeader>
              <CardContent className="p-6 md:p-8 flex-grow">
                <ul className="space-y-3 text-slate-300 font-light text-sm md:text-base">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      {feature.included ? <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />}
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 md:p-8 mt-auto border-t border-slate-700">
                <Button 
                  asChild 
                  size="lg" 
                  className={`w-full text-md py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${tier.buttonColor} ${tier.name === "Sekolah Standar" ? 'font-semibold' : ''}`}
                >
                  <Link href={tier.href} target={tier.href.startsWith("http") ? "_blank" : "_self"} rel={tier.href.startsWith("http") ? "noopener noreferrer" : ""}>
                    {tier.name === "Paket Uji Coba" ? <Sparkles className="mr-2 h-5 w-5"/> : <MessageCircle className="mr-2 h-5 w-5"/>}
                     {tier.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
         <div className="mt-16 text-center">
            <Card className="inline-block bg-slate-800/50 border-slate-700 shadow-lg rounded-xl p-6 md:p-8 max-w-2xl mx-auto animate-fade-in-up [animation-delay:0.5s]">
              <CardHeader className="p-0 mb-4">
                <div className="flex justify-center mb-3">
                    <ShieldQuestion className="h-10 w-10 text-amber-400" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-100">Butuh Solusi Kustom?</CardTitle>
                <CardDescription className="text-slate-300 mt-1">
                  Kami menyediakan paket enterprise yang dapat disesuaikan dengan kebutuhan spesifik lembaga pendidikan Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-slate-300 mb-6 font-light">
                  Termasuk integrasi sistem, fitur tambahan, pelatihan khusus, dan dukungan teknis tingkat lanjut. Hubungi kami untuk diskusi lebih lanjut.
                </p>
                <Button asChild size="lg" className="text-lg px-8 py-5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-lg hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 rounded-lg">
                  <Link href="https://wa.me/6282131100121?text=Halo%2C%20saya%20tertarik%20dengan%20paket%20kustom%20GUMPLA%20AI." target="_blank" rel="noopener noreferrer">
                    Hubungi Tim Enterprise <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </section>
  );
}
