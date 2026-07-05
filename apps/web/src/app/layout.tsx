import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SiteFooter } from '@/components/SiteFooter';
import { TopLoader } from '@/components/TopLoader';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Synthetica — AI Character Marketplace',
  description:
    'Discover, license, and trade fully synthetic AI characters. The world’s first AI Character Marketplace.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-cinema bg-vignette min-h-screen font-sans antialiased">
        <div className="relative z-10 flex min-h-screen flex-col">
          <TopLoader />
          <Providers>{children}</Providers>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
