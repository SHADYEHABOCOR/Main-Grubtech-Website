import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, BarChart3, Users, Truck } from 'lucide-react';
import { Card } from '../ui/Card';
import { AnimatedElement } from '../ui/AnimatedElement';

const icons = [Zap, BarChart3, Users, Truck];

export const ProblemsSection: React.FC = () => {
  const { t } = useTranslation();
  const problems = t('problems.cards', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;

  return (
    <section className="py-12 md:py-20 lg:py-24" aria-labelledby="problems-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement
          as="h2"
          id="problems-heading"
          animation="fade-up"
          scrollTrigger
          once
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-10 md:mb-14 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300"
        >
          {t('problems.title')}
        </AnimatedElement>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
          {problems.map((problem, index) => {
            const Icon = icons[index];
            return (
              <AnimatedElement
                key={index}
                className="h-full"
                animation="fade-up"
                delay={index * 80}
                scrollTrigger
                once
              >
                <Card className="bg-[rgba(255,255,255,0.04)] backdrop-blur-sm border border-white/6 p-6 hover:shadow-2xl transition-shadow duration-300 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="rounded-full p-3 bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_6px_20px_rgba(56,189,248,0.12)]">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white/95">{problem.title}</h3>
                  </div>

                  <p className="text-sm md:text-base text-white/75 leading-relaxed mt-1">{problem.description}</p>
                  <div className="mt-6">
                    <span className="inline-flex items-center text-sm text-cyan-300 font-medium">
                      {t('common.learn_more') || 'Learn more'}
                      <svg
                        className="ml-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </Card>
              </AnimatedElement>
            );
          })}
        </div>
      </div>
    </section>
  );
};
