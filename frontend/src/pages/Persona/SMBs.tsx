import React from 'react';
import { PersonaPageTemplate } from '../../components/templates';
import { PersonaPageConfig } from '../../types/persona';
import heroImage from '../../assets/images/67dc711c8f07d9dd28e15139_4.webp';
import slideImage1 from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import slideImage2 from '../../assets/images/67dc711be26f722ed5e512d0_2.webp';
import slideImage3 from '../../assets/images/67dc7cfdb715a068a177ec7f_3.webp';
import slideImage4 from '../../assets/images/67e4f77992b25496c5f2bac1_Group-801.webp';
import slideImage5 from '../../assets/images/67e6566bf38258101582b959_Group-847.webp';
import challengesImage from '../../assets/images/67e3fc0d212d34c973c8916f_Group-499.webp';
import featuresImage from '../../assets/images/67e4f7769e2f66451a12fcf4_Group-781.webp';

/**
 * SMBs persona page configuration
 * Uses PersonaPageTemplate with configuration for small and medium businesses
 */
const smbsConfig: PersonaPageConfig = {
  seo: {
    title: 'Solutions for SMBs & Independent Restaurants',
    description: 'Affordable restaurant technology for independent restaurants and small chains. Compete with big players using easy-to-use tools designed for your budget.',
    keywords: 'small restaurant technology, independent restaurant software, affordable POS, SMB restaurant solutions, small business restaurant management',
  },
  translationPrefix: 'personas.smbs',
  hero: {
    badgeKey: 'personas.smbs.hero.badge',
    headlineKey: 'personas.smbs.hero.headline',
    subheadingKey: 'personas.smbs.hero.subheading',
    primaryCTAKey: 'personas.smbs.hero.primaryCTA',
    heroImage: heroImage,
    heroImageAlt: 'Order Management Dashboard',
  },
  challenges: {
    titleKey: 'personas.smbs.challenges.title',
    subtitleKey: 'personas.smbs.challenges.subtitle',
    itemsKey: 'personas.smbs.challenges.items',
    image: challengesImage,
    imageAlt: 'Restaurant Challenges',
    imagePosition: 'left',
    backgroundColor: 'white',
  },
  howWeHelp: {
    titleKey: 'personas.smbs.howWeHelp.title',
    subtitleKey: 'personas.smbs.howWeHelp.subtitle',
    slidesKey: 'personas.smbs.howWeHelp.slides',
    slideImages: [slideImage1, slideImage2, slideImage3, slideImage4, slideImage5],
    backgroundColor: 'gradient-blue',
    autoPlayInterval: 5000,
  },
  solutions: {
    titleKey: 'personas.smbs.solutions.title',
    itemsKey: 'personas.smbs.solutions.items',
    backgroundColor: 'white',
  },
  features: {
    titleKey: 'personas.smbs.features.title',
    subtitleKey: 'personas.smbs.features.subtitle',
    itemsKey: 'personas.smbs.features.items',
    image: featuresImage,
    imageAlt: 'Platform Features',
    imagePosition: 'left',
    backgroundColor: 'blue-light',
  },
  cta: {
    titleKey: 'personas.smbs.cta.title',
    subtitleKey: 'personas.smbs.cta.subtitle',
    primaryCTAKey: 'personas.smbs.cta.primaryCTA',
    primaryCTALink: '/connect-with-us',
    secondaryCTAKey: 'personas.smbs.cta.secondaryCTA',
    secondaryCTALink: '/connect-with-us',
  },
};

/**
 * SMBs persona page component
 * Renders content for small and medium businesses and independent restaurants
 */
export const SMBs: React.FC = () => {
  return <PersonaPageTemplate config={smbsConfig} />;
};
