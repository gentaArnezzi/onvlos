import { Language, getTranslation } from "./translations";

export function t(key: string, language: Language = "en"): string {
  return getTranslation(key, language);
}

