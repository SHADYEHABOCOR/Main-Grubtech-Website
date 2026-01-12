import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
// import { Check, Timer, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AnimatedElement } from '../../components/ui';
import { GKDSDashboard } from '../../components/dashboards/GKDSDashboard';
import { RestaurantTypesTabs } from '../../components/sections/RestaurantTypesTabs';
import { FAQSection } from '../../components/sections/FAQSection';
import { FeatureBoard } from '../../components/sections/FeatureBoard';
import { ScrollIndicator } from '../../components/ui/ScrollIndicator';
import { SEO } from '../../components/seo';
import { CTASection } from '../../components/sections/CTASection';

export const GKDS: React.FC = () => {
  const { t, i18n } = useTranslation();

  

  const metrics = t('solutions.gKDS.metrics', { returnObjects: true }) as Array<{value: string; label: string}>;

  return (
    <>
      <SEO
        title="GKDS - Kitchen Display System"
        description="Streamline kitchen operations with GKDS. Real-time order management, reduce ticket times, improve accuracy, and enhance kitchen communication for restaurants."
        keywords="kitchen display system, KDS, restaurant kitchen, order management, kitchen efficiency, ticket management, kitchen operations"
      />
      <div className="min-h-screen bg-white">
      {/* Hero */}
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
                {t('solutions.gKDS.heroTitle', { defaultValue: 'Keep the kitchen moving. In real time.' })}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                {t('solutions.gKDS.description', { defaultValue: 'Real-time kitchen management that reduces wait times and errors' })}
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

      {/* Metrics */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {metrics.map((metric, index) => (
              <AnimatedElement
                key={index}
                animation="fade-up"
                delay={index * 100}
                scrollTrigger
                once
                className="h-full"
              >
                <Card className="text-center h-full">
                  <div className="text-4xl font-bold text-primary mb-2">{metric.value}</div>
                  <div className="text-lg text-text-primary">{metric.label}</div>
                </Card>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <FeatureBoard />

      {/* Restaurant Types Tabs */}
      <RestaurantTypesTabs />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA */}
      <CTASection
        title={t('solutions.gKDS.ctaSection.title')}
        primaryButtonText={t('solutions.gKDS.buttons.requestDemo')}
        primaryButtonLink={`/${i18n.language}/connect-with-us`}
      />
    </div>
    </>
  );
};
