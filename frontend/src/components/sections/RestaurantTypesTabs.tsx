import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Store, Users, Globe, Cloud, Check, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackgroundLines } from '../ui/BackgroundLines';
import { PillTabs } from '../ui/PillTabs';
import { AnimatedElement } from '../ui/AnimatedElement';

// Import local images
import smbsImage from '../../assets/images/67dc711c8f07d9dd28e15139_4.webp';
import regionalImage from '../../assets/images/67dc711cb7049fc8aa1b44b0_5.webp';
import globalImage from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import darkKitchensImage from '../../assets/images/67dc711be26f722ed5e512d0_2.webp';

interface TabContent {
  id: string;
  icon: React.ReactNode;
  title: string;
  heading: string;
  description: string;
  features: string[];
  link: string;
  image: string;
}

export const RestaurantTypesTabs: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const restaurantTypesData = t('restaurantTypes.tabs', { returnObjects: true }) as Array<{
    id: string;
    title: string;
    heading: string;
    description: string;
    features: string[];
  }>;

  const tabs: TabContent[] = restaurantTypesData.map((tab) => {
    const icons: Record<string, React.ReactNode> = {
      smbs: <Store className="w-5 h-5" />,
      regional: <Users className="w-5 h-5" />,
      global: <Globe className="w-5 h-5" />,
      'dark-kitchens': <Cloud className="w-5 h-5" />,
    };

    const images: Record<string, string> = {
      smbs: smbsImage,
      regional: regionalImage,
      global: globalImage,
      'dark-kitchens': darkKitchensImage,
    };

    const linkPaths: Record<string, string> = {
      smbs: '/persona/smbs',
      regional: '/persona/regional-chains',
      global: '/persona/global-chains',
      'dark-kitchens': '/persona/dark-kitchens',
    };

    return {
      ...tab,
      icon: icons[tab.id],
      link: linkPaths[tab.id] || `/persona/${tab.id}`,
      image: images[tab.id],
    };
  });

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % tabs.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + tabs.length) % tabs.length);
  };

  const currentTab = tabs[currentIndex];

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
      <BackgroundLines />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="text-center mb-12 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {t('restaurantTypes.title', 'One system. Every restaurant setup.')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('restaurantTypes.subtitle', 'Built to run single locations, multi-outlet brands, and delivery-first operations — without losing control.')}
          </p>
        </AnimatedElement>

        {/* Tabs - Hidden on mobile */}
        <div className="hidden md:flex justify-center mb-12">
          <PillTabs
            tabs={tabs.map((tab) => ({
              key: tab.id,
              label: tab.title,
              icon: tab.icon,
            }))}
            activeKey={tabs[currentIndex].id}
            onChange={(key) => {
              const index = tabs.findIndex((t) => t.id === key);
              if (index !== -1) setCurrentIndex(index);
            }}
          />
        </div>

        {/* Tab Content - Show current only, no stacked grid */}
        <AnimatedElement
          animation="fade-up"
          delay={100}
          scrollTrigger
          once
          className="relative"
        >
          <div
            className="bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl sm:shadow-2xl shadow-gray-200/50"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[400px] sm:min-h-[500px] h-full">
              {/* Left: Text Content */}
              <div className="p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 lg:order-1 relative">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 rounded-full w-fit mb-4 sm:mb-6 border border-blue-100">
                  {React.cloneElement(currentTab.icon as React.ReactElement, { className: "w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" })}
                  <span className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wide">{currentTab.title}</span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  {currentTab.heading}
                </h3>

                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  {currentTab.description}
                </p>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {currentTab.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" strokeWidth={2.5} />
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 font-medium">{feature}</p>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/${i18n.language}${currentTab.link}`}
                  className="inline-flex items-center gap-2 text-blue-600 font-bold text-base sm:text-lg hover:gap-3 transition-all group"
                >
                  <span>{t('restaurantTypes.readMore')}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform rtl-mirror" />
                </Link>
              </div>

              {/* Right: Image */}
              <div className="bg-gray-50 p-4 sm:p-8 md:p-12 lg:p-16 flex items-center justify-center order-1 lg:order-2 border-l border-gray-100 h-full">
                <div className="relative w-full h-full min-h-[200px] sm:min-h-[300px] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={currentTab.image}
                    alt={currentTab.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation - Force LTR for consistent arrow direction */}
          <div className="flex items-center justify-between mt-8 md:mt-12" dir="ltr">
            {/* Dots */}
            <div className="flex gap-2">
              {tabs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-gray-200 hover:bg-gray-300'
                    }`}
                  aria-label={`Go to restaurant type ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-3">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 group shadow-sm"
                aria-label="Previous restaurant type"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </button>
              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 group shadow-sm"
                aria-label="Next restaurant type"
              >
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};
