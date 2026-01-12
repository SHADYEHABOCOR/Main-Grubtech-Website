import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PillTabs } from '../../ui/PillTabs';
import { AnimatedElement } from '../../ui/AnimatedElement';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Zap, Bell, TrendingUp, PieChart } from 'lucide-react';

// Import extracted components
import {
  Sidebar,
  TutorialCursor,
  HomeDashboardContent,
  SalesReportsContent,
  FeatureCard,
} from './components';

// Import extracted data
import { homeTutorialSteps, salesTutorialSteps } from './data';

/**
 * DashboardShowcaseSection Component
 *
 * Main section component that showcases the dashboard interface with interactive tutorial.
 * Features:
 * - Dual view system (Home Dashboard and Sales Reports)
 * - Auto-switching between views every 20 seconds
 * - Responsive scaling to maintain aspect ratio
 * - Interactive tutorial cursor overlay
 * - Feature highlights grid
 *
 * This component orchestrates the dashboard showcase experience by managing view state,
 * scaling calculations, and rendering the appropriate dashboard content with tutorial overlays.
 */
export const DashboardShowcaseSection: React.FC = () => {
  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<'home' | 'sales'>('home');
  const dashboardContainerRef = useRef<HTMLDivElement>(null);
  const aspectRatioContainerRef = useRef<HTMLDivElement>(null);
  const [dashboardScale, setDashboardScale] = useState(1);

  // Calculate dashboard scale based on container size
  useEffect(() => {
    const calculateScale = () => {
      if (!aspectRatioContainerRef.current) return;

      const containerRect = aspectRatioContainerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Dashboard is designed for 1400x787 (16:9 ratio)
      const designWidth = 1400;
      const designHeight = 787;

      // Calculate scale to fit container while maintaining aspect ratio
      const scaleX = containerWidth / designWidth;
      const scaleY = containerHeight / designHeight;
      const scale = Math.min(scaleX, scaleY);

      setDashboardScale(scale);
    };

    calculateScale();

    // Recalculate on window resize
    const resizeObserver = new ResizeObserver(calculateScale);
    if (aspectRatioContainerRef.current) {
      resizeObserver.observe(aspectRatioContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Auto-switch views every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev === 'home' ? 'sales' : 'home'));
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Zap, title: 'Real-Time Updates', description: 'See orders and sales data update live as transactions happen across all channels.' },
    { icon: TrendingUp, title: 'Smart Analytics', description: 'AI-powered insights help you identify trends and optimize your operations.' },
    { icon: PieChart, title: 'Multi-Channel View', description: 'Unified view of all delivery platforms, dine-in, and pickup orders in one place.' },
    { icon: Bell, title: 'Instant Alerts', description: 'Get notified about important events like low inventory or unusual patterns.' },
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-slate-50 overflow-hidden relative">
      {/* Background Gradients - hidden on mobile */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-100/30 rounded-full blur-[100px] -z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="text-center mb-10 sm:mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold rounded-full mb-6 shadow-sm">
            <Zap size={14} className="fill-blue-600" />
            {t('homepage.dashboard.badge', 'Powerful Dashboard')}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {t('homepage.dashboard.title', 'See Your Business')}
            <span className="block text-blue-600">
              {t('homepage.dashboard.titleHighlight', 'at a Glance')}
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('homepage.dashboard.subtitle', 'Our intuitive dashboard gives you real-time insights into orders, sales, and performance across all your channels — all in one unified view.')}
          </p>
        </AnimatedElement>

        {/* View Switcher */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <PillTabs
            tabs={[
              { key: 'home', label: t('homepage.dashboard.tabs.home', 'Home') },
              { key: 'sales', label: t('homepage.dashboard.tabs.sales', 'Sales') },
            ]}
            activeKey={currentView}
            onChange={(key) => setCurrentView(key as 'home' | 'sales')}
          />
        </div>

        {/* Dashboard Container with Aspect Ratio */}
        <AnimatedElement
          animation="fade-up"
          delay={100}
          scrollTrigger
          once
          className="relative mb-12 md:mb-16 lg:mb-24"
        >
          {/* Gradient background glow - only on desktop */}
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-500 rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] blur opacity-30 hidden lg:block" />

          {/* Aspect Ratio Container - maintains 16:9 ratio */}
          <div ref={aspectRatioContainerRef} className="relative w-full" style={{ aspectRatio: '16 / 9' }} dir="ltr">
            {/* Dashboard Frame - scales to fit container */}
            <div className="absolute inset-0 bg-gray-900 p-1 sm:p-2 rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] shadow-2xl shadow-blue-900/20 ring-1 ring-white/10">
              <div className="w-full h-full bg-[#f3f4f6] rounded-xl md:rounded-2xl lg:rounded-[2rem] overflow-hidden border border-gray-200/50">
                {/* Scaled Dashboard Container - designed for 1400x787 (16:9), scales to fill container */}
                <div
                  ref={dashboardContainerRef}
                  className="flex w-full h-full relative"
                  style={{
                    transform: `scale(${dashboardScale})`,
                    transformOrigin: '0 0',
                    width: `${100 / dashboardScale}%`,
                    height: `${100 / dashboardScale}%`
                  }}
                >
                  <Sidebar activePage={currentView} prefersReducedMotion={prefersReducedMotion} />
                  <div
                    className="flex-1 overflow-y-auto scrollbar-hide scroll-smooth"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {currentView === 'home' ? <HomeDashboardContent prefersReducedMotion={prefersReducedMotion} /> : <SalesReportsContent prefersReducedMotion={prefersReducedMotion} />}
                  </div>
                  <TutorialCursor
                    steps={currentView === 'home' ? homeTutorialSteps : salesTutorialSteps}
                    isPlaying={true}
                    containerRef={dashboardContainerRef}
                    prefersReducedMotion={prefersReducedMotion}
                    scale={dashboardScale}
                  />
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <AnimatedElement
              key={feature.title}
              animation="fade-up"
              speed="fast"
              delay={index * 100}
              scrollTrigger
              once
            >
              <FeatureCard
                icon={feature.icon}
                title={t(`homepage.dashboard.features.${index}.title`, feature.title)}
                description={t(`homepage.dashboard.features.${index}.description`, feature.description)}
                delay={0.1 * index}
                prefersReducedMotion={prefersReducedMotion}
              />
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardShowcaseSection;
