
import type { PropsWithChildren } from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

// This layout can be very simple, just ensuring a consistent header/footer
// for these informational pages if needed, or can be expanded.

export default function LegalLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header and Footer could be simplified versions if needed, or the standard landing ones */}
      <LandingHeader appName="GUMPLA AI" appLogoUrl={null} /> 
      <main className="flex-grow">
        {children}
      </main>
      <LandingFooter appName="GUMPLA AI" />
    </div>
  );
}
