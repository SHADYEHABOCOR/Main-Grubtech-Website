import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { PillTabs } from '../ui/PillTabs';
import { BackgroundLines } from '../ui/BackgroundLines';
import { AnimatedElement } from '../ui/AnimatedElement';
import gOnlineImage from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import gOnlineLiteImage from '../../assets/images/67dc711be26f722ed5e512d0_2.webp';
import gKDSImage from '../../assets/images/67dc7cfdb715a068a177ec7f_3.webp';
import gDispatchImage from '../../assets/images/67dc711c8f07d9dd28e15139_4.webp';
import { GOnlineDashboard } from '../dashboards/GOnlineDashboard';
import { GOnlineLiteDashboard } from '../dashboards/GOnlineLiteDashboard';
import { GKDSDashboard } from '../dashboards/GKDSDashboard';
import { GDispatchDashboard } from '../dashboards/GDispatchDashboard';

export const SolutionsSection: React.FC = () => {
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

  const solutions = [
    {
      key: 'gOnline',
      image: gOnlineImage,
      link: '/solutions/gonline',
      Dashboard: GOnlineDashboard,
    },
    {
      key: 'gOnlineLite',
      image: gOnlineLiteImage,
      link: '/solutions/gonline-lite',
      Dashboard: GOnlineLiteDashboard,
    },
    {
      key: 'gKDS',
      image: gKDSImage,
      link: '/solutions/gkds',
      Dashboard: GKDSDashboard,
    },
    {
      key: 'gDispatch',
      image: gDispatchImage,
      link: '/solutions/gdispatch',
      Dashboard: GDispatchDashboard,
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % solutions.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + solutions.length) % solutions.length);
  };

  const currentSolution = solutions[currentIndex];
  const data = t(`solutions.${currentSolution.key}`, { returnObjects: true }) as {
    title: string;
    description: string;
    features: string[];
    cta: string;
  };

  return (
    <section className="py-24 lg:py-32 bg-white overflow-hidden relative">
      <BackgroundLines />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="text-center mb-12 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {t('homepage.solutions.title', 'Our')} <span className="text-blue-600">{t('homepage.solutions.titleHighlight', 'Solutions')}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('homepage.solutions.subtitle', 'Powerful tools designed to streamline every aspect of your restaurant operations — from ordering to delivery.')}
          </p>
        </AnimatedElement>

        {/* Solution Tabs - Hidden on mobile */}
        <div className="hidden md:flex justify-center mb-12">
          <PillTabs
            tabs={solutions.map((solution) => {
              const tabData = t(`solutions.${solution.key}`, { returnObjects: true }) as { title: string };
              return { key: solution.key, label: tabData.title };
            })}
            activeKey={solutions[currentIndex].key}
            onChange={(key) => {
              const index = solutions.findIndex((s) => s.key === key);
              if (index !== -1) setCurrentIndex(index);
            }}
          />
        </div>

        {/* Current Solution Content - No stacked grid, just show current */}
        <AnimatedElement
          animation="fade-up"
          delay={100}
          scrollTrigger
          once
          className="relative"
        >
          <div
            className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[500px] h-full">
              {/* Left: Text Content */}
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 lg:order-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-transparent -z-10" />

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {data.title}
                </h3>
                <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed">
                  {data.description}
                </p>
                <ul className="space-y-4 mb-8">
                  {data.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.5} />
                      </div>
                      <span className="text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/${i18n.language}${currentSolution.link}`}
                  className="inline-flex items-center gap-2 text-blue-600 font-semibold text-lg hover:gap-3 transition-all group"
                >
                  <span>{data.cta}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl-mirror" />
                </Link>
              </div>

              {/* Right: Dashboard Preview */}
              <div className="bg-gray-50 p-8 md:p-12 lg:p-16 flex items-center justify-center order-1 lg:order-2 border-l border-gray-100 h-full">
                <div className="w-full max-w-lg">
                  {currentSolution.Dashboard && <currentSolution.Dashboard />}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation - Force LTR for consistent arrow direction */}
          <div className="flex items-center justify-between mt-8 md:mt-12" dir="ltr">
            {/* Dots */}
            <div className="flex gap-2">
              {solutions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-gray-200 hover:bg-gray-300'
                    }`}
                  aria-label={`Go to solution ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-3">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 group shadow-sm"
                aria-label="Previous solution"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </button>
              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 group shadow-sm"
                aria-label="Next solution"
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
