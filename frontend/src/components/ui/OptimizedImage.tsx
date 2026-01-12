import React, { useState, useRef, useCallback } from 'react';

/**
 * Inject a preload link into the document head for priority images
 */
const injectPreloadLink = (src: string): void => {
  if (typeof window === 'undefined' || !src) return;
  if (src.startsWith('data:')) return;

  const existing = document.querySelector(`link[rel="preload"][href="${src}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: string;
  blurDataURL?: string;
  priority?: boolean;
  useWebP?: boolean;
  useAVIF?: boolean;
  sizes?: string;
  srcSetWidths?: number[];
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Convert image path to a different format
 */
const convertImageFormat = (src: string, format: 'webp' | 'avif'): string => {
  if (src.startsWith('data:') || src.startsWith('http') || src.endsWith(`.${format}`)) {
    return src;
  }

  const extension = src.split('.').pop()?.toLowerCase();
  if (extension && ['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
    return src.replace(/\.(jpg|jpeg|png|webp)$/i, `.${format}`);
  }

  return src;
};

/**
 * Generate srcset string for responsive images
 */
const generateSrcSet = (src: string, widths: number[], format?: 'webp' | 'avif'): string => {
  const baseSrc = format ? convertImageFormat(src, format) : src;
  return widths.map(w => `${baseSrc} ${w}w`).join(', ');
};

/**
 * Optimized Image Component
 *
 * PERFORMANCE FIX: Uses native lazy loading instead of creating new Image() objects.
 * The previous implementation created a `new Image()` for every image to preload it,
 * which caused DUPLICATE HTTP requests - one from the Image() object and one from
 * the actual <img> tag. This was causing 1000+ requests on pages with many images.
 *
 * Now uses:
 * - Native `loading="lazy"` - browser handles lazy loading efficiently
 * - Native `decoding="async"` - prevents blocking the main thread
 * - Direct src assignment - single request per image
 *
 * Features:
 * - Native lazy loading (loading="lazy")
 * - WebP and AVIF format support with fallback
 * - Responsive srcset support
 * - Fallback image on error
 * - Priority loading for above-the-fold images
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  fallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E',
  blurDataURL,
  priority = false,
  useWebP = true,
  useAVIF = false,
  sizes,
  srcSetWidths,
  onLoad,
  onError,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Preload priority images only
  if (priority && typeof window !== 'undefined') {
    injectPreloadLink(src);
  }

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (!imageError) {
      setImageError(true);
      onError?.();
    }
  }, [imageError, onError]);

  // Use actual src directly - let browser handle loading
  // Only show fallback if there's an error
  const imageSrc = imageError ? fallback : src;

  const webpSrc = useWebP ? convertImageFormat(src, 'webp') : src;
  const avifSrc = useAVIF ? convertImageFormat(src, 'avif') : src;
  const shouldUsePicture = (useWebP && webpSrc !== src) || (useAVIF && avifSrc !== src);

  const srcSetOriginal = srcSetWidths ? generateSrcSet(src, srcSetWidths) : undefined;
  const srcSetWebP = srcSetWidths && useWebP ? generateSrcSet(src, srcSetWidths, 'webp') : undefined;
  const srcSetAVIF = srcSetWidths && useAVIF ? generateSrcSet(src, srcSetWidths, 'avif') : undefined;

  // Simple fade-in effect when loaded
  const imgClassName = `${className} ${imageLoaded ? 'opacity-100' : 'opacity-70'} transition-opacity duration-200`;
  const imgStyle = blurDataURL && !imageLoaded ? { filter: 'blur(5px)' } : undefined;

  return shouldUsePicture ? (
    <picture>
      {useAVIF && avifSrc !== src && (
        <source srcSet={srcSetAVIF || avifSrc} type="image/avif" sizes={sizes} />
      )}
      {useWebP && webpSrc !== src && (
        <source srcSet={srcSetWebP || webpSrc} type="image/webp" sizes={sizes} />
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        srcSet={srcSetOriginal}
        sizes={sizes}
        alt={alt}
        className={imgClassName}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        style={imgStyle}
      />
    </picture>
  ) : (
    <img
      ref={imgRef}
      src={imageSrc}
      srcSet={srcSetOriginal}
      sizes={sizes}
      alt={alt}
      className={imgClassName}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      onLoad={handleLoad}
      onError={handleError}
      style={imgStyle}
    />
  );
};

/**
 * Simple wrapper for backward compatibility
 * Just adds loading="lazy" to standard img tags
 */
export const LazyImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({
  loading = 'lazy',
  ...props
}) => {
  return <img loading={loading} {...props} />;
};
