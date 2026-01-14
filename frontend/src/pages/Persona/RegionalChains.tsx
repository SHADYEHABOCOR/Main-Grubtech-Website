import React from 'react';
import { PersonaPageTemplate } from '../../components/templates';
import { PersonaPageConfig } from '../../types/persona';
import heroImage from '../../assets/images/regional-chains.webp';
import slideImage1 from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import slideImage2 from '../../assets/images/regional-chains.webp';
import slideImage3 from '../../assets/images/regional-chains.webp';
import slideImage4 from '../../assets/images/67e3fc0d212d34c973c8916f_Group-499.webp';
import slideImage5 from '../../assets/images/67e4f7769e2f66451a12fcf4_Group-781.webp';
import challengesImage from '../../assets/images/integrations-diagram.png';
import featuresImage from '../../assets/images/67e6566bf38258101582b959_Group-847.webp';

/**
 * RegionalChains persona page configuration
 * Uses PersonaPageTemplate with configuration for regional restaurant chains
 */
const regionalChainsConfig: PersonaPageConfig = {
  seo: {
    title: 'Solutions for Regional Restaurant Chains',
    description: 'Scale your regional restaurant chain with centralized management. Control multiple locations, standardize operations, and drive growth across your network.',
    keywords: 'regional restaurant chain, multi-location restaurant, franchise management, restaurant chain software, centralized restaurant management',
  },
  translationPrefix: 'personas.regional',
  hero: {
    badgeKey: 'personas.regional.hero.badge',
    headlineKey: 'personas.regional.hero.headline',
    subheadingKey: 'personas.regional.hero.subheading',
    primaryCTAKey: 'personas.regional.hero.primaryCTA',
    heroImage: heroImage,
    heroImageAlt: 'Multi-Location Dashboard',
    secondaryCTA: {
      labelKey: 'personas.regional.hero.secondaryCTA',
      link: '/blog',
    },
  },
  challenges: {
    titleKey: 'personas.regional.challenges.title',
    subtitleKey: 'personas.regional.challenges.subtitle',
    itemsKey: 'personas.regional.challenges.items',
    image: challengesImage,
    imageAlt: 'Multi-Location Management',
    imagePosition: 'left',
    backgroundColor: 'white',
  },
  howWeHelp: {
    titleKey: 'personas.regional.howWeHelp.title',
    subtitleKey: 'personas.regional.howWeHelp.subtitle',
    slidesKey: 'personas.regional.howWeHelp.slides',
    slideImages: [slideImage1, slideImage2, slideImage3, slideImage4, slideImage5],
    backgroundColor: 'gradient-blue',
    autoPlayInterval: 5000,
  },
  solutions: {
    titleKey: 'personas.regional.solutions.title',
    itemsKey: 'personas.regional.solutions.items',
    backgroundColor: 'white',
  },
  features: {
    titleKey: 'personas.regional.features.title',
    subtitleKey: 'personas.regional.features.subtitle',
    itemsKey: 'personas.regional.features.items',
    image: featuresImage,
    imageAlt: 'Platform Features',
    imagePosition: 'left',
    backgroundColor: 'blue-light',
  },
  cta: {
    titleKey: 'personas.regional.cta.title',
    subtitleKey: 'personas.regional.cta.subtitle',
    primaryCTAKey: 'personas.regional.cta.primaryCTA',
    primaryCTALink: '/connect-with-us',
    secondaryCTAKey: 'personas.regional.cta.secondaryCTA',
    secondaryCTALink: '/connect-with-us',
  },
};

/**
 * RegionalChains persona page component
 * Renders content for regional restaurant chains
 */
export const RegionalChains: React.FC = () => {
  return <PersonaPageTemplate config={regionalChainsConfig} />;
};
