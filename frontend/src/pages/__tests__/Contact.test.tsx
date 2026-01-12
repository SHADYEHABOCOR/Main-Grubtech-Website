import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test/testUtils';
import '@testing-library/jest-dom';
import { Contact } from '../Contact';
import { useContent } from '../../hooks/useContent';

// Mock the useContent hook
vi.mock('../../hooks/useContent', () => ({
  useContent: vi.fn(),
}));

// Mock the ContactForm component to simplify testing
vi.mock('../../components/forms/ContactForm', () => ({
  ContactForm: () => <div data-testid="contact-form">Contact Form</div>,
}));

// Mock the ScrollIndicator component
vi.mock('../../components/ui/ScrollIndicator', () => ({
  ScrollIndicator: () => <div data-testid="scroll-indicator">Scroll Indicator</div>,
}));

// Mock the AnimatedElement component to render children without animations
vi.mock('../../components/ui/AnimatedElement', () => ({
  AnimatedElement: ({ children, as: Component = 'div', className, ...props }: any) => (
    <Component className={className} {...props}>
      {children}
    </Component>
  ),
}));

// Mock the Card component
vi.mock('../../components/ui/Card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card" {...props}>
      {children}
    </div>
  ),
}));

describe('Contact Page', () => {
  const mockGetContent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useContent
    vi.mocked(useContent).mockReturnValue({
      content: {},
      loading: false,
      error: null,
      getContent: mockGetContent,
      getContentArray: vi.fn(() => []),
    });

    // Default return values for getContent
    mockGetContent.mockImplementation((key: string) => {
      const contentMap: Record<string, string> = {
        'contact_hero_title': 'Get in Touch',
        'contact_hero_subtitle': 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
        'contact_email_title': 'Email Us',
        'contact_phone_title': 'Call Us',
        'contact_address_title': 'Visit Us',
        'contact_hours_title': 'Business Hours',
      };
      return contentMap[key] || '';
    });
  });

  describe('Hero Section', () => {
    it('renders the hero section with correct title', () => {
      render(<Contact />);

      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('renders the hero section with correct subtitle', () => {
      render(<Contact />);

      expect(screen.getByText(/Have questions\? We'd love to hear from you/i)).toBeInTheDocument();
    });

    it('displays fallback title when loading', () => {
      vi.mocked(useContent).mockReturnValue({
        content: {},
        loading: true,
        error: null,
        getContent: mockGetContent,
        getContentArray: vi.fn(() => []),
      });

      render(<Contact />);

      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('displays custom content from CMS when available', () => {
      mockGetContent.mockImplementation((key: string) => {
        if (key === 'contact_hero_title') return 'Custom Contact Title';
        if (key === 'contact_hero_subtitle') return 'Custom contact subtitle from CMS';
        return '';
      });

      render(<Contact />);

      expect(screen.getByText('Custom Contact Title')).toBeInTheDocument();
      expect(screen.getByText('Custom contact subtitle from CMS')).toBeInTheDocument();
    });

    it('renders ScrollIndicator component', () => {
      render(<Contact />);

      expect(screen.getByTestId('scroll-indicator')).toBeInTheDocument();
    });
  });

  describe('Contact Info Cards', () => {
    it('renders all four contact info cards', () => {
      render(<Contact />);

      const cards = screen.getAllByTestId('card');
      // Filter for only the contact info cards (not the form card)
      const contactInfoCards = cards.slice(0, 4);

      expect(contactInfoCards).toHaveLength(4);
    });

    it('displays email contact card with correct information', () => {
      render(<Contact />);

      expect(screen.getByText('Email Us')).toBeInTheDocument();
      expect(screen.getByText('contact@grubtech.com')).toBeInTheDocument();

      const emailLink = screen.getByRole('link', { name: /contact@grubtech.com/i });
      expect(emailLink).toHaveAttribute('href', 'mailto:contact@grubtech.com');
    });

    it('displays phone contact card with correct information', () => {
      render(<Contact />);

      expect(screen.getByText('Call Us')).toBeInTheDocument();
      expect(screen.getByText('+971 4 123 4567')).toBeInTheDocument();

      const phoneLink = screen.getByRole('link', { name: /\+971 4 123 4567/i });
      expect(phoneLink).toHaveAttribute('href', 'tel:+97141234567');
    });

    it('displays address contact card with correct information', () => {
      render(<Contact />);

      expect(screen.getByText('Visit Us')).toBeInTheDocument();
      expect(screen.getByText('Dubai, United Arab Emirates')).toBeInTheDocument();

      const addressLink = screen.getByRole('link', { name: /Dubai, United Arab Emirates/i });
      expect(addressLink).toHaveAttribute('href', 'https://maps.google.com');
    });

    it('displays business hours card with correct information', () => {
      render(<Contact />);

      expect(screen.getByText('Business Hours')).toBeInTheDocument();
      expect(screen.getByText('Mon - Fri: 9:00 AM - 6:00 PM')).toBeInTheDocument();
    });

    it('renders business hours as text instead of link', () => {
      render(<Contact />);

      // Business hours should be rendered as paragraph, not a link
      const hoursText = screen.getByText('Mon - Fri: 9:00 AM - 6:00 PM');
      expect(hoursText.tagName).toBe('P');
    });

    it('uses custom content for card titles when available', () => {
      mockGetContent.mockImplementation((key: string) => {
        const contentMap: Record<string, string> = {
          'contact_email_title': 'Custom Email Title',
          'contact_phone_title': 'Custom Phone Title',
          'contact_address_title': 'Custom Address Title',
          'contact_hours_title': 'Custom Hours Title',
        };
        return contentMap[key] || '';
      });

      render(<Contact />);

      expect(screen.getByText('Custom Email Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Phone Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Address Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Hours Title')).toBeInTheDocument();
    });

    it('displays default card titles when content is loading', () => {
      vi.mocked(useContent).mockReturnValue({
        content: {},
        loading: true,
        error: null,
        getContent: vi.fn(() => ''),
        getContentArray: vi.fn(() => []),
      });

      render(<Contact />);

      expect(screen.getByText('Email Us')).toBeInTheDocument();
      expect(screen.getByText('Call Us')).toBeInTheDocument();
      expect(screen.getByText('Visit Us')).toBeInTheDocument();
      expect(screen.getByText('Business Hours')).toBeInTheDocument();
    });
  });

  describe('Contact Form Section', () => {
    it('renders the contact form section heading', () => {
      render(<Contact />);

      expect(screen.getByText('Send Us a Message')).toBeInTheDocument();
    });

    it('renders the contact form section subtitle', () => {
      render(<Contact />);

      expect(screen.getByText(/Fill out the form below and our team will get back to you within 24 hours/i)).toBeInTheDocument();
    });

    it('renders the ContactForm component', () => {
      render(<Contact />);

      expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });

    it('wraps ContactForm in a Card component', () => {
      render(<Contact />);

      const cards = screen.getAllByTestId('card');
      // The last card should contain the contact form
      const formCard = cards[cards.length - 1];

      expect(formCard).toBeInTheDocument();
      expect(formCard).toContainElement(screen.getByTestId('contact-form'));
    });
  });

  describe('Map Section', () => {
    it('renders the map placeholder section', () => {
      render(<Contact />);

      expect(screen.getByText('Map Integration Placeholder (Google Maps / Mapbox)')).toBeInTheDocument();
    });
  });

  describe('Page Layout and Structure', () => {
    it('renders the page with correct structure', () => {
      const { container } = render(<Contact />);

      // Check for main container
      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
    });

    it('renders all main sections in correct order', () => {
      const { container } = render(<Contact />);

      const sections = container.querySelectorAll('section');
      expect(sections).toHaveLength(4); // Hero, Contact Info, Form, Map
    });

    it('applies correct background colors to sections', () => {
      const { container } = render(<Contact />);

      const sections = container.querySelectorAll('section');

      // Hero section should have blue background
      expect(sections[0]).toHaveClass('bg-blue-50');

      // Contact info section should have light background
      expect(sections[1]).toHaveClass('bg-background-blue-light');

      // Form section should have white background
      expect(sections[2]).toHaveClass('bg-white');
    });
  });

  describe('Animations and AnimatedElement Integration', () => {
    it('uses AnimatedElement for hero title', () => {
      const { container } = render(<Contact />);

      const heroTitle = screen.getByText('Get in Touch');
      expect(heroTitle).toBeInTheDocument();
      expect(heroTitle.tagName).toBe('H1');
    });

    it('uses AnimatedElement for hero subtitle', () => {
      const { container } = render(<Contact />);

      const heroSubtitle = screen.getByText(/Have questions\? We'd love to hear from you/i);
      expect(heroSubtitle).toBeInTheDocument();
      expect(heroSubtitle.tagName).toBe('P');
    });

    it('uses AnimatedElement for form section heading', () => {
      const { container } = render(<Contact />);

      const formHeading = screen.getByText('Send Us a Message');
      expect(formHeading).toBeInTheDocument();
      expect(formHeading.tagName).toBe('H2');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Contact />);

      const h1 = screen.getByRole('heading', { level: 1, name: /Get in Touch/i });
      expect(h1).toBeInTheDocument();

      const h2 = screen.getByRole('heading', { level: 2, name: /Send Us a Message/i });
      expect(h2).toBeInTheDocument();
    });

    it('has accessible links for contact methods', () => {
      render(<Contact />);

      const emailLink = screen.getByRole('link', { name: /contact@grubtech.com/i });
      const phoneLink = screen.getByRole('link', { name: /\+971 4 123 4567/i });
      const addressLink = screen.getByRole('link', { name: /Dubai, United Arab Emirates/i });

      expect(emailLink).toBeInTheDocument();
      expect(phoneLink).toBeInTheDocument();
      expect(addressLink).toBeInTheDocument();
    });
  });

  describe('Content Management Integration', () => {
    it('calls getContent for hero title', () => {
      render(<Contact />);

      expect(mockGetContent).toHaveBeenCalledWith('contact_hero_title');
    });

    it('calls getContent for hero subtitle', () => {
      render(<Contact />);

      expect(mockGetContent).toHaveBeenCalledWith('contact_hero_subtitle');
    });

    it('calls getContent for all contact card titles', () => {
      render(<Contact />);

      expect(mockGetContent).toHaveBeenCalledWith('contact_email_title');
      expect(mockGetContent).toHaveBeenCalledWith('contact_phone_title');
      expect(mockGetContent).toHaveBeenCalledWith('contact_address_title');
      expect(mockGetContent).toHaveBeenCalledWith('contact_hours_title');
    });

    it('handles empty content gracefully', () => {
      mockGetContent.mockReturnValue('');

      render(<Contact />);

      // Should still render fallback values
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('handles content loading state', () => {
      vi.mocked(useContent).mockReturnValue({
        content: {},
        loading: true,
        error: null,
        getContent: vi.fn(() => ''),
        getContentArray: vi.fn(() => []),
      });

      render(<Contact />);

      // Should render fallback content during loading
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
      expect(screen.getByText('Email Us')).toBeInTheDocument();
    });

    it('handles content error state', () => {
      vi.mocked(useContent).mockReturnValue({
        content: {},
        loading: false,
        error: 'Failed to load content',
        getContent: vi.fn(() => ''),
        getContentArray: vi.fn(() => []),
      });

      render(<Contact />);

      // Should still render with fallback content
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive padding classes to hero section', () => {
      const { container } = render(<Contact />);

      const heroSection = container.querySelectorAll('section')[0];
      expect(heroSection).toHaveClass('pt-32', 'pb-20', 'md:pt-40', 'md:pb-28');
    });

    it('applies responsive padding classes to contact info section', () => {
      const { container } = render(<Contact />);

      const contactInfoSection = container.querySelectorAll('section')[1];
      expect(contactInfoSection).toHaveClass('py-16', 'md:py-24');
    });

    it('applies responsive grid layout to contact cards', () => {
      const { container } = render(<Contact />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
    });
  });
});
