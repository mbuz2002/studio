
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google'; // Changed font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LogProvider } from '@/contexts/LogContext';

// Instantiate Roboto font
const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto', // CSS variable for Roboto
  weight: ['300', '400', '500', '700', '900'] // Common weights for Roboto
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
      {/* Applied the new Roboto font variable to the body */}
      <body className={`${roboto.variable} antialiased`}>
        <ThemeProvider>
          <QueryClientProvider>
            <LogProvider> {/* LogProvider now wraps AuthProvider */}
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </LogProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

