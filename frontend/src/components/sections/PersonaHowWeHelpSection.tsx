import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImageSlider } from '../ui/ImageSlider';
import { AnimatedElement } from '../ui/AnimatedElement';
import { HowWeHelpConfig, HowWeHelpSlide } from '../../types/persona';

interface PersonaHowWeHelpSectionProps {
  /** How We Help section configuration */
  config: HowWeHelpConfig;
}

/**
 * PersonaHowWeHelpSection component - Renders the "How We Help" section for persona pages.
 *
 * Features:
 * - ImageSlider with overlay content
 * - Section title and subtitle
 * - Configurable background color
 * - Auto-play functionality
 * - Slide titles and descriptions overlay
 *
 * @example
 * <PersonaHowWeHelpSection
 *   config={{
 *     titleKey: 'personas.global.howWeHelp.title',
 *     subtitleKey: 'personas.global.howWeHelp.subtitle',
 *     slidesKey: 'personas.global.howWeHelp.slides',
 *     slideImages: [slideImage1, slideImage2, slideImage3, slideImage4, slideImage5],
 *     backgroundColor: 'white',
 *     autoPlayInterval: 5000
 *   }}
 * />
 */
export const PersonaHowWeHelpSection: React.FC<PersonaHowWeHelpSectionProps> = ({ config }) => {
  const { t } = useTranslation();

  // Get translated content
  const titleText = t(config.titleKey);
  const subtitleText = t(config.subtitleKey);
  const slides = t(config.slidesKey, { returnObjects: true }) as HowWeHelpSlide[];

  // Combine slide images with translation data
  const howWeHelpSlides = config.slideImages.map((image, index) => ({
    image,
    title: slides[index]?.title || '',
    description: slides[index]?.description || '',
  }));

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
        return 'bg-white';
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
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitleText}
          </p>
        </AnimatedElement>

        <div className="h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
          <ImageSlider
            images={howWeHelpSlides.map(slide => slide.image)}
            autoPlayInterval={config.autoPlayInterval || 5000}
            showControls={false}
            overlays={howWeHelpSlides.map(slide => (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                <div className="p-8 md:p-12 text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">{slide.title}</h3>
                  <p className="text-lg md:text-xl text-white/90 max-w-2xl">{slide.description}</p>
                </div>
              </div>
            ))}
          />
        </div>
      </div>
    </section>
  );
};
