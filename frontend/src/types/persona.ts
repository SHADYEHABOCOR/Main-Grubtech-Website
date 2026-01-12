/**
 * TypeScript interfaces for Persona page configuration
 * Used by PersonaPageTemplate to render persona pages with consistent structure
 */

/**
 * SEO metadata configuration for persona pages
 */
export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
}

/**
 * Hero section configuration
 */
export interface HeroConfig {
  /** Translation key for badge text */
  badgeKey: string;
  /** Translation key for main headline */
  headlineKey: string;
  /** Translation key for subheading/description */
  subheadingKey: string;
  /** Translation key for primary CTA button */
  primaryCTAKey: string;
  /** Hero image source */
  heroImage: string;
  /** Hero image alt text */
  heroImageAlt: string;
  /** Optional secondary CTA configuration */
  secondaryCTA?: {
    /** Translation key for secondary CTA button text */
    labelKey: string;
    /** Link for secondary CTA button */
    link: string;
  };
}

/**
 * Single statistic item
 */
export interface Stat {
  value: string;
  label: string;
}

/**
 * Stats section configuration (optional section)
 */
export interface StatsConfig {
  /** Translation key for stats array */
  statsKey: string;
}

/**
 * Image position for sections with images
 */
export type ImagePosition = 'left' | 'right';

/**
 * Background color options for sections
 */
export type BackgroundColor =
  | 'white'
  | 'blue-light'
  | 'gradient-blue'
  | 'transparent';

/**
 * Challenges section configuration
 */
export interface ChallengesConfig {
  /** Translation key for section title */
  titleKey: string;
  /** Translation key for section subtitle */
  subtitleKey: string;
  /** Translation key for challenge items array */
  itemsKey: string;
  /** Challenge section image */
  image: string;
  /** Image alt text */
  imageAlt: string;
  /** Position of the image relative to content */
  imagePosition: ImagePosition;
  /** Background color for the section */
  backgroundColor?: BackgroundColor;
}

/**
 * Single slide in How We Help section
 */
export interface HowWeHelpSlide {
  image: string;
  title: string;
  description: string;
}

/**
 * How We Help section configuration
 */
export interface HowWeHelpConfig {
  /** Translation key for section title */
  titleKey: string;
  /** Translation key for section subtitle */
  subtitleKey: string;
  /** Translation key for slides array */
  slidesKey: string;
  /** Array of slide images */
  slideImages: string[];
  /** Background color for the section */
  backgroundColor?: BackgroundColor;
  /** Auto-play interval in milliseconds */
  autoPlayInterval?: number;
}

/**
 * Solutions section configuration
 */
export interface SolutionsConfig {
  /** Translation key for section title */
  titleKey: string;
  /** Translation key for solutions items array */
  itemsKey: string;
  /** Background color/gradient for the section */
  backgroundColor?: BackgroundColor;
}

/**
 * Features section configuration
 */
export interface FeaturesConfig {
  /** Translation key for section title */
  titleKey: string;
  /** Translation key for section subtitle */
  subtitleKey: string;
  /** Translation key for feature items array */
  itemsKey: string;
  /** Features section image */
  image: string;
  /** Image alt text */
  imageAlt: string;
  /** Position of the image relative to content */
  imagePosition: ImagePosition;
  /** Background color for the section */
  backgroundColor?: BackgroundColor;
}

/**
 * CTA section configuration
 */
export interface CTAConfig {
  /** Translation key for CTA title */
  titleKey: string;
  /** Translation key for CTA subtitle */
  subtitleKey: string;
  /** Translation key for primary CTA button text */
  primaryCTAKey: string;
  /** Link for primary CTA button */
  primaryCTALink: string;
  /** Translation key for secondary CTA button text */
  secondaryCTAKey: string;
  /** Link for secondary CTA button */
  secondaryCTALink: string;
}

/**
 * Complete persona page configuration
 * This is the main interface that defines all content and layout for a persona page
 */
export interface PersonaPageConfig {
  /** SEO metadata */
  seo: SEOConfig;
  /** Base translation key prefix (e.g., 'personas.global') */
  translationPrefix: string;
  /** Hero section configuration */
  hero: HeroConfig;
  /** Stats section configuration (optional) */
  stats?: StatsConfig;
  /** Challenges section configuration */
  challenges: ChallengesConfig;
  /** How We Help section configuration */
  howWeHelp: HowWeHelpConfig;
  /** Solutions section configuration */
  solutions: SolutionsConfig;
  /** Features section configuration */
  features: FeaturesConfig;
  /** CTA section configuration */
  cta: CTAConfig;
}
