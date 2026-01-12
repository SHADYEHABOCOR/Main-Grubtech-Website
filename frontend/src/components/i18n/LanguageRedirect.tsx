import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLanguageFromPath, addLanguageToPath, supportedLanguages, type SupportedLanguage } from '../../i18n/config';

/**
 * Component that handles language-based URL redirects
 * If user visits /about, redirect to /en/about (or their preferred language)
 */
export const LanguageRedirect: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const pathLang = getLanguageFromPath(location.pathname);

    // If path already has a language prefix
    if (pathLang) {
      // Update i18n if different from current language
      if (pathLang !== i18n.language) {
        i18n.changeLanguage(pathLang);
      }
      return;
    }

    // Skip redirect for admin routes
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Path doesn't have language prefix - add one
    const currentLang = i18n.language.split('-')[0] as SupportedLanguage;
    const targetLang = supportedLanguages.includes(currentLang) ? currentLang : 'en';

    const newPath = addLanguageToPath(location.pathname, targetLang);
    navigate(newPath + location.search + location.hash, { replace: true });
  }, [location.pathname, i18n, navigate, location.search, location.hash]);

  return null;
};
