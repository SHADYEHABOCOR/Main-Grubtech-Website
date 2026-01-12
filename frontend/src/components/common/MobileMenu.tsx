import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { FocusTrap } from '../accessibility';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const menuSections = [
    {
      key: 'restaurants',
      label: t('global.nav.restaurants'),
      items: [
        { label: t('global.nav.independentSMEs'), path: '/persona/smbs' },
        { label: t('global.nav.regionalChains'), path: '/persona/regional-chains' },
        { label: t('global.nav.globalBrands'), path: '/persona/global-chains' },
        { label: t('global.nav.darkKitchens'), path: '/persona/dark-kitchens' },
      ],
    },
    {
      key: 'solutions',
      label: t('global.nav.solutions'),
      items: [
        { label: t('global.nav.gOnline'), path: '/gonline' },
        { label: t('global.nav.gOnlineLite'), path: '/gonline-lite' },
        { label: t('global.nav.gKDS'), path: '/gkds' },
        { label: t('global.nav.gDispatch'), path: '/gdispatch' },
        { label: t('global.nav.gData'), path: '/gdata' },
      ],
    },
    {
      key: 'resources',
      label: t('global.nav.resources'),
      items: [
        { label: t('global.nav.blog'), path: 'https://blog.grubtech.com/', external: true },
        { label: t('global.nav.knowledgeBase'), path: 'https://knowledge.grubtech.com/', external: true },
      ],
    },
    {
      key: 'company',
      label: t('global.nav.company'),
      items: [
        { label: t('global.nav.aboutUs'), path: '/about' },
        { label: t('global.nav.careers'), path: '/careers' },
      ],
    },
  ];

  // Exit animation handling
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender) {
      setIsExiting(true);
      // Instant dismissal for reduced motion, 300ms animation for normal
      const exitDuration = prefersReducedMotion ? 0 : 300;
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, exitDuration);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, shouldRender, prefersReducedMotion]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden ${
          !prefersReducedMotion ? 'transition-opacity duration-300' : ''
        } ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />
      <FocusTrap active={isOpen && !isExiting} onEscape={onClose}>
        <div
          className={`fixed top-0 right-0 bottom-0 w-[280px] bg-white shadow-xl z-50 lg:hidden ${
            !prefersReducedMotion ? 'transition-transform duration-300 ease-in-out' : ''
          } ${
            isExiting ? `${!prefersReducedMotion ? 'translate-x-full' : ''}` : 'translate-x-0'
          }`}
          style={{
            animation: !isExiting && !prefersReducedMotion ? 'mobile-menu-slide-in 0.3s ease-in-out forwards' : 'none',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <LanguageSwitcher />
              <button onClick={onClose} className="p-2 hover:bg-background-alt rounded-lg" aria-label="Close menu">
                <X className="w-6 h-6 text-text-primary" />
              </button>
            </div>

            <nav className="flex-1 px-6 py-8 overflow-y-auto">
              <ul className="flex flex-col gap-2">
                {menuSections.map((section) => (
                  <li key={section.key}>
                    <button
                      onClick={() => toggleSection(section.key)}
                      className="w-full flex items-center justify-between py-3 text-text-primary hover:text-primary font-medium transition-colors"
                    >
                      <span>{section.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 ${
                          !prefersReducedMotion ? 'transition-transform duration-200' : ''
                        } ${
                          expandedSection === section.key ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {/* CSS Grid accordion technique - similar to FAQSection */}
                    <div
                      className={`grid overflow-hidden ${
                        !prefersReducedMotion ? 'transition-[grid-template-rows] duration-200' : ''
                      } ${
                        expandedSection === section.key ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="min-h-0">
                        <ul
                          className={`pl-4 space-y-2 ${
                            !prefersReducedMotion ? 'transition-opacity duration-200' : ''
                          } ${
                            expandedSection === section.key ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          {section.items.map((item) =>
                            'external' in item && item.external ? (
                              <li key={item.label}>
                                <a
                                  href={item.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={onClose}
                                  className="block py-2 text-text-secondary hover:text-primary transition-colors"
                                >
                                  {item.label}
                                </a>
                              </li>
                            ) : (
                              <li key={item.label}>
                                <Link
                                  to={item.path}
                                  onClick={onClose}
                                  className="block py-2 text-text-secondary hover:text-primary transition-colors"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </li>
                ))}
                <li>
                  <Link
                    to="/integrations"
                    onClick={onClose}
                    className="block py-3 text-text-primary hover:text-primary font-medium transition-colors"
                  >
                    {t('global.nav.integrations')}
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="p-6 border-t border-border space-y-3">
              <a
                href="https://grubcenter.grubtech.io/login"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2 text-text-primary hover:text-primary font-medium transition-colors"
              >
                {t('global.nav.logIn')}
              </a>
              <Link to={`/${i18n.language}/connect-with-us`} onClick={onClose} className="block">
                <Button variant="primary" className="w-full">
                  {t('global.nav.letsTalk')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </FocusTrap>
    </>
  );
};
