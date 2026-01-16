import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { AnimatedElement } from '../../components/ui';
import { GOnlineLiteDashboard } from '../../components/dashboards/GOnlineLiteDashboard';
import { SolutionPageTemplate } from '../../components/templates';

// Benefit images
import benefitImage1 from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import benefitImage2 from '../../assets/images/67dc711be26f722ed5e512d0_2.webp';
import benefitImage3 from '../../assets/images/67dc7cfdb715a068a177ec7f_3.webp';
import benefitImage4 from '../../assets/images/67dc711c8f07d9dd28e15139_4.webp';

export const GOnlineLite: React.FC = () => {
  const { t, i18n } = useTranslation();

  const benefitImages = [benefitImage1, benefitImage2, benefitImage3, benefitImage4];

  const useCases = t('solutions.gOnlineLite.perfectFor.items', { returnObjects: true }) as string[];
  const whyChooseBenefits = (t('solutions.gOnlineLite.whyChoose.benefits', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    features: string[];
  }>).map((benefit, index) => ({
    ...benefit,
    image: benefitImages[index] || undefined,
  }));
  const comparisonFeatures = t('solutions.gOnlineLite.comparison.features', { returnObjects: true }) as string[];

  const comparison = comparisonFeatures.map((feature, index) => ({
    feature,
    lite: index < 4, // First 4 features are in Lite
    full: true
  }));

  // Custom Comparison Section
  const ComparisonSection = (
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
  );

  return (
    <SolutionPageTemplate
      seo={{
        title: "gOnline Lite - Quick Start Online Ordering",
        description: "Go live fast with gOnline Lite. No POS integration needed, setup in under 30 minutes. Perfect for single-location restaurants starting with online ordering.",
        keywords: "online ordering lite, quick setup ordering, no POS integration, single location restaurant, simple online ordering, fast restaurant setup"
      }}
      hero={{
        title: t('solutions.gOnlineLite.heroTitle'),
        subtitle: t('solutions.gOnlineLite.heroSubtitle'),
        primaryButtonText: t('solutions.gOnlineLite.buttons.startFreeTrial'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
        secondaryButtonText: t('solutions.gOnlineLite.buttons.comparePlans'),
        secondaryButtonLink: `/${i18n.language}/solutions/gonline`,
      }}
      heroDashboard={<GOnlineLiteDashboard />}
      benefits={whyChooseBenefits}
      useCases={{
        title: t('solutions.gOnlineLite.perfectFor.title'),
        items: useCases,
      }}
      afterUseCases={ComparisonSection}
      cta={{
        title: t('solutions.gOnlineLite.ctaSection.title'),
        subtitle: t('solutions.gOnlineLite.ctaSection.description'),
        primaryButtonText: t('solutions.gOnlineLite.buttons.startFreeTrial'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
      }}
    />
  );
};
