import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { useLenis } from './hooks/useLenis';
import { LanguageRedirect } from './components/i18n/LanguageRedirect';
import { ValidatedLanguageRoute } from './components/i18n/ValidatedLanguageRoute';
import { RTLProvider } from './components/i18n/RTLProvider';
import { CookieConsentBanner } from './components/lead-generation';
import { RateLimitProvider } from './context/RateLimitContext';
import { ErrorBoundary, RouteErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { ToastProvider } from './components/ui/Toast';
import { ScrollRestoration } from './hooks/useScrollRestoration';
import { initWebVitals } from './utils/analytics/webVitals';
import { initDeferredAnalytics, loadAnalyticsIfNeeded } from './utils/analytics';
import { SkipLink } from './components/accessibility';
import './i18n/config';

// Initialize Core Web Vitals tracking
initWebVitals();

// Lazy load Home page for better initial bundle size
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));

// Lazy load pages for code splitting
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const ConnectWithUs = lazy(() => import('./pages/ConnectWithUs').then(m => ({ default: m.ConnectWithUs })));
const Careers = lazy(() => import('./pages/Careers').then(m => ({ default: m.Careers })));
const FAQs = lazy(() => import('./pages/FAQs').then(m => ({ default: m.FAQs })));

// Solution Pages
const GOnline = lazy(() => import('./pages/Solutions/GOnline').then(m => ({ default: m.GOnline })));
const GOnlineLite = lazy(() => import('./pages/Solutions/GOnlineLite').then(m => ({ default: m.GOnlineLite })));
const GKDS = lazy(() => import('./pages/Solutions/GKDS').then(m => ({ default: m.GKDS })));
const GDispatch = lazy(() => import('./pages/Solutions/GDispatch').then(m => ({ default: m.GDispatch })));
const GData = lazy(() => import('./pages/Solutions/GData').then(m => ({ default: m.GData })));
const GPicker = lazy(() => import('./pages/Solutions/GPicker').then(m => ({ default: m.GPicker })));

// Persona Pages
const SMBs = lazy(() => import('./pages/Persona/SMBs').then(m => ({ default: m.SMBs })));
const RegionalChains = lazy(() => import('./pages/Persona/RegionalChains').then(m => ({ default: m.RegionalChains })));
const GlobalChains = lazy(() => import('./pages/Persona/GlobalChains').then(m => ({ default: m.GlobalChains })));
const DarkKitchens = lazy(() => import('./pages/Persona/DarkKitchens').then(m => ({ default: m.DarkKitchens })));

// Integration Pages
const Integrations = lazy(() => import('./pages/Integrations/Integrations').then(m => ({ default: m.Integrations })));

// Legal Pages
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Terms = lazy(() => import('./pages/Legal/Terms').then(m => ({ default: m.Terms })));
const DPA = lazy(() => import('./pages/Legal/DPA').then(m => ({ default: m.DPA })));
const SLA = lazy(() => import('./pages/Legal/SLA').then(m => ({ default: m.SLA })));
const GDPR = lazy(() => import('./pages/Legal/GDPR').then(m => ({ default: m.GDPR })));

// Cookie Settings
const CookieSettings = lazy(() => import('./components/lead-generation').then(m => ({ default: m.CookieSettings })));

// Blog Pages
const BlogListing = lazy(() => import('./pages/Blog/BlogListing').then(m => ({ default: m.BlogListing })));
const BlogDetail = lazy(() => import('./pages/Blog/BlogDetail').then(m => ({ default: m.BlogDetail })));

// Video Showcase Page
const VideoShowcase = lazy(() => import('./pages/VideoShowcase').then(m => ({ default: m.VideoShowcase })));

// 404 Not Found Page
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Admin Pages - Lazy loaded since they're less frequently accessed
const AdminProvider = lazy(() => import('./context/AdminContext').then(m => ({ default: m.AdminProvider })));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute').then(m => ({ default: m.ProtectedRoute })));
const Login = lazy(() => import('./pages/Admin/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard').then(m => ({ default: m.Dashboard })));
const BlogList = lazy(() => import('./pages/Admin/BlogList').then(m => ({ default: m.BlogList })));
const BlogForm = lazy(() => import('./pages/Admin/BlogForm').then(m => ({ default: m.BlogForm })));
const TestimonialsList = lazy(() => import('./pages/Admin/TestimonialsList').then(m => ({ default: m.TestimonialsList })));
const TestimonialsForm = lazy(() => import('./pages/Admin/TestimonialsForm').then(m => ({ default: m.TestimonialsForm })));
const CareersList = lazy(() => import('./pages/Admin/CareersList').then(m => ({ default: m.CareersList })));
const CareersForm = lazy(() => import('./pages/Admin/CareersForm').then(m => ({ default: m.CareersForm })));
const IntegrationsList = lazy(() => import('./pages/Admin/IntegrationsList').then(m => ({ default: m.IntegrationsList })));
const IntegrationsForm = lazy(() => import('./pages/Admin/IntegrationsForm').then(m => ({ default: m.IntegrationsForm })));
const VideoGalleriesList = lazy(() => import('./pages/Admin/VideoGalleriesList').then(m => ({ default: m.VideoGalleriesList })));
const VideoGalleriesForm = lazy(() => import('./pages/Admin/VideoGalleriesForm').then(m => ({ default: m.VideoGalleriesForm })));
const LeadsList = lazy(() => import('./pages/Admin/LeadsList').then(m => ({ default: m.LeadsList })));
const LeadDetail = lazy(() => import('./pages/Admin/LeadDetail').then(m => ({ default: m.LeadDetail })));
const JobApplicationsList = lazy(() => import('./pages/Admin/JobApplicationsList').then(m => ({ default: m.JobApplicationsList })));
const PoliciesList = lazy(() => import('./pages/Admin/PoliciesList').then(m => ({ default: m.PoliciesList })));
const PoliciesForm = lazy(() => import('./pages/Admin/PoliciesForm').then(m => ({ default: m.PoliciesForm })));

// Full page loading skeleton with header (for initial app load)
const LoadingFallback = () => (
  <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
    {/* Header skeleton */}
    <div className="h-20 bg-white/80 backdrop-blur-sm border-b border-gray-100" />

    {/* Centered loader */}
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Loading...</p>
      </div>
    </div>
  </div>
);

// Analytics Tracker Component
function AnalyticsTracker() {
  const location = useLocation();

  // Initialize session and deferred analytics on app load
  useEffect(() => {
    // analytics.initSession(); // Disabled - using Google Analytics instead
    // Initialize deferred analytics (loads after 3s delay on eligible pages)
    initDeferredAnalytics();
  }, []);

  // Track page views on route change and load analytics if needed
  useEffect(() => {
    // analytics.trackPageView(); // Disabled - using Google Analytics instead
    // Check if analytics should be loaded for this route (SPA navigation)
    loadAnalyticsIfNeeded(location.pathname);
  }, [location]);

  return null;
}

function App() {
  // Optimized Lenis smooth scroll - uses autoRaf which stops when idle
  useLenis();

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <RateLimitProvider>
          <ToastProvider position="top-right">
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <OfflineIndicator />
              <ScrollRestoration />
              <AnalyticsTracker />
            <LanguageRedirect />
            <RTLProvider />
            <CookieConsentBanner />
            <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Admin Login (Public) */}
              <Route path="/admin/login" element={<Login />} />

              {/* Admin Routes (Protected) */}
              <Route path="/admin/*" element={
                <RouteErrorBoundary>
                  <ProtectedRoute>
                    <AdminProvider>
                      <AdminLayout />
                    </AdminProvider>
                  </ProtectedRoute>
                </RouteErrorBoundary>
              }>
                <Route index element={<Dashboard />} />
                <Route path="blog" element={<BlogList />} />
                <Route path="blog/new" element={<BlogForm />} />
                <Route path="blog/edit/:id" element={<BlogForm />} />
                <Route path="testimonials" element={<TestimonialsList />} />
                <Route path="testimonials/new" element={<TestimonialsForm />} />
                <Route path="testimonials/edit/:id" element={<TestimonialsForm />} />
                <Route path="careers" element={<CareersList />} />
                <Route path="careers/new" element={<CareersForm />} />
                <Route path="careers/:id" element={<CareersForm />} />
                <Route path="integrations" element={<IntegrationsList />} />
                <Route path="integrations/new" element={<IntegrationsForm />} />
                <Route path="integrations/edit/:id" element={<IntegrationsForm />} />
                <Route path="video-galleries" element={<VideoGalleriesList />} />
                <Route path="video-galleries/new" element={<VideoGalleriesForm />} />
                <Route path="video-galleries/edit/:id" element={<VideoGalleriesForm />} />
                <Route path="leads" element={<LeadsList />} />
                <Route path="leads/:id" element={<LeadDetail />} />
                <Route path="job-applications" element={<JobApplicationsList />} />
                <Route path="policies" element={<PoliciesList />} />
                <Route path="policies/new" element={<PoliciesForm />} />
                <Route path="policies/:id" element={<PoliciesForm />} />
              </Route>

              {/* Language-prefixed routes */}
              <Route path="/:lang/*" element={
                <ValidatedLanguageRoute>
                <div className="min-h-screen flex flex-col relative">
                  <SkipLink targetId="main-content" />
                  <Header />
                  <main id="main-content" className="flex-grow relative z-10" tabIndex={-1}>
                    <RouteErrorBoundary>
                        <Routes>
                          {/* Main Pages */}
                          <Route path="/" element={<Home />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/connect-with-us" element={<ConnectWithUs />} />
                          <Route path="/careers" element={<Careers />} />
                          <Route path="/faqs" element={<FAQs />} />

                          {/* Solution Pages */}
                          <Route path="/gonline" element={<GOnline />} />
                          <Route path="/gonline-lite" element={<GOnlineLite />} />
                          <Route path="/gkds" element={<GKDS />} />
                          <Route path="/gdispatch" element={<GDispatch />} />
                          <Route path="/gdata" element={<GData />} />
                          <Route path="/gpicker" element={<GPicker />} />

                          {/* Legacy routes for backwards compatibility */}
                          <Route path="/solutions/gonline" element={<GOnline />} />
                          <Route path="/solutions/gkds" element={<GKDS />} />

                          {/* Persona Pages */}
                          <Route path="/persona/smbs" element={<SMBs />} />
                          <Route path="/persona/regional-chains" element={<RegionalChains />} />
                          <Route path="/persona/global-chains" element={<GlobalChains />} />
                          <Route path="/persona/dark-kitchens" element={<DarkKitchens />} />

                          {/* Integrations */}
                          <Route path="/integrations" element={<Integrations />} />

                          {/* Legal Pages */}
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms-and-conditions" element={<Terms />} />
                          <Route path="/dpa" element={<DPA />} />
                          <Route path="/service-level-agreement" element={<SLA />} />
                          <Route path="/gdpr-eu" element={<GDPR />} />
                          <Route path="/cookie-settings" element={<CookieSettings />} />

                          {/* Blog Pages */}
                          <Route path="/blog" element={<BlogListing />} />
                          <Route path="/blog/:slug" element={<BlogDetail />} />

                          {/* Video Showcase */}
                          <Route path="/videos" element={<VideoShowcase />} />

                          {/* 404 Not Found - Catch all unmatched routes */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                    </RouteErrorBoundary>
                  </main>
                  <Footer />
                </div>
                </ValidatedLanguageRoute>
              } />

              {/* Fallback routes without language prefix - redirect handled by LanguageRedirect */}
              {/* This renders nothing while LanguageRedirect performs the redirect */}
              <Route path="/*" element={null} />
            </Routes>
          </Suspense>
            </Router>
          </ToastProvider>
        </RateLimitProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
