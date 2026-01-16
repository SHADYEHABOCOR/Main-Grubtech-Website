import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../ui/AnimatedElement';

interface Benefit {
  title: string;
  description: string;
  features: string[];
  link?: string;
  image?: string;
}

interface BenefitsGridProps {
  benefits?: Benefit[];
}

export const BenefitsGrid: React.FC<BenefitsGridProps> = ({ benefits }) => {
  const { t } = useTranslation();

  const benefitsData: Benefit[] = benefits || (t('benefits.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    features: string[];
    image?: string;
  }>).map((item) => ({
    ...item,
    link: '/connect-with-us',
  }));

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            {t('benefits.title')}
          </h2>
        </AnimatedElement>

        <div className="space-y-12">
          {benefitsData.map((benefit, index) => {
            const isEven = index % 2 === 0;
            const hasImage = !!benefit.image;

            return (
              <AnimatedElement
                key={index}
                animation="fade-up"
                delay={index * 50}
                scrollTrigger
                once
              >
                <div className={`bg-background-blue-light rounded-2xl p-8 md:p-10 border border-gray-100 ${hasImage ? '' : 'max-w-4xl mx-auto'}`}>
                  <div className={`${hasImage ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center' : ''}`}>
                    {/* Image - shown first on even indexes (right side visually due to order) */}
                    {hasImage && (
                      <AnimatedElement
                        animation={isEven ? 'fade-left' : 'fade-right'}
                        delay={100}
                        scrollTrigger
                        once
                        className={`${isEven ? 'lg:order-2' : 'lg:order-1'}`}
                      >
                        <img
                          src={benefit.image}
                          alt={benefit.title}
                          className="w-full rounded-xl"
                        />
                      </AnimatedElement>
                    )}

                    {/* Content */}
                    <div className={hasImage ? (isEven ? 'lg:order-1' : 'lg:order-2') : ''}>
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-500 mb-6 leading-relaxed">
                        {benefit.description}
                      </p>
                      <div className={`grid grid-cols-1 ${hasImage ? '' : 'sm:grid-cols-2'} gap-3 mb-6`}>
                        {benefit.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm h-full"
                          >
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                              <Check className="w-3 h-3 text-primary" strokeWidth={2.5} />
                            </div>
                            <p className="text-sm text-gray-700">{feature}</p>
                          </div>
                        ))}
                      </div>
                      {benefit.link && (
                        <Link
                          to={benefit.link}
                          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:border-primary hover:text-primary transition-colors"
                        >
                          {t('benefits.cta')}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedElement>
            );
          })}
        </div>
      </div>
    </section>
  );
};
