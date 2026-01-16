import React from 'react';
import { ArrowRight, Package, ShoppingCart, Printer, Truck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../../components/ui';
import { SolutionPageTemplate } from '../../components/templates';
import restaurantTypesImage from '../../assets/images/67e4f77992b25496c5f2bac1_Group-801.webp';

export const GPicker: React.FC = () => {
  const { t, i18n } = useTranslation();

  const builtForItems = t('solutions.gPicker.builtFor.items', { returnObjects: true }) as string[];
  const howItWorksSteps = t('solutions.gPicker.howItWorks.steps', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const capabilities = t('solutions.gPicker.capabilities.items', { returnObjects: true }) as Array<{ title: string; description: string; features: string[] }>;

  const stepIcons = [Package, ShoppingCart, Printer, Truck];

  // Custom Hero Dashboard - Fulfillment Flow Visual
  const HeroDashboard = (
    <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="space-y-6">
        {howItWorksSteps.slice(0, 4).map((step, index) => {
          const Icon = stepIcons[index];
          return (
            <AnimatedElement
              key={index}
              animation="fade-left"
              speed="fast"
              delay={400 + index * 150}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{step.description}</p>
              </div>
              {index < 3 && (
                <ArrowRight className="w-5 h-5 text-gray-300 rtl-mirror" />
              )}
            </AnimatedElement>
          );
        })}
      </div>
    </div>
  );

  // Custom Capabilities Section (replacing Benefits)
  const CapabilitiesSection = (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            {t('solutions.gPicker.capabilities.title')}
          </h2>
        </AnimatedElement>

        <div className="space-y-8">
          {capabilities.map((capability, index) => (
            <AnimatedElement
              key={index}
              animation="fade-up"
              delay={index * 50}
              scrollTrigger
              once
              className="max-w-4xl mx-auto"
            >
              <div className="bg-background-blue-light rounded-2xl p-8 md:p-10 border border-gray-100">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  {capability.title}
                </h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  {capability.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {capability.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 h-full"
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <ArrowRight className="w-3 h-3 text-primary rtl-mirror" />
                      </div>
                      <p className="text-sm text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );

  // Custom Built For Section
  const BuiltForSection = (
    <section className="py-16 md:py-24 bg-background-blue-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimatedElement animation="fade-right" scrollTrigger once>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
              {t('solutions.gPicker.builtFor.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('solutions.gPicker.builtFor.subtitle')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {builtForItems.map((item, index) => (
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
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                </AnimatedElement>
              ))}
            </div>
          </AnimatedElement>

          <AnimatedElement animation="fade-left" scrollTrigger once>
            <img
              src={restaurantTypesImage}
              alt="Fulfillment Operations"
              className="w-full rounded-2xl"
            />
          </AnimatedElement>
        </div>
      </div>
    </section>
  );

  // Custom How It Works Section
  const HowItWorksSection = (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            {t('solutions.gPicker.howItWorks.title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('solutions.gPicker.howItWorks.subtitle')}
          </p>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorksSteps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <AnimatedElement
                key={index}
                animation="fade-up"
                delay={index * 100}
                scrollTrigger
                once
              >
                <Card className="text-center h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-6xl font-bold text-gray-100">
                    {index + 1}
                  </div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </Card>
              </AnimatedElement>
            );
          })}
        </div>
      </div>
    </section>
  );

  return (
    <SolutionPageTemplate
      seo={{
        title: "gPicker - Order Fulfillment System",
        description: "Streamline order fulfillment with gPicker. Centralize orders, guide staff through picking and packing, and dispatch with real-time updates across all channels.",
        keywords: "order fulfillment, picking system, grocery fulfillment, convenience store, dark store operations, order management, dispatch system"
      }}
      hero={{
        title: t('solutions.gPicker.heroTitle'),
        subtitle: t('solutions.gPicker.heroSubtitle'),
        primaryButtonText: t('solutions.gPicker.buttons.scheduleDemo'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
        secondaryButtonText: t('solutions.gPicker.buttons.learnMore'),
        secondaryButtonLink: `/${i18n.language}/connect-with-us`,
      }}
      heroDashboard={HeroDashboard}
      hideBenefits={true}
      hideUseCases={true}
      afterFeatureBoard={CapabilitiesSection}
      afterBenefits={BuiltForSection}
      afterUseCases={HowItWorksSection}
      cta={{
        title: t('solutions.gPicker.ctaSection.title'),
        subtitle: t('solutions.gPicker.ctaSection.description'),
        primaryButtonText: t('solutions.gPicker.buttons.scheduleDemo'),
        primaryButtonLink: `/${i18n.language}/connect-with-us`,
      }}
    />
  );
};
