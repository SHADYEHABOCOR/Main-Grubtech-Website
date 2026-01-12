import React, { useState } from 'react';
import { MapPin, Users, TrendingUp, Smile, Linkedin, Lightbulb, Target, Eye, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ScrollIndicator } from '../components/ui/ScrollIndicator';
import { AnimatedElement } from '../components/ui/AnimatedElement';
import { SEO } from '../components/seo';
import { CTASection } from '../components/sections/CTASection';
import { OptimizedImage } from '../components/ui/OptimizedImage';

// Type definitions for translated content
interface ValueItem {
  title: string;
  description: string;
}

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface OfficeItem {
  name: string;
  city: string;
  country: string;
  address: string;
}

// Import team member images
import mohamedAlFayed from '../assets/about/mohamed-al-fayed.jpg';
import omarRifai from '../assets/about/omar-rifai.webp';

// Import section images
import ourStoryImage from '../assets/about/our-story.jpg';
import worldMapSvg from '../assets/about/world-map.svg';

// Import city images for offices
import barcelonaImage from '../assets/about/barcelona.jpg';
import cairoImage from '../assets/about/cairo.jpg';
import colomboImage from '../assets/about/colombo.jpg';
import riyadhImage from '../assets/about/riyadh.jpg';
import valenciaImage from '../assets/about/valencia.jpg';

// Map city names to images
const cityImages: Record<string, string> = {
  'Dubai': riyadhImage, // Using Riyadh as fallback for Dubai
  'Riyadh': riyadhImage,
  'Cairo': cairoImage,
  'Barcelona': barcelonaImage,
  'Valencia': valenciaImage,
  'Colombo': colomboImage,
};

// Timeline Accordion Item Component
const TimelineAccordionItem: React.FC<{ item: TimelineItem; index: number }> = ({ item, index }) => {
  const [isOpen, setIsOpen] = useState(index === 0); // First item open by default

  return (
    <AnimatedElement
      animation="fade-up"
      delay={index * 100}
      scrollTrigger
      once
      className="border border-gray-200 rounded-xl overflow-hidden bg-white"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            {item.year}
          </span>
          <h3 className="text-lg font-bold text-text-primary">{item.title}</h3>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {/* CSS Grid accordion technique - smooth height animation without JavaScript */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-0">
            <div className="pl-16">
              <p className="text-text-secondary leading-relaxed">{item.description}</p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedElement>
  );
};

export const About: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { value: t('about.stats.satisfaction'), label: t('about.stats.satisfactionLabel'), icon: Smile },
    { value: t('about.stats.users'), label: t('about.stats.usersLabel'), icon: Users },
    { value: t('about.stats.team'), label: t('about.stats.teamLabel'), icon: Users },
    { value: t('about.stats.growth'), label: t('about.stats.growthLabel'), icon: TrendingUp },
  ];

  const team = [
    {
      name: 'Mohamed Al Fayed',
      title: 'Chief Executive Officer',
      image: mohamedAlFayed,
      linkedin: 'https://ae.linkedin.com/in/moefayed',
    },
    {
      name: 'Omar Rifai',
      title: 'Chief Growth Officer',
      image: omarRifai,
      linkedin: 'https://ae.linkedin.com/in/rifai1',
    },
  ];

  return (
    <>
      <SEO
        title="About Us"
        description="Learn about Grubtech's mission to transform restaurant operations. Founded in Dubai, we're building the future of unified restaurant management technology."
        keywords="about grubtech, restaurant technology company, food tech startup, restaurant management platform, Dubai tech company"
      />
      <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="relative min-h-[60vh] pt-32 pb-20 md:pt-40 md:pb-28 flex items-center bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50"
      >
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedElement
              as="h1"
              animation="fade-up"
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              {t('about.hero.title')}
            </AnimatedElement>
            <AnimatedElement
              as="p"
              animation="fade-up"
              delay={200}
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
            >
              {t('about.hero.subtitle')}
            </AnimatedElement>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedElement
              animation="fade-up"
              scrollTrigger
              once
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-6">{t('about.story.title')}</h2>
              <div className="space-y-4 text-base text-text-secondary leading-relaxed">
                <p>{t('about.story.paragraph1')}</p>
                <p>{t('about.story.paragraph2')}</p>
                <p>{t('about.story.paragraph3')}</p>
              </div>
            </AnimatedElement>
            <AnimatedElement
              animation="fade-right"
              scrollTrigger
              once
              className="relative"
            >
              <OptimizedImage
                src={ourStoryImage}
                alt={t('about.story.title')}
                className="w-full h-auto rounded-2xl"
              />
            </AnimatedElement>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-background-blue-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {(t('about.values.items', { returnObjects: true }) as ValueItem[]).map((value, index) => {
              const icons = [Lightbulb, Target, Eye];
              const Icon = icons[index] || Lightbulb;
              return (
                <AnimatedElement
                  key={index}
                  animation="fade-up"
                  delay={index * 100}
                  scrollTrigger
                  once
                  className="bg-white rounded-2xl p-8 shadow-sm h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-4">{value.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{value.description}</p>
                </AnimatedElement>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Journey - Accordion Timeline */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left side - Title and Stats */}
            <div>
              <AnimatedElement
                as="h2"
                animation="fade-up"
                scrollTrigger
                once
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-8"
              >
                {t('about.timeline.title')}
              </AnimatedElement>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <AnimatedElement
                    key={index}
                    animation="fade-up"
                    delay={index * 100}
                    scrollTrigger
                    once
                    className="bg-background-blue-light rounded-xl p-5"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-text-secondary font-medium">{stat.label}</div>
                  </AnimatedElement>
                ))}
              </div>
            </div>

            {/* Right side - Accordion Timeline */}
            <div className="space-y-3">
              {(t('about.timeline.items', { returnObjects: true }) as TimelineItem[]).map((item, index) => (
                <TimelineAccordionItem key={index} item={item} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24 bg-background-blue-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            as="h2"
            animation="fade-up"
            scrollTrigger
            once
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-12 text-center"
          >
            {t('about.team.title')}
          </AnimatedElement>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
            {team.map((member, index) => (
              <AnimatedElement
                key={index}
                animation="fade-up"
                delay={index * 100}
                scrollTrigger
                once
                className="bg-white rounded-2xl p-8 text-center shadow-sm h-full"
              >
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                  <OptimizedImage
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-1">{member.name}</h3>
                <p className="text-primary font-semibold mb-3">{member.title}</p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-colors"
                  aria-label={`${member.name}'s LinkedIn profile`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            as="h2"
            animation="fade-up"
            scrollTrigger
            once
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-12 text-center"
          >
            {t('about.presence.title')}
          </AnimatedElement>

          {/* World Map */}
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="mb-12"
          >
            <img
              src={worldMapSvg}
              alt="Grubtech Global Presence"
              className="w-full h-auto"
            />
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {(t('about.presence.offices', { returnObjects: true }) as OfficeItem[]).map((office, index) => (
              <AnimatedElement
                key={index}
                animation="fade-up"
                delay={index * 100}
                scrollTrigger
                once
                className="bg-background-alt rounded-2xl overflow-hidden h-full"
              >
                {/* City Image */}
                {cityImages[office.city] && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={cityImages[office.city]}
                      alt={office.city}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-text-primary">{office.city}, {office.country}</h3>
                    </div>
                  </div>
                  <p className="font-semibold text-text-primary mb-2">{office.name}</p>
                  <p className="text-sm text-text-secondary">{office.address}</p>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title={t('about.cta.title')}
        subtitle={t('about.cta.subtitle')}
        primaryButtonText={t('about.cta.button')}
        primaryButtonLink="/connect-with-us"
      />
    </div>
    </>
  );
};
