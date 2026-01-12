import React from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { ContactForm } from '../components/forms/ContactForm';
import { useContent } from '../hooks/useContent';
import { SEO } from '../components/seo';
import { AnimatedElement } from '../components/ui/AnimatedElement';

export const ConnectWithUs: React.FC = () => {
  const { getContent, loading } = useContent();

  const contactMethods = [
    {
      icon: <Phone className="w-8 h-8 text-primary" />,
      title: 'Phone',
      info: '+971 4 XXX XXXX',
      description: 'Monday - Friday, 9AM - 6PM GST',
    },
    {
      icon: <Mail className="w-8 h-8 text-primary" />,
      title: 'Email',
      info: 'hello@grubtech.com',
      description: 'We\'ll respond within 24 hours',
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-primary" />,
      title: 'Live Chat',
      info: 'Available on website',
      description: 'Chat with our team instantly',
    },
    {
      icon: <MapPin className="w-8 h-8 text-primary" />,
      title: 'Office',
      info: 'Dubai, UAE',
      description: 'Visit our headquarters',
    },
  ];

  const offices = [
    {
      city: 'Dubai',
      country: 'United Arab Emirates',
      
      address: 'Dubai Silicon Oasis, Dubai, UAE',
      phone: '+971 4 XXX XXXX',
      email: 'uae@grubtech.com',
    },
    {
      city: 'Riyadh',
      country: 'Saudi Arabia',
      
      address: 'King Fahd Road, Riyadh, KSA',
      phone: '+966 11 XXX XXXX',
      email: 'ksa@grubtech.com',
    },
    {
      city: 'Madrid',
      country: 'Spain',
      
      address: 'Paseo de la Castellana, Madrid, Spain',
      phone: '+34 XXX XXX XXX',
      email: 'spain@grubtech.com',
    },
    {
      city: 'Lisbon',
      country: 'Portugal',
      
      address: 'Avenida da Liberdade, Lisbon, Portugal',
      phone: '+351 XXX XXX XXX',
      email: 'portugal@grubtech.com',
    },
  ];

  return (
    <>
      <SEO
        title="Connect With Us"
        description="Get in touch with Grubtech. Schedule a demo, request pricing, or speak with our team about transforming your restaurant operations."
        keywords="contact grubtech, restaurant software demo, request pricing, grubtech support, restaurant technology consultation"
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] pt-32 pb-20 md:pt-40 md:pb-28 flex items-center bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            animation="fade-up"
            speed="slow"
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {loading ? "Let's Talk" : getContent('connect_hero_title') || "Let's Talk"}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {loading ? "Have questions? Want to see a demo? Our team is here to help you transform your restaurant operations." : getContent('connect_hero_subtitle') || "Have questions? Want to see a demo? Our team is here to help you transform your restaurant operations."}
            </p>
          </AnimatedElement>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <AnimatedElement
                key={index}
                animation="fade-up"
                delay={index * 100}
                scrollTrigger
                once
              >
                <Card className="text-center h-full">
                  <div className="flex justify-center mb-4">{method.icon}</div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">{method.title}</h3>
                  <p className="text-primary font-semibold mb-1">{method.info}</p>
                  <p className="text-sm text-text-secondary">{method.description}</p>
                </Card>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Send Us a Message
            </h2>
            <p className="text-lg text-text-secondary">
              Fill out the form below and we'll get back to you as soon as possible
            </p>
          </AnimatedElement>

          <AnimatedElement
            animation="fade-up"
            delay={200}
            scrollTrigger
            once
          >
            <Card>
              <ContactForm />
            </Card>
          </AnimatedElement>
        </div>
      </section>

      {/* Offices Section */}
      <section className="py-16 md:py-24 bg-background-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Our Global Offices
            </h2>
            <p className="text-lg text-text-secondary">
              Find us in major markets around the world
            </p>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {offices.map((office, index) => (
              <AnimatedElement
                key={index}
                animation="fade-up"
                delay={index * 100}
                scrollTrigger
                once
              >
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-text-primary mb-1">
                        {office.city}
                      </h3>
                      <p className="text-text-secondary mb-4">{office.country}</p>
                      <div className="space-y-2 text-sm text-text-secondary">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{office.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{office.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span>{office.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  );
};
