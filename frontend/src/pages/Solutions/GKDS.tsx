import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { AnimatedElement } from '../../components/ui';
import { GKDSDashboard } from '../../components/dashboards/GKDSDashboard';
import { SolutionPageTemplate } from '../../components/templates';
import restaurantTypesImage from '../../assets/images/67e4f77992b25496c5f2bac1_Group-801.webp';

// Benefit images
import benefitImage1 from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import benefitImage2 from '../../assets/images/67dc711be26f722ed5e512d0_2.webp';
import benefitImage3 from '../../assets/images/67dc7cfdb715a068a177ec7f_3.webp';
import benefitImage4 from '../../assets/images/67dc711c8f07d9dd28e15139_4.webp';

export const GKDS: React.FC = () => {
  const { t, i18n } = useTranslation();

  const benefitImages = [benefitImage1, benefitImage2, benefitImage3, benefitImage4];

  const whyChooseBenefits = (t('solutions.gKDS.whyChoose.benefits', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    features: string[];
  }>).map((benefit, index) => ({
    ...benefit,
    image: benefitImages[index] || undefined,
  }));

  // gKDS+ features for virtual kitchens
  const gkdsPlusFeatures = t('solutions.gKDS.gkdsPlus.features', { returnObjects: true }) as string[];

  // Custom gKDS+ Section for Virtual Kitchens
  const GKDSPlusSection = (
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
  );

  return (
    <SolutionPageTemplate
      seo={{
        title: "gKDS - Kitchen Display System",
        description: "Streamline kitchen operations with gKDS. Real-time order management, reduce ticket times, improve accuracy, and enhance kitchen communication for restaurants.",
        keywords: "kitchen display system, KDS, restaurant kitchen, order management, kitchen efficiency, ticket management, kitchen operations"
      }}
      hero={{
        title: t('solutions.gKDS.heroTitle'),
        subtitle: t('solutions.gKDS.description'),
        primaryButtonText: t('solutions.gKDS.buttons.scheduleDemo'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
        secondaryButtonText: t('solutions.gKDS.buttons.watchVideo'),
        secondaryButtonLink: `/${i18n.language}/connect-with-us`,
      }}
      heroDashboard={<GKDSDashboard />}
      benefits={whyChooseBenefits}
      hideUseCases={true}
      afterBenefits={GKDSPlusSection}
      cta={{
        title: t('solutions.gKDS.ctaSection.title'),
        subtitle: t('solutions.gKDS.ctaSection.description'),
        primaryButtonText: t('solutions.gKDS.buttons.requestDemo'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
      }}
    />
  );
};
