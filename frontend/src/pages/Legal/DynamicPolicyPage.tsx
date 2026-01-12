import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { PageHead, STATIC_PAGE_HEAD_PROPS } from '../../components/seo';
import { AnimatedElement } from '../../components/ui/AnimatedElement';
import axios from 'axios';
import { getApiUrl } from '../../config/api';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

interface PolicyData {
  id: number;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  updated_at: string;
}

interface DynamicPolicyPageProps {
  slug: string;
  fallbackTitle: string;
  fallbackContent: React.ReactNode;
  fallbackLastUpdated: string;
}

export const DynamicPolicyPage: React.FC<DynamicPolicyPageProps> = ({
  slug,
  fallbackTitle,
  fallbackContent,
  fallbackLastUpdated,
}) => {
  const { t, i18n } = useTranslation();
  const [policyData, setPolicyData] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const API_BASE = getApiUrl('/api');
        const response = await axios.get(`${API_BASE}/policies/${slug}?lang=${i18n.language}`);
        setPolicyData(response.data);
        setUseFallback(false);
      } catch {
        // API failed, use fallback content
        setUseFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [slug, i18n.language]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative min-h-[50vh] pt-32 pb-20 md:pt-40 md:pb-28 flex items-center bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              <div className="h-12 w-64 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4" />
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          </div>
        </section>
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </Card>
          </div>
        </section>
      </div>
    );
  }

  // Use API content if available, otherwise use fallback
  const title = useFallback ? fallbackTitle : policyData?.title || fallbackTitle;
  const lastUpdated = useFallback
    ? fallbackLastUpdated
    : policyData?.updated_at
      ? formatDate(policyData.updated_at)
      : fallbackLastUpdated;

  return (
    <div className="min-h-screen bg-white">
      {/* Optimized resource hints for static pages - no analytics preconnects */}
      <PageHead {...STATIC_PAGE_HEAD_PROPS} />

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
            {useFallback ? (
              // Render fallback React content
              fallbackContent
            ) : (
              // Render HTML content from API
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(policyData?.content || '') }}
                className="space-y-6 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:mb-3 [&>p]:text-gray-600 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:list-inside [&>ul]:text-gray-600 [&>ul]:space-y-2 [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:text-gray-600 [&>ol]:space-y-2 [&>ol]:ml-4 [&>a]:text-blue-600 [&>a]:underline"
              />
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};
