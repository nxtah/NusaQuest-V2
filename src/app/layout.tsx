import React from 'react';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppinsBold = Poppins({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-poppins-bold',
});

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body className={poppinsBold.variable}>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;