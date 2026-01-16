import React from 'react';
import { ArrowRight, Package, ShoppingCart, Printer, Truck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../../components/ui';
import { RestaurantTypesTabs } from '../../components/sections/RestaurantTypesTabs';
import { FAQSection } from '../../components/sections/FAQSection';
import { FeatureBoard } from '../../components/sections/FeatureBoard';
import { ScrollIndicator } from '../../components/ui/ScrollIndicator';
import { SEO } from '../../components/seo';
import { CTASection } from '../../components/sections/CTASection';
import restaurantTypesImage from '../../assets/images/67e4f77992b25496c5f2bac1_Group-801.webp';

export const GPicker: React.FC = () => {
  const { t, i18n } = useTranslation();

  const builtForItems = t('solutions.gPicker.builtFor.items', { returnObjects: true }) as string[];
  const howItWorksSteps = t('solutions.gPicker.howItWorks.steps', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const capabilities = t('solutions.gPicker.capabilities.items', { returnObjects: true }) as Array<{ title: string; description: string; features: string[] }>;

  const stepIcons = [Package, ShoppingCart, Printer, Truck];

  return (
    <>
      <SEO
        title="gPicker - Order Fulfillment System"
        description="Streamline order fulfillment with gPicker. Centralize orders, guide staff through picking and packing, and dispatch with real-time updates across all channels."
        keywords="order fulfillment, picking system, grocery fulfillment, convenience store, dark store operations, order management, dispatch system"
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
                  {t('solutions.gPicker.heroTitle')}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  {t('solutions.gPicker.heroSubtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/${i18n.language}/connect-with-us`}>
                    <Button variant="primary" size="lg">
                      {t('solutions.gPicker.buttons.scheduleDemo')}
                    </Button>
                  </Link>
                  <Link to={`/${i18n.language}/connect-with-us`}>
                    <Button variant="outline" size="lg" className="!border-blue-600 !text-blue-600 !bg-transparent hover:!bg-blue-600 hover:!text-white">
                      {t('solutions.gPicker.buttons.learnMore')}
                    </Button>
                  </Link>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="fade-left" speed="slow" delay={200} className="relative">
                {/* Subtle glow behind visual */}
                <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />
                {/* Visual representation of fulfillment flow */}
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
              </AnimatedElement>
            </div>
          </div>
          <ScrollIndicator />
        </section>

        {/* Features Section */}
        <FeatureBoard />

        {/* Key Capabilities Section - Using BenefitsGrid-like structure */}
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

        {/* Built For Section - Same as Use Cases in other pages */}
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

        {/* How It Works Section */}
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

        {/* Restaurant Types Tabs */}
        <RestaurantTypesTabs />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <CTASection
          title={t('solutions.gPicker.ctaSection.title')}
          subtitle={t('solutions.gPicker.ctaSection.description')}
          primaryButtonText={t('solutions.gPicker.buttons.scheduleDemo')}
          primaryButtonLink={`/${i18n.language}/connect-with-us`}
        />
      </div>
    </>
  );
};
