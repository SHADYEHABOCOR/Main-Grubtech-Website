import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AnimatedElement } from '../../components/ui';
import { GOnlineLiteDashboard } from '../../components/dashboards/GOnlineLiteDashboard';
import { RestaurantTypesTabs } from '../../components/sections/RestaurantTypesTabs';
import { FAQSection } from '../../components/sections/FAQSection';
import { FeatureBoard } from '../../components/sections/FeatureBoard';
import { BenefitsGrid } from '../../components/sections/BenefitsGrid';
import { ScrollIndicator } from '../../components/ui/ScrollIndicator';
import { SEO } from '../../components/seo';
import { CTASection } from '../../components/sections/CTASection';
import restaurantTypesImage from '../../assets/images/67e4f77992b25496c5f2bac1_Group-801.webp';

export const GOnlineLite: React.FC = () => {
  const { t, i18n } = useTranslation();

  const useCases = t('solutions.gOnlineLite.perfectFor.items', { returnObjects: true }) as string[];
  const whyChooseBenefits = t('solutions.gOnlineLite.whyChoose.benefits', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    features: string[];
  }>;
  const comparisonFeatures = t('solutions.gOnlineLite.comparison.features', { returnObjects: true }) as string[];

  const comparison = comparisonFeatures.map((feature, index) => ({
    feature,
    lite: index < 4, // First 4 features are in Lite
    full: true
  }));

  return (
    <>
      <SEO
        title="gOnline Lite - Quick Start Online Ordering"
        description="Go live fast with gOnline Lite. No POS integration needed, setup in under 30 minutes. Perfect for single-location restaurants starting with online ordering."
        keywords="online ordering lite, quick setup ordering, no POS integration, single location restaurant, simple online ordering, fast restaurant setup"
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
                  {t('solutions.gOnlineLite.heroTitle')}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  {t('solutions.gOnlineLite.heroSubtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/${i18n.language}/connect-with-us`}>
                    <Button variant="primary" size="lg">
                      {t('solutions.gOnlineLite.buttons.startFreeTrial')}
                    </Button>
                  </Link>
                  <Link to={`/${i18n.language}/solutions/gonline`}>
                    <Button variant="outline" size="lg" className="!border-blue-600 !text-blue-600 !bg-transparent hover:!bg-blue-600 hover:!text-white">
                      {t('solutions.gOnlineLite.buttons.comparePlans')}
                    </Button>
                  </Link>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="fade-left" speed="slow" delay={200} className="relative">
                {/* Subtle glow behind dashboard */}
                <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />
                <GOnlineLiteDashboard />
              </AnimatedElement>
            </div>
          </div>
          <ScrollIndicator />
        </section>

        {/* Features Section */}
        <FeatureBoard />

        {/* Benefits Section - Using BenefitsGrid like GOnline */}
        <BenefitsGrid benefits={whyChooseBenefits} />

        {/* Use Cases Section - Same as GOnline */}
        <section className="py-16 md:py-24 bg-background-blue-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedElement animation="fade-right" scrollTrigger once>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-8 tracking-tight">
                  {t('solutions.gOnlineLite.perfectFor.title')}
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
              </AnimatedElement>

              <AnimatedElement animation="fade-left" scrollTrigger once>
                <img
                  src={restaurantTypesImage}
                  alt="Restaurant Types"
                  className="w-full rounded-2xl"
                />
              </AnimatedElement>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedElement
              animation="fade-up"
              scrollTrigger
              once
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
                {t('solutions.gOnlineLite.comparison.title')}
              </h2>
              <p className="text-lg text-gray-500">
                {t('solutions.gOnlineLite.comparison.subtitle')}
              </p>
            </AnimatedElement>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-text-primary font-semibold">{t('solutions.gOnlineLite.comparison.tableHeaders.feature')}</th>
                      <th className="text-center py-4 px-6 text-text-primary font-semibold">{t('solutions.gOnlineLite.comparison.tableHeaders.lite')}</th>
                      <th className="text-center py-4 px-6 text-text-primary font-semibold">{t('solutions.gOnlineLite.comparison.tableHeaders.full')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-6 text-text-primary">{row.feature}</td>
                        <td className="py-4 px-6 text-center">
                          {row.lite ? (
                            <Check className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {row.full ? (
                            <Check className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </section>

        {/* Restaurant Types Tabs */}
        <RestaurantTypesTabs />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <CTASection
          title={t('solutions.gOnlineLite.ctaSection.title')}
          subtitle={t('solutions.gOnlineLite.ctaSection.description')}
          primaryButtonText={t('solutions.gOnlineLite.buttons.startFreeTrial')}
          primaryButtonLink={`/${i18n.language}/connect-with-us`}
        />
      </div>
    </>
  );
};
