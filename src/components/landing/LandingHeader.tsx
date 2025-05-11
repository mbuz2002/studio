
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';

interface LandingHeaderProps {
  appName: string;
  appLogoUrl: string | null;
}

export function LandingHeader({ appName, appLogoUrl }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/70 backdrop-blur-lg shadow-2xl border-b border-slate-700/50">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-sky-400 hover:text-sky-300 transition-colors group">
          {appLogoUrl ? (
            <Image src={appLogoUrl} alt={`${appName} Logo`} width={36} height={36} className="h-9 w-9 object-contain rounded-full shadow-md border border-sky-500/30 group-hover:border-sky-400 transition-all" data-ai-hint="app logo" />
          ) : (
            <GraduationCap className="h-9 w-9 text-sky-400 group-hover:text-sky-300 transition-colors" />
          )}
          <span className="text-2xl font-bold tracking-tight text-slate-100 group-hover:text-sky-300 transition-colors">{appName}</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" className="text-slate-300 hover:bg-slate-700/50 hover:text-sky-300 px-3 sm:px-4 py-1.5 text-sm sm:text-base rounded-lg transition-colors">
            <Link href="/login">
              <LogIn className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Masuk
            </Link>
          </Button>
          <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white px-3 sm:px-4 py-1.5 text-sm sm:text-base rounded-lg shadow-md hover:shadow-sky-500/50 transition-all duration-300">
            <Link href="/signup">
              <UserPlus className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Daftar
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
