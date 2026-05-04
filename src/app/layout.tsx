import type { Metadata } from "next";
import { Irish_Grover, Geist, Geist_Mono, Poppins } from "next/font/google"; 
import React from 'react';
import Providers from '@/src/app/providers';

const RootLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}