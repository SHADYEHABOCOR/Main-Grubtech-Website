import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/testUtils';
import '@testing-library/jest-dom';
import { Careers } from '../Careers';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

// Mock axios
vi.mock('axios');

// Mock the useToast hook
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock('../../components/ui/Toast', () => ({
  useToast: () => mockToast,
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
  Card: ({ children, className, onClick, ...props }: any) => (
    <div className={className} data-testid="card" onClick={onClick} {...props}>
      {children}
    </div>
  ),
}));

// Mock the Button component
vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, type, variant, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock the JobDepartmentSkeleton component
vi.mock('../../components/ui/Skeleton', () => ({
  JobDepartmentSkeleton: ({ jobs }: { jobs?: number }) => (
    <div data-testid="job-department-skeleton" data-jobs={jobs}>
      Job Department Skeleton
    </div>
  ),
}));

describe('Careers Page', () => {
  const mockJobsData = [
    {
      id: 1,
      title: 'Senior Sales Manager',
      department: 'Sales',
      location: 'Dubai, UAE',
      type: 'Full-time',
      description: 'We are looking for an experienced sales manager to lead our team.',
      requirements: null,
      application_link: 'https://example.com/apply/1',
      status: 'active',
    },
    {
      id: 2,
      title: 'Software Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Join our engineering team to build cutting-edge solutions.',
      requirements: null,
      application_link: 'https://example.com/apply/2',
      status: 'active',
    },
    {
      id: 3,
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Dubai, UAE',
      type: 'Part-time',
      description: 'Help us grow our brand presence in the market.',
      requirements: null,
      application_link: null,
      status: 'active',
    },
    {
      id: 4,
      title: 'Sales Executive',
      department: 'Sales',
      location: 'Abu Dhabi, UAE',
      type: 'Full-time',
      description: 'Drive sales growth in the Abu Dhabi region.',
      requirements: null,
      application_link: 'https://example.com/apply/4',
      status: 'active',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Hero Section', () => {
    it('renders the hero section with correct title', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      render(<Careers />);

      expect(screen.getByText("We're hiring!")).toBeInTheDocument();
    });

    it('renders the hero section with correct subtitle', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      render(<Careers />);

      expect(screen.getByText("We're looking for talented people")).toBeInTheDocument();
    });

    it('renders the hero section with correct description', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      render(<Careers />);

      expect(
        screen.getByText(/Our philosophy is simple — hire a team of diverse, passionate people/i)
      ).toBeInTheDocument();
    });

    it('renders ScrollIndicator component', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      render(<Careers />);

      expect(screen.getByTestId('scroll-indicator')).toBeInTheDocument();
    });

    it('has proper hero section styling with blue background', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      const { container } = render(<Careers />);

      const heroSection = container.querySelector('section.bg-blue-50');
      expect(heroSection).toBeInTheDocument();
    });
  });

  describe('Open Positions Section', () => {
    it('renders the section title', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByText('Open Positions')).toBeInTheDocument();
      });
    });

    it('renders the section subtitle', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByText('Find your next opportunity')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('displays job department skeletons while loading', () => {
      vi.mocked(axios.get).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<Careers />);

      const skeletons = screen.getAllByTestId('job-department-skeleton');
      expect(skeletons).toHaveLength(2);
    });

    it('displays skeleton with correct number of jobs', () => {
      vi.mocked(axios.get).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<Careers />);

      const skeletons = screen.getAllByTestId('job-department-skeleton');
      expect(skeletons[0]).toHaveAttribute('data-jobs', '2');
      expect(skeletons[1]).toHaveAttribute('data-jobs', '3');
    });

    it('does not display job listings while loading', () => {
      vi.mocked(axios.get).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<Careers />);

      expect(screen.queryByText('Senior Sales Manager')).not.toBeInTheDocument();
    });

    it('does not display empty state while loading', () => {
      vi.mocked(axios.get).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<Careers />);

      expect(screen.queryByText('No Open Positions')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no jobs are available', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByText('No Open Positions')).toBeInTheDocument();
      });
    });

    it('displays empty state message', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      render(<Careers />);

      await waitFor(() => {
        expect(
          screen.getByText('No open positions at the moment. Check back soon!')
        ).toBeInTheDocument();
      });
    });

    it('renders Briefcase icon in empty state', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      const { container } = render(<Careers />);

      await waitFor(() => {
        // Check for the icon container with blue background
        const iconContainer = container.querySelector('.bg-blue-100');
        expect(iconContainer).toBeInTheDocument();
      });
    });

    it('does not display job listings in empty state', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      render(<Careers />);

      await waitFor(() => {
        expect(screen.queryByText('Senior Sales Manager')).not.toBeInTheDocument();
      });
    });

    it('does not display skeletons in empty state', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      render(<Careers />);

      await waitFor(() => {
        expect(screen.queryByTestId('job-department-skeleton')).not.toBeInTheDocument();
      });
    });
  });

  describe('Job Listings - API Integration', () => {
    it('fetches jobs from the correct API endpoint', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockJobsData });

      render(<Careers />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.CAREERS.BASE);
      });
    });

    it('fetches jobs on component mount', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockJobsData });

      render(<Careers />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(1);
      });
    });

    it('handles API error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(axios.get).mockRejectedValue(new Error('API Error'));

      render(<Careers />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      // Should display empty state on error
      await waitFor(() => {
        expect(screen.getByText('No open positions at the moment. Check back soon!')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Job Listings - Rendering', () => {
    beforeEach(async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockJobsData });
    });

    it('displays job listings when data is available', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByText('Senior Sales Manager')).toBeInTheDocument();
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.getByText('Marketing Specialist')).toBeInTheDocument();
        expect(screen.getByText('Sales Executive')).toBeInTheDocument();
      });
    });

    it('displays job locations correctly', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByText('Dubai, UAE')).toBeInTheDocument();
        expect(screen.getByText('Remote')).toBeInTheDocument();
        expect(screen.getByText('Abu Dhabi, UAE')).toBeInTheDocument();
      });
    });

    it('displays job types correctly', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(screen.getAllByText('Full-time')).toHaveLength(3);
        expect(screen.getByText('Part-time')).toBeInTheDocument();
      });
    });

    it('displays job descriptions correctly', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(
          screen.getByText('We are looking for an experienced sales manager to lead our team.')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Join our engineering team to build cutting-edge solutions.')
        ).toBeInTheDocument();
      });
    });

    it('displays Apply Now button for jobs with application link', async () => {
      render(<Careers />);

      await waitFor(() => {
        const applyButtons = screen.getAllByText('Apply Now');
        expect(applyButtons).toHaveLength(3); // 3 out of 4 jobs have application links
      });
    });

    it('does not display Apply Now button for jobs without application link', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByText('Marketing Specialist')).toBeInTheDocument();
      });

      // Find the Marketing Specialist card and verify it doesn't have an Apply button
      const marketingText = screen.getByText('Marketing Specialist');
      const card = marketingText.closest('[data-testid="card"]');

      const buttons = card?.querySelectorAll('button');
      expect(buttons).toHaveLength(0);
    });

    it('renders jobs in Card components', async () => {
      render(<Careers />);

      await waitFor(() => {
        const cards = screen.getAllByTestId('card');
        // Should have job cards + application form card
        expect(cards.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  describe('Job Listings - Department Grouping', () => {
    beforeEach(async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockJobsData });
    });

    it('groups jobs by department', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByText('Sales')).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Marketing')).toBeInTheDocument();
      });
    });

    it('displays correct position count for each department', async () => {
      render(<Careers />);

      await waitFor(() => {
        // Sales has 2 positions
        expect(screen.getByText('2 positions available')).toBeInTheDocument();
        // Engineering and Marketing each have 1 position
        expect(screen.getAllByText('1 position available')).toHaveLength(2);
      });
    });

    it('displays positions within their correct departments', async () => {
      render(<Careers />);

      await waitFor(() => {
        const salesSection = screen.getByText('Sales').closest('.bg-background-alt');
        expect(salesSection).toContainElement(screen.getByText('Senior Sales Manager'));
        expect(salesSection).toContainElement(screen.getByText('Sales Executive'));
      });
    });

    it('sorts departments with Sales first', async () => {
      render(<Careers />);

      await waitFor(() => {
        const departmentHeaders = screen.getAllByText(/Sales|Engineering|Marketing/);
        // First department should be Sales
        expect(departmentHeaders[0]).toHaveTextContent('Sales');
      });
    });
  });

  describe('Job Listings - Interactions', () => {
    beforeEach(async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockJobsData });
    });

    it('opens application link when Apply Now button is clicked', async () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(<Careers />);

      await waitFor(() => {
        const applyButtons = screen.getAllByText('Apply Now');
        applyButtons[0].click();
      });

      expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/apply/1', '_blank');

      windowOpenSpy.mockRestore();
    });

    it('opens application link when job card is clicked', async () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(<Careers />);

      await waitFor(() => {
        const salesManagerTitle = screen.getByText('Senior Sales Manager');
        const card = salesManagerTitle.closest('[data-testid="card"]');
        if (card) {
          (card as HTMLElement).click();
        }
      });

      expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/apply/1', '_blank');

      windowOpenSpy.mockRestore();
    });

    it('does not make card clickable when no application link', async () => {
      render(<Careers />);

      await waitFor(() => {
        const marketingTitle = screen.getByText('Marketing Specialist');
        const card = marketingTitle.closest('[data-testid="card"]');

        // Check that the card doesn't have cursor-pointer class
        expect(card?.className).not.toContain('cursor-pointer');
      });
    });
  });

  describe('Application Form Section', () => {
    beforeEach(async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });
    });

    it('renders the application form section title', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByText("Didn't find the perfect role?")).toBeInTheDocument();
      });
    });

    it('renders the application form section subtitle', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByText("Let's stay connected!")).toBeInTheDocument();
      });
    });

    it('renders the application form section description', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(
          screen.getByText(/We may not have an open position that fits your skills right now/i)
        ).toBeInTheDocument();
      });
    });

    it('renders all form fields', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('your@company.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('+1 (555) 000-0000')).toBeInTheDocument();
      });
    });

    it('renders the expertise dropdown', async () => {
      render(<Careers />);

      await waitFor(() => {
        const expertiseSelect = screen.getByLabelText(/What's your area of expertise?/i);
        expect(expertiseSelect).toBeInTheDocument();
        expect(expertiseSelect.tagName).toBe('SELECT');
      });
    });

    it('renders the CV upload field', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByText('Upload Your CV')).toBeInTheDocument();
      });
    });

    it('renders the privacy agreement checkbox', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(
          screen.getByText('You agree to our friendly privacy policy.')
        ).toBeInTheDocument();
      });
    });

    it('renders the submit button', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByText('Submit Application')).toBeInTheDocument();
      });
    });

    it('wraps the form in a Card component', async () => {
      render(<Careers />);

      await waitFor(() => {
        const cards = screen.getAllByTestId('card');
        const formCard = cards[cards.length - 1];

        expect(formCard).toBeInTheDocument();
        expect(formCard).toContainElement(screen.getByText('Submit Application'));
      });
    });
  });

  describe('Animations and AnimatedElement Integration', () => {
    beforeEach(async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });
    });

    it('uses AnimatedElement for hero title', async () => {
      const { container } = render(<Careers />);

      await waitFor(() => {
        const heroTitle = screen.getByText("We're hiring!");
        expect(heroTitle).toBeInTheDocument();
        expect(heroTitle.tagName).toBe('H1');
      });
    });

    it('uses AnimatedElement for hero subtitle', async () => {
      render(<Careers />);

      await waitFor(() => {
        const heroSubtitle = screen.getByText("We're looking for talented people");
        expect(heroSubtitle).toBeInTheDocument();
        expect(heroSubtitle.tagName).toBe('H2');
      });
    });

    it('uses AnimatedElement for open positions section title', async () => {
      render(<Careers />);

      await waitFor(() => {
        const sectionTitle = screen.getByText('Open Positions');
        expect(sectionTitle).toBeInTheDocument();
        expect(sectionTitle.tagName).toBe('H2');
      });
    });

    it('uses AnimatedElement for application form section title', async () => {
      render(<Careers />);

      await waitFor(() => {
        const formTitle = screen.getByText("Didn't find the perfect role?");
        expect(formTitle).toBeInTheDocument();
        expect(formTitle.tagName).toBe('H2');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockJobsData });
    });

    it('has proper heading hierarchy', async () => {
      render(<Careers />);

      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1, name: /We're hiring!/i });
        expect(h1).toBeInTheDocument();

        const h2Elements = screen.getAllByRole('heading', { level: 2 });
        expect(h2Elements.length).toBeGreaterThan(0);
      });
    });

    it('has accessible form labels', async () => {
      render(<Careers />);

      await waitFor(() => {
        expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone number/i)).toBeInTheDocument();
      });
    });

    it('marks required form fields', async () => {
      render(<Careers />);

      await waitFor(() => {
        const firstNameInput = screen.getByPlaceholderText('First name');
        expect(firstNameInput).toHaveAttribute('required');

        const emailInput = screen.getByPlaceholderText('your@company.com');
        expect(emailInput).toHaveAttribute('required');
      });
    });

    it('uses semantic HTML for form inputs', async () => {
      render(<Careers />);

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('your@company.com');
        expect(emailInput).toHaveAttribute('type', 'email');

        const phoneInput = screen.getByPlaceholderText('+1 (555) 000-0000');
        expect(phoneInput).toHaveAttribute('type', 'tel');

        const linkedinInput = screen.getByLabelText(/LinkedIn Profile/i);
        expect(linkedinInput).toHaveAttribute('type', 'url');
      });
    });
  });

  describe('Page Layout and Structure', () => {
    beforeEach(async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });
    });

    it('renders the page with correct structure', async () => {
      const { container } = render(<Careers />);

      await waitFor(() => {
        const mainContainer = container.querySelector('.min-h-screen');
        expect(mainContainer).toBeInTheDocument();
      });
    });

    it('renders all main sections in correct order', async () => {
      const { container } = render(<Careers />);

      await waitFor(() => {
        const sections = container.querySelectorAll('section');
        expect(sections).toHaveLength(3); // Hero, Open Positions, Application Form
      });
    });

    it('applies correct background color to hero section', async () => {
      const { container } = render(<Careers />);

      await waitFor(() => {
        const heroSection = container.querySelectorAll('section')[0];
        expect(heroSection).toHaveClass('bg-blue-50');
      });
    });

    it('applies correct background color to open positions section', async () => {
      const { container } = render(<Careers />);

      await waitFor(() => {
        const positionsSection = container.querySelectorAll('section')[1];
        expect(positionsSection).toHaveClass('bg-white');
      });
    });

    it('applies correct background color to application form section', async () => {
      const { container } = render(<Careers />);

      await waitFor(() => {
        const formSection = container.querySelectorAll('section')[2];
        expect(formSection).toHaveClass('bg-white');
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });
    });

    it('applies responsive padding classes to hero section', async () => {
      const { container } = render(<Careers />);

      await waitFor(() => {
        const heroSection = container.querySelectorAll('section')[0];
        expect(heroSection).toHaveClass('pt-32', 'pb-20', 'md:pt-40', 'md:pb-28');
      });
    });

    it('applies responsive padding classes to sections', async () => {
      const { container } = render(<Careers />);

      await waitFor(() => {
        const positionsSection = container.querySelectorAll('section')[1];
        expect(positionsSection).toHaveClass('py-16', 'md:py-24');
      });
    });

    it('applies responsive grid layout to form fields', async () => {
      const { container } = render(<Careers />);

      await waitFor(() => {
        const gridContainers = container.querySelectorAll('.grid-cols-1.md\\:grid-cols-2');
        expect(gridContainers.length).toBeGreaterThan(0);
      });
    });
  });
});
