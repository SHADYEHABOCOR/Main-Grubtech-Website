import React from 'react';
import { useTranslation } from 'react-i18next';
import { TestimonialCard } from '../ui/TestimonialCard';
import { Carousel } from '../ui/Carousel';
import { BackgroundLines } from '../ui/BackgroundLines';
import { AnimatedElement } from '../ui/AnimatedElement';
import { useFeaturedTestimonials } from '../../hooks/useTestimonials';

export const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();
  // Limit to 10 testimonials - a carousel doesn't need 100 items
  const { data, isLoading, error } = useFeaturedTestimonials(10);

  // Extract testimonials from paginated response
  const testimonials = data?.data || [];

  return (
    <section className="py-24 lg:py-32 bg-slate-50 overflow-hidden relative">
      <BackgroundLines />

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedElement
          animation="fade-up"
          scrollTrigger
          once
          className="text-center mb-12 md:mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-6">
            {t('homepage.testimonials.badge', 'Testimonials')}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            {t('homepage.testimonials.title', 'What Our')} <span className="text-blue-600">{t('homepage.testimonials.titleHighlight', 'Customers Say')}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('homepage.testimonials.subtitle', 'Trusted by leading restaurants worldwide to streamline operations and boost growth.')}
          </p>
        </AnimatedElement>

        {isLoading ? (
          <div className="text-center text-text-secondary py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>{t('testimonials.loading')}</p>
          </div>
        ) : error ? (
          <div className="text-center text-text-secondary py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-lg text-red-600">{t('testimonials.error', 'Failed to load testimonials')}</p>
          </div>
        ) : testimonials.length > 0 ? (
          <Carousel
            autoPlay={true}
            autoPlayInterval={6000}
            showArrows={true}
            showDots={true}
            className="w-full"
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="w-full px-4 py-8 md:py-12">
                <TestimonialCard
                  quote={testimonial.content}
                  author={testimonial.name}
                  title={testimonial.company}
                  headline={testimonial.headline ?? undefined}
                  image={testimonial.image ?? undefined}
                  companyLogo={testimonial.company_logo ?? undefined}
                  rating={testimonial.rating}
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="text-center text-text-secondary py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-lg">{t('testimonials.empty')}</p>
          </div>
        )}
      </div>
    </section>
  );
};