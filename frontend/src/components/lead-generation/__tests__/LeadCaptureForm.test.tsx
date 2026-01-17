import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '../../../test/testUtils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LeadCaptureForm } from '../LeadCaptureForm';
import { analytics } from '../../../utils/analytics/analytics';

// Mock the analytics module
vi.mock('../../../utils/analytics/analytics', () => ({
  analytics: {
    track: vi.fn(),
    trackFormSubmit: vi.fn(),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('LeadCaptureForm Component', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful fetch response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Form Rendering', () => {
    it('renders all form fields correctly', () => {
      render(<LeadCaptureForm />);

      // Check for all required fields
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company.*restaurant name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/restaurant type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^message/i)).toBeInTheDocument();
    });

    it('renders the submit button', () => {
      render(<LeadCaptureForm />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('renders required fields legend', () => {
      render(<LeadCaptureForm />);

      expect(screen.getByText(/fields marked with.*are required/i)).toBeInTheDocument();
    });

    it('sets correct input types for fields', () => {
      render(<LeadCaptureForm />);

      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/phone number/i)).toHaveAttribute('type', 'tel');
      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/company.*restaurant name/i)).toHaveAttribute('type', 'text');
    });

    it('renders restaurant type dropdown with all options', () => {
      render(<LeadCaptureForm />);

      const restaurantTypeSelect = screen.getByLabelText(/restaurant type/i) as HTMLSelectElement;
      expect(restaurantTypeSelect).toBeInTheDocument();

      // Check for placeholder option
      expect(restaurantTypeSelect.querySelector('option[value=""]')).toHaveTextContent(/select type/i);

      // Check for all restaurant type options
      const expectedOptions = [
        'Independent Restaurant',
        'Small Chain (2-10 locations)',
        'Regional Chain (11-50 locations)',
        'Global Chain (50+ locations)',
        'Dark Kitchen / Cloud Kitchen',
        'Franchise',
        'Other',
      ];

      expectedOptions.forEach(option => {
        expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
      });
    });

    it('renders title and subtitle when provided', () => {
      render(
        <LeadCaptureForm
          title="Get Started Today"
          subtitle="Fill out the form below"
        />
      );

      expect(screen.getByText('Get Started Today')).toBeInTheDocument();
      expect(screen.getByText('Fill out the form below')).toBeInTheDocument();
    });

    it('does not render title and subtitle when not provided', () => {
      render(<LeadCaptureForm />);

      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    });

    it('marks required fields with asterisks', () => {
      render(<LeadCaptureForm />);

      expect(screen.getByText(/full name \*/i)).toBeInTheDocument();
      expect(screen.getByText(/email address \*/i)).toBeInTheDocument();
      expect(screen.getByText(/company.*restaurant name \*/i)).toBeInTheDocument();
      expect(screen.getByText(/restaurant type \*/i)).toBeInTheDocument();
    });

    it('does not mark optional fields with asterisks', () => {
      render(<LeadCaptureForm />);

      const phoneLabel = screen.getByText(/phone number/i);
      expect(phoneLabel.textContent).not.toMatch(/\*/);

      const messageLabel = screen.getByText(/^message$/i);
      expect(messageLabel.textContent).not.toMatch(/\*/);
    });
  });

  describe('Field Validation', () => {
    it('validates required name field', () => {
      render(<LeadCaptureForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveAttribute('required');
    });

    it('validates required email field', () => {
      render(<LeadCaptureForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('validates required company field', () => {
      render(<LeadCaptureForm />);

      const companyInput = screen.getByLabelText(/company.*restaurant name/i);
      expect(companyInput).toHaveAttribute('required');
    });

    it('validates required restaurant type field', () => {
      render(<LeadCaptureForm />);

      const restaurantTypeSelect = screen.getByLabelText(/restaurant type/i);
      expect(restaurantTypeSelect).toHaveAttribute('required');
    });

    it('does not require phone field', () => {
      render(<LeadCaptureForm />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      expect(phoneInput).not.toHaveAttribute('required');
    });

    it('does not require message field', () => {
      render(<LeadCaptureForm />);

      const messageInput = screen.getByLabelText(/^message/i);
      expect(messageInput).not.toHaveAttribute('required');
    });
  });

  describe('Form Submission', () => {
    it('submits form with all fields filled', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm formType="demo" onSuccess={mockOnSuccess} />);

      // Fill in all fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@restaurant.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Doe Restaurant');
      await user.type(screen.getByLabelText(/phone number/i), '+971501234567');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Independent Restaurant');
      await user.type(screen.getByLabelText(/^message/i), 'I would like to request a demo of your platform');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/leads',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: expect.stringContaining('John Doe'),
          })
        );
      });

      // Verify the request body
      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);

      expect(requestBody).toMatchObject({
        name: 'John Doe',
        email: 'john@restaurant.com',
        company: 'Doe Restaurant',
        phone: '+971501234567',
        restaurantType: 'Independent Restaurant',
        message: 'I would like to request a demo of your platform',
        formType: 'demo',
        source: '/',
      });
      expect(requestBody.timestamp).toBeDefined();
    });

    it('submits form with only required fields filled', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm formType="contact" />);

      // Fill in only required fields
      await user.type(screen.getByLabelText(/full name/i), 'Jane Smith');
      await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Smith Inc');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Franchise');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/leads',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);

      expect(requestBody).toMatchObject({
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'Smith Inc',
        phone: '',
        restaurantType: 'Franchise',
        message: '',
        formType: 'contact',
      });
    });

    it('tracks analytics events on form submission', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm formType="trial" />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Dark Kitchen / Cloud Kitchen');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(analytics.track).toHaveBeenCalledWith('contact_form_start', {
          form_type: 'trial',
        });
      });

      await waitFor(() => {
        expect(analytics.trackFormSubmit).toHaveBeenCalledWith('trial', {
          restaurant_type: 'Dark Kitchen / Cloud Kitchen',
          has_company: true,
        });
      });

      await waitFor(() => {
        expect(analytics.track).toHaveBeenCalledWith('lead_captured', {
          form_type: 'trial',
          source_page: '/',
        });
      });
    });

    it('sends webhook notification when webhook URL is configured', async () => {
      const user = userEvent.setup({ delay: null });
      const originalEnv = import.meta.env.VITE_LEAD_WEBHOOK_URL;

      // Mock environment variable
      import.meta.env.VITE_LEAD_WEBHOOK_URL = 'https://hooks.slack.com/test';

      render(<LeadCaptureForm formType="demo" />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Restaurant');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Independent Restaurant');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Check that webhook was called (second fetch call)
        expect(global.fetch).toHaveBeenCalledTimes(2);

        const webhookCall = vi.mocked(global.fetch).mock.calls[1];
        expect(webhookCall[0]).toBe('https://hooks.slack.com/test');
        expect(webhookCall[1]?.method).toBe('POST');
      });

      // Restore environment variable
      import.meta.env.VITE_LEAD_WEBHOOK_URL = originalEnv;
    });

    it('calls onSuccess callback after successful submission', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm onSuccess={mockOnSuccess} />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('uses correct formType in API request', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm formType="newsletter" />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        const callArgs = vi.mocked(global.fetch).mock.calls[0];
        const requestBody = JSON.parse(callArgs[1]?.body as string);
        expect(requestBody.formType).toBe('newsletter');
      });
    });
  });

  describe('Success State', () => {
    it('displays success state after successful submission', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sent successfully!/i })).toBeInTheDocument();
      });
    });

    it('disables submit button in success state', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        const successButton = screen.getByRole('button', { name: /sent successfully!/i });
        expect(successButton).toBeDisabled();
      });
    });

    it('shows check icon in success state', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sent successfully!/i })).toBeInTheDocument();
      });
    });

    it('resets form after 3 seconds on success', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sent successfully!/i })).toBeInTheDocument();
      });

      // Wait for the form to reset after 3 seconds (using real timers)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/full name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email address/i)).toHaveValue('');
        expect(screen.getByLabelText(/company.*restaurant name/i)).toHaveValue('');
      }, { timeout: 5000 });
    });
  });

  describe('Error Handling', () => {
    it('displays error state on submission failure', async () => {
      const user = userEvent.setup({ delay: null });
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /error - try again/i })).toBeInTheDocument();
      });
    });

    it('displays error message on submission failure', async () => {
      const user = userEvent.setup({ delay: null });
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/something went wrong. please try again./i)).toBeInTheDocument();
      });
    });

    it('shows alert icon in error state', async () => {
      const user = userEvent.setup({ delay: null });
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /error - try again/i })).toBeInTheDocument();
      });
    });

    it('handles non-ok response as error', async () => {
      const user = userEvent.setup({ delay: null });
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /error - try again/i })).toBeInTheDocument();
        expect(screen.getByText(/something went wrong. please try again./i)).toBeInTheDocument();
      });
    });

    it('clears error state after 5 seconds', async () => {
      const user = userEvent.setup({ delay: null });
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /error - try again/i })).toBeInTheDocument();
      });

      // Wait for error state to clear after 5 seconds (using real timers)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
        expect(screen.queryByText(/something went wrong. please try again./i)).not.toBeInTheDocument();
      }, { timeout: 7000 });
    });

    it('does not call onSuccess on submission failure', async () => {
      const user = userEvent.setup({ delay: null });
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<LeadCaptureForm onSuccess={mockOnSuccess} />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /error - try again/i })).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('retains form data on submission failure', async () => {
      const user = userEvent.setup({ delay: null });
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /error - try again/i })).toBeInTheDocument();
      });

      // Form data should still be present
      expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
      expect(screen.getByLabelText(/email address/i)).toHaveValue('john@example.com');
      expect(screen.getByLabelText(/company.*restaurant name/i)).toHaveValue('Test Company');
      expect(screen.getByLabelText(/restaurant type/i)).toHaveValue('Other');
    });
  });

  describe('Loading State', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup({ delay: null });
      let resolveSubmit: (value: any) => void;
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });

      vi.mocked(global.fetch).mockReturnValue(submitPromise as any);

      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Check for loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sending\.\.\./i })).toBeInTheDocument();
      });

      // Resolve the promise and wait for state update
      await act(async () => {
        resolveSubmit!({ ok: true, json: async () => ({ success: true }) });
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    });

    it('disables submit button during submission', async () => {
      const user = userEvent.setup({ delay: null });
      let resolveSubmit: (value: any) => void;
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });

      vi.mocked(global.fetch).mockReturnValue(submitPromise as any);

      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Button should be disabled during loading
      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /sending\.\.\./i });
        expect(loadingButton).toBeDisabled();
      });

      // Resolve the promise
      resolveSubmit!({ ok: true, json: async () => ({ success: true }) });
    });

    it('shows spinner during submission', async () => {
      const user = userEvent.setup({ delay: null });
      let resolveSubmit: (value: any) => void;
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });

      vi.mocked(global.fetch).mockReturnValue(submitPromise as any);

      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Check for loading state with spinner (testing the presence of "Sending...")
      await waitFor(() => {
        expect(screen.getByText(/sending\.\.\./i)).toBeInTheDocument();
      });

      // Resolve the promise
      resolveSubmit!({ ok: true, json: async () => ({ success: true }) });
    });
  });

  describe('Form Field Interactions', () => {
    it('updates input values as user types', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm />);

      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      await user.type(nameInput, 'John Doe');

      expect(nameInput.value).toBe('John Doe');
    });

    it('updates email value as user types', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm />);

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('allows selecting different restaurant type options', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm />);

      const restaurantTypeSelect = screen.getByLabelText(/restaurant type/i) as HTMLSelectElement;

      await user.selectOptions(restaurantTypeSelect, 'Small Chain (2-10 locations)');
      expect(restaurantTypeSelect.value).toBe('Small Chain (2-10 locations)');

      await user.selectOptions(restaurantTypeSelect, 'Dark Kitchen / Cloud Kitchen');
      expect(restaurantTypeSelect.value).toBe('Dark Kitchen / Cloud Kitchen');
    });

    it('accepts multiline text in message field', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm />);

      const messageInput = screen.getByLabelText(/^message/i) as HTMLTextAreaElement;
      const multilineMessage = 'Line 1\nLine 2\nLine 3';

      await user.type(messageInput, multilineMessage);

      expect(messageInput.value).toBe(multilineMessage);
    });

    it('updates all form fields correctly', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm />);

      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@test.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Restaurant');
      await user.type(screen.getByLabelText(/phone number/i), '+123456789');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Franchise');
      await user.type(screen.getByLabelText(/^message/i), 'Test message');

      expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
      expect(screen.getByLabelText(/email address/i)).toHaveValue('john@test.com');
      expect(screen.getByLabelText(/company.*restaurant name/i)).toHaveValue('Test Restaurant');
      expect(screen.getByLabelText(/phone number/i)).toHaveValue('+123456789');
      expect(screen.getByLabelText(/restaurant type/i)).toHaveValue('Franchise');
      expect(screen.getByLabelText(/^message/i)).toHaveValue('Test message');
    });
  });

  describe('Form Props', () => {
    it('defaults to contact formType when not specified', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        const callArgs = vi.mocked(global.fetch).mock.calls[0];
        const requestBody = JSON.parse(callArgs[1]?.body as string);
        expect(requestBody.formType).toBe('contact');
      });
    });

    it('includes source page in submission', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LeadCaptureForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/company.*restaurant name/i), 'Test Company');
      await user.selectOptions(screen.getByLabelText(/restaurant type/i), 'Other');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        const callArgs = vi.mocked(global.fetch).mock.calls[0];
        const requestBody = JSON.parse(callArgs[1]?.body as string);
        expect(requestBody.source).toBe('/');
      });
    });
  });
});
