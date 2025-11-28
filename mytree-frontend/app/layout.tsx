import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";
import { Kanit } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "MyTree Journal - บันทึกการปลูกต้นไม้",
  description: "ระบบบันทึกและติดตามการเจริญเติบโตของต้นไม้ (Cannabis Cultivation Journal)",
};

import { AppNavbar } from "../components/Navbar";

// ... imports ...

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable} ${kanit.variable}
          font-sans antialiased 
          bg-linear-to-br from-secondary via-white to-blue-50
          dark:from-gray-950 dark:via-gray-900 dark:to-primary
          min-h-screen w-full
          text-foreground
        `}
        style={{
          fontFamily: 'Kanit, var(--font-geist-sans), var(--font-geist-mono), sans-serif',
        }}
      >
        <AppNavbar />
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
