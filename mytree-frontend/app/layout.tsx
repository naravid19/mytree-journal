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
  title: "Create Next App",
  description: "Generated by create next app",
};

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
          font-sans antialiased bg-gradient-to-br from-blue-50 via-white to-green-50
          dark:from-gray-900 dark:via-gray-900 dark:to-gray-800
          min-h-screen w-full
        `}
        style={{
          fontFamily: 'Kanit, var(--font-geist-sans), var(--font-geist-mono), sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
