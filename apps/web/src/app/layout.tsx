import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SiteFooter } from '@/components/SiteFooter';
import { TopLoader } from '@/components/TopLoader';
import { CustomCursor } from '@/components/CustomCursor';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Synthetica — Synthetic creativity platform',
  description:
    'The future isn\'t filmed. It\'s synthesized. Discover, license, and create fully synthetic AI characters.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-cinema bg-vignette min-h-screen font-sans antialiased">
        <div className="relative z-10 flex min-h-screen flex-col overflow-x-clip">
          <CustomCursor />
          <TopLoader />
          <Providers>{children}</Providers>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
