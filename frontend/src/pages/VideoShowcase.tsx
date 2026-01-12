import React from 'react';
import { VideoGallery } from '../components/ui/VideoGallery';
import { VideoData } from '../utils/videoHelpers';
import { CTASection } from '../components/sections/CTASection';
import { PageHead, VIDEO_PAGE_HEAD_PROPS } from '../components/seo';

export const VideoShowcase: React.FC = () => {
  // Example video data - replace with your actual videos
  const productVideos: VideoData[] = [
    {
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Getting Started with Grubtech',
      description: 'Learn how to set up your restaurant management system in just 5 minutes',
      ctaText: 'Watch Tutorial',
      duration: '5:23',
    },
    {
      videoUrl: 'https://youtu.be/ScMzIvxBSi4',
      title: 'Order Management Made Easy',
      description: 'See how Grubtech streamlines your order processing workflow',
      ctaText: 'Learn More',
      duration: '3:45',
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      title: 'Advanced Analytics Dashboard',
      description: 'Discover powerful insights to grow your restaurant business',
      ctaText: 'Explore Features',
      duration: '4:12',
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
      title: 'Multi-Location Management',
      description: 'Manage all your restaurant locations from a single platform',
      ctaText: 'See How',
      duration: '6:30',
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      title: 'Customer Success Stories',
      description: 'Hear from restaurant owners who transformed their business with Grubtech',
      ctaText: 'Watch Stories',
      duration: '8:15',
    },
  ];

  const featureVideos: VideoData[] = [
    {
      videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      title: 'Real-Time Delivery Tracking',
      description: 'Track every order in real-time with our integrated delivery system',
      ctaText: 'Learn More',
      duration: '2:30',
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
      title: 'Menu Management',
      description: 'Update your menu across all platforms with a single click',
      ctaText: 'Watch Demo',
      duration: '3:15',
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=PHgc8Q6qTjc',
      title: 'Kitchen Display System',
      description: 'Optimize your kitchen operations with our smart KDS',
      ctaText: 'See Features',
      duration: '4:00',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Optimized resource hints for video pages - includes YouTube/Vimeo preconnects */}
      <PageHead {...VIDEO_PAGE_HEAD_PROPS} />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] pt-32 pb-20 md:pt-40 md:pb-28 flex items-center bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Product Video Gallery
          </h1>
          <p className="text-xl text-gray-600">
            Explore our platform through interactive product demos and tutorials
          </p>
        </div>
      </section>

      {/* Video Gallery Sections */}
      <VideoGallery
        title="Product Tutorials"
        videos={productVideos}
      />

      <div className="bg-background-alt">
        <VideoGallery
          title="Feature Highlights"
          videos={featureVideos}
        />
      </div>

      {/* CTA Section */}
      <CTASection
        title="Ready to Transform Your Restaurant?"
        subtitle="See how Grubtech can help you streamline operations and grow your business"
        primaryButtonText="Schedule a Demo"
      />
    </div>
  );
};
