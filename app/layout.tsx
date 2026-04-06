import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { getMetadataBase, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME } from '@/lib/seo';

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
  metadataBase: getMetadataBase(),
  title: {
    default: `${SITE_NAME} | Handcrafted Cakes in Nairobi`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SITE_NAME} | Handcrafted Cakes in Nairobi`,
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} social preview`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Handcrafted Cakes in Nairobi`,
    description: SITE_DESCRIPTION,
    images: ['/twitter-image'],
  },
  icons: {
    icon: [{ url: '/icon', type: 'image/png' }],
    shortcut: ['/icon'],
    apple: [{ url: '/apple-icon', type: 'image/png' }],
  },
  category: 'food',
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
