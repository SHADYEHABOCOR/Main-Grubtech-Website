import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { AnimatedElement } from '../../components/ui';
import { GKDSDashboard } from '../../components/dashboards/GKDSDashboard';
import { RestaurantTypesTabs } from '../../components/sections/RestaurantTypesTabs';
import { FAQSection } from '../../components/sections/FAQSection';
import { FeatureBoard } from '../../components/sections/FeatureBoard';
import { BenefitsGrid } from '../../components/sections/BenefitsGrid';
import { ScrollIndicator } from '../../components/ui/ScrollIndicator';
import { SEO } from '../../components/seo';
import { CTASection } from '../../components/sections/CTASection';
import restaurantTypesImage from '../../assets/images/67e4f77992b25496c5f2bac1_Group-801.webp';

export const GKDS: React.FC = () => {
  const { t, i18n } = useTranslation();

  const whyChooseBenefits = t('solutions.gKDS.whyChoose.benefits', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    features: string[];
  }>;

  // gKDS+ features for virtual kitchens
  const gkdsPlusFeatures = t('solutions.gKDS.gkdsPlus.features', { returnObjects: true }) as string[];

  return (
    <>
      <SEO
        title="gKDS - Kitchen Display System"
        description="Streamline kitchen operations with gKDS. Real-time order management, reduce ticket times, improve accuracy, and enhance kitchen communication for restaurants."
        keywords="kitchen display system, KDS, restaurant kitchen, order management, kitchen efficiency, ticket management, kitchen operations"
      />
      <div className="min-h-screen bg-white">
        {/* Hero Section - 2 column layout like GOnline */}
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
                  {t('solutions.gKDS.heroTitle')}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  {t('solutions.gKDS.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/${i18n.language}/connect-with-us`}>
                    <Button variant="primary" size="lg">
                      {t('solutions.gKDS.buttons.scheduleDemo')}
                    </Button>
                  </Link>
                  <Link to={`/${i18n.language}/connect-with-us`}>
                    <Button variant="outline" size="lg" className="!border-blue-600 !text-blue-600 !bg-transparent hover:!bg-blue-600 hover:!text-white">
                      {t('solutions.gKDS.buttons.watchVideo')}
                    </Button>
                  </Link>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="fade-left" speed="slow" delay={200} className="relative">
                {/* Subtle glow behind dashboard */}
                <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />
                <GKDSDashboard />
              </AnimatedElement>
            </div>
          </div>
          <ScrollIndicator />
        </section>

        {/* Features Section */}
        <FeatureBoard />

        {/* Benefits Section - Using BenefitsGrid like GOnline */}
        <BenefitsGrid benefits={whyChooseBenefits} />

        {/* gKDS+ for Virtual Kitchens Section */}
        <section className="py-16 md:py-24 bg-background-blue-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedElement animation="fade-right" scrollTrigger once>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
                  {t('solutions.gKDS.gkdsPlus.title')}
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {t('solutions.gKDS.gkdsPlus.subtitle')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gkdsPlusFeatures.map((feature, index) => (
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
                      <span className="text-sm font-medium text-gray-700">{feature}</span>
                    </AnimatedElement>
                  ))}
                </div>
              </AnimatedElement>

              <AnimatedElement animation="fade-left" scrollTrigger once>
                <img
                  src={restaurantTypesImage}
                  alt="Virtual Kitchen Operations"
                  className="w-full rounded-2xl"
                />
              </AnimatedElement>
            </div>
          </div>
        </section>

        {/* Restaurant Types Tabs */}
        <RestaurantTypesTabs />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <CTASection
          title={t('solutions.gKDS.ctaSection.title')}
          subtitle={t('solutions.gKDS.ctaSection.description')}
          primaryButtonText={t('solutions.gKDS.buttons.requestDemo')}
          primaryButtonLink={`/${i18n.language}/connect-with-us`}
        />
      </div>
    </>
  );
};
