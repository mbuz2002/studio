
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogIn, UserPlus, Menu, Info, HelpCircle, FileTextIcon, BadgePercent, Sparkles, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface LandingHeaderProps {
  appName: string;
  appLogoUrl: string | null;
}

const navLinks = [
  { href: "/#features", label: "Fitur", icon: Sparkles },
  { href: "/#pricing", label: "Harga", icon: BadgePercent },
  { href: "/about", label: "Tentang Kami", icon: Info },
  { href: "/documentation", label: "Dokumentasi", icon: FileTextIcon },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
];

export function LandingHeader({ appName, appLogoUrl }: LandingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading: authLoading } = useAuth(); // Get user and loading state

  const renderAuthButtons = () => {
    if (authLoading) {
      return (
        <>
          <Button variant="ghost" className="text-slate-300 px-3 sm:px-4 py-1.5 text-sm sm:text-base rounded-lg animate-pulse">
            <div className="h-5 w-12 bg-slate-700 rounded"></div>
          </Button>
          <Button className="bg-sky-500 px-3 sm:px-4 py-1.5 text-sm sm:text-base rounded-lg animate-pulse">
            <div className="h-5 w-16 bg-sky-700 rounded"></div>
          </Button>
        </>
      );
    }

    if (user) {
      const dashboardHref = user.role === "SuperAdmin" ? "/superadmin/dashboard" : "/dashboard";
      return (
        <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white px-3 sm:px-4 py-1.5 text-sm sm:text-base rounded-lg shadow-md hover:shadow-teal-500/50 transition-all duration-300">
          <Link href={dashboardHref}>
            <LayoutDashboard className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Dasbor
          </Link>
        </Button>
      );
    }

    return (
      <>
        <Button asChild variant="ghost" className="text-slate-300 hover:bg-slate-700/50 hover:text-sky-300 px-3 sm:px-4 py-1.5 text-sm sm:text-base rounded-lg transition-colors">
          <Link href="/login-by-school">
            <LogIn className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Masuk
          </Link>
        </Button>
        <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white px-3 sm:px-4 py-1.5 text-sm sm:text-base rounded-lg shadow-md hover:shadow-sky-500/50 transition-all duration-300">
          <Link href="/signup">
            <UserPlus className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Daftar
          </Link>
        </Button>
      </>
    );
  };

  const renderMobileAuthButtons = () => {
    if (authLoading) {
      return <div className="h-10 bg-slate-700 rounded w-full animate-pulse mt-2"></div>;
    }
    if (user) {
      const dashboardHref = user.role === "SuperAdmin" ? "/superadmin/dashboard" : "/dashboard";
      return (
        <SheetClose asChild>
          <Button asChild className="w-full justify-start bg-teal-500 hover:bg-teal-600 text-white text-base py-3 px-3">
            <Link href={dashboardHref}>
              <LayoutDashboard className="mr-2 h-5 w-5" /> Dasbor
            </Link>
          </Button>
        </SheetClose>
      );
    }
    return (
      <>
        <SheetClose asChild>
          <Button asChild variant="ghost" className="w-full justify-start text-slate-200 hover:bg-slate-700/50 hover:text-sky-300 text-base py-3 px-3">
            <Link href="/login-by-school">
              <LogIn className="mr-2 h-5 w-5" /> Masuk
            </Link>
          </Button>
        </SheetClose>
        <SheetClose asChild>
          <Button asChild className="w-full justify-start bg-sky-500 hover:bg-sky-600 text-white text-base py-3 px-3">
            <Link href="/signup">
              <UserPlus className="mr-2 h-5 w-5" /> Daftar
            </Link>
          </Button>
        </SheetClose>
      </>
    );
  };


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

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
          {navLinks.map(link => (
            <Button key={link.href} asChild variant="ghost" className="text-slate-300 hover:bg-slate-700/50 hover:text-sky-300 px-3 py-1.5 text-sm rounded-lg transition-colors">
              <Link href={link.href}>
                {link.icon && <link.icon className="mr-1.5 h-4 w-4" />} {link.label}
              </Link>
            </Button>
          ))}
          {renderAuthButtons()}
        </nav>

        {/* Mobile Navigation Trigger (Hamburger Menu) */}
        <div className="sm:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-slate-700/50 hover:text-sky-300">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-slate-800 border-slate-700 text-slate-100 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-slate-700">
                  <Link href="/" className="flex items-center gap-2.5 text-sky-400 hover:text-sky-300 transition-colors group" onClick={() => setIsMobileMenuOpen(false)}>
                    {appLogoUrl ? (
                      <Image src={appLogoUrl} alt={`${appName} Logo`} width={32} height={32} className="h-8 w-8 object-contain rounded-full shadow-md border border-sky-500/30" data-ai-hint="app logo" />
                    ) : (
                      <GraduationCap className="h-8 w-8 text-sky-400" />
                    )}
                    <span className="text-xl font-bold tracking-tight text-slate-100">{appName}</span>
                  </Link>
                </div>
                <nav className="flex flex-col gap-2 p-4 flex-grow">
                  {navLinks.map(link => (
                     <SheetClose key={link.href} asChild>
                        <Button asChild variant="ghost" className="w-full justify-start text-slate-200 hover:bg-slate-700/50 hover:text-sky-300 text-base py-3 px-3">
                          <Link href={link.href}>
                            {link.icon && <link.icon className="mr-2 h-5 w-5" />} {link.label}
                          </Link>
                        </Button>
                      </SheetClose>
                  ))}
                  {renderMobileAuthButtons()}
                </nav>
                <div className="p-6 border-t border-slate-700 text-center text-xs text-slate-500">
                  &copy; {new Date().getFullYear()} {appName}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

