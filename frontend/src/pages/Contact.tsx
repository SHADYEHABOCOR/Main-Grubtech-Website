import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { ContactForm } from '../components/forms/ContactForm';
import { Card } from '../components/ui/Card';
import { ScrollIndicator } from '../components/ui/ScrollIndicator';
import { useContent } from '../hooks/useContent';
import { AnimatedElement } from '../components/ui/AnimatedElement';

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  const { getContent, loading } = useContent();

  const contactInfo = [
    {
      icon: Mail,
      title: loading ? 'Email Us' : getContent('contact_email_title') || 'Email Us',
      content: 'contact@grubtech.com',
      link: 'mailto:contact@grubtech.com',
    },
    {
      icon: Phone,
      title: loading ? 'Call Us' : getContent('contact_phone_title') || 'Call Us',
      content: '+971 4 123 4567',
      link: 'tel:+97141234567',
    },
    {
      icon: MapPin,
      title: loading ? 'Visit Us' : getContent('contact_address_title') || 'Visit Us',
      content: 'Dubai, United Arab Emirates',
      link: 'https://maps.google.com',
    },
    {
      icon: Clock,
      title: loading ? 'Business Hours' : getContent('contact_hours_title') || 'Business Hours',
      content: 'Mon - Fri: 9:00 AM - 6:00 PM',
      link: null,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] pt-32 pb-20 md:pt-40 md:pb-28 flex items-center bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <AnimatedElement
            as="h1"
            animation="fade-up"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {loading ? 'Get in Touch' : getContent('contact_hero_title') || 'Get in Touch'}
          </AnimatedElement>
          <AnimatedElement
            as="p"
            animation="fade-up"
            delay={200}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            {loading ? 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.' : getContent('contact_hero_subtitle') || 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.'}
          </AnimatedElement>
        </div>
        <ScrollIndicator />
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 md:py-24 bg-background-blue-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {contactInfo.map((info, index) => (
              <AnimatedElement
                key={index}
                animation="fade-up"
                speed="fast"
                delay={index * 100}
                scrollTrigger
                once
                className="h-full"
              >
                <Card hoverable={false} className="text-center h-full">
                  <info.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-text-primary mb-2">{info.title}</h3>
                  {info.link ? (
                    <a
                      href={info.link}
                      className="text-text-secondary hover:text-primary transition-colors"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-text-secondary">{info.content}</p>
                  )}
                </Card>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 text-shadow-sm">
              {t('contact.formTitle', { defaultValue: 'Send Us a Message' })}
            </h2>
            <p className="text-lg text-text-secondary">
              {t('contact.formSubtitle', { defaultValue: 'Fill out the form below and our team will get back to you within 24 hours.' })}
            </p>
          </AnimatedElement>

          <AnimatedElement
            animation="fade-up"
            delay={200}
            scrollTrigger
            once
          >
            <Card className="p-8 md:p-12">
              <ContactForm />
            </Card>
          </AnimatedElement>
        </div>
      </section>

      {/* Map Section (Optional placeholder) */}
      <section className="h-96 bg-gray-200">
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>Map Integration Placeholder (Google Maps / Mapbox)</p>
        </div>
      </section>
    </div>
  );
};
