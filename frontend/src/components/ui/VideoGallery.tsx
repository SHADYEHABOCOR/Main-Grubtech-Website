import React, { useState, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from './MotionComponents.lazy';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VideoCard } from './VideoCard';
import { AnimatedElement } from './AnimatedElement';
import { VideoData, ParsedVideo } from '../../utils/videoHelpers';

// Lazy load VideoModal since it's only needed when user clicks a video
const VideoModal = lazy(() => import('./VideoModal').then(m => ({ default: m.VideoModal })));

interface VideoGalleryProps {
  title?: string;
  videos: VideoData[];
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ title, videos }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<ParsedVideo | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const handleVideoClick = (video: ParsedVideo, title: string) => {
    setSelectedVideo(video);
    setSelectedVideoTitle(title);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedVideo(null);
      setSelectedVideoTitle('');
    }, 300);
  };

  if (!videos || videos.length === 0) {
    return null;
  }

  const getPrevIndex = () => (currentIndex === 0 ? videos.length - 1 : currentIndex - 1);
  const getNextIndex = () => (currentIndex === videos.length - 1 ? 0 : currentIndex + 1);

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-background-blue-light overflow-hidden relative">
      <div className="w-full">
        {/* Section Title */}
        {title && (
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="text-center mb-12 md:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              {title}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('homepage.videoGallery.subtitle', 'Discover how our platform transforms restaurant operations through these feature walkthroughs.')}
            </p>
          </AnimatedElement>
        )}

        {/* Centered Carousel */}
        <div className="relative">
          {/* Video Container with colored background - hidden on mobile */}
          <div
            className="relative h-[320px] sm:h-[400px] md:h-[650px] lg:h-[700px] flex items-center justify-center md:bg-gradient-to-r md:from-primary/5 md:via-primary/10 md:to-primary/5 md:rounded-3xl mx-2 sm:mx-4 md:mx-8 lg:mx-12"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {/* Previous Video (left side) - Hidden on mobile */}
              <motion.div
                key={`prev-${getPrevIndex()}`}
                initial={{ opacity: 0, x: -80, scale: 0.88 }}
                animate={{ opacity: 0.25, x: 0, scale: 0.75 }}
                exit={{ opacity: 0, x: -80, scale: 0.88 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={handlePrev}
                className="hidden md:block absolute left-2 md:left-4 lg:left-6 w-[28%] lg:w-[24%] xl:w-[22%] cursor-pointer filter blur-[1px] hover:opacity-40 transition-opacity"
              >
                <VideoCard video={videos[getPrevIndex()]} onClick={() => { }} />
              </motion.div>

              {/* Current Video (center) - Full width on mobile */}
              <motion.div
                key={`current-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1, zIndex: 10 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute w-[90%] md:w-[62%] lg:w-[55%] xl:w-[50%] z-10"
              >
                <VideoCard
                  video={videos[currentIndex]}
                  onClick={(parsedVideo) => handleVideoClick(parsedVideo, videos[currentIndex].title)}
                  isActive={!isModalOpen}
                />
              </motion.div>

              {/* Next Video (right side) - Hidden on mobile */}
              <motion.div
                key={`next-${getNextIndex()}`}
                initial={{ opacity: 0, x: 80, scale: 0.88 }}
                animate={{ opacity: 0.25, x: 0, scale: 0.75 }}
                exit={{ opacity: 0, x: 80, scale: 0.88 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={handleNext}
                className="hidden md:block absolute right-2 md:right-4 lg:right-6 w-[28%] lg:w-[24%] xl:w-[22%] cursor-pointer filter blur-[1px] hover:opacity-40 transition-opacity"
              >
                <VideoCard video={videos[getNextIndex()]} onClick={() => { }} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation - Same style as other sections - Force LTR for consistent arrow direction */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mt-4 md:mt-8" dir="ltr">
              {/* Dots */}
              <div className="flex gap-1.5 md:gap-2">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                      ? 'w-6 md:w-10 bg-blue-600'
                      : 'w-2 md:w-2.5 bg-gray-300 hover:bg-blue-300'
                      }`}
                    aria-label={`Go to video ${index + 1}`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={handlePrev}
                  className="p-2 md:p-3 rounded-full bg-white border border-gray-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 group shadow-sm"
                  aria-label="Previous video"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-white transition-colors" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 md:p-3 rounded-full bg-white border border-gray-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 group shadow-sm"
                  aria-label="Next video"
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal - Only loaded when needed */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <VideoModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            video={selectedVideo}
            title={selectedVideoTitle}
          />
        </Suspense>
      )}
    </section>
  );
};
