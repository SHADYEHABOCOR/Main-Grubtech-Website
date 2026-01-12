import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Languages that use RTL direction
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * RTL Provider Component
 *
 * Automatically sets the document direction (dir) and lang attributes
 * based on the current language. This enables proper RTL support for
 * Arabic and other RTL languages.
 *
 * Features:
 * - Sets dir="rtl" or dir="ltr" on <html> element
 * - Sets lang attribute for accessibility
 * - Updates on language change
 */
export const RTLProvider: React.FC = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language.split('-')[0];
    const isRTL = RTL_LANGUAGES.includes(currentLang);

    // Set direction on html element
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

    // Set lang attribute for accessibility
    document.documentElement.lang = currentLang;

    // Add/remove RTL class for additional styling hooks
    if (isRTL) {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [i18n.language]);

  return null;
};

export default RTLProvider;
