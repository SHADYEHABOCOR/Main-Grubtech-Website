import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import ar from './ar.json';
import es from './es.json';
import pt from './pt.json';

// Supported languages
export const supportedLanguages = ['en', 'ar', 'es', 'pt'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

// Language names for display
export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  ar: 'العربية',
  es: 'Español',
  pt: 'Português'
};

// Get language from URL pathname
export const getLanguageFromPath = (pathname: string): SupportedLanguage | null => {
  const pathParts = pathname.split('/').filter(Boolean);
  const firstPart = pathParts[0];

  if (supportedLanguages.includes(firstPart as SupportedLanguage)) {
    return firstPart as SupportedLanguage;
  }

  return null;
};

// Remove language prefix from pathname
export const removeLanguageFromPath = (pathname: string): string => {
  const pathParts = pathname.split('/').filter(Boolean);
  const firstPart = pathParts[0];

  if (supportedLanguages.includes(firstPart as SupportedLanguage)) {
    return '/' + pathParts.slice(1).join('/');
  }

  return pathname;
};

// Add language prefix to pathname
export const addLanguageToPath = (pathname: string, language: SupportedLanguage): string => {
  const cleanPath = removeLanguageFromPath(pathname);
  return `/${language}${cleanPath === '/' ? '' : cleanPath}`;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      es: { translation: es },
      pt: { translation: pt },
    },
    supportedLngs: supportedLanguages,
    fallbackLng: 'en',

    // Language detection options
    detection: {
      // Order of detection
      order: ['path', 'localStorage', 'navigator'],

      // Keys to look up language in localStorage
      lookupLocalStorage: 'i18nextLng',

      // Cache user language
      caches: ['localStorage'],

      // Optional: exclude certain paths from detection
      excludeCacheFor: ['cimode'],

      // Convert language codes
      convertDetectedLanguage: (lng: string) => {
        // Handle language variants
        const langCode = lng.split('-')[0];
        return supportedLanguages.includes(langCode as SupportedLanguage)
          ? langCode
          : 'en';
      },
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    // React options
    react: {
      useSuspense: false, // Set to false to avoid suspense issues
    },

    // Debug mode (disable in production)
    debug: false,
  });

export default i18n;
