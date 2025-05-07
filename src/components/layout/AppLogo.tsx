import { BookMarked } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-2 text-lg font-semibold text-sidebar-primary-foreground hover:text-sidebar-primary-foreground/90">
      <BookMarked className="h-7 w-7 text-sidebar-primary" />
      <span className="hidden group-data-[state=expanded]:md:inline">EduAI Planner</span>
    </Link>
  );
}
