"use client";

import { DarkThemeToggle } from "flowbite-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiCollection, HiOutlineBeaker, HiMenu, HiX } from "react-icons/hi";
import { useState, useEffect } from "react";

export function AppNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect with performance optimization
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => 
    pathname === path 
      ? "text-primary-dark dark:text-primary-light bg-primary-light/10 dark:bg-primary/20" 
      : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-800/50";

  const navLinkClasses = (path: string) => 
    `flex items-center gap-2 px-4 py-2 rounded-full font-kanit font-medium transition-all duration-300 ${isActive(path)}`;

  return (
    <nav 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled 
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md py-2 border-b border-gray-200/50 dark:border-gray-800/50" 
          : "bg-transparent py-4"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link 
              href="/" 
              className="group flex items-center gap-2 text-xl font-bold tracking-tight text-primary-dark dark:text-emerald-400 font-kanit transition-transform hover:scale-105"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🌳</span>
              <span>MyTree Journal</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/" className={navLinkClasses("/")}>
              <HiHome className="w-5 h-5" />
              หน้าหลัก
            </Link>
            <Link href="/strains" className={navLinkClasses("/strains")}>
              <HiCollection className="w-5 h-5" />
              สายพันธุ์
            </Link>
            <Link href="/batches" className={navLinkClasses("/batches")}>
              <HiOutlineBeaker className="w-5 h-5" />
              ชุดการปลูก
            </Link>
            <div className="pl-4 ml-2 border-l border-gray-200 dark:border-gray-700">
              <DarkThemeToggle className="focus:ring-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2 transition-colors" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <DarkThemeToggle className="focus:ring-0 rounded-full" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
            >
              {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="mx-4 mt-2 mb-4 rounded-2xl glass border border-white/20 dark:border-gray-700/50 p-2 space-y-1 shadow-lg">
          <Link 
            href="/" 
            className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${isActive("/")}`} 
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center gap-3">
              <HiHome className="w-5 h-5" />
              หน้าหลัก
            </div>
          </Link>
          <Link 
            href="/strains" 
            className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${isActive("/strains")}`} 
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center gap-3">
              <HiCollection className="w-5 h-5" />
              สายพันธุ์
            </div>
          </Link>
          <Link 
            href="/batches" 
            className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${isActive("/batches")}`} 
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center gap-3">
              <HiOutlineBeaker className="w-5 h-5" />
              ชุดการปลูก
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
