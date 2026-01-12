import React from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../seo';
import { PersonaHeroSection } from '../sections/PersonaHeroSection';
import { PersonaStatsSection } from '../sections/PersonaStatsSection';
import { PersonaChallengesSection } from '../sections/PersonaChallengesSection';
import { PersonaHowWeHelpSection } from '../sections/PersonaHowWeHelpSection';
import { PersonaSolutionsSection } from '../sections/PersonaSolutionsSection';
import { PersonaFeaturesSection } from '../sections/PersonaFeaturesSection';
import { CTASection } from '../sections/CTASection';
import { PersonaPageConfig } from '../../types/persona';

interface PersonaPageTemplateProps {
  /** Complete persona page configuration */
  config: PersonaPageConfig;
}

/**
 * PersonaPageTemplate component - Main template for persona pages.
 *
 * This template orchestrates all persona page sections based on configuration,
 * rendering them in the correct order with proper props. It handles optional
 * sections (like stats) and maintains consistent styling across all persona pages.
 *
 * Features:
 * - SEO metadata configuration
 * - Hero section with badge, headline, CTAs
 * - Optional stats section
 * - Challenges section with configurable image position
 * - How We Help section with image slider
 * - Solutions grid section
 * - Features section with configurable image position
 * - CTA section
 *
 * @example
 * <PersonaPageTemplate config={globalChainsConfig} />
 */
export const PersonaPageTemplate: React.FC<PersonaPageTemplateProps> = ({ config }) => {
  const { t, i18n } = useTranslation();

  // Get CTA translations
  const ctaTitle = t(config.cta.titleKey);
  const ctaSubtitle = t(config.cta.subtitleKey);
  const ctaPrimaryText = t(config.cta.primaryCTAKey);
  const ctaSecondaryText = t(config.cta.secondaryCTAKey);

  return (
    <>
      <SEO
        title={config.seo.title}
        description={config.seo.description}
        keywords={config.seo.keywords}
      />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <PersonaHeroSection config={config.hero} />

        {/* Stats Section (Optional) */}
        {config.stats && <PersonaStatsSection config={config.stats} />}

        {/* Challenges Section */}
        <PersonaChallengesSection config={config.challenges} />

        {/* How We Help Section */}
        <PersonaHowWeHelpSection config={config.howWeHelp} />

        {/* Solutions Section */}
        <PersonaSolutionsSection config={config.solutions} />

        {/* Features Section */}
        <PersonaFeaturesSection config={config.features} />

        {/* CTA Section */}
        <CTASection
          title={ctaTitle}
          subtitle={ctaSubtitle}
          primaryButtonText={ctaPrimaryText}
          primaryButtonLink={`/${i18n.language}${config.cta.primaryCTALink}`}
          secondaryButtonText={ctaSecondaryText}
          secondaryButtonLink={`/${i18n.language}${config.cta.secondaryCTALink}`}
        />
      </div>
    </>
  );
};
