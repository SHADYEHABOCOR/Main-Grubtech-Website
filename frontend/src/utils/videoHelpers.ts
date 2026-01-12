export interface VideoData {
  videoUrl: string;
  title: string;
  description?: string;
  ctaText?: string;
  thumbnailUrl?: string;
  logoUrl?: string;
  duration?: string;
}

export interface ParsedVideo {
  type: 'youtube' | 'vimeo' | 'direct';
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
  originalUrl: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

/**
 * Extract Vimeo video ID from URL
 */
export const getVimeoVideoId = (url: string): string | null => {
  const pattern = /vimeo\.com\/(?:.*\/)?(\d+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
};

/**
 * Parse video URL and return standardized data
 */
export const parseVideoUrl = (url: string, customThumbnail?: string): ParsedVideo | null => {
  // Check for YouTube
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return {
      type: 'youtube',
      videoId: youtubeId,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0`,
      thumbnailUrl: customThumbnail || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      originalUrl: url,
    };
  }

  // Check for Vimeo
  const vimeoId = getVimeoVideoId(url);
  if (vimeoId) {
    return {
      type: 'vimeo',
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
      thumbnailUrl: customThumbnail || '', // Vimeo thumbnails require API call
      originalUrl: url,
    };
  }

  // Direct video file
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return {
      type: 'direct',
      videoId: url,
      embedUrl: url,
      thumbnailUrl: customThumbnail || '',
      originalUrl: url,
    };
  }

  return null;
};

/**
 * Validate if a URL is a valid video URL
 */
export const isValidVideoUrl = (url: string): boolean => {
  return parseVideoUrl(url) !== null;
};

/**
 * Get thumbnail URL with fallback
 */
export const getVideoThumbnail = async (url: string, customThumbnail?: string): Promise<string> => {
  if (customThumbnail) return customThumbnail;

  const parsed = parseVideoUrl(url);
  if (!parsed) return '';

  if (parsed.type === 'youtube') {
    // Try maxresdefault first, fallback to hqdefault
    const maxResUrl = `https://img.youtube.com/vi/${parsed.videoId}/maxresdefault.jpg`;
    try {
      const response = await fetch(maxResUrl, { method: 'HEAD' });
      if (response.ok) return maxResUrl;
    } catch {
      // Fallback to hqdefault
    }
    return `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`;
  }

  if (parsed.type === 'vimeo') {
    // Vimeo requires API call - return placeholder or use custom thumbnail
    try {
      const response = await fetch(`https://vimeo.com/api/v2/video/${parsed.videoId}.json`);
      const data = await response.json();
      return data[0]?.thumbnail_large || '';
    } catch {
      return '';
    }
  }

  return parsed.thumbnailUrl;
};
