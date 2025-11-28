"use client";

import { DarkThemeToggle } from "flowbite-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiCollection, HiOutlineBeaker, HiMenu } from "react-icons/hi";
import { useState } from "react";

export function AppNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path ? "text-primary dark:text-green-400" : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary to-primary-light dark:from-green-400 dark:to-green-200 font-kanit">
              🌳 MyTree Journal
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`flex items-center gap-1 font-kanit font-medium transition-colors ${isActive("/")}`}>
              <HiHome className="w-5 h-5" />
              หน้าหลัก
            </Link>
            <Link href="/strains" className={`flex items-center gap-1 font-kanit font-medium transition-colors ${isActive("/strains")}`}>
              <HiCollection className="w-5 h-5" />
              สายพันธุ์
            </Link>
            <Link href="/batches" className={`flex items-center gap-1 font-kanit font-medium transition-colors ${isActive("/batches")}`}>
              <HiOutlineBeaker className="w-5 h-5" />
              ชุดการปลูก
            </Link>
            <DarkThemeToggle className="focus:ring-0" />
          </div>

          <div className="flex items-center md:hidden gap-2">
            <DarkThemeToggle className="focus:ring-0" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              <HiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/")}`} onClick={() => setIsOpen(false)}>
              หน้าหลัก
            </Link>
            <Link href="/strains" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/strains")}`} onClick={() => setIsOpen(false)}>
              สายพันธุ์
            </Link>
            <Link href="/batches" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/batches")}`} onClick={() => setIsOpen(false)}>
              ชุดการปลูก
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
