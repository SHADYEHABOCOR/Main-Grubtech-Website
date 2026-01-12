import React from 'react';
import { Star } from 'lucide-react';
import { getFileUrl } from '../../config/api';

interface TestimonialCardProps {
  quote: string;
  author: string;
  title: string;
  headline?: string;
  image?: string;
  companyLogo?: string;
  rating?: number;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  title,
  headline,
  image,
  companyLogo,
  rating = 5,
}) => {
  // Helper function to get the full image URL
  const getImageUrl = (path?: string) => {
    if (!path) return undefined;
    return getFileUrl(path);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden max-w-6xl mx-auto h-auto md:h-[550px] lg:h-[600px] border border-gray-100 group hover:border-blue-100 transition-colors duration-500">
      {/* Left side: Image */}
      <div className="relative h-64 sm:h-72 md:h-full w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 md:hidden" />
        {image ? (
          <img
            src={getImageUrl(image)}
            alt={author}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              // Fallback to a placeholder if image fails to load
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=400&fit=crop';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <span className="text-6xl opacity-20">🍽️</span>
          </div>
        )}
      </div>

      {/* Right side: Content */}
      <div className="p-8 sm:p-10 md:p-12 lg:p-16 flex flex-col justify-center items-start h-full bg-white relative">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 7.55228 14.017 7V3H19.017C20.6739 3 22.017 4.34315 22.017 6V15C22.017 16.6569 20.6739 18 19.017 18H16.017V21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 7.55228 5.0166 7V3H10.0166C11.6735 3 13.0166 4.34315 13.0166 6V15C13.0166 16.6569 11.6735 18 10.0166 18H7.0166V21H5.0166Z" />
          </svg>
        </div>

        <div className="flex flex-col justify-center items-start w-full relative z-10">
          {/* Stars */}
          <div className="flex gap-1 mb-6">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
            ))}
          </div>

          {/* Headline */}
          {headline && (
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight font-serif tracking-tight">
              "{headline}"
            </h3>
          )}

          {/* Quote */}
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 line-clamp-4 sm:line-clamp-none font-medium">
            {quote}
          </p>

          <div className="w-full h-px bg-gray-100 mb-8" />

          {/* Author & Logo */}
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="font-bold text-gray-900 text-lg">{author}</p>
              <p className="text-blue-600 font-medium text-sm">{title}</p>
            </div>
            {companyLogo && (
              <div className="h-10 sm:h-12">
                <img
                  src={getImageUrl(companyLogo)}
                  alt={title}
                  className="h-full w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
