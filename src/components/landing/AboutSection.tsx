
"use client";

import { Info, Users, Lightbulb, Zap } from 'lucide-react';
import Image from 'next/image';

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-slate-800/60">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <Info className="h-16 w-16 text-sky-400 mx-auto mb-6 animate-subtle-bob" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-sky-300 tracking-tight animate-fade-in-up">
            Tentang GUMPLA AI
          </h2>
          <p className="text-md md:text-lg text-slate-300 max-w-3xl mx-auto font-light animate-fade-in-up [animation-delay:0.1s]">
            Platform inovatif yang dirancang untuk memberdayakan pendidik Indonesia dengan teknologi AI terdepan dalam perencanaan dan manajemen kurikulum.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up [animation-delay:0.2s]">
            <Image 
              src="https://picsum.photos/seed/about-team/600/400" 
              alt="Tim GUMPLA AI" 
              width={600} 
              height={400} 
              className="rounded-xl shadow-2xl object-cover"
              data-ai-hint="team collaboration"
            />
          </div>
          <div className="space-y-6 animate-fade-in-up [animation-delay:0.3s]">
            <div>
              <h3 className="text-2xl font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Lightbulb className="h-7 w-7 text-amber-400" /> Misi Kami
              </h3>
              <p className="text-slate-300 leading-relaxed font-light">
                Menyediakan alat bantu perencanaan kurikulum yang cerdas, efisien, dan mudah digunakan bagi para pendidik di semua jenjang pendidikan, sehingga mereka dapat lebih fokus pada pengembangan kualitas pengajaran dan interaksi bermakna dengan siswa.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Zap className="h-7 w-7 text-teal-400" /> Visi Kami
              </h3>
              <p className="text-slate-300 leading-relaxed font-light">
                Menjadi platform digital terdepan dalam mendukung transformasi pendidikan di Indonesia melalui pemanfaatan teknologi kecerdasan artifisial (AI) yang bertanggung jawab dan berdampak positif.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Users className="h-7 w-7 text-purple-400" /> Untuk Siapa GUMPLA AI?
              </h3>
              <p className="text-slate-300 leading-relaxed font-light">
                GUMPLA AI dirancang untuk Guru, Kepala Sekolah, Wakil Kepala Sekolah bidang Kurikulum, staf Tata Usaha, dan semua pihak yang terlibat dalam perencanaan dan administrasi pembelajaran di sekolah.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
