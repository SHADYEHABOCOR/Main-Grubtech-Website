import React from 'react';

interface FeatureCardProps {
  /** Icon component to display */
  icon: React.ElementType;
  /** Title of the feature */
  title: string;
  /** Description of the feature */
  description: string;
  /** Animation delay (currently unused but kept for API compatibility) */
  delay: number;
  /** Whether to reduce motion for accessibility */
  prefersReducedMotion?: boolean;
}

/**
 * FeatureCard component displays a feature highlight card with an icon and description.
 * Used below the dashboard to showcase key platform features and capabilities.
 *
 * @example
 * <FeatureCard
 *   icon={Zap}
 *   title="Real-Time Updates"
 *   description="See orders and sales data update live as transactions happen."
 *   delay={0}
 * />
 */
export const FeatureCard: React.FC<FeatureCardProps> = React.memo(({
  icon: Icon,
  title,
  description,
  prefersReducedMotion = false,
}) => (
  <div
    className={`flex items-start gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm hover:shadow-md h-full ${
      !prefersReducedMotion ? 'transition-shadow duration-300' : ''
    }`}
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
));
