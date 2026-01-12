import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScrollIndicator } from '../ui/ScrollIndicator';
import { OptimizedImage } from '../ui/OptimizedImage';
import { AnimatedElement } from '../ui/AnimatedElement';
import { HeroConfig } from '../../types/persona';

interface PersonaHeroSectionProps {
  /** Hero section configuration */
  config: HeroConfig;
}

/**
 * PersonaHeroSection component - Renders the hero section for persona pages.
 *
 * Features:
 * - Badge, headline, subheading display
 * - Primary CTA button (required)
 * - Optional secondary CTA button with configurable link
 * - Hero image with animations
 * - Decorative gradient backgrounds
 * - ScrollIndicator
 *
 * @example
 * <PersonaHeroSection
 *   config={{
 *     badgeKey: 'personas.global.hero.badge',
 *     headlineKey: 'personas.global.hero.headline',
 *     subheadingKey: 'personas.global.hero.subheading',
 *     primaryCTAKey: 'personas.global.hero.primaryCTA',
 *     heroImage: heroImage,
 *     heroImageAlt: 'Global Operations Dashboard',
 *     secondaryCTA: {
 *       labelKey: 'personas.global.hero.secondaryCTA',
 *       link: '/connect-with-us'
 *     }
 *   }}
 * />
 */
export const PersonaHeroSection: React.FC<PersonaHeroSectionProps> = ({ config }) => {
  const { t, i18n } = useTranslation();

  // Get translated content
  const badgeText = t(config.badgeKey);
  const headlineText = t(config.headlineKey);
  const subheadingText = t(config.subheadingKey);
  const primaryCTAText = t(config.primaryCTAKey);
  const secondaryCTAText = config.secondaryCTA ? t(config.secondaryCTA.labelKey) : '';

  return (
    <section className="relative min-h-screen flex items-center bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50">
      {/* Light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimatedElement
            animation="fade-up"
            className="text-center lg:text-left"
          >
            <Badge variant="primary" className="mb-4">
              {badgeText}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {headlineText}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              {subheadingText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to={`/${i18n.language}/connect-with-us`}>
                <Button variant="primary" size="lg">
                  {primaryCTAText}
                </Button>
              </Link>
              {config.secondaryCTA && (
                <Link to={`/${i18n.language}${config.secondaryCTA.link}`}>
                  <Button variant="outline" size="lg" className="!border-blue-600 !text-blue-600 !bg-transparent hover:!bg-blue-600 hover:!text-white">
                    {secondaryCTAText}
                  </Button>
                </Link>
              )}
            </div>
          </AnimatedElement>

          <AnimatedElement
            animation="fade-left"
            delay={100}
            className="hidden lg:block relative"
          >
            {/* Subtle glow behind image */}
            <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <OptimizedImage
                src={config.heroImage}
                alt={config.heroImageAlt}
                className="w-full h-full object-cover"
                priority={true}
              />
            </div>
          </AnimatedElement>
        </div>
      </div>
      <ScrollIndicator />
    </section>
  );
};
