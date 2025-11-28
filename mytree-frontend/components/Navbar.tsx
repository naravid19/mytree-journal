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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-400 font-kanit">
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
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg">
          <Link href="/" className={`block px-3 py-3 rounded-xl text-base font-medium transition-colors ${isActive("/")}`} onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
              <HiHome className="w-5 h-5" />
              หน้าหลัก
            </div>
          </Link>
          <Link href="/strains" className={`block px-3 py-3 rounded-xl text-base font-medium transition-colors ${isActive("/strains")}`} onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
              <HiCollection className="w-5 h-5" />
              สายพันธุ์
            </div>
          </Link>
          <Link href="/batches" className={`block px-3 py-3 rounded-xl text-base font-medium transition-colors ${isActive("/batches")}`} onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
              <HiOutlineBeaker className="w-5 h-5" />
              ชุดการปลูก
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
