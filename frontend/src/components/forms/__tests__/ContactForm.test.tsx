import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '../../../test/testUtils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ContactForm } from '../ContactForm';
import { contactService } from '../../../services/contactService';
import { useToast } from '../../ui/Toast';

// Mock the contactService
vi.mock('../../../services/contactService', () => ({
  contactService: {
    submitContact: vi.fn(),
  },
}));

// Mock the useToast hook
vi.mock('../../ui/Toast', () => ({
  useToast: vi.fn(),
}));

describe('ContactForm Component', () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    showToast: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(contactService.submitContact).mockResolvedValue({
      success: true,
      data: { id: 'test-id' },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders all form fields correctly', () => {
      render(<ContactForm />);

      // Check for all required fields
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preferred contact method/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^message/i)).toBeInTheDocument();
    });

    it('renders the submit button', () => {
      render(<ContactForm />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('renders required fields legend', () => {
      render(<ContactForm />);

      expect(screen.getByText(/fields marked with.*are required/i)).toBeInTheDocument();
    });

    it('sets correct input types for fields', () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/phone number/i)).toHaveAttribute('type', 'tel');
    });

    it('renders subject dropdown with options', () => {
      render(<ContactForm />);

      const subjectSelect = screen.getByLabelText(/^subject/i);
      expect(subjectSelect).toBeInTheDocument();

      // Check that native select has all expected options
      const options = subjectSelect.querySelectorAll('option');
      const optionTexts = Array.from(options).map(opt => opt.textContent);

      expect(optionTexts).toContain('Request a Demo');
      expect(optionTexts).toContain('Sales Inquiry');
      expect(optionTexts).toContain('Technical Support');
      expect(optionTexts).toContain('Partnership Opportunities');
    });

    it('renders preferred contact method dropdown with options', () => {
      render(<ContactForm />);

      const contactMethodSelect = screen.getByLabelText(/preferred contact method/i);
      expect(contactMethodSelect).toBeInTheDocument();

      // Default value should be email
      expect(contactMethodSelect).toHaveValue('email');
    });
  });

  describe('Field Validation', () => {
    it('shows validation error for empty name field', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for name less than 2 characters', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'J');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for empty email field', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid phone number format', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, 'abc');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
      });
    });

    it('does not show error for empty optional phone field', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Fill required fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');
      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/phone.*required/i)).not.toBeInTheDocument();
      });
    });

    it('shows validation error for empty subject field', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for empty message field', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/message is required/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for message less than 10 characters', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const messageInput = screen.getByLabelText(/^message/i);
      await user.type(messageInput, 'Short');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('clears field error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Trigger validation
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });

      // Start typing
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'John');

      await waitFor(() => {
        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with all fields filled', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Fill in all fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '+971501234567');
      await user.type(screen.getByLabelText(/company name/i), 'Acme Corp');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');
      await user.selectOptions(screen.getByLabelText(/preferred contact method/i), 'phone');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message for the sales team');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(contactService.submitContact).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+971501234567',
          company: 'Acme Corp',
          subject: 'sales',
          message: 'This is a test message for the sales team',
          preferredContact: 'phone',
        });
      });
    });

    it('submits form with only required fields filled', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Fill in only required fields
      await user.type(screen.getByLabelText(/full name/i), 'Jane Smith');
      await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'demo');

      await user.type(screen.getByLabelText(/^message/i), 'I would like to request a demo of your product');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(contactService.submitContact).toHaveBeenCalledWith({
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '',
          company: '',
          subject: 'demo',
          message: 'I would like to request a demo of your product',
          preferredContact: 'email',
        });
      });
    });

    it('does not submit form when validation fails', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Submit empty form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });

      expect(contactService.submitContact).not.toHaveBeenCalled();
    });
  });

  describe('Success State', () => {
    it('displays success message after successful submission', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/message sent!/i)).toBeInTheDocument();
        expect(screen.getByText(/thank you for contacting us/i)).toBeInTheDocument();
      });
    });

    it('shows success toast notification', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          expect.stringContaining('Thank you for contacting us')
        );
      });
    });

    it('hides form fields when in success state', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
      });
    });

    it('displays reset button in success state', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send another message/i })).toBeInTheDocument();
      });
    });

    it('resets form when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send another message/i })).toBeInTheDocument();
      });

      // Click reset button
      const resetButton = screen.getByRole('button', { name: /send another message/i });
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/full name/i)).toHaveValue('');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message on submission failure', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.submitContact).mockRejectedValueOnce(new Error('Network error'));

      render(<ContactForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Check for error display in the form (getFormErrorMessage returns sanitized message)
        expect(screen.getByText(/an error occurred|unable to send/i)).toBeInTheDocument();
      });
    });

    it('shows error toast notification on submission failure', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.submitContact).mockRejectedValueOnce(new Error('Server error'));

      render(<ContactForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });
    });

    it('does not show success state on submission failure', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.submitContact).mockRejectedValueOnce(new Error('Server error'));

      render(<ContactForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });

      // Should still show form fields
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.queryByText(/message sent!/i)).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      let resolveSubmit: (value: any) => void;
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });

      vi.mocked(contactService.submitContact).mockReturnValue(submitPromise as any);

      render(<ContactForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Check for loading state
      await waitFor(() => {
        expect(screen.getByText(/sending/i)).toBeInTheDocument();
      });

      // Resolve the promise with act to properly handle React state updates
      await act(async () => {
        resolveSubmit!({ success: true, data: { id: 'test-id' } });
      });
    });

    it('disables submit button during submission', async () => {
      const user = userEvent.setup();
      let resolveSubmit: (value: any) => void;
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });

      vi.mocked(contactService.submitContact).mockReturnValue(submitPromise as any);

      render(<ContactForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Button should be disabled during loading
      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /sending/i });
        expect(loadingButton).toBeDisabled();
      });

      // Resolve the promise with act to properly handle React state updates
      await act(async () => {
        resolveSubmit!({ success: true, data: { id: 'test-id' } });
      });
    });

    it('re-enables submit button after submission completes', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.submitContact).mockRejectedValueOnce(new Error('Server error'));

      render(<ContactForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');

      await user.selectOptions(screen.getByLabelText(/^subject/i), 'sales');

      await user.type(screen.getByLabelText(/^message/i), 'This is a test message');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Wait for error
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });

      // Button should be enabled again
      const enabledButton = screen.getByRole('button', { name: /send message/i });
      expect(enabledButton).not.toBeDisabled();
    });
  });

  describe('Form Field Interactions', () => {
    it('updates input values as user types', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      await user.type(nameInput, 'John Doe');

      expect(nameInput.value).toBe('John Doe');
    });

    it('allows selecting different subject options', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const subjectSelect = screen.getByLabelText(/^subject/i);
      await user.selectOptions(subjectSelect, 'support');

      expect(subjectSelect).toHaveValue('support');
    });

    it('allows selecting different contact method options', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const contactMethodSelect = screen.getByLabelText(/preferred contact method/i);

      // Default should be email
      expect(contactMethodSelect).toHaveValue('email');

      // Change to phone
      await user.selectOptions(contactMethodSelect, 'phone');

      expect(contactMethodSelect).toHaveValue('phone');
    });

    it('accepts multiline text in message field', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const messageInput = screen.getByLabelText(/^message/i) as HTMLTextAreaElement;
      const multilineMessage = 'Line 1\nLine 2\nLine 3';

      await user.type(messageInput, multilineMessage);

      expect(messageInput.value).toBe(multilineMessage);
    });
  });
});
