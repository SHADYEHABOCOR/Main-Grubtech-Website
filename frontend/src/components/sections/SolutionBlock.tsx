import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { AnimatedElement } from '../ui/AnimatedElement';

interface SolutionBlockProps {
  title: string;
  description: string;
  features: string[];
  image: string;
  cta: string;
  link: string;
  reverse?: boolean;
  dashboard?: React.ComponentType;
}

export const SolutionBlock: React.FC<SolutionBlockProps> = ({
  title,
  description,
  features,
  image,
  cta,
  link,
  reverse = false,
  dashboard: Dashboard,
}) => {
  return (
    <div className={`py-16 md:py-20 overflow-hidden ${reverse ? 'bg-slate-50' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
            reverse ? 'lg:grid-flow-dense' : ''
          }`}
        >
          <AnimatedElement
            animation={reverse ? 'fade-left' : 'fade-right'}
            scrollTrigger
            once
            className={reverse ? 'lg:col-start-2' : ''}
          >
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-snug">{title}</h3>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">{description}</p>
            <ul className="space-y-3 mb-6">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-gray-900">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to={link}
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-light transition-colors"
            >
              {cta} <span dir="ltr">→</span>
            </Link>
          </AnimatedElement>

          <AnimatedElement
            animation={reverse ? 'fade-right' : 'fade-left'}
            delay={200}
            scrollTrigger
            once
            className={reverse ? 'lg:col-start-1 lg:row-start-1' : ''}
          >
            {Dashboard ? (
              <Dashboard />
            ) : (
              <img src={image} alt={title} className="w-full h-auto rounded-lg shadow-lg" />
            )}
          </AnimatedElement>
        </div>
      </div>
    </div>
  );
};
