"use client";

import { LanguageProvider } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

export function LanguageProviderWrapper({
  children,
  defaultLanguage = "en",
}: {
  children: React.ReactNode;
  defaultLanguage?: Language;
}) {
  return (
    <LanguageProvider defaultLanguage={defaultLanguage}>
      {children}
    </LanguageProvider>
  );
}

