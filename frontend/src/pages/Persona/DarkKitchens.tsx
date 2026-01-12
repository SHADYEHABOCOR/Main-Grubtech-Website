import React from 'react';
import { PersonaPageTemplate } from '../../components/templates';
import { PersonaPageConfig } from '../../types/persona';
import heroImage from '../../assets/images/67dc711be26f722ed5e512d0_2.webp';
import slideImage1 from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import slideImage2 from '../../assets/images/67dc7cfdb715a068a177ec7f_3.webp';
import slideImage3 from '../../assets/images/67dc711c8f07d9dd28e15139_4.webp';
import slideImage4 from '../../assets/images/67e3fc0d212d34c973c8916f_Group-499.webp';
import slideImage5 from '../../assets/images/67e4f7769e2f66451a12fcf4_Group-781.webp';
import challengesImage from '../../assets/images/67e6566bf38258101582b959_Group-847.webp';
import featuresImage from '../../assets/images/67e4f77992b25496c5f2bac1_Group-801.webp';

/**
 * DarkKitchens persona page configuration
 * Uses PersonaPageTemplate with configuration for dark kitchens and ghost kitchen operations
 */
const darkKitchensConfig: PersonaPageConfig = {
  seo: {
    title: 'Solutions for Dark Kitchens & Ghost Kitchens',
    description: 'Power your dark kitchen or ghost kitchen operations. Manage multiple virtual brands, optimize delivery, and maximize kitchen efficiency from one platform.',
    keywords: 'dark kitchen software, ghost kitchen management, virtual restaurant brands, cloud kitchen technology, delivery-only restaurant, virtual kitchen platform',
  },
  translationPrefix: 'personas.darkKitchens',
  hero: {
    badgeKey: 'personas.darkKitchens.hero.badge',
    headlineKey: 'personas.darkKitchens.hero.headline',
    subheadingKey: 'personas.darkKitchens.hero.subheading',
    primaryCTAKey: 'personas.darkKitchens.hero.primaryCTA',
    heroImage: heroImage,
    heroImageAlt: 'Multi-Brand Dashboard',
    secondaryCTA: {
      labelKey: 'personas.darkKitchens.hero.secondaryCTA',
      link: '/solutions/gonline',
    },
  },
  stats: {
    statsKey: 'personas.darkKitchens.stats',
  },
  challenges: {
    titleKey: 'personas.darkKitchens.challenges.title',
    subtitleKey: 'personas.darkKitchens.challenges.subtitle',
    itemsKey: 'personas.darkKitchens.challenges.items',
    image: challengesImage,
    imageAlt: 'Dark Kitchen Operations',
    imagePosition: 'left',
    backgroundColor: 'blue-light',
  },
  howWeHelp: {
    titleKey: 'personas.darkKitchens.howWeHelp.title',
    subtitleKey: 'personas.darkKitchens.howWeHelp.subtitle',
    slidesKey: 'personas.darkKitchens.howWeHelp.slides',
    slideImages: [slideImage1, slideImage2, slideImage3, slideImage4, slideImage5],
    backgroundColor: 'white',
    autoPlayInterval: 5000,
  },
  solutions: {
    titleKey: 'personas.darkKitchens.solutions.title',
    itemsKey: 'personas.darkKitchens.solutions.items',
    backgroundColor: 'gradient-blue',
  },
  features: {
    titleKey: 'personas.darkKitchens.features.title',
    subtitleKey: 'personas.darkKitchens.features.subtitle',
    itemsKey: 'personas.darkKitchens.features.items',
    image: featuresImage,
    imageAlt: 'Virtual Brand Features',
    imagePosition: 'right',
    backgroundColor: 'white',
  },
  cta: {
    titleKey: 'personas.darkKitchens.cta.title',
    subtitleKey: 'personas.darkKitchens.cta.subtitle',
    primaryCTAKey: 'personas.darkKitchens.cta.primaryCTA',
    primaryCTALink: '/connect-with-us',
    secondaryCTAKey: 'personas.darkKitchens.cta.secondaryCTA',
    secondaryCTALink: '/connect-with-us',
  },
};

/**
 * DarkKitchens persona page component
 * Renders content for dark kitchen and ghost kitchen operations
 */
export const DarkKitchens: React.FC = () => {
  return <PersonaPageTemplate config={darkKitchensConfig} />;
};
