import React, { memo, useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Store, Globe2, Clock, Users } from 'lucide-react';
import { AnimatedElement } from '../ui/AnimatedElement';
// Direct import for LCP optimization - HeroDashboard is above-the-fold critical content
import { HeroDashboard } from './HeroDashboard';

// Memoize to prevent unnecessary re-renders
export const HeroSection: React.FC = memo(() => {
  const { t, i18n } = useTranslation();
  const [avgDeliveryTime, setAvgDeliveryTime] = useState(28);
  const [satisfactionRate, setSatisfactionRate] = useState(98);

  useEffect(() => {
    const interval = setInterval(() => {
      // Batch state updates to prevent multiple re-renders
      window.requestAnimationFrame(() => {
        setAvgDeliveryTime(Math.floor(Math.random() * 5) + 26);
        setSatisfactionRate(Math.floor(Math.random() * 3) + 97);
      });
    }, 5000); // Increased from 3s to 5s to reduce re-render frequency
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-0 lg:pt-48 overflow-hidden flex flex-col justify-center bg-[#F8FAFC] rounded-b-[4rem] border-b border-gray-200 shadow-sm">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left side - Text content */}
          <AnimatedElement
            animation="fade-up"
            className="space-y-8 text-center lg:text-left"
          >
            {/* No delay on headline - critical for LCP */}
            <h1 className="font-bold leading-[1.1] tracking-tight">
              <span className="block text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-2">
                {t('homepage.hero.headlinePart1', 'One system runs')}
              </span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl text-blue-600 pb-4">
                {t('homepage.hero.headlinePart2', 'your restaurant.')}
              </span>
            </h1>

            <AnimatedElement
              as="p"
              animation="fade-up"
              delay={100}
              className="text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              {t('homepage.hero.subheading')}
            </AnimatedElement>

            <AnimatedElement
              animation="fade-up"
              delay={200}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              <Link to={`/${i18n.language}/connect-with-us`}>
                <Button variant="primary" size="lg" className="shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-shadow duration-300">
                  {t('homepage.hero.primaryCTA')}
                </Button>
              </Link>
              <Link to={`/${i18n.language}/solutions/gonline`}>
                <Button variant="outline-dark" size="lg" className="bg-white/50 backdrop-blur-sm hover:bg-white transition-colors duration-300">
                  {t('homepage.hero.secondaryCTA')}
                </Button>
              </Link>
            </AnimatedElement>
          </AnimatedElement>

          {/* Right side - Dashboard */}
          <AnimatedElement
            animation="fade-right"
            speed="slow"
            delay={100}
            className="relative"
          >
            <div className="relative rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 p-2 shadow-2xl shadow-blue-500/10">
              <HeroDashboard />
            </div>
          </AnimatedElement>
        </div>
      </div>

      {/* Stats Row - Clean white cards */}
      <div className="hidden md:flex justify-center gap-6 mt-20 lg:mt-28">
        {[
          { icon: Store, label: t('homepage.stats.restaurantsLabel'), value: t('homepage.stats.restaurants'), desc: t('homepage.stats.restaurantsDescription') },
          { icon: Globe2, label: t('homepage.stats.coverageLabel'), value: t('homepage.stats.coverage'), desc: t('homepage.stats.coverageDescription') },
          { icon: Clock, label: t('homepage.stats.deliveryLabel'), value: avgDeliveryTime, suffix: ' min', desc: t('homepage.stats.deliveryDescription') },
          { icon: Users, label: t('homepage.stats.satisfactionLabel'), value: satisfactionRate, suffix: '%', desc: t('homepage.stats.satisfactionDescription') },
        ].map((stat, i) => (
          <AnimatedElement
            key={i}
            animation="fade-up"
            delay={500 + i * 100}
            className="group px-8 pt-12 pb-10 rounded-t-3xl rounded-b-none bg-white shadow-xl shadow-gray-200/50 border border-gray-100 border-b-0 min-h-[200px] min-w-[200px] flex flex-col hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-[transform,background-color] duration-300">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight text-center">{stat.label}</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <div className="text-3xl font-bold text-gray-900 font-mono tracking-tight">
                {stat.value}{stat.suffix || ''}
              </div>
              <div className="text-sm text-gray-500 mt-2 leading-relaxed">{stat.desc}</div>
            </div>
          </AnimatedElement>
        ))}
      </div>
    </section>
  );
});
