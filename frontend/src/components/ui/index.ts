/**
 * UI Component Library
 * Centralized exports for all reusable UI components
 *
 * Usage:
 * import { Button, Card, Badge, Container } from '@/components/ui';
 */

// Primitives
export { Button } from './Button';
export { Badge } from './Badge';
export { Card } from './Card';
export { AnimatedElement } from './AnimatedElement';
export type { AnimationVariant, AnimationSpeed, AnimationTiming } from './AnimatedElement';

// Layout
export { Container } from './Container';
export { SectionWrapper } from './SectionWrapper';

// Typography
export { Heading } from './Heading';
export { Text } from './Text';

// Form Elements
export { FormInput } from './FormInput';
export { Select } from './Select';
export { TextArea } from './TextArea';

// Media
export { OptimizedImage } from './OptimizedImage';
export { VideoCard } from './VideoCard';
export { VideoModal } from './VideoModal';
export { VideoGallery } from './VideoGallery';
export { ImageSlider } from './ImageSlider';
export { Carousel } from './Carousel';
export { InfiniteSlider } from './InfiniteSlider';

// Feedback
export { Loader } from './Loader';
export { LoadingSpinner } from './LoadingSpinner';
export { Skeleton } from './Skeleton';
export { Modal } from './Modal';

// Decorative
export { BackgroundLines } from './BackgroundLines';
export { GeometricBackground } from './GeometricBackground';
export { default as DarkVeil } from './DarkVeil';
export { CustomCursor } from './CustomCursor';
export { ScrollIndicator } from './ScrollIndicator';
export { IconWrapper } from './IconWrapper';

// Cards
export { TestimonialCard } from './TestimonialCard';

// Navigation
export { PillTabs } from './PillTabs';
export type { Tab } from './PillTabs';
