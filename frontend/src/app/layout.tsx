import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BEYONDPROOF — Beyond Trust. Beyond Doubt.',
  description: 'Next-Generation Multi-Engine Deepfake, Document, and Forensic Verification Platform',
  themeColor: '#030712',
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
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-950 text-gray-50 antialiased selection:bg-violet-600/30 selection:text-violet-200`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
