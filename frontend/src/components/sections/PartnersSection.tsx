import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfiniteSlider } from '../ui/InfiniteSlider';
import { AnimatedElement } from '../ui/AnimatedElement';
import { OptimizedImage } from '../ui/OptimizedImage';

// Import logos
import burgerKing from '../../assets/logos/burger-king.svg';
import subway from '../../assets/logos/subway.svg';
import dominos from '../../assets/logos/dominos.svg';
import nandos from '../../assets/logos/nandos.svg';
import logo1 from '../../assets/logos/customer-logo-46.svg';
import logo2 from '../../assets/logos/customer-logo-14.svg';
import logo3 from '../../assets/logos/customer-logo-47.svg';
import logo4 from '../../assets/logos/customer-logo-9.svg';
import logo5 from '../../assets/logos/customer-logo-63.svg';
import logo6 from '../../assets/logos/customer-logo-60.svg';
import dodo from '../../assets/logos/dodo-pizza.svg';

const logos = [
  burgerKing,
  subway,
  dominos,
  nandos,
  logo1,
  logo2,
  logo3,
  logo4,
  logo5,
  logo6,
  dodo,
];

export const PartnersSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden relative border-b border-gray-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="text-center mb-10"
        >
          <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">
            {t('homepage.partners.title')}
          </p>
        </AnimatedElement>

        <AnimatedElement
          animation="scale-in"
          delay={100}
          scrollTrigger
          once
          className="relative w-full"
        >
          {/* Left gradient fade */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Right gradient fade */}
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Infinite scroll slider - always LTR */}
          <InfiniteSlider speed={80} direction="left" pauseOnHover={false}>
            {/* Duplicate logos array to ensure enough content for seamless loop */}
            {[...logos, ...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-16 h-10 md:w-20 md:h-12 flex items-center justify-center mx-4 md:mx-6"
              >
                {/* Partner logos with lazy loading - not LCP critical */}
                <OptimizedImage
                  src={logo}
                  alt={`Partner logo ${(index % logos.length) + 1}`}
                  width={80}
                  height={48}
                  className="max-w-full max-h-full object-contain grayscale opacity-60"
                  priority={false}
                />
              </div>
            ))}
          </InfiniteSlider>
        </AnimatedElement>
      </div>
    </section>
  );
};
