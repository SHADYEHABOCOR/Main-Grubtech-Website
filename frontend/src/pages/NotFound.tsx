import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, HelpCircle, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { AnimatedElement } from '../components/ui/AnimatedElement';

export const NotFound: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(`/${i18n.language}`);
    }
  };

  const suggestedLinks = [
    { label: 'Home', path: `/${i18n.language}`, icon: Home },
    { label: 'About Us', path: `/${i18n.language}/about`, icon: HelpCircle },
    { label: 'Contact', path: `/${i18n.language}/connect-with-us`, icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 */}
        <AnimatedElement
          animation="scale-in"
          className="mb-8"
        >
          <div className="relative inline-block">
            {/* Large 404 text */}
            <h1 className="text-[150px] md:text-[200px] font-bold text-gray-100 leading-none select-none">
              404
            </h1>

          </div>
        </AnimatedElement>

        {/* Message */}
        <AnimatedElement
          animation="fade-up"
          delay={200}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
        </AnimatedElement>

        {/* Action Buttons */}
        <AnimatedElement
          animation="fade-up"
          delay={400}
          className="flex flex-row gap-4 justify-center mb-12"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleGoBack}
            className="min-w-[160px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Button>

          <Link to={`/${i18n.language}`}>
            <Button
              variant="outline-dark"
              size="lg"
              className="min-w-[160px] bg-white/50 backdrop-blur-sm hover:bg-white transition-colors duration-300"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Button>
          </Link>
        </AnimatedElement>

        {/* Suggested Links */}
        <AnimatedElement
          animation="scale-in"
          delay={600}
          className="border-t border-gray-200 pt-8"
        >
          <p className="text-sm text-gray-500 mb-4">Or try one of these pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestedLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-primary hover:text-primary transition-colors text-sm font-medium"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </AnimatedElement>

        {/* Fun fact / Easter egg */}
        <AnimatedElement
          as="p"
          animation="scale-in"
          delay={1000}
          className="mt-12 text-xs text-gray-400"
        >
          Fun fact: The 404 error code was named after a room at CERN where the original web servers were located.
        </AnimatedElement>
      </div>
    </div>
  );
};

export default NotFound;
