import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnimatedElement } from '../ui';
import { RestaurantTypesTabs } from '../sections/RestaurantTypesTabs';
import { FAQSection } from '../sections/FAQSection';
import { FeatureBoard } from '../sections/FeatureBoard';
import { BenefitsGrid } from '../sections/BenefitsGrid';
import { ScrollIndicator } from '../ui/ScrollIndicator';
import { SEO } from '../seo';
import { CTASection } from '../sections/CTASection';
import restaurantTypesImage from '../../assets/images/67e4f77992b25496c5f2bac1_Group-801.webp';

interface Benefit {
  title: string;
  description: string;
  features: string[];
  image?: string;
}

interface CTAConfig {
  title: string;
  subtitle?: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
}

interface HeroConfig {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

interface UseCasesConfig {
  title: string;
  subtitle?: string;
  items: string[];
  image?: string;
  imageAlt?: string;
}

interface SolutionPageTemplateProps {
  // SEO
  seo: SEOConfig;

  // Hero Section
  hero: HeroConfig;
  heroDashboard: ReactNode;

  // Benefits (Why Choose) Section - optional, uses BenefitsGrid
  benefits?: Benefit[];

  // Use Cases / Perfect For Section - optional
  useCases?: UseCasesConfig;

  // CTA Section
  cta: CTAConfig;

  // Custom sections to inject at specific positions
  afterHero?: ReactNode;
  afterFeatureBoard?: ReactNode;
  afterBenefits?: ReactNode;
  afterUseCases?: ReactNode;
  afterRestaurantTypes?: ReactNode;

  // Option to hide default sections
  hideFeatureBoard?: boolean;
  hideBenefits?: boolean;
  hideUseCases?: boolean;
  hideRestaurantTypes?: boolean;
  hideFAQ?: boolean;
}

export const SolutionPageTemplate: React.FC<SolutionPageTemplateProps> = ({
  seo,
  hero,
  heroDashboard,
  benefits,
  useCases,
  cta,
  afterHero,
  afterFeatureBoard,
  afterBenefits,
  afterUseCases,
  afterRestaurantTypes,
  hideFeatureBoard = false,
  hideBenefits = false,
  hideUseCases = false,
  hideRestaurantTypes = false,
  hideFAQ = false,
}) => {
  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
      />
      <div className="min-h-screen bg-white">
        {/* Hero Section - 2 column layout */}
        <section
          className="relative min-h-screen pt-32 pb-20 md:pt-40 md:pb-28 lg:pt-48 flex items-center bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50"
        >
          {/* Light gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent" />

          {/* Decorative elements */}
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedElement animation="fade-right" speed="slow">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  {hero.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  {hero.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={hero.primaryButtonLink}>
                    <Button variant="primary" size="lg">
                      {hero.primaryButtonText}
                    </Button>
                  </Link>
                  <Link to={hero.secondaryButtonLink}>
                    <Button variant="outline" size="lg" className="!border-blue-600 !text-blue-600 !bg-transparent hover:!bg-blue-600 hover:!text-white">
                      {hero.secondaryButtonText}
                    </Button>
                  </Link>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="fade-left" speed="slow" delay={200} className="relative">
                {/* Subtle glow behind dashboard */}
                <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />
                {heroDashboard}
              </AnimatedElement>
            </div>
          </div>
          <ScrollIndicator />
        </section>

        {/* Custom section after hero */}
        {afterHero}

        {/* Features Section */}
        {!hideFeatureBoard && <FeatureBoard />}

        {/* Custom section after feature board */}
        {afterFeatureBoard}

        {/* Benefits Section */}
        {!hideBenefits && benefits && benefits.length > 0 && (
          <BenefitsGrid benefits={benefits} />
        )}

        {/* Custom section after benefits */}
        {afterBenefits}

        {/* Use Cases / Perfect For Section */}
        {!hideUseCases && useCases && useCases.items.length > 0 && (
          <section className="py-16 md:py-24 bg-background-blue-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <AnimatedElement animation="fade-right" scrollTrigger once>
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
                    {useCases.title}
                  </h2>
                  {useCases.subtitle && (
                    <p className="text-lg text-gray-600 mb-8">
                      {useCases.subtitle}
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {useCases.items.map((item, index) => (
                      <AnimatedElement
                        key={index}
                        animation="fade-up"
                        speed="fast"
                        delay={index * 50}
                        scrollTrigger
                        once
                        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-[border-color,box-shadow] duration-200"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-primary rtl-mirror" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{item}</span>
                      </AnimatedElement>
                    ))}
                  </div>
                </AnimatedElement>

                <AnimatedElement animation="fade-left" scrollTrigger once>
                  <img
                    src={useCases.image || restaurantTypesImage}
                    alt={useCases.imageAlt || "Use Cases"}
                    className="w-full rounded-2xl"
                  />
                </AnimatedElement>
              </div>
            </div>
          </section>
        )}

        {/* Custom section after use cases */}
        {afterUseCases}

        {/* Restaurant Types Tabs */}
        {!hideRestaurantTypes && <RestaurantTypesTabs />}

        {/* Custom section after restaurant types */}
        {afterRestaurantTypes}

        {/* FAQ Section */}
        {!hideFAQ && <FAQSection />}

        {/* CTA Section */}
        <CTASection
          title={cta.title}
          subtitle={cta.subtitle}
          primaryButtonText={cta.primaryButtonText}
          primaryButtonLink={cta.primaryButtonLink}
          secondaryButtonText={cta.secondaryButtonText}
          secondaryButtonLink={cta.secondaryButtonLink}
        />
      </div>
    </>
  );
};
