import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../ui/AnimatedElement';
import { Card } from '../ui/Card';
import { SolutionsConfig } from '../../types/persona';

interface PersonaSolutionsSectionProps {
  /** Solutions section configuration */
  config: SolutionsConfig;
}

/**
 * Solution item structure
 */
interface SolutionItem {
  title: string;
  description: string;
}

/**
 * PersonaSolutionsSection component - Renders the solutions grid for persona pages.
 *
 * Features:
 * - Configurable background gradient
 * - Centered section title
 * - Responsive grid layout (1 column on mobile, 2 on desktop)
 * - Card components for each solution
 * - Animated elements with staggered delays
 *
 * @example
 * <PersonaSolutionsSection
 *   config={{
 *     titleKey: 'personas.global.solutions.title',
 *     itemsKey: 'personas.global.solutions.items',
 *     backgroundColor: 'gradient-blue'
 *   }}
 * />
 */
export const PersonaSolutionsSection: React.FC<PersonaSolutionsSectionProps> = ({ config }) => {
  const { t } = useTranslation();

  // Get translated content
  const titleText = t(config.titleKey);
  const solutionItems = t(config.itemsKey, { returnObjects: true }) as SolutionItem[];

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
        return 'bg-gradient-to-b from-background-blue-light to-white';
    }
  };

  return (
    <section className={`py-16 md:py-24 ${getBackgroundClass()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-shadow-sm">
            {titleText}
          </h2>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutionItems.map((solution, index) => (
            <AnimatedElement
              key={index}
              animation="fade-up"
              delay={index * 50}
              scrollTrigger
              once
              className="h-full"
            >
              <Card className="h-full text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{solution.title}</h3>
                <p className="text-gray-600">{solution.description}</p>
              </Card>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
};
