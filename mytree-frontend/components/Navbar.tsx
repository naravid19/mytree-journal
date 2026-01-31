'use client';

import { DarkThemeToggle } from 'flowbite-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiHome,
  HiCollection,
  HiOutlineBeaker,
  HiMenu,
  HiX,
  HiTranslate,
} from 'react-icons/hi';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// =============================================================================
// Types
// =============================================================================

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ReactNode;
}

// =============================================================================
// Constants
// =============================================================================

const SCROLL_THRESHOLD = 10;

// =============================================================================
// Component
// =============================================================================

/**
 * AppNavbar - Main navigation component
 * Features responsive design, scroll effects, language toggle, and dark mode
 */
export function AppNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  // Navigation items configuration
  const navItems: NavItem[] = useMemo(
    () => [
      { path: '/', labelKey: 'common.home', icon: <HiHome className="w-5 h-5" aria-hidden="true" /> },
      { path: '/strains', labelKey: 'common.strains', icon: <HiCollection className="w-5 h-5" aria-hidden="true" /> },
      { path: '/batches', labelKey: 'common.batches', icon: <HiOutlineBeaker className="w-5 h-5" aria-hidden="true" /> },
    ],
    []
  );

  // Memoized toggle handler
  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'th' ? 'en' : 'th');
  }, [language, setLanguage]);

  // Memoized mobile menu toggle
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close mobile menu
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle scroll effect with performance optimization (requestAnimationFrame)
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > SCROLL_THRESHOLD);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get active state classes for nav links
  const getActiveClasses = (path: string): string =>
    pathname === path
      ? 'text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 font-bold'
      : 'text-text-muted hover:text-primary dark:hover:text-primary-light hover:bg-surface-dark/5 dark:hover:bg-surface/5';

  // Desktop nav link classes
  const getDesktopLinkClasses = (path: string): string =>
    `flex items-center gap-2 px-4 py-2 rounded-full font-kanit font-medium transition-all duration-300 ${getActiveClasses(path)}`;

  // Mobile nav link classes
  const getMobileLinkClasses = (path: string): string =>
    `block px-4 py-3 rounded-xl text-base font-medium transition-all ${getActiveClasses(path)}`;

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${
          scrolled
            ? 'bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-xl shadow-sm py-2 border-b border-gray-200/50 dark:border-gray-800/50 supports-backdrop-filter:bg-surface/60'
            : 'bg-transparent py-4'
        }
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link
              href="/"
              className="group flex items-center gap-2 text-xl font-bold tracking-tight text-primary-dark dark:text-primary-light font-kanit transition-transform hover:scale-105"
              aria-label="MyTree Journal - Home"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform duration-300" aria-hidden="true">
                🌳
              </span>
              <span>MyTree Journal</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} className={getDesktopLinkClasses(item.path)}>
                {item.icon}
                {t(item.labelKey)}
              </Link>
            ))}

            <div className="pl-4 ml-2 border-l border-gray-200 dark:border-gray-700 flex items-center gap-1">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-text-muted hover:text-primary hover:bg-surface-dark/5 dark:hover:bg-surface/5 transition-colors"
                aria-label={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
              >
                <HiTranslate className="w-4 h-4" aria-hidden="true" />
                <span className="uppercase">{language}</span>
              </button>

              {/* Dark Mode Toggle */}
              <DarkThemeToggle
                className="focus:ring-0 hover:bg-surface-dark/5 dark:hover:bg-surface/5 rounded-full p-2 transition-colors text-text-muted hover:text-primary"
                aria-label="Toggle dark mode"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <DarkThemeToggle className="focus:ring-0 rounded-full text-text-muted" />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-full text-text-muted hover:bg-surface-dark/5 dark:hover:bg-surface/5 focus:outline-none transition-colors"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? (
                <HiX className="w-6 h-6" aria-hidden="true" />
              ) : (
                <HiMenu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
        aria-hidden={!isOpen}
      >
        <div className="mx-4 mt-2 mb-4 rounded-2xl glass border border-white/20 dark:border-gray-700/50 p-2 space-y-1 shadow-lg bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={getMobileLinkClasses(item.path)}
              onClick={closeMenu}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {t(item.labelKey)}
              </div>
            </Link>
          ))}

          {/* Language Toggle for Mobile */}
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-text-muted hover:bg-surface-dark/5 dark:hover:bg-surface/5 transition-colors"
          >
            <HiTranslate className="w-5 h-5" aria-hidden="true" />
            {language === 'th' ? 'English' : 'ภาษาไทย'}
          </button>
        </div>
      </div>
    </nav>
  );
}

