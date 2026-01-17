import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLanguageFromPath, addLanguageToPath, supportedLanguages, type SupportedLanguage } from '../../i18n/config';

/**
 * Component that handles language-based URL redirects
 * If user visits /about, redirect to /en/about (or their preferred language)
 *
 * Uses Navigate component for synchronous redirect (no flash)
 */
export const LanguageRedirect: React.FC = () => {
  const { i18n } = useTranslation();
  const location = useLocation();

  const pathLang = getLanguageFromPath(location.pathname);

  // Sync i18n language with URL (side effect)
  useEffect(() => {
    if (pathLang && pathLang !== i18n.language) {
      i18n.changeLanguage(pathLang);
    }
  }, [pathLang, i18n]);

  // If path already has language prefix or is admin route, do nothing
  if (pathLang || location.pathname.startsWith('/admin')) {
    return null;
  }

  // Path doesn't have language prefix - redirect synchronously
  const currentLang = i18n.language.split('-')[0] as SupportedLanguage;
  const targetLang = supportedLanguages.includes(currentLang) ? currentLang : 'en';
  const newPath = addLanguageToPath(location.pathname, targetLang) + location.search + location.hash;

  return <Navigate to={newPath} replace />;
};
