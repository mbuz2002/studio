
"use client";

import Link from 'next/link';
import { GraduationCap, Github, Linkedin, Twitter, MessageCircle, Phone, Mail, Info, HelpCircle, FileTextIcon, FileBadgeIcon } from 'lucide-react'; // Added new icons

interface LandingFooterProps {
  appName: string;
}

export function LandingFooter({ appName }: LandingFooterProps) {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 border-t border-slate-700/50 text-slate-400">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* App Info */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <GraduationCap className="h-9 w-9 text-sky-400" />
              <span className="text-xl font-bold text-slate-100">{appName}</span>
            </div>
            <p className="text-sm leading-relaxed font-light">
              Platform cerdas untuk perencanaan pembelajaran dan manajemen kurikulum yang efektif dan inovatif, membantu pendidik Indonesia.
            </p>
             <p className="text-xs mt-4">
              Dibuat oleh: <strong className="text-slate-200 font-medium">RIFQY IZA FAHRIZAL</strong>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-lg font-semibold text-slate-200 mb-4 tracking-wide">Tautan Cepat</h5>
            <ul className="space-y-2 text-sm font-light">
              <li><Link href="/#features" className="hover:text-sky-400 transition-colors duration-200">Fitur Unggulan</Link></li>
              <li><Link href="/about" className="hover:text-sky-400 transition-colors duration-200 flex items-center gap-1.5"><Info size={16}/> Tentang Kami</Link></li>
              <li><Link href="/documentation" className="hover:text-sky-400 transition-colors duration-200 flex items-center gap-1.5"><FileTextIcon size={16}/> Dokumentasi</Link></li>
              <li><Link href="/signup" className="hover:text-sky-400 transition-colors duration-200">Pendaftaran</Link></li>
              <li><Link href="/login" className="hover:text-sky-400 transition-colors duration-200">Masuk Akun</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h5 className="text-lg font-semibold text-slate-200 mb-4 tracking-wide">Hubungi Kami</h5>
            <ul className="space-y-2 text-sm font-light">
                <li className="flex items-center gap-2">
                    <Mail size={16} className="text-slate-500"/>
                    <a href="mailto:rifqyiza@gmail.com" className="hover:text-sky-400 transition-colors duration-200">rifqyiza@gmail.com</a>
                </li>
                <li className="flex items-center gap-2">
                    <Phone size={16} className="text-slate-500"/>
                    <a href="https://wa.me/6282131100121" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors duration-200">+62 821-3110-0121</a>
                </li>
            </ul>
          </div>

            {/* Legal/More Links */}
          <div className="lg:text-right">
            <h5 className="text-lg font-semibold text-slate-200 mb-4 tracking-wide">Informasi</h5>
            <ul className="space-y-2 text-sm font-light">
              <li><Link href="/faq" className="hover:text-sky-400 transition-colors duration-200 flex items-center gap-1.5 lg:justify-end"><HelpCircle size={16}/> FAQ</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-sky-400 transition-colors duration-200 flex items-center gap-1.5 lg:justify-end"><FileBadgeIcon size={16}/> Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition-colors duration-200">Kebijakan Privasi</Link></li>
            </ul>
          </div>

        </div>
        <div className="border-t border-slate-700/50 pt-8 text-center text-sm">
          <p>&copy; {currentYear} {appName}. Semua Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </div>
    </footer>
  );
}
