import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const dynamic = 'force-dynamic';

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const headlineFont = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WhiskeDelights | Modern Artisanal Cakes',
  description: 'Simple, elegant cake ordering for handcrafted bakery creations in Nairobi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${bodyFont.variable} ${headlineFont.variable} font-body antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
