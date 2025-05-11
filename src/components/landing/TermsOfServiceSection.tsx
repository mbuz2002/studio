
"use client";

import { FileBadgeIcon, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function TermsOfServiceSection() {
  return (
    <section id="terms" className="py-16 md:py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <FileBadgeIcon className="h-16 w-16 text-indigo-400 mx-auto mb-6 animate-subtle-bob" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-indigo-300 tracking-tight animate-fade-in-up">
            Syarat & Ketentuan Layanan
          </h2>
          <p className="text-md md:text-lg text-slate-300 max-w-2xl mx-auto font-light animate-fade-in-up [animation-delay:0.1s]">
            Harap baca dengan saksama syarat dan ketentuan penggunaan platform GUMPLA AI.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-slate-800/70 border border-slate-700 rounded-xl shadow-xl p-8 md:p-10 text-center animate-fade-in-up [animation-delay:0.2s]">
          <ShieldCheck className="h-12 w-12 text-indigo-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-slate-100 mb-4">
            Penting untuk Diketahui
          </h3>
          <p className="text-slate-300 leading-relaxed mb-8 font-light">
            Dengan menggunakan layanan GUMPLA AI, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku. Dokumen ini mengatur hak dan kewajiban Anda sebagai pengguna, serta tanggung jawab kami sebagai penyedia layanan. Pastikan Anda selalu merujuk pada versi terbaru dari syarat dan ketentuan ini.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-5 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105 rounded-lg font-semibold">
            <Link href="/terms-of-service">
              Baca Selengkapnya <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-xs text-slate-400 mt-6">
            Halaman Syarat & Ketentuan detail sedang dalam pengembangan.
          </p>
        </div>
      </div>
    </section>
  );
}
