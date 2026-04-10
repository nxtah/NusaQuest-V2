import type { Metadata } from "next";
import { Irish_Grover, Geist, Geist_Mono } from "next/font/google";
import React from 'react';
import "./globals.css";

const irishGrover = Irish_Grover({
  weight: "400",
  variable: "--font-irish-grover",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NusaQuest",
  description: "Educational Adventure Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${irishGrover.variable} antialiased overflow-hidden m-0 p-0`}>
        {children}
      </body>
    </html>
  );
}