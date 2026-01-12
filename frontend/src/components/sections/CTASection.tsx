import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { AnimatedElement } from '../ui/AnimatedElement';

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  title,
  subtitle,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
}) => {
  const { t, i18n } = useTranslation();

  const finalTitle = title || t('cta.headline', 'One system. Full control.');
  const finalSubtitle = subtitle || t('cta.subheading', 'Everything your restaurant runs on — orders, kitchens, deliveries, and data — in one place.');
  const finalPrimaryText = primaryButtonText || t('cta.button', 'Talk To Us');
  const finalPrimaryLink = primaryButtonLink || `/${i18n.language}/connect-with-us`;
  const finalSecondaryText = secondaryButtonText || t('cta.secondaryButton', 'Explore Solutions');
  const finalSecondaryLink = secondaryButtonLink || `/${i18n.language}/solutions/gonline`;

  return (
    <section className="py-10 md:py-16 bg-background-blue-light">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="bg-blue-800 rounded-3xl md:rounded-[2.5rem] relative overflow-hidden py-12 md:py-16 px-6 sm:px-12 lg:px-16"
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-700/50 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/30 rounded-full blur-3xl" />
          </div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <AnimatedElement
              as="h2"
              animation="fade-up"
              speed="fast"
              delay={100}
              scrollTrigger
              once
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
            >
              {finalTitle}
            </AnimatedElement>
            <AnimatedElement
              as="p"
              animation="fade-up"
              speed="fast"
              delay={200}
              scrollTrigger
              once
              className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10"
            >
              {finalSubtitle}
            </AnimatedElement>

            <AnimatedElement
              animation="fade-up"
              speed="fast"
              delay={300}
              scrollTrigger
              once
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to={finalPrimaryLink}>
                <Button
                  variant="white"
                  size="lg"
                  className="px-8 py-3"
                >
                  {finalPrimaryText}
                </Button>
              </Link>
              {secondaryButtonText && (
                <Link to={finalSecondaryLink}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 border-white text-white hover:bg-white hover:text-blue-900"
                  >
                    {finalSecondaryText}
                  </Button>
                </Link>
              )}
            </AnimatedElement>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};
