import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../ui/AnimatedElement';
import { OptimizedImage } from '../ui/OptimizedImage';
import { FeaturesConfig } from '../../types/persona';

interface PersonaFeaturesSectionProps {
  /** Features section configuration */
  config: FeaturesConfig;
}

/**
 * PersonaFeaturesSection component - Renders the features section for persona pages.
 *
 * Features:
 * - Configurable image position (left or right)
 * - Configurable background color
 * - Title, subtitle, and feature items with arrow icons
 * - RTL support for arrow icons
 * - Animated elements with staggered delays
 * - Responsive grid layout
 * - Hover effects on feature items
 *
 * @example
 * <PersonaFeaturesSection
 *   config={{
 *     titleKey: 'personas.global.features.title',
 *     subtitleKey: 'personas.global.features.subtitle',
 *     itemsKey: 'personas.global.features.items',
 *     image: featuresImage,
 *     imageAlt: 'Enterprise Features',
 *     imagePosition: 'right',
 *     backgroundColor: 'white'
 *   }}
 * />
 */
export const PersonaFeaturesSection: React.FC<PersonaFeaturesSectionProps> = ({ config }) => {
  const { t } = useTranslation();

  // Get translated content
  const titleText = t(config.titleKey);
  const subtitleText = t(config.subtitleKey);
  const featureItems = t(config.itemsKey, { returnObjects: true }) as string[];

  // Determine background color class
  const getBackgroundClass = () => {
    switch (config.backgroundColor) {
      case 'white':
        return 'bg-white';
      case 'blue-light':
        return 'bg-background-blue-light';
      case 'gradient-blue':
        return 'bg-gradient-to-b from-background-blue-light to-white';
      case 'transparent':
        return 'bg-transparent';
      default:
        return 'bg-white';
    }
  };

  // Determine feature item styling based on background
  const getFeatureItemClass = () => {
    if (config.backgroundColor === 'blue-light') {
      return 'bg-white';
    }
    return 'bg-background-blue-light';
  };

  // Image component
  const imageElement = (
    <AnimatedElement
      animation={config.imagePosition === 'left' ? 'fade-right' : 'fade-left'}
      scrollTrigger
      once
      className="hidden lg:block"
    >
      <OptimizedImage
        src={config.image}
        alt={config.imageAlt}
        className="w-full rounded-2xl"
      />
    </AnimatedElement>
  );

  // Content component
  const contentElement = (
    <AnimatedElement
      animation={config.imagePosition === 'left' ? 'fade-left' : 'fade-right'}
      scrollTrigger
      once
    >
      <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
        {titleText}
      </h2>
      <p className="text-base text-gray-600 mb-8">
        {subtitleText}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {featureItems.map((feature, index) => (
          <AnimatedElement
            key={index}
            animation="fade-up"
            speed="fast"
            delay={index * 20}
            scrollTrigger
            once
            className={`flex items-center gap-3 p-4 ${getFeatureItemClass()} rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-white transition-colors duration-300`}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-primary rtl-mirror" />
            </div>
            <span className="text-sm font-medium text-gray-900">{feature}</span>
          </AnimatedElement>
        ))}
      </div>
    </AnimatedElement>
  );

  return (
    <section className={`py-16 md:py-24 ${getBackgroundClass()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {config.imagePosition === 'left' ? (
            <>
              {imageElement}
              {contentElement}
            </>
          ) : (
            <>
              {contentElement}
              {imageElement}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
