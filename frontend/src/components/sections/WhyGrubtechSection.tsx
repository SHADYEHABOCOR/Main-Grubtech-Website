import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Heart, Lock } from 'lucide-react';
import { Card } from '../ui/Card';
import { AnimatedElement } from '../ui/AnimatedElement';

const icons = [Globe, Heart, Lock];

export const WhyGrubtechSection: React.FC = () => {
  const { t } = useTranslation();
  const benefits = t('whyGrubtech.cards', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;

  return (
    <section className="bg-white py-12 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement
          as="h2"
          animation="fade-up"
          speed="fast"
          scrollTrigger
          once
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary text-center mb-12 md:mb-16 text-shadow-sm"
        >
          {t('whyGrubtech.title')}
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = icons[index];
            return (
              <AnimatedElement
                key={index}
                animation="fade-up"
                speed="fast"
                delay={index * 100}
                scrollTrigger
                once
              >
                <Card hoverable={false} className="text-center h-full">
                  <div className="flex flex-col items-center">
                    <Icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-xl font-bold text-text-primary mb-3 text-shadow-sm">{benefit.title}</h3>
                    <p className="text-text-secondary text-base leading-relaxed">{benefit.description}</p>
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
