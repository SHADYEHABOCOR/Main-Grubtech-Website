import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../ui/AnimatedElement';
import { StatsConfig, Stat } from '../../types/persona';

interface PersonaStatsSectionProps {
  /** Stats section configuration */
  config: StatsConfig;
}

/**
 * PersonaStatsSection component - Renders the stats grid for persona pages.
 *
 * Features:
 * - Responsive grid layout (2 columns on mobile, 4 on desktop)
 * - Animated stat cards with staggered delays
 * - Hover effects on stat cards
 * - Displays 2-4 stats with value and label
 *
 * @example
 * <PersonaStatsSection
 *   config={{
 *     statsKey: 'personas.global.stats'
 *   }}
 * />
 */
export const PersonaStatsSection: React.FC<PersonaStatsSectionProps> = ({ config }) => {
  const { t } = useTranslation();

  // Get stats data from translations
  const statsData = t(config.statsKey, { returnObjects: true }) as Stat[];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <AnimatedElement
              key={index}
              animation="fade-up"
              delay={index * 50}
              scrollTrigger
              once
              className="text-center"
            >
              <div className="bg-background-blue-light rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                <div className="text-4xl md:text-5xl font-semibold text-primary mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
};
