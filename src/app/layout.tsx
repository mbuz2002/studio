
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google'; // Changed font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LogProvider } from '@/contexts/LogContext';
import { CurriculumProvider } from '@/contexts/CurriculumContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans', 
  weight: ['300', '400', '500', '600', '700', '800'] // Common weights for Plus Jakarta Sans
});

export const metadata: Metadata = {
  title: 'EduAI Planner',
  description: 'Perencanaan Pembelajaran dan Manajemen Kurikulum Berbasis AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <ThemeProvider>
          <QueryClientProvider>
            <LogProvider> 
              <AuthProvider>
                <CurriculumProvider> 
                  {children}
                  <Toaster />
                </CurriculumProvider>
              </AuthProvider>
            </LogProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
