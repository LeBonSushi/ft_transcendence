import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider, SignedIn, SignedOut, UserAvatar, UserButton, UserProfile } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ui/theme-provider';
import Header from '@/components/ui/header';
import { Toaster } from 'react-hot-toast';
import './globals.css';

import { shadcn } from '@clerk/themes';
import Footer from '@/components/ui/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Travel Planner - Plan Your Perfect Trip',
  description: 'Collaborative travel planning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className='flex flex-col h-screen'>
              <Header />
              {children}
            </div>
            <Toaster position="top-right" />
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}