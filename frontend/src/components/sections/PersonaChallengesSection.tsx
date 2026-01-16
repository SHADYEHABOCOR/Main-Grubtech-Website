import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../ui/AnimatedElement';
import { OptimizedImage } from '../ui/OptimizedImage';
import { ChallengesConfig } from '../../types/persona';

interface PersonaChallengesSectionProps {
  /** Challenges section configuration */
  config: ChallengesConfig;
}

/**
 * PersonaChallengesSection component - Renders the challenges section for persona pages.
 *
 * Features:
 * - Configurable image position (left or right)
 * - Configurable background color
 * - Title, subtitle, and challenge items with check icons
 * - Animated elements with staggered delays
 * - Responsive grid layout
 * - Hover effects on challenge items
 *
 * @example
 * <PersonaChallengesSection
 *   config={{
 *     titleKey: 'personas.global.challenges.title',
 *     subtitleKey: 'personas.global.challenges.subtitle',
 *     itemsKey: 'personas.global.challenges.items',
 *     image: challengesImage,
 *     imageAlt: 'Global Operations',
 *     imagePosition: 'left',
 *     backgroundColor: 'blue-light'
 *   }}
 * />
 */
export const PersonaChallengesSection: React.FC<PersonaChallengesSectionProps> = ({ config }) => {
  const { t } = useTranslation();

  // Get translated content
  const titleText = t(config.titleKey);
  const subtitleText = t(config.subtitleKey);
  const challengeItems = t(config.itemsKey, { returnObjects: true }) as string[];

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
        return 'bg-background-blue-light';
    }
  };

  // Determine challenge item styling based on background
  const getChallengeItemClass = () => {
    if (config.backgroundColor === 'white') {
      return 'bg-background-blue-light hover:bg-white';
    }
    return 'bg-white';
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

  // Content component (challenges grid only)
  const contentElement = (
    <AnimatedElement
      animation={config.imagePosition === 'left' ? 'fade-left' : 'fade-right'}
      scrollTrigger
      once
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {challengeItems.map((challenge, index) => (
          <AnimatedElement
            key={index}
            animation="fade-up"
            speed="fast"
            delay={index * 30}
            scrollTrigger
            once
            className={`flex items-center gap-3 p-4 ${getChallengeItemClass()} rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-300`}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm font-medium text-gray-900">{challenge}</span>
          </AnimatedElement>
        ))}
      </div>
    </AnimatedElement>
  );

  return (
    <section className={`py-16 md:py-24 ${getBackgroundClass()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered title and subtitle */}
        <AnimatedElement animation="fade-up" scrollTrigger once className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            {titleText}
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {subtitleText}
          </p>
        </AnimatedElement>

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
