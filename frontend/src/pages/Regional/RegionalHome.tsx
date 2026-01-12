import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScrollIndicator } from '../../components/ui/ScrollIndicator';
import { CTASection } from '../../components/sections/CTASection';
import { AnimatedElement } from '../../components/ui/AnimatedElement';
import { useTranslation } from 'react-i18next';

type RegionCode = 'ae' | 'sa' | 'es' | 'pt';

const regionData = {
  ae: {
    name: 'United Arab Emirates',

    phone: '+971 4 XXX XXXX',
    email: 'uae@grubtech.com',
    office: 'Dubai, United Arab Emirates',
    description: 'Trusted by leading restaurants across the UAE',
    stats: [
      { value: '500+', label: 'Restaurants in UAE' },
      { value: '7', label: 'Emirates Covered' },
      { value: '24/7', label: 'Local Support' },
    ],
  },
  sa: {
    name: 'Saudi Arabia',

    phone: '+966 11 XXX XXXX',
    email: 'ksa@grubtech.com',
    office: 'Riyadh, Saudi Arabia',
    description: 'Powering digital transformation for Saudi restaurants',
    stats: [
      { value: '300+', label: 'Restaurants in KSA' },
      { value: '13', label: 'Regions Served' },
      { value: '24/7', label: 'Arabic Support' },
    ],
  },
  es: {
    name: 'Spain',

    phone: '+34 XXX XXX XXX',
    email: 'spain@grubtech.com',
    office: 'Madrid, Spain',
    description: 'Transforming restaurants across Spain',
    stats: [
      { value: '200+', label: 'Restaurants in Spain' },
      { value: '17', label: 'Regions Covered' },
      { value: '24/7', label: 'Spanish Support' },
    ],
  },
  pt: {
    name: 'Portugal',

    phone: '+351 XXX XXX XXX',
    email: 'portugal@grubtech.com',
    office: 'Lisbon, Portugal',
    description: 'Helping Portuguese restaurants thrive online',
    stats: [
      { value: '150+', label: 'Restaurants in Portugal' },
      { value: '18', label: 'Districts Served' },
      { value: '24/7', label: 'Portuguese Support' },
    ],
  },
};

export const RegionalHome: React.FC = () => {
  const { region } = useParams<{ region: RegionCode }>();
  const { i18n } = useTranslation();
  const data = region && regionData[region] ? regionData[region] : regionData.ae;

  const solutions = [
    {
      title: 'For SMEs',
      description: 'Affordable solutions for independent restaurants',
      link: '/persona/smbs',
    },
    {
      title: 'For Chains',
      description: 'Multi-location management systems',
      link: '/persona/regional-chains',
    },
    {
      title: 'For Dark Kitchens',
      description: 'Virtual brand management',
      link: '/persona/dark-kitchens',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen pb-20 md:pb-28 flex items-center bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatedElement
            animation="fade-up"
            speed="slow"
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Grubtech {data.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {data.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/${i18n.language}/connect-with-us`}>
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link to={`/${i18n.language}/connect-with-us`}>
                <Button variant="outline" size="lg" className="!border-blue-600 !text-blue-600 !bg-transparent hover:!bg-blue-600 hover:!text-white">
                  Contact Local Team
                </Button>
              </Link>
            </div>
          </AnimatedElement>
        </div>
        <ScrollIndicator />
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.stats.map((stat, index) => (
              <AnimatedElement
                key={index}
                animation="fade-up"
                delay={index * 100}
                scrollTrigger
                once
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-text-secondary">{stat.label}</div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-16 md:py-24 bg-background-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Solutions for {data.name}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Tailored solutions for restaurants of all sizes
            </p>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <AnimatedElement
                key={index}
                animation="fade-up"
                delay={index * 100}
                scrollTrigger
                once
              >
                <Card className="text-center h-full">
                  <h3 className="text-2xl font-bold text-text-primary mb-3">{solution.title}</h3>
                  <p className="text-text-secondary mb-6">{solution.description}</p>
                  <Link to={`/${i18n.language}${solution.link}`}>
                    <Button variant="outline" className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </Card>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-text-secondary">
              Our local team is here to help you succeed
            </p>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-text-primary mb-2">Office</h3>
              <p className="text-text-secondary">{data.office}</p>
            </Card>

            <Card className="text-center">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-text-primary mb-2">Phone</h3>
              <p className="text-text-secondary">{data.phone}</p>
            </Card>

            <Card className="text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-text-primary mb-2">Email</h3>
              <p className="text-text-secondary">{data.email}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Ready to Transform Your Restaurant?"
        subtitle={`Join hundreds of successful restaurants in ${data.name}`}
        primaryButtonText="Schedule a Demo"
        primaryButtonLink={`/${i18n.language}/connect-with-us`}
      />
    </div>
  );
};
