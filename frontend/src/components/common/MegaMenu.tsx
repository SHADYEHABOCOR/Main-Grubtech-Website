import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Rocket, ChefHat, BookOpen, Briefcase, Info, Store, Zap, Monitor, TrendingUp, Database } from 'lucide-react';
// import { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '../../hooks/useReducedMotion';
// Temporarily using icons instead of SVGs
// import GOnlineLogo from '../../assets/svgs_collection/Gonline.svg';
// import GOnlineLiteLogo from '../../assets/svgs_collection/Gonline-Lite.svg';
// import GKDSLogo from '../../assets/svgs_collection/Gkds.svg';
// import GDispatchLogo from '../../assets/svgs_collection/GDispatch.svg';
// import GDataLogo from '../../assets/svgs_collection/Gdata.svg';

interface MegaMenuProps {
  type: 'solutions' | 'restaurants' | 'resources' | 'company';
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ type, isOpen, onClose }) => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender) {
      setIsExiting(true);
      const exitDuration = prefersReducedMotion ? 0 : 200; // Instant exit for reduced motion
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, exitDuration);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, shouldRender, prefersReducedMotion]);

  const menuData = {
    solutions: {
      title: t('global.megaMenu.solutions.title'),
      items: [
        {
          label: t('global.megaMenu.solutions.gOnline'),
          path: '/gonline',
          icon: Store,
          description: t('global.megaMenu.solutions.gOnlineDesc'),
        },
        {
          label: t('global.megaMenu.solutions.gOnlineLite'),
          path: '/gonline-lite',
          icon: Zap,
          description: t('global.megaMenu.solutions.gOnlineLiteDesc'),
        },
        {
          label: t('global.megaMenu.solutions.gKDS'),
          path: '/gkds',
          icon: Monitor,
          description: t('global.megaMenu.solutions.gKDSDesc'),
        },
        {
          label: t('global.megaMenu.solutions.gDispatch'),
          path: '/gdispatch',
          icon: TrendingUp,
          description: t('global.megaMenu.solutions.gDispatchDesc'),
        },
        {
          label: t('global.megaMenu.solutions.gData'),
          path: '/gdata',
          icon: Database,
          description: t('global.megaMenu.solutions.gDataDesc'),
        },
      ],
    },
    restaurants: {
      title: t('global.megaMenu.restaurants.title'),
      items: [
        {
          label: t('global.megaMenu.restaurants.independentSMEs'),
          path: '/persona/smbs',
          icon: Building2,
          description: t('global.megaMenu.restaurants.independentSMEsDesc'),
        },
        {
          label: t('global.megaMenu.restaurants.regionalChains'),
          path: '/persona/regional-chains',
          icon: Users,
          description: t('global.megaMenu.restaurants.regionalChainsDesc'),
        },
        {
          label: t('global.megaMenu.restaurants.globalBrands'),
          path: '/persona/global-chains',
          icon: Rocket,
          description: t('global.megaMenu.restaurants.globalBrandsDesc'),
        },
        {
          label: t('global.megaMenu.restaurants.darkKitchens'),
          path: '/persona/dark-kitchens',
          icon: ChefHat,
          description: t('global.megaMenu.restaurants.darkKitchensDesc'),
        },
      ],
    },
    resources: {
      title: t('global.megaMenu.resources.title'),
      items: [
        {
          label: t('global.megaMenu.resources.blog'),
          path: '/blog',
          icon: BookOpen,
          description: t('global.megaMenu.resources.blogDesc'),
        },
        {
          label: t('global.megaMenu.resources.knowledgeBase'),
          path: 'https://knowledge.grubtech.com/',
          icon: Database,
          description: t('global.megaMenu.resources.knowledgeBaseDesc'),
        },
      ],
    },
    company: {
      title: t('global.megaMenu.company.title'),
      items: [
        {
          label: t('global.megaMenu.company.aboutUs'),
          path: '/about',
          icon: Info,
          description: t('global.megaMenu.company.aboutUsDesc'),
        },
        {
          label: t('global.megaMenu.company.careers'),
          path: '/careers',
          icon: Briefcase,
          description: t('global.megaMenu.company.careersDesc'),
        },
      ],
    },
  };

  const data = menuData[type];
  const gridCols = type === 'solutions' ? 'grid-cols-2' : type === 'restaurants' ? 'grid-cols-2' : 'grid-cols-1';

  if (!shouldRender) return null;

  return (
    <div
      className={`absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden dropdown-container ${
        !prefersReducedMotion ? 'transition-all duration-200' : ''
      } ${
        isExiting ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
      }`}
      style={{
        minWidth: type === 'solutions' || type === 'restaurants' ? '500px' : '320px',
        animation: !isExiting && !prefersReducedMotion ? 'mega-menu-fade-in-down 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none',
      }}
    >
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {data.title}
        </h3>
        <div className={`grid ${gridCols} gap-3 items-stretch`}>
          {data.items.map((item, index) => {
            const Icon = 'icon' in item ? item.icon : undefined;
            const logo = 'logo' in item ? item.logo : undefined;
            const isExternal = item.path.startsWith('http');

            const content = (
              <div
                className={`group relative p-4 rounded-xl hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 ${
                  !prefersReducedMotion ? 'transition-all duration-300' : ''
                } border border-transparent hover:border-primary/20 h-full`}
                style={{
                  animation: !isExiting && !prefersReducedMotion ? `menu-item-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${index * 50}ms forwards` : 'none',
                  opacity: isExiting ? 0 : undefined,
                }}
              >
                <div className="flex items-start gap-3">
                  {(Icon !== undefined || logo !== undefined) && (
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 ${
                          !prefersReducedMotion ? 'transition-all duration-300' : ''
                        }`}
                        style={{
                          animation: !prefersReducedMotion ? `icon-float-small 2s ease-in-out infinite ${index * 0.2}s` : 'none',
                        }}
                      >
                        {logo ? (
                          <img src={String(logo)} alt={String(item.label)} className="w-6 h-6 object-contain" />
                        ) : Icon ? (
                          <Icon className={`w-5 h-5 text-primary group-hover:text-white ${!prefersReducedMotion ? 'transition-colors' : ''}`} />
                        ) : null}
                      </div>
                      {/* Floating particles */}
                      <div
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary/40"
                        style={{
                          animation: !prefersReducedMotion ? `particle-pulse 3s ease-in-out infinite ${index * 0.3}s` : 'none',
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className={`font-semibold text-text-primary group-hover:text-primary ${!prefersReducedMotion ? 'transition-colors' : ''} mb-1`}>
                      {item.label}
                    </h4>
                    {item.description && (
                      <p className={`text-xs text-gray-500 group-hover:text-gray-600 ${!prefersReducedMotion ? 'transition-colors' : ''}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                {/* Hover glow effect */}
                <div
                  className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 ${!prefersReducedMotion ? 'transition-opacity duration-300' : ''} pointer-events-none`}
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0, 168, 142, 0.05) 0%, transparent 70%)',
                  }}
                />
              </div>
            );

            return isExternal ? (
              <a
                key={item.label}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
              >
                {content}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.path}
                onClick={onClose}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl -z-10" />
    </div>
  );
};
