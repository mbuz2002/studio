
"use client";

import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Apa itu GUMPLA AI?",
    answer: "GUMPLA AI adalah platform digital berbasis kecerdasan artifisial (AI) yang dirancang untuk membantu para pendidik di Indonesia dalam merencanakan kurikulum, membuat RPP, PROTA, Promes, Modul Ajar, dan mengelola data sekolah secara lebih efisien dan efektif.",
  },
  {
    question: "Kurikulum apa saja yang didukung oleh GUMPLA AI?",
    answer: "Saat ini, GUMPLA AI mendukung Kurikulum Merdeka, Kurikulum 2013 (K-13), dan Kurikulum Tingkat Satuan Pendidikan (KTSP 2006). Platform kami dirancang fleksibel untuk mengakomodasi berbagai kebutuhan kurikulum.",
  },
  {
    question: "Apakah GUMPLA AI gratis digunakan?",
    answer: "GUMPLA AI menawarkan masa uji coba gratis bagi pengguna baru untuk merasakan semua fitur unggulan. Setelah masa uji coba berakhir, tersedia berbagai pilihan paket berlangganan yang dapat disesuaikan dengan kebutuhan sekolah Anda. Hubungi tim kami untuk informasi lebih lanjut.",
  },
  {
    question: "Bagaimana GUMPLA AI membantu dalam pembuatan Modul Ajar Kurikulum Merdeka?",
    answer: "GUMPLA AI menyediakan asisten AI cerdas yang dapat membantu Anda membuat draf Modul Ajar yang lengkap sesuai dengan struktur dan komponen Kurikulum Merdeka, mulai dari informasi umum, komponen inti, hingga lampiran. Ini sangat menghemat waktu dan memastikan kelengkapan modul.",
  },
  {
    question: "Apakah data sekolah saya aman di GUMPLA AI?",
    answer: "Keamanan data adalah prioritas utama kami. GUMPLA AI menerapkan standar keamanan terbaik untuk melindungi semua data sekolah dan pengguna. (Untuk aplikasi demo ini, data disimpan di localStorage browser Anda).",
  },
  {
    question: "Bagaimana cara memulai menggunakan GUMPLA AI?",
    answer: "Anda dapat memulai dengan mendaftar akun sekolah baru melalui tombol 'Daftar Gratis Sekarang' di halaman utama. Setelah itu, Anda dapat langsung menjelajahi fitur-fitur yang tersedia.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <HelpCircle className="h-16 w-16 text-sky-400 mx-auto mb-6 animate-subtle-bob" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-sky-300 tracking-tight animate-fade-in-up">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-md md:text-lg text-slate-300 max-w-2xl mx-auto font-light animate-fade-in-up [animation-delay:0.1s]">
            Temukan jawaban atas pertanyaan umum mengenai GUMPLA AI.
          </p>
        </div>

        <div className="max-w-3xl mx-auto animate-fade-in-up [animation-delay:0.2s]">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-slate-700">
                <AccordionTrigger className="text-left text-lg font-semibold text-slate-100 hover:text-sky-400 py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-300 text-base leading-relaxed font-light pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
