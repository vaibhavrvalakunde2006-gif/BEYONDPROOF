import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#030712',
};

export const metadata: Metadata = {
  title: 'BEYONDPROOF — Beyond Trust. Beyond Doubt.',
  description: 'Next-Generation Multi-Engine Deepfake, Document, and Forensic Verification Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="color-scheme" content="dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anta&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-950 text-gray-50 antialiased selection:bg-violet-600/30 selection:text-violet-200`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
