import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { MegaMenu } from './MegaMenu';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import grubtechLogo from '../../assets/icons/grubtech-logo-black.svg';

interface NavItem {
  label: string;
  path?: string;
  dropdown?: 'solutions' | 'restaurants' | 'resources' | 'company';
}

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const navigation: NavItem[] = [
    {
      label: t('global.nav.restaurants'),
      dropdown: 'restaurants',
    },
    {
      label: t('global.nav.solutions'),
      dropdown: 'solutions',
    },
    {
      label: t('global.nav.integrations'),
      path: `/${i18n.language}/integrations`,
    },
    {
      label: t('global.nav.resources'),
      dropdown: 'resources',
    },
    {
      label: t('global.nav.company'),
      dropdown: 'company',
    },
  ];

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Close dropdown when route changes
  useEffect(() => {
    closeDropdown();
  }, [location.pathname]);

  // Handle scroll effect with RAF throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        closeDropdown();
      }
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <>
      {/* Header Container - Static full-width on mobile, floating on desktop */}
      <div className={`fixed top-0 left-0 right-0 z-50 lg:px-8 lg:pt-4 ${!prefersReducedMotion ? 'transition-all duration-500' : ''}`}>
        <header
          className={`
            lg:max-w-7xl lg:mx-auto lg:rounded-2xl ${!prefersReducedMotion ? 'transition-all duration-500 ease-out' : ''}
            ${isScrolled
              ? 'bg-white/80 backdrop-blur-xl shadow-elegant-lg lg:border lg:border-border-light'
              : 'bg-white/95 backdrop-blur-xl shadow-elegant lg:border lg:border-border-light'
            }
          `}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-18">
            <Link to="/" className={`flex items-center ${!prefersReducedMotion ? 'transition-smooth hover:opacity-80' : ''}`} aria-label="Grubtech - Go to homepage">
              {/* Logo with explicit dimensions to prevent CLS */}
              <img
                src={grubtechLogo}
                alt="Grubtech"
                width={120}
                height={40}
                className="h-8 md:h-10 w-auto"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navigation.map((item) => (
                <div
                  key={item.label}
                  className="relative dropdown-container"
                >
                  {item.path ? (
                    <Link
                      to={item.path}
                      className={`font-medium flex items-center gap-1 relative group ${
                        !prefersReducedMotion ? 'transition-all duration-300' : ''
                      } ${isScrolled ? 'text-text-secondary hover:text-primary' : 'text-text-primary hover:text-primary'}`}
                    >
                      {item.label}
                      {!prefersReducedMotion && (
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`font-medium flex items-center gap-1 relative group ${
                        !prefersReducedMotion ? 'transition-all duration-300' : ''
                      } ${isScrolled ? 'text-text-secondary hover:text-primary' : 'text-text-primary hover:text-primary'}`}
                    >
                      {item.label}
                      {item.dropdown && (
                        <ChevronDown
                          className={`w-4 h-4 ${
                            !prefersReducedMotion ? 'transition-transform duration-300' : ''
                          } ${openDropdown === item.label ? 'rotate-180' : ''}`}
                        />
                      )}
                      {!prefersReducedMotion && (
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                      )}
                    </button>
                  )}

                  {item.dropdown && (
                    <MegaMenu
                      type={item.dropdown}
                      isOpen={openDropdown === item.label}
                      onClose={closeDropdown}
                    />
                  )}
                </div>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4">
              <LanguageSwitcher />
              <a
                href="https://grubcenter.grubtech.io/login"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-medium relative group ${
                  !prefersReducedMotion ? 'transition-all duration-300' : ''
                } ${isScrolled ? 'text-text-secondary hover:text-primary' : 'text-text-primary hover:text-primary'}`}
              >
                {t('global.nav.logIn')}
                {!prefersReducedMotion && (
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                )}
              </a>
              <Link to={`/${i18n.language}/connect-with-us`}>
                <Button variant="primary" size="md">
                  {t('global.nav.letsTalk')}
                </Button>
              </Link>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-2 hover:bg-background-alt rounded-smooth pointer-events-auto relative z-[100] ${
                !prefersReducedMotion ? 'transition-smooth' : ''
              }`}
              aria-label="Open menu"
              type="button"
            >
              <Menu className="w-6 h-6 text-text-primary pointer-events-none" />
            </button>
          </div>
        </div>
      </header>
    </div>

    <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
  </>
  );
};
