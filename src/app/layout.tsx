import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#59a87d',
};

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
        {children}
      </body>
    </html>
  );
}
