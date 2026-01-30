import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";
import { Kanit } from "next/font/google";
import { ThemeProvider } from "../components/ThemeProvider";
import { LanguageProvider } from "../contexts/LanguageContext";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kanit.variable} font-sans antialiased 
        bg-background text-text dark:bg-background-dark dark:text-text-dark
        selection:bg-primary-light selection:text-white`}
        style={{
          fontFamily: 'var(--font-kanit), var(--font-geist-sans), sans-serif',
        }}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LanguageProvider>
            <AppNavbar />
            <div className="pt-20 pb-8 min-h-screen">
              {children}
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
