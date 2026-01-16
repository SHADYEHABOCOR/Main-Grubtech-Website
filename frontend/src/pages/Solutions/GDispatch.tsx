import React from 'react';
import { useTranslation } from 'react-i18next';
import { GDispatchDashboard } from '../../components/dashboards/GDispatchDashboard';
import { SolutionPageTemplate } from '../../components/templates';

// Benefit images
import benefitImage1 from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import benefitImage2 from '../../assets/images/67dc711be26f722ed5e512d0_2.webp';
import benefitImage3 from '../../assets/images/67dc7cfdb715a068a177ec7f_3.webp';
import benefitImage4 from '../../assets/images/67dc711c8f07d9dd28e15139_4.webp';
import benefitImage5 from '../../assets/images/67dc711cb7049fc8aa1b44b0_5.webp';

export const GDispatch: React.FC = () => {
  const { t, i18n } = useTranslation();

  const benefitImages = [benefitImage1, benefitImage2, benefitImage3, benefitImage4, benefitImage5];

  const whyChooseBenefits = (t('solutions.gDispatch.whyChoose.benefits', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    features: string[];
  }>).map((benefit, index) => ({
    ...benefit,
    image: benefitImages[index] || undefined,
  }));
  const useCases = t('solutions.gDispatch.perfectFor.items', { returnObjects: true }) as string[];

  return (
    <SolutionPageTemplate
      seo={{
        title: "gDispatch - Delivery Management System",
        description: "Optimize your delivery operations with gDispatch. Real-time driver tracking, automated dispatch, route optimization, and delivery analytics for restaurants.",
        keywords: "delivery management, driver tracking, restaurant delivery, dispatch software, route optimization, delivery analytics, fleet management"
      }}
      hero={{
        title: t('solutions.gDispatch.heroTitle'),
        subtitle: t('solutions.gDispatch.description'),
        primaryButtonText: t('solutions.gDispatch.buttons.scheduleDemo'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
        secondaryButtonText: t('solutions.gDispatch.buttons.watchVideo'),
        secondaryButtonLink: `/${i18n.language}/connect-with-us`,
      }}
      heroDashboard={<GDispatchDashboard />}
      benefits={whyChooseBenefits}
      useCases={{
        title: t('solutions.gDispatch.perfectFor.title'),
        items: useCases,
        imageAlt: "Delivery Operations",
      }}
      cta={{
        title: t('solutions.gDispatch.ctaSection.title'),
        subtitle: t('solutions.gDispatch.ctaSection.description'),
        primaryButtonText: t('solutions.gDispatch.buttons.scheduleDemo'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
      }}
    />
  );
};
