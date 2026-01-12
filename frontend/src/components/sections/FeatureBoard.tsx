import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../ui/AnimatedElement';

interface Feature {
  title: string;
  icon: string;
}

interface FeatureBoardProps {
  title?: string;
  description?: string;
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    title: 'Order Management',
    icon: 'https://cdn.prod.website-files.com/6527c8f52546312f94ae6d0c/67e6280ac8594214738daf18_Group%20863.svg',
  },
  {
    title: 'Menu Management',
    icon: 'https://cdn.prod.website-files.com/6527c8f52546312f94ae6d0c/67e628d4a6399eaf12759254_Group%20864.svg',
  },
  {
    title: 'Delivery Management',
    icon: 'https://cdn.prod.website-files.com/6527c8f52546312f94ae6d0c/67e628d4b823eb946c548d63_Group%20865.svg',
  },
  {
    title: 'Order Status Updates',
    icon: 'https://cdn.prod.website-files.com/6527c8f52546312f94ae6d0c/67e634acdbe68225c629698c_Group%20875.svg',
  },
  {
    title: 'Menu Analysis',
    icon: 'https://cdn.prod.website-files.com/6527c8f52546312f94ae6d0c/67e628d4a6399eaf12759259_Group%20866.svg',
  },
  {
    title: 'Aggregator Integration',
    icon: 'https://cdn.prod.website-files.com/6527c8f52546312f94ae6d0c/67e628d5c8594214738e4ead_Group%20871.svg',
  },
  {
    title: 'Automated Order Routing',
    icon: 'https://cdn.prod.website-files.com/6527c8f52546312f94ae6d0c/67e628d45cd2a8ee6b1f7ca2_Group%20870.svg',
  },
  {
    title: 'Real-Time Reporting',
    icon: 'https://cdn.prod.website-files.com/6527c8f52546312f94ae6d0c/67e628d4aaf43d2e385b4dab_Group%20869.svg',
  },
  {
    title: 'Multi Location Control',
    icon: 'https://cdn.prod.website-files.com/6527c8f52546312f94ae6d0c/67e628d467a9c5147f2927c5_Group%20868.svg',
  },
];

export const FeatureBoard: React.FC<FeatureBoardProps> = ({
  title,
  description,
  features,
}) => {
  const { t } = useTranslation();

  const featuresList = features || (t('featureBoard.features', { returnObjects: true }) as string[]).map((featureTitle, index) => ({
    title: featureTitle,
    icon: defaultFeatures[index]?.icon || '',
  }));

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 bg-background-blue-light rounded-3xl p-8 md:p-12 border border-gray-100">
          {/* Left: Title and CTA */}
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="lg:col-span-4"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
              {title || t('featureBoard.title')}
            </h2>
            <p className="text-base text-gray-500 mb-8 leading-relaxed">
              {description || t('featureBoard.description')}
            </p>
            <Link
              to="/connect-with-us"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              {t('featureBoard.cta')}
            </Link>
          </AnimatedElement>

          {/* Right: Feature Grid */}
          <AnimatedElement
            animation="fade-up"
            delay={100}
            scrollTrigger
            once
            className="lg:col-span-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuresList.map((feature, index) => (
                <AnimatedElement
                  key={index}
                  animation="fade-up"
                  speed="fast"
                  delay={index * 30}
                  scrollTrigger
                  once
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-300"
                >
                  {feature.icon && (
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-primary/5 rounded-lg">
                      <img
                        src={feature.icon}
                        alt={feature.title}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-medium text-gray-900">
                    {feature.title}
                  </h3>
                </AnimatedElement>
              ))}
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
};
