import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import './globals.css';

import { SocketProvider } from '@/providers/socket-provider';
import DismissableToast from '@/components/DismissableToast';

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


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} font-sans antialiased `}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider session={session}>
            <SocketProvider>
              {children}
            </SocketProvider>
          </SessionProvider>
          <DismissableToast />
        </ThemeProvider>
      </body>
    </html>
  );
}
