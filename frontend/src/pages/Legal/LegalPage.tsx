import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { AnimatedElement } from '../../components/ui/AnimatedElement';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export const LegalPage: React.FC<LegalPageProps> = ({ title, lastUpdated, children }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] pt-32 pb-20 md:pt-40 md:pb-28 flex items-center bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatedElement
            animation="fade-up"
            speed="slow"
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-gray-600">{t('legal.lastUpdated')}: {lastUpdated}</p>
          </AnimatedElement>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="prose prose-lg max-w-none">
            {children}
          </Card>
        </div>
      </section>
    </div>
  );
};
