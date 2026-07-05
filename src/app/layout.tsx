import type {Metadata, Viewport} from 'next';
import {Geist, Geist_Mono, Irish_Grover, Poppins} from 'next/font/google';
import React from 'react';
import Providers from '@/src/app/providers';
import './globals.css';
import '../components/home/home-modals.css';
import '../components/home/home-labels.css';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#59a87d',
};

const irishGrover = Irish_Grover({
  weight: '400',
  variable: '--font-irish-grover',
  subsets: ['latin'],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'NusaQuest',
  description: 'Educational Adventure Game',
  icons: {
    icon: '/icons/logo.webp',
    shortcut: '/icons/logo.webp',
    apple: '/icons/logo.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${irishGrover.variable} ${poppins.variable} antialiased overflow-auto m-0 p-0`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
