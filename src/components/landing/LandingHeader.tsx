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
    <header className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-sky-400 hover:text-sky-300 transition-colors">
          {appLogoUrl ? (
            <Image src={appLogoUrl} alt={`${appName} Logo`} width={32} height={32} className="h-8 w-8 object-contain rounded-full" data-ai-hint="app logo" />
          ) : (
            <GraduationCap className="h-8 w-8" />
          )}
          <span className="text-2xl font-bold tracking-tight text-slate-100">{appName}</span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          <Button asChild variant="ghost" className="text-slate-200 hover:bg-slate-700 hover:text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md">
            <Link href="/login">
              <LogIn className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Masuk
            </Link>
          </Button>
          <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md shadow-md hover:shadow-sky-500/40 transition-all">
            <Link href="/signup">
              <UserPlus className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Daftar
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
