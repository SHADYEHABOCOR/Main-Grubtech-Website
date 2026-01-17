import { useParams, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from '../../i18n/config';

interface ValidatedLanguageRouteProps {
  children: React.ReactNode;
}

/**
 * Validates that the :lang parameter is a supported language.
 * If not, redirects to the correct language-prefixed path.
 *
 * This prevents the 404 flash issue where /:lang/* would match
 * any path like /about (treating "about" as the language),
 * causing the NotFound component to briefly render before
 * LanguageRedirect could handle the redirect.
 */
export const ValidatedLanguageRoute: React.FC<ValidatedLanguageRouteProps> = ({ children }) => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();

  // Check if the lang param is a valid supported language
  const isValidLanguage = lang && supportedLanguages.includes(lang as SupportedLanguage);

  if (!isValidLanguage) {
    // The captured :lang is not a valid language (e.g., "about" from /about)
    // Redirect to the proper language-prefixed path
    const currentLang = i18n.language.split('-')[0] as SupportedLanguage;
    const targetLang = supportedLanguages.includes(currentLang) ? currentLang : 'en';

    // Reconstruct the full path: /{targetLang}/{lang}/{rest}
    // where {lang} is the invalid "language" that was actually a route segment
    const restOfPath = location.pathname.replace(/^\/[^/]+/, ''); // Remove the first segment
    const newPath = `/${targetLang}/${lang}${restOfPath}${location.search}${location.hash}`;

    return <Navigate to={newPath} replace />;
  }

  return <>{children}</>;
};
