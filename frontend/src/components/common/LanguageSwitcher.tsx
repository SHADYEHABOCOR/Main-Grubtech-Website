import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { supportedLanguages, languageNames, addLanguageToPath, removeLanguageFromPath, type SupportedLanguage } from '../../i18n/config';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender) {
      setIsExiting(true);
      const exitDuration = prefersReducedMotion ? 0 : 150; // Instant exit for reduced motion
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, exitDuration);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, shouldRender, prefersReducedMotion]);

  const currentLanguage = i18n.language.split('-')[0] as SupportedLanguage;

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    // Update i18n
    i18n.changeLanguage(newLang);

    // Update URL
    const cleanPath = removeLanguageFromPath(location.pathname);
    const newPath = addLanguageToPath(cleanPath, newLang);
    navigate(newPath + location.search + location.hash);

    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 ${
          !prefersReducedMotion ? 'transition-colors' : ''
        }`}
        aria-label="Change language"
      >
        <Globe className="w-5 h-5 text-gray-600" />
      </button>

      {shouldRender && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div
            className={`absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[150px] z-50 ${
              !prefersReducedMotion ? 'transition-opacity duration-150' : ''
            } ${
              isExiting ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {supportedLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                  !prefersReducedMotion ? 'transition-colors' : ''
                } ${
                  currentLanguage === lang ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                }`}
              >
                {languageNames[lang]}
                {currentLanguage === lang && (
                  <span className="ml-2 text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
