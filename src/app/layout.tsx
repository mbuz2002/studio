
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google'; // Changed font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Instantiate Plus Jakarta Sans
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['300', '400', '500', '600', '700', '800'] // Added common weights
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
      {/* Applied the new font variable to the body */}
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <ThemeProvider>
          <QueryClientProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
