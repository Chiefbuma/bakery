import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

// Force dynamic rendering to ensure DB-dependent components work at runtime
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'WhiskeDelights | Artisanal Bakery Management',
  description: 'High-performance Production Management and eCommerce System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
