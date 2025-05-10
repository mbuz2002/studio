
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google'; 
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LogProvider } from '@/contexts/LogContext';
import { CurriculumProvider } from '@/contexts/CurriculumContext';

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto', 
  weight: ['300', '400', '500', '700'] 
});

export const metadata: Metadata = {
  title: 'GUMPLA AI',
  description: 'Platform Cerdas Perencanaan Pembelajaran dan Manajemen Kurikulum dengan GUMPLA AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased font-roboto`}> {/* Apply font-roboto */}
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

