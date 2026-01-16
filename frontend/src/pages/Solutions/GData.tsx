import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../../components/ui';
import { GDataDashboard } from '../../components/dashboards/GDataDashboard';
import { RestaurantTypesTabs } from '../../components/sections/RestaurantTypesTabs';
import { FAQSection } from '../../components/sections/FAQSection';
import { FeatureBoard } from '../../components/sections/FeatureBoard';
import { BenefitsGrid } from '../../components/sections/BenefitsGrid';
import { ScrollIndicator } from '../../components/ui/ScrollIndicator';
import { SEO } from '../../components/seo';
import { CTASection } from '../../components/sections/CTASection';

export const GData: React.FC = () => {
  const { i18n, t } = useTranslation();

  const whyChooseBenefits = t('solutions.gData.whyChoose.benefits', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    features: string[];
  }>;

  const reports = t('solutions.gData.reportsSection.categories', { returnObjects: true }) as Array<{ category: string; items: string[] }>;

  return (
    <>
      <SEO
        title="gData - Restaurant Analytics & Reporting"
        description="Make data-driven decisions with gData. Comprehensive restaurant analytics, real-time reporting, sales insights, and performance dashboards for your business."
        keywords="restaurant analytics, business intelligence, sales reporting, restaurant data, performance dashboard, restaurant KPIs, data insights"
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
                  {t('solutions.gData.heroTitle')}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  {t('solutions.gData.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/${i18n.language}/connect-with-us`}>
                    <Button variant="primary" size="lg">
                      {t('solutions.gData.buttons.scheduleDemo')}
                    </Button>
                  </Link>
                  <Link to={`/${i18n.language}/connect-with-us`}>
                    <Button variant="outline" size="lg" className="!border-blue-600 !text-blue-600 !bg-transparent hover:!bg-blue-600 hover:!text-white">
                      {t('solutions.gData.buttons.viewSampleReports')}
                    </Button>
                  </Link>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="fade-left" speed="slow" delay={200} className="relative">
                {/* Subtle glow behind dashboard */}
                <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />
                <GDataDashboard />
              </AnimatedElement>
            </div>
          </div>
          <ScrollIndicator />
        </section>

        {/* Features Section */}
        <FeatureBoard />

        {/* Benefits Section - Using BenefitsGrid like GOnline */}
        <BenefitsGrid benefits={whyChooseBenefits} />

        {/* Reports Section - Unique to gData */}
        <section className="py-16 md:py-24 bg-background-blue-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedElement
              animation="fade-up"
              scrollTrigger
              once
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
                {t('solutions.gData.reportsSection.title')}
              </h2>
              <p className="text-base text-gray-500 max-w-2xl mx-auto">
                {t('solutions.gData.reportsSection.subtitle')}
              </p>
            </AnimatedElement>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report, index) => (
                <AnimatedElement
                  key={index}
                  animation="fade-up"
                  delay={index * 100}
                  scrollTrigger
                  once
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-[border-color,box-shadow] duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                    {report.category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.items.map((item, idx) => (
                      <AnimatedElement
                        key={idx}
                        animation="fade-up"
                        speed="fast"
                        delay={idx * 30}
                        scrollTrigger
                        once
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/50 transition-colors duration-200"
                      >
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ArrowRight className="w-3.5 h-3.5 text-primary rtl-mirror" />
                        </div>
                        <span className="text-sm text-gray-700">{item}</span>
                      </AnimatedElement>
                    ))}
                  </div>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </section>

        {/* Restaurant Types Tabs */}
        <RestaurantTypesTabs />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <CTASection
          title={t('solutions.gData.ctaSection.title')}
          subtitle={t('solutions.gData.ctaSection.description')}
          primaryButtonText={t('solutions.gData.buttons.scheduleDemo')}
          primaryButtonLink={`/${i18n.language}/connect-with-us`}
          secondaryButtonText={t('solutions.gData.buttons.viewSampleDashboard')}
          secondaryButtonLink={`/${i18n.language}/connect-with-us`}
        />
      </div>
    </>
  );
};
