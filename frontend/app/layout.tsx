"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDark, setIsDark] = useState<boolean>(true);
  return (
    <html lang="en" className={isDark ? "dark" : ""}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar setDarkMode={setIsDark} darkMode={isDark} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
