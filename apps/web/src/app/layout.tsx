import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from 'react-hot-toast';
import './globals.css';

import { shadcn } from '@clerk/themes';
import Footer from '@/components/ui/footer';

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
        <body className={`${playfair.variable} ${dmSans.variable} font-sans antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className='flex flex-col h-screen justify-center items-center'>
              {/* <Header /> */}
              {children}
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}