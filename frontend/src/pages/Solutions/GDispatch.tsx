import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../../components/ui';
import { GDispatchDashboard } from '../../components/dashboards/GDispatchDashboard';
import { RestaurantTypesTabs } from '../../components/sections/RestaurantTypesTabs';
import { FAQSection } from '../../components/sections/FAQSection';
import { FeatureBoard } from '../../components/sections/FeatureBoard';
import { ScrollIndicator } from '../../components/ui/ScrollIndicator';
import { SEO } from '../../components/seo';
import { CTASection } from '../../components/sections/CTASection';
import liveTracking from '../../assets/images/67e4f7769e2f66451a12fcf4_Group-781.webp';

export const GDispatch: React.FC = () => {
  const { t, i18n } = useTranslation();

  

  const stats = t('solutions.gDispatch.stats', { returnObjects: true }) as Array<{value: string; label: string}>;
  const benefits = t('solutions.gDispatch.benefits', { returnObjects: true }) as Array<{title: string; description: string}>;
  const useCases = t('solutions.gDispatch.perfectFor.items', { returnObjects: true}) as string[];

  return (
    <>
      <SEO
        title="GDispatch - Delivery Management System"
        description="Optimize your delivery operations with GDispatch. Real-time driver tracking, automated dispatch, route optimization, and delivery analytics for restaurants."
        keywords="delivery management, driver tracking, restaurant delivery, dispatch software, route optimization, delivery analytics, fleet management"
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
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
              <Badge variant="primary" className="mb-4">
                {t('solutions.gDispatch.badge')}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                {t('solutions.gDispatch.title')}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                {t('solutions.gDispatch.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={`/${i18n.language}/connect-with-us`}>
                  <Button variant="primary" size="lg">
                    {t('solutions.gDispatch.buttons.scheduleDemo')}
                  </Button>
                </Link>
                <Link to={`/${i18n.language}/connect-with-us`}>
                  <Button variant="outline" size="lg" className="!border-blue-600 !text-blue-600 !bg-transparent hover:!bg-blue-600 hover:!text-white">
                    {t('solutions.gDispatch.buttons.watchVideo')}
                  </Button>
                </Link>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="fade-left" speed="slow" delay={200} className="relative">
              {/* Subtle glow behind dashboard */}
              <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />
              <GDispatchDashboard />
            </AnimatedElement>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedElement
                key={index}
                animation="fade-up"
                delay={index * 100}
                scrollTrigger
                once
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-text-secondary">{stat.label}</div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeatureBoard />

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 text-shadow-sm">
              {t('solutions.common.transformYourDelivery')}
            </h2>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {benefits.map((benefit, index) => (
              <AnimatedElement
                key={index}
                animation="fade-up"
                delay={index * 100}
                scrollTrigger
                once
                className="h-full"
              >
                <Card className="text-center h-full">
                  <h3 className="text-xl font-bold text-text-primary mb-3">{benefit.title}</h3>
                  <p className="text-text-secondary">{benefit.description}</p>
                </Card>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-24 bg-background-blue-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedElement animation="fade-right" scrollTrigger once>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-8 tracking-tight">
                {t('solutions.gDispatch.perfectFor.title')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {useCases.map((useCase, index) => (
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
                    <span className="text-sm font-medium text-gray-700">{useCase}</span>
                  </AnimatedElement>
                ))}
              </div>
              <div className="mt-8">
                <Link to={`/${i18n.language}/connect-with-us`}>
                  <Button variant="primary" size="lg">
                    {t('solutions.gDispatch.buttons.seeHowItWorks')}
                  </Button>
                </Link>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="fade-left" scrollTrigger once>
              <img
                src={liveTracking}
                alt="Live Tracking"
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
        title={t('solutions.gDispatch.ctaSection.title')}
        subtitle={t('solutions.gDispatch.ctaSection.description')}
        primaryButtonText={t('solutions.gDispatch.buttons.scheduleDemo')}
        primaryButtonLink={`/${i18n.language}/connect-with-us`}
      />
    </div>
    </>
  );
};
