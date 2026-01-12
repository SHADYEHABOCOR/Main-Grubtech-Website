import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../../components/ui';
import { GOnlineLiteDashboard } from '../../components/dashboards/GOnlineLiteDashboard';
import { RestaurantTypesTabs } from '../../components/sections/RestaurantTypesTabs';
import { FAQSection } from '../../components/sections/FAQSection';
import { FeatureBoard } from '../../components/sections/FeatureBoard';
import { ScrollIndicator } from '../../components/ui/ScrollIndicator';
import { CTASection } from '../../components/sections/CTASection';

export const GOnlineLite: React.FC = () => {
  const { t, i18n } = useTranslation();

  const benefits = t('solutions.gOnlineLite.benefits', { returnObjects: true }) as Array<{title: string; description: string}>;
  const comparisonFeatures = t('solutions.gOnlineLite.comparison.features', { returnObjects: true }) as string[];

  const comparison = comparisonFeatures.map((feature, index) => ({
    feature,
    lite: index < 4, // First 4 features are in Lite
    full: true
  }));

  return (
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
          <AnimatedElement animation="fade-up" speed="slow" className="text-center">
            <Badge variant="primary" className="mb-4">
              {t('solutions.gOnlineLite.badge')}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {t('solutions.gOnlineLite.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('solutions.gOnlineLite.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

            {/* Dashboard */}
            <AnimatedElement
              animation="fade-up"
              speed="slow"
              delay={300}
              className="mt-12 max-w-4xl mx-auto relative"
            >
              {/* Subtle glow behind dashboard */}
              <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />
              <GOnlineLiteDashboard />
            </AnimatedElement>
          </AnimatedElement>
        </div>
        <ScrollIndicator />
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
              {t('solutions.common.whyChoose')} {t('solutions.gOnlineLite.title')}?
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

      {/* Comparison Section */}
      <section className="py-16 md:py-24 bg-background-blue-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 text-shadow-sm">
              {t('solutions.gOnlineLite.comparison.title')}
            </h2>
            <p className="text-lg text-text-secondary">
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
  );
};
