import React from 'react';
import { useTranslation } from 'react-i18next';
import { GOnlineDashboard } from '../../components/dashboards/GOnlineDashboard';
import { SolutionPageTemplate } from '../../components/templates';

// Benefit images
import benefitImage1 from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';
import benefitImage2 from '../../assets/images/67dc711be26f722ed5e512d0_2.webp';
import benefitImage3 from '../../assets/images/67dc7cfdb715a068a177ec7f_3.webp';
import benefitImage4 from '../../assets/images/67dc711c8f07d9dd28e15139_4.webp';
import benefitImage5 from '../../assets/images/67dc711cb7049fc8aa1b44b0_5.webp';

export const GOnline: React.FC = () => {
  const { t, i18n } = useTranslation();

  const benefitImages = [benefitImage1, benefitImage2, benefitImage3, benefitImage4, benefitImage5];

  const whyChooseBenefits = (t('solutions.gOnline.whyChoose.benefits', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    features: string[];
  }>).map((benefit, index) => ({
    ...benefit,
    image: benefitImages[index] || undefined,
  }));

  const useCases = t('solutions.gOnline.perfectFor.items', { returnObjects: true }) as string[];

  return (
    <SolutionPageTemplate
      seo={{
        title: "gOnline - Online Ordering Platform",
        description: "Launch your own branded online ordering system. gOnline helps restaurants take direct orders, reduce commission fees, and own their customer relationships.",
        keywords: "online ordering system, restaurant ordering platform, direct ordering, branded ordering app, commission-free ordering, restaurant ecommerce"
      }}
      hero={{
        title: t('solutions.gOnline.heroTitle'),
        subtitle: t('solutions.gOnline.description'),
        primaryButtonText: t('solutions.gOnline.buttons.scheduleDemo'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
        secondaryButtonText: t('solutions.gOnline.buttons.downloadBrochure'),
        secondaryButtonLink: `/${i18n.language}/connect-with-us`,
      }}
      heroDashboard={<GOnlineDashboard className="w-full rounded-lg" />}
      benefits={whyChooseBenefits}
      useCases={{
        title: t('solutions.gOnline.perfectFor.title'),
        items: useCases,
      }}
      cta={{
        title: t('solutions.gOnline.ctaSection.title'),
        subtitle: t('solutions.gOnline.ctaSection.description'),
        primaryButtonText: t('solutions.gOnline.buttons.getStartedToday'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
      }}
    />
  );
};
