import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../../components/ui';
import { GDataDashboard } from '../../components/dashboards/GDataDashboard';
import { SolutionPageTemplate } from '../../components/templates';

// Benefit images
import benefitImage1 from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import benefitImage2 from '../../assets/images/67dc711be26f722ed5e512d0_2.webp';
import benefitImage3 from '../../assets/images/67dc7cfdb715a068a177ec7f_3.webp';
import benefitImage4 from '../../assets/images/67dc711c8f07d9dd28e15139_4.webp';

export const GData: React.FC = () => {
  const { i18n, t } = useTranslation();

  const benefitImages = [benefitImage1, benefitImage2, benefitImage3, benefitImage4];

  const whyChooseBenefits = (t('solutions.gData.whyChoose.benefits', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    features: string[];
  }>).map((benefit, index) => ({
    ...benefit,
    image: benefitImages[index] || undefined,
  }));

  const reports = t('solutions.gData.reportsSection.categories', { returnObjects: true }) as Array<{ category: string; items: string[] }>;

  // Custom Reports Section
  const ReportsSection = (
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
  );

  return (
    <SolutionPageTemplate
      seo={{
        title: "gData - Restaurant Analytics & Reporting",
        description: "Make data-driven decisions with gData. Comprehensive restaurant analytics, real-time reporting, sales insights, and performance dashboards for your business.",
        keywords: "restaurant analytics, business intelligence, sales reporting, restaurant data, performance dashboard, restaurant KPIs, data insights"
      }}
      hero={{
        title: t('solutions.gData.heroTitle'),
        subtitle: t('solutions.gData.description'),
        primaryButtonText: t('solutions.gData.buttons.scheduleDemo'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
        secondaryButtonText: t('solutions.gData.buttons.viewSampleReports'),
        secondaryButtonLink: `/${i18n.language}/connect-with-us`,
      }}
      heroDashboard={<GDataDashboard />}
      benefits={whyChooseBenefits}
      hideUseCases={true}
      afterBenefits={ReportsSection}
      cta={{
        title: t('solutions.gData.ctaSection.title'),
        subtitle: t('solutions.gData.ctaSection.description'),
        primaryButtonText: t('solutions.gData.buttons.scheduleDemo'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
        secondaryButtonText: t('solutions.gData.buttons.viewSampleDashboard'),
        secondaryButtonLink: `/${i18n.language}/connect-with-us`,
      }}
    />
  );
};
