import React from 'react';
import { PersonaPageTemplate } from '../../components/templates';
import { PersonaPageConfig } from '../../types/persona';
import heroImage from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import slideImage1 from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import slideImage2 from '../../assets/images/67dc711cb7049fc8aa1b44b0_5.webp';
import slideImage3 from '../../assets/images/67e4f7769e2f66451a12fcf4_Group-781.webp';
import slideImage4 from '../../assets/images/67e3fc0d212d34c973c8916f_Group-499.webp';
import slideImage5 from '../../assets/images/67dd0fb05de09fb517d4c8b1_3PL.webp';
import challengesImage from '../../assets/images/67e4f77992b25496c5f2bac1_Group-801.webp';
import featuresImage from '../../assets/images/67e6566bf38258101582b959_Group-847.webp';

/**
 * GlobalChains persona page configuration
 * Uses PersonaPageTemplate with configuration for enterprise global restaurant chains
 */
const globalChainsConfig: PersonaPageConfig = {
  seo: {
    title: 'Enterprise Solutions for Global Restaurant Chains',
    description: 'Enterprise-grade restaurant management for global brands. Multi-region support, bank-level security, 99.9% uptime SLA, and dedicated enterprise support.',
    keywords: 'enterprise restaurant software, global restaurant chain, multi-country restaurant management, enterprise POS, restaurant enterprise solutions',
  },
  translationPrefix: 'personas.global',
  hero: {
    badgeKey: 'personas.global.hero.badge',
    headlineKey: 'personas.global.hero.headline',
    subheadingKey: 'personas.global.hero.subheading',
    primaryCTAKey: 'personas.global.hero.primaryCTA',
    heroImage: heroImage,
    heroImageAlt: 'Global Operations Dashboard',
    secondaryCTA: {
      labelKey: 'personas.global.hero.secondaryCTA',
      link: '/connect-with-us',
    },
  },
  stats: {
    statsKey: 'personas.global.stats',
  },
  challenges: {
    titleKey: 'personas.global.challenges.title',
    subtitleKey: 'personas.global.challenges.subtitle',
    itemsKey: 'personas.global.challenges.items',
    image: challengesImage,
    imageAlt: 'Global Operations',
    imagePosition: 'left',
    backgroundColor: 'blue-light',
  },
  howWeHelp: {
    titleKey: 'personas.global.howWeHelp.title',
    subtitleKey: 'personas.global.howWeHelp.subtitle',
    slidesKey: 'personas.global.howWeHelp.slides',
    slideImages: [slideImage1, slideImage2, slideImage3, slideImage4, slideImage5],
    backgroundColor: 'white',
    autoPlayInterval: 5000,
  },
  solutions: {
    titleKey: 'personas.global.solutions.title',
    itemsKey: 'personas.global.solutions.items',
    backgroundColor: 'gradient-blue',
  },
  features: {
    titleKey: 'personas.global.features.title',
    subtitleKey: 'personas.global.features.subtitle',
    itemsKey: 'personas.global.features.items',
    image: featuresImage,
    imageAlt: 'Enterprise Features',
    imagePosition: 'right',
    backgroundColor: 'white',
  },
  cta: {
    titleKey: 'personas.global.cta.title',
    subtitleKey: 'personas.global.cta.subtitle',
    primaryCTAKey: 'personas.global.cta.primaryCTA',
    primaryCTALink: '/connect-with-us',
    secondaryCTAKey: 'personas.global.cta.secondaryCTA',
    secondaryCTALink: '/connect-with-us',
  },
};

/**
 * GlobalChains persona page component
 * Renders enterprise-focused content for global restaurant chains
 */
export const GlobalChains: React.FC = () => {
  return <PersonaPageTemplate config={globalChainsConfig} />;
};
