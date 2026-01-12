import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../ui/AnimatedElement';

export const StatsSection: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    {
      value: t('homepage.stats.uptime'),
      label: t('homepage.stats.uptimeLabel'),
      description: t('homepage.stats.uptimeDescription'),
    },
    {
      value: t('homepage.stats.orders'),
      label: t('homepage.stats.ordersLabel'),
      description: t('homepage.stats.ordersDescription'),
    },
    {
      value: t('homepage.stats.partners'),
      label: t('homepage.stats.partnersLabel'),
      description: t('homepage.stats.partnersDescription'),
    },
  ];

  return (
    <section className="py-20 sm:py-24 md:py-32 bg-blue-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/60 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <AnimatedElement
              key={index}
              animation="fade-up"
              delay={index * 100}
              scrollTrigger
              once
              threshold={0.1}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full bg-white border border-gray-100 p-8 rounded-2xl shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-blue-500/10 transition-shadow duration-300 text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-600 mb-4">
                  {stat.value}
                </div>
                <div className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {stat.label}
                </div>
                <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {stat.description}
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
};
