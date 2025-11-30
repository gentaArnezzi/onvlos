"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, getTranslation } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  defaultLanguage = "en",
}: {
  children: React.ReactNode;
  defaultLanguage?: Language;
}) {
  // Ensure defaultLanguage is valid
  const validLanguage: Language = (defaultLanguage === "en" || defaultLanguage === "id") ? defaultLanguage : "en";
  const [language, setLanguage] = useState<Language>(validLanguage);

  // Update language when defaultLanguage changes
  useEffect(() => {
    if (defaultLanguage === "en" || defaultLanguage === "id") {
      setLanguage(defaultLanguage);
    }
  }, [defaultLanguage]);

  const t = (key: string) => {
    try {
      const translation = getTranslation(key, language);
      return translation;
    } catch (error) {
      console.error("Translation error:", error, "key:", key);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback to English if context is not available
    console.warn("useTranslation used outside LanguageProvider, falling back to English");
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: (key: string) => {
        const { getTranslation } = require("./translations");
        return getTranslation(key, "en");
      },
    };
  }
  return context;
}

