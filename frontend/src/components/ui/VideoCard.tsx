import React, { useState, useEffect } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { VideoData, parseVideoUrl, ParsedVideo } from '../../utils/videoHelpers';
import { AnimatedElement } from './AnimatedElement';

interface VideoCardProps {
  video: VideoData;
  onClick: (parsedVideo: ParsedVideo) => void;
  isActive?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, isActive = false }) => {
  const [parsedVideo, setParsedVideo] = useState<ParsedVideo | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const parsed = parseVideoUrl(video.videoUrl, video.thumbnailUrl);
    setParsedVideo(parsed);

    if (parsed) {
      // Use custom thumbnail or default from parsed video
      setThumbnailUrl(video.thumbnailUrl || parsed.thumbnailUrl);
    }
  }, [video.videoUrl, video.thumbnailUrl]);

  const handleClick = () => {
    if (parsedVideo) {
      onClick(parsedVideo);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <AnimatedElement
      animation="fade-up"
      scrollTrigger
      once
      className="flex-shrink-0 w-full group"
    >
      {/* Video Thumbnail Container */}
      <div
        onClick={isActive ? undefined : handleClick}
        onKeyDown={isActive ? undefined : handleKeyDown}
        role={isActive ? undefined : "button"}
        tabIndex={isActive ? undefined : 0}
        aria-label={isActive ? undefined : `Play video: ${video.title}`}
        className={`relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-lg hover:shadow-2xl transition-all duration-300 ${!isActive ? 'cursor-pointer' : ''}`}
      >
        {/* Autoplaying Video (when active) */}
        {isActive && parsedVideo ? (
          parsedVideo.type === 'youtube' ? (
            <iframe
              key={`youtube-${isMuted}`}
              src={`https://www.youtube.com/embed/${parsedVideo.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${parsedVideo.videoId}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`}
              className="w-full h-full object-cover"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={video.title}
            />
          ) : parsedVideo.type === 'vimeo' ? (
            <iframe
              key={`vimeo-${isMuted}`}
              src={`https://player.vimeo.com/video/${parsedVideo.videoId}?autoplay=1&muted=${isMuted ? 1 : 0}&loop=1&background=1&controls=0`}
              className="w-full h-full object-cover"
              allow="autoplay; fullscreen"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <video
              src={parsedVideo.embedUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted={isMuted}
              loop
              playsInline
            />
          )
        ) : (
          <>
            {/* Thumbnail Image */}
            {thumbnailUrl && !imageError ? (
              <img
                src={thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
                <Play className="w-16 h-16 text-primary/50" />
              </div>
            )}
          </>
        )}

        {/* Gradient Overlay for better text/icon visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Logo/Icon Overlay (top-left) */}
        {video.logoUrl && (
          <div className="absolute top-4 left-4 z-10">
            <img
              src={video.logoUrl}
              alt="Category icon"
              className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-lg"
            />
          </div>
        )}

        {/* Control Buttons (bottom-left) */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
          {/* Unmute/Mute Button */}
          {isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-primary hover:text-white transition-all duration-300"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Play Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-primary hover:text-white transition-all duration-300"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </button>
        </div>
      </div>

      {/* Video Info */}
      <div className="space-y-2 px-2">
        <h3 className="text-lg md:text-xl font-medium text-text-primary line-clamp-2">
          {video.title}
        </h3>

        {video.description && (
          <p className="text-sm md:text-base text-text-secondary/80 line-clamp-2 leading-relaxed font-light">
            {video.description}
          </p>
        )}
      </div>
    </AnimatedElement>
  );
};
