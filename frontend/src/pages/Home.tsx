import React, { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { useVideos } from '../hooks/useVideos';
import { HeroSection } from '../components/sections/HeroSection';
import { PartnersSection } from '../components/sections/PartnersSection';

import { SEO, StructuredData, ResourcePreloader } from '../components/seo';
import { generateOrganizationSchema, generateWebsiteSchema } from '../utils/seo/structuredData';

// Lazy load below-the-fold sections for better initial load performance
const StatsSection = lazy(() => import('../components/sections/StatsSection').then(m => ({ default: m.StatsSection })));
const SolutionsSection = lazy(() => import('../components/sections/SolutionsSection').then(m => ({ default: m.SolutionsSection })));
const DashboardShowcaseSection = lazy(() => import('../components/sections/DashboardShowcase').then(m => ({ default: m.DashboardShowcaseSection })));
const RestaurantTypesTabs = lazy(() => import('../components/sections/RestaurantTypesTabs').then(m => ({ default: m.RestaurantTypesTabs })));
const TestimonialsSection = lazy(() => import('../components/sections/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const CTASection = lazy(() => import('../components/sections/CTASection').then(m => ({ default: m.CTASection })));
const VideoGallery = lazy(() => import('../components/ui/VideoGallery').then(m => ({ default: m.VideoGallery })));

// Minimal loading placeholder for sections
const SectionPlaceholder = () => (
  <div className="py-16 md:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-8 w-48 bg-gray-200 rounded mb-8 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { data: productVideos = [], isLoading: loading } = useVideos();

  return (
    <>
      {/* SEO Meta Tags and Canonical URL */}
      <SEO
        title={t('homepage.seo.title', 'Unified Restaurant Operations and Management Platform')}
        description={t('homepage.seo.description', 'Effortlessly operate, delegate, and manage your entire restaurant! Grubtech brings all restaurant touchpoints to your fingertips through a single dashboard.')}
        keywords={t('homepage.seo.keywords', 'restaurant management, restaurant operations, POS integration, online ordering, delivery management, kitchen display system, restaurant analytics, multi-location restaurant, food service technology')}
        type="website"
      />

      {/* Structured Data for Search Engines */}
      <StructuredData
        data={[
          generateOrganizationSchema(),
          generateWebsiteSchema()
        ]}
      />

      {/* Prefetch likely next routes after page load */}
      <ResourcePreloader
        prefetchRoutes={['/en/about', '/en/pricing', '/en/connect-with-us']}
      />

      <main>
        {/* Above-the-fold content - loaded immediately */}
        <HeroSection />
        <PartnersSection />

        {/* Below-the-fold content - lazy loaded for better initial performance */}
        <Suspense fallback={<SectionPlaceholder />}>
          <DashboardShowcaseSection />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <SolutionsSection />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <RestaurantTypesTabs />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <StatsSection />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <TestimonialsSection />
        </Suspense>
        {!loading && productVideos.length > 0 && (
          <Suspense fallback={<SectionPlaceholder />}>
            <VideoGallery
              title={t('homepage.videoGallery.title', 'See Grubtech in Action')}
              videos={productVideos}
            />
          </Suspense>
        )}
        <Suspense fallback={<SectionPlaceholder />}>
          <CTASection />
        </Suspense>
      </main>
    </>
  );
};
