
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-1 text-xl font-bold text-sidebar-primary-foreground hover:text-sidebar-primary-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-background rounded-md">
      <GraduationCap className="h-7 w-7 text-sidebar-primary" />
      <span className="hidden group-data-[state=expanded]:md:inline">GUMPLA AI</span>
    </Link>
  );
}

