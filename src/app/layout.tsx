import type {Metadata, Viewport} from 'next';
import {Poppins} from 'next/font/google';
import React from 'react';
import Providers from '@/src/app/providers';
import RotateDeviceOverlay from '@/src/components/layout/RotateDeviceOverlay';
import './globals.css';
import '../components/home/home-modals.css';
import '../components/home/home-labels.css';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#59a87d',
};

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
      <body className={`${poppins.variable} antialiased overflow-auto m-0 p-0`}>
        <Providers>{children}</Providers>
        <RotateDeviceOverlay />
      </body>
    </html>
  );
}
