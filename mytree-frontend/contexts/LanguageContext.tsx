"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import thTranslations from "../locales/th.json";
import enTranslations from "../locales/en.json";

type Language = "th" | "en";
type Translations = typeof thTranslations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
}

const translations: Record<Language, Translations> = {
  th: thTranslations,
  en: enTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("th");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === "th" || savedLang === "en")) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (mounted) {
      localStorage.setItem("language", lang);
      document.documentElement.lang = lang;
    }
  };

  // Get nested translation by dot notation: "dashboard.title"
  const t = (key: string): string => {
    const keys = key.split(".");
    let result: Record<string, unknown> | string = translations[language];
    
    for (const k of keys) {
      if (typeof result === "object" && result !== null && k in result) {
        result = result[k] as Record<string, unknown> | string;
      } else {
        return key; // Return key if not found
      }
    }
    
    return typeof result === "string" ? result : key;
  };

  // Always provide context (use default Thai language before hydration)
  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
