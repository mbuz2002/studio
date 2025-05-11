"use client";

import Link from 'next/link';
import { GraduationCap, Github, Linkedin, Twitter, MessageCircle } from 'lucide-react';

interface LandingFooterProps {
  appName: string;
}

export function LandingFooter({ appName }: LandingFooterProps) {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-800 border-t border-slate-700 text-slate-400">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-8 w-8 text-sky-400" />
              <span className="text-xl font-bold text-slate-100">{appName}</span>
            </div>
            <p className="text-sm leading-relaxed">
              Platform cerdas untuk perencanaan pembelajaran dan manajemen kurikulum yang efektif dan inovatif.
            </p>
             <p className="text-xs mt-4">
              Dibuat oleh: <strong className="text-slate-200">RIFQY IZA FAHRIZAL</strong>
            </p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-slate-200 mb-3">Tautan Cepat</h5>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="#features" className="hover:text-sky-400 transition-colors">Fitur</Link></li>
              <li><Link href="/signup" className="hover:text-sky-400 transition-colors">Pendaftaran</Link></li>
              <li><Link href="/login" className="hover:text-sky-400 transition-colors">Masuk</Link></li>
              <li><Link href="https://wa.me/6282131100121?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20GUMPLA%20AI." target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">Hubungi Kami (WA)</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-slate-200 mb-3">Hubungi Kami</h5>
            <p className="text-sm mb-1">Email: <a href="mailto:rifqyiza@gmail.com" className="hover:text-sky-400 transition-colors">rifqyiza@gmail.com</a></p>
            <p className="text-sm">Telepon/WA: <a href="https://wa.me/6282131100121" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">+62 821-3110-0121</a></p>
            <div className="flex space-x-4 mt-4">
              {/* Placeholder for social media icons */}
              {/* <a href="#" className="hover:text-sky-400 transition-colors"><Github size={20}/></a>
              <a href="#" className="hover:text-sky-400 transition-colors"><Linkedin size={20}/></a>
              <a href="#" className="hover:text-sky-400 transition-colors"><Twitter size={20}/></a> */}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 text-center text-sm">
          <p>&copy; {currentYear} {appName}. Semua Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </div>
    </footer>
  );
}
