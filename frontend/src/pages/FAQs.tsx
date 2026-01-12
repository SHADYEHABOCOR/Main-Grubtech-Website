import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { PillTabs } from '../components/ui/PillTabs';
import { CTASection } from '../components/sections/CTASection';
import { useTranslation } from 'react-i18next';
import { useContent } from '../hooks/useContent';
import { AnimatedElement } from '../components/ui/AnimatedElement';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export const FAQs: React.FC = () => {
  const { getContent, loading } = useContent();
  const { i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const categories = ['All', 'General', 'Pricing', 'Technical', 'Integrations', 'Support'];

  const faqs: FAQ[] = [
    {
      category: 'General',
      question: 'What is Grubtech?',
      answer: 'Grubtech is a comprehensive restaurant technology platform that helps restaurants manage online orders, streamline operations, and grow their business. We integrate with POS systems, delivery platforms, and provide analytics to optimize your restaurant operations.',
    },
    {
      category: 'General',
      question: 'Who can use Grubtech?',
      answer: 'Grubtech is designed for restaurants of all sizes - from independent cafes and SMEs to regional chains, global brands, and dark kitchens. Our solutions scale to meet your needs.',
    },
    {
      category: 'Pricing',
      question: 'How much does Grubtech cost?',
      answer: 'We offer flexible pricing plans based on your restaurant size and needs. Starting from affordable plans for single-location restaurants to enterprise solutions for multi-location operations. Contact our sales team for a custom quote.',
    },
    {
      category: 'Pricing',
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 14-day free trial for gOnline Lite so you can experience the platform before committing. No credit card required.',
    },
    {
      category: 'Pricing',
      question: 'Are there any setup fees?',
      answer: 'Setup fees vary depending on your package and integration requirements. Many of our plans include free setup and onboarding support.',
    },
    {
      category: 'Technical',
      question: 'How long does implementation take?',
      answer: 'Implementation time varies by solution. gOnline Lite can be set up in under 30 minutes. More complex integrations with POS systems and multiple locations typically take 1-2 weeks.',
    },
    {
      category: 'Technical',
      question: 'Do I need technical expertise to use Grubtech?',
      answer: 'No! Our platform is designed to be user-friendly and intuitive. We provide comprehensive training and 24/7 support to ensure your success.',
    },
    {
      category: 'Technical',
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption and are SOC2 and ISO compliant. Your data is securely stored and backed up regularly.',
    },
    {
      category: 'Integrations',
      question: 'Which POS systems do you integrate with?',
      answer: 'We integrate with all major POS systems including Oracle MICROS, Toast, Square, Lightspeed, NCR Aloha, and many more. Check our integrations page for the full list.',
    },
    {
      category: 'Integrations',
      question: 'Do you integrate with delivery platforms?',
      answer: 'Yes! We integrate with all major delivery platforms including Uber Eats, DoorDash, Deliveroo, Just Eat, Talabat, and more. Manage all orders from one dashboard.',
    },
    {
      category: 'Integrations',
      question: 'Can I request a custom integration?',
      answer: 'Yes, we offer custom integration development for enterprise clients. Contact our sales team to discuss your specific needs.',
    },
    {
      category: 'Support',
      question: 'What support do you provide?',
      answer: 'We offer 24/7 customer support via phone, email, and live chat. Enterprise customers get dedicated account managers and priority support.',
    },
    {
      category: 'Support',
      question: 'Do you provide training?',
      answer: 'Yes! We provide comprehensive onboarding training for all new customers. We also offer ongoing training sessions and a detailed knowledge base.',
    },
    {
      category: 'Support',
      question: 'How quickly do you respond to support tickets?',
      answer: 'Standard support tickets receive a response within 4 hours. Enterprise customers receive priority support with response times under 1 hour.',
    },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch =
      searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            animation="fade-up"
            speed="slow"
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {loading ? 'Frequently Asked Questions' : getContent('faqs_hero_title') || 'Frequently Asked Questions'}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {loading ? 'Find answers to common questions about Grubtech' : getContent('faqs_hero_subtitle') || 'Find answers to common questions about Grubtech'}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={loading ? 'Search FAQs...' : getContent('faqs_search_placeholder') || 'Search FAQs...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg border-0 focus:ring-2 focus:ring-primary text-lg shadow-lg"
                />
              </div>
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <PillTabs
              tabs={categories.map((category) => ({
                key: category,
                label: category,
              }))}
              activeKey={activeCategory}
              onChange={setActiveCategory}
            />
          </div>
        </div>
      </section>

      {/* FAQs List */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-text-secondary mb-4">
                No FAQs found matching "{searchTerm}". Try different keywords.
              </p>
              <a
                href={`/${i18n.language}/connect-with-us`}
                className="text-primary hover:underline font-medium"
              >
                Contact our support team →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <AnimatedElement
                  key={index}
                  animation="fade-up"
                  delay={index * 50}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full text-left"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-text-primary mb-1">
                            {faq.question}
                          </h3>
                          <span className="text-xs text-primary font-medium">
                            {faq.category}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-6 h-6 text-text-secondary transition-transform duration-300 flex-shrink-0 ${
                            expandedIndex === index ? 'transform rotate-180' : ''
                          }`}
                        />
                      </div>

                      {/* CSS-only accordion using CSS Grid technique */}
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          expandedIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-text-secondary mt-4 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </button>
                  </Card>
                </AnimatedElement>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Still Have Questions?"
        subtitle="Our team is here to help you find the right solution"
        primaryButtonText="Contact Support"
        primaryButtonLink={`/${i18n.language}/connect-with-us`}
        secondaryButtonText="Visit Knowledge Base"
        secondaryButtonLink="https://knowledge.grubtech.com/"
      />
    </div>
  );
};
