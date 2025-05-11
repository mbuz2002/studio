
"use client";

import { FileTextIcon, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function DocumentationSection() {
  return (
    <section id="documentation" className="py-16 md:py-24 bg-slate-800/60">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <FileTextIcon className="h-16 w-16 text-teal-400 mx-auto mb-6 animate-subtle-bob" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-teal-300 tracking-tight animate-fade-in-up">
            Dokumentasi & Panduan
          </h2>
          <p className="text-md md:text-lg text-slate-300 max-w-2xl mx-auto font-light animate-fade-in-up [animation-delay:0.1s]">
            Pelajari lebih lanjut cara menggunakan GUMPLA AI secara maksimal melalui panduan lengkap kami.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-slate-700/50 border border-slate-600 rounded-xl shadow-xl p-8 md:p-10 text-center animate-fade-in-up [animation-delay:0.2s]">
          <BookOpen className="h-12 w-12 text-teal-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-slate-100 mb-4">
            Panduan Pengguna Lengkap
          </h3>
          <p className="text-slate-300 leading-relaxed mb-8 font-light">
            Dokumentasi ini akan memandu Anda melalui setiap fitur GUMPLA AI, mulai dari pendaftaran, pengaturan awal, hingga penggunaan fitur-fitur canggih berbasis AI. Temukan tips dan praktik terbaik untuk mengoptimalkan pengalaman Anda.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-5 bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover:shadow-teal-500/50 transition-all duration-300 transform hover:scale-105 rounded-lg font-semibold">
            <Link href="/documentation">
              Lihat Dokumentasi <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
           <p className="text-xs text-slate-400 mt-6">
            Halaman dokumentasi detail sedang dalam pengembangan.
          </p>
        </div>
      </div>
    </section>
  );
}
