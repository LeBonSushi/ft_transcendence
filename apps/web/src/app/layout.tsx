import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from 'react-hot-toast';
import './globals.css';

import { shadcn } from '@clerk/themes';
import { SocketProvider } from '@/providers/socket-provider';
import { VerificationProvider } from '@/providers/verification-provider';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Voyageur - Planifiez vos aventures',
  description: 'Plateforme collaborative de planification de voyages',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: shadcn }}>
      <html lang="fr" suppressHydrationWarning>
        <body className={`${playfair.variable} ${dmSans.variable} font-sans antialiased `}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SocketProvider>
              <VerificationProvider>
                {children}
              </VerificationProvider>
            </SocketProvider>
            <Toaster position="top-right" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}