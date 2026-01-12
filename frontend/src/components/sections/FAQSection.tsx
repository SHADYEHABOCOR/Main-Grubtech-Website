import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../ui/AnimatedElement';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs?: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  // Get FAQs from translations if not provided as prop
  const faqItems = faqs || (t('faq.questions', { returnObjects: true }) as FAQItem[]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-background-blue-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-lg text-text-secondary">
            {t('faq.subtitle')}
          </p>
        </AnimatedElement>

        <div className="space-y-4">
          {faqItems.map((faq, index) => (
            <AnimatedElement
              key={index}
              animation="fade-up"
              speed="fast"
              delay={index * 30}
              scrollTrigger
              once
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-text-primary pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-primary flex-shrink-0 ${
                    !prefersReducedMotion ? 'transition-transform duration-300' : ''
                  } ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {/* CSS-only accordion using CSS Grid technique */}
              <div
                className={`grid overflow-hidden ${
                  !prefersReducedMotion ? 'transition-[grid-template-rows,opacity] duration-300 ease-in-out' : ''
                } ${
                  openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 text-text-secondary leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>

        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="text-center mt-12"
        >
          <p className="text-text-secondary mb-4">
            {t('faq.stillHaveQuestions')}
          </p>
          <a
            href="/connect-with-us"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            {t('faq.contactUs')}
          </a>
        </AnimatedElement>
      </div>
    </section>
  );
};
