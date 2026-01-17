import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink, Puzzle } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PillTabs } from '../../components/ui/PillTabs';
import { ScrollIndicator } from '../../components/ui/ScrollIndicator';
import { DataState } from '../../components/ui/DataState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import { getFileUrl } from '../../config/api';
import { OptimizedImage } from '../../components/ui/OptimizedImage';
import { AnimatedElement } from '../../components/ui/AnimatedElement';
import { useIntegrations, useIntegrationCategories } from '../../hooks/useIntegrations';
import { IntegrationRequestModal } from '../../components/modals/IntegrationRequestModal';
import type { Integration } from '../../types';

type TabType = 'POS' | 'Delivery' | 'Fulfillment' | 'ERP';

/**
 * Hook to track window width for responsive column calculation
 */
const useWindowWidth = () => {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

/**
 * Calculate number of columns based on window width
 * Matches Tailwind breakpoints: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
 */
const getColumnCount = (width: number): number => {
  if (width >= 1024) return 4; // lg breakpoint
  if (width >= 640) return 2;  // sm breakpoint
  return 1;
};

export const Integrations: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('POS');
  const [initialLoad, setInitialLoad] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Virtual scrolling setup
  const parentRef = useRef<HTMLDivElement>(null);
  const windowWidth = useWindowWidth();
  const columnCount = getColumnCount(windowWidth);

  const allTabs = [
    { id: 'POS' as TabType, label: 'POS Systems' },
    { id: 'Delivery' as TabType, label: 'Delivery Platforms' },
    { id: 'Fulfillment' as TabType, label: 'Fulfillment' },
    { id: 'ERP' as TabType, label: 'ERP Systems' },
  ];

  // Fetch available categories
  const { data: categoriesData, isLoading: categoriesLoading } = useIntegrationCategories();
  const availableTabs = (categoriesData || []) as TabType[];

  // Fetch integrations for the active tab
  const { data: integrationsData, isLoading: integrationsLoading, error: integrationsError, refetch } = useIntegrations({
    category: activeTab,
    status: 'active',
    limit: 500
  });
  const integrations = integrationsData?.data || [];

  // Calculate virtual rows based on column count
  const rowCount = useMemo(
    () => Math.ceil(integrations.length / columnCount),
    [integrations.length, columnCount]
  );

  // Setup virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated row height (card height + gap)
    overscan: 2, // Render 2 extra rows above and below viewport
  });

  // Set initial tab from URL or first available category
  useEffect(() => {
    if (categoriesLoading || initialLoad === false) return;

    if (availableTabs.length > 0) {
      const tab = searchParams.get('tab');
      if (tab && availableTabs.includes(tab as TabType)) {
        setActiveTab(tab as TabType);
      } else {
        // Use first available tab in order
        const firstAvailable = allTabs.find(t => availableTabs.includes(t.id));
        if (firstAvailable) setActiveTab(firstAvailable.id);
      }
      setInitialLoad(false);
    }
  }, [categoriesLoading, availableTabs, initialLoad, searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  // Only show tabs that have integrations
  const tabs = allTabs.filter(tab => availableTabs.includes(tab.id));

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
          <AnimatedElement animation="fade-up" speed="slow" className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('integrations.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('integrations.hero.subtitle')}
            </p>
            <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
              {t('integrations.hero.requestButton')}
            </Button>
          </AnimatedElement>
        </div>
        <ScrollIndicator />
      </section>

      {/* Tabs Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title and Description */}
          <div className="text-center mb-8 relative">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 text-shadow-sm">
              {t(`integrations.tabs.${activeTab.toLowerCase()}.title`)}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t(`integrations.tabs.${activeTab.toLowerCase()}.description`)}
            </p>
          </div>

          {/* Tab Navigation - Below title and description */}
          <div className="mb-12">
            <PillTabs
              tabs={tabs.map((tab) => ({
                key: tab.id,
                label: tab.label,
              }))}
              activeKey={activeTab}
              onChange={(key) => handleTabChange(key as TabType)}
              className="flex justify-center"
            />
          </div>

          {/* Integration Cards */}
          <AnimatedElement key={activeTab} animation="fade-up" speed="fast">
            <DataState
              isLoading={integrationsLoading}
              isError={!!integrationsError}
              error={integrationsError instanceof Error ? integrationsError : new Error('Failed to load integrations')}
              isEmpty={integrations.length === 0}
              onRetry={() => refetch()}
              skeleton={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Card key={i} className="p-8">
                      <div className="flex flex-col items-center">
                        <Skeleton className="w-20 h-20 mb-4" />
                        <Skeleton className="w-32 h-6 mb-2" />
                        <Skeleton className="w-full h-4 mb-1" />
                        <Skeleton className="w-3/4 h-4" />
                      </div>
                    </Card>
                  ))}
                </div>
              }
              emptyComponent={
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Puzzle className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('integrations.empty.title')}</h3>
                  <p className="text-gray-600">{t('integrations.empty.description')}</p>
                </div>
              }
              messages={{
                error: t('integrations.error'),
              }}
            >
              {/* Virtual scrolling container */}
              <div
                ref={parentRef}
                className="overflow-auto"
                style={{ height: '800px' }}
              >
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const startIndex = virtualRow.index * columnCount;
                    const rowIntegrations = integrations.slice(startIndex, startIndex + columnCount);

                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {rowIntegrations.map((integration: Integration) => (
                            <Card
                              key={integration.id}
                              className="text-center h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-between p-8"
                            >
                              <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="mb-4 h-20 flex items-center justify-center w-full">
                                  <OptimizedImage
                                    src={getFileUrl(integration.logo_url)}
                                    alt={integration.name}
                                    className="max-h-full max-w-full object-contain rounded-lg"
                                  />
                                </div>
                                <h3 className="text-lg font-bold text-text-primary mb-2">{integration.name}</h3>
                                <p className="text-sm text-text-secondary mb-4">{integration.description}</p>
                              </div>
                              {integration.website_url && (
                                <a
                                  href={integration.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors text-sm font-semibold"
                                >
                                  Visit Website
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DataState>
          </AnimatedElement>
        </div>
      </section>

      {/* Integration Request Modal */}
      <IntegrationRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};