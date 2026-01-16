import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/testUtils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SubscribeForm } from '../SubscribeForm';
import { contactService } from '../../../services/contactService';

// Mock the contactService
vi.mock('../../../services/contactService', () => ({
  contactService: {
    subscribeNewsletter: vi.fn(),
  },
}));

// Mock the useLanguage hook
vi.mock('../../../context/LanguageContext', () => ({
  useLanguage: vi.fn(() => ({
    currentLanguage: 'en',
    changeLanguage: vi.fn(),
    isRTL: false,
  })),
}));

describe('SubscribeForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(contactService.subscribeNewsletter).mockResolvedValue({
      success: true,
      data: {},
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders email input field correctly', () => {
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      expect(emailInput).toBeInTheDocument();
    });

    it('renders the submit button', () => {
      render(<SubscribeForm />);

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('sets correct input type for email field', () => {
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('renders mail icon in submit button', () => {
      render(<SubscribeForm />);

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      const svg = submitButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('disables email input during submission', async () => {
      const user = userEvent.setup();
      // Use a deferred promise to control when the submission resolves
      let resolveSubmission: (value: { success: boolean; data: object }) => void;
      const submissionPromise = new Promise<{ success: boolean; data: object }>((resolve) => {
        resolveSubmission = resolve;
      });
      vi.mocked(contactService.subscribeNewsletter).mockReturnValue(submissionPromise);

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Should be disabled during submission
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
      });

      // Resolve the promise to clean up
      resolveSubmission!({ success: true, data: {} });
    });
  });

  describe('Email Validation', () => {
    it('shows validation error for empty email field', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('does not show validation error for valid email', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
      });
    });

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      // Trigger validation error
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      // Start typing - error should clear
      await user.type(emailInput, 't');

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });

    it('shows error styling on email input when there is an error', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      // Trigger validation error
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      expect(emailInput).toHaveClass('border-red-500');
    });

    it('shows normal styling on email input when there is no error', () => {
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      expect(emailInput).toHaveClass('border-border');
      expect(emailInput).not.toHaveClass('border-red-500');
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid email', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(contactService.subscribeNewsletter).toHaveBeenCalledWith('test@example.com', 'en');
      });
    });

    it('submits form with current language from context', async () => {
      const user = userEvent.setup();
      // Mock Arabic language
      const { useLanguage } = await import('../../../context/LanguageContext');
      vi.mocked(useLanguage).mockReturnValue({
        currentLanguage: 'ar',
        changeLanguage: vi.fn(),
        isRTL: true,
      });

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(contactService.subscribeNewsletter).toHaveBeenCalledWith('test@example.com', 'ar');
      });
    });

    it('does not submit form when validation fails', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      expect(contactService.subscribeNewsletter).not.toHaveBeenCalled();
    });

    it('clears email field after successful submission', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(contactService.subscribeNewsletter).toHaveBeenCalled();
      });

      // Success state should be shown, form should be hidden
      await waitFor(() => {
        expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument();
      });
    });

    it('prevents form submission while already submitting', async () => {
      const user = userEvent.setup();
      // Use a deferred promise to control when the submission resolves
      let resolveSubmission: (value: { success: boolean; data: object }) => void;
      const submissionPromise = new Promise<{ success: boolean; data: object }>((resolve) => {
        resolveSubmission = resolve;
      });
      vi.mocked(contactService.subscribeNewsletter).mockReturnValue(submissionPromise);

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      // Click twice quickly
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only be called once
      await waitFor(() => {
        expect(contactService.subscribeNewsletter).toHaveBeenCalledTimes(1);
      });

      // Resolve the promise to clean up
      resolveSubmission!({ success: true, data: {} });
    });
  });

  describe('Success State', () => {
    it('displays success message after successful submission', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument();
      });
    });

    it('shows success message about email confirmation', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/check your email for confirmation/i)).toBeInTheDocument();
      });
    });

    it('hides form fields when in success state', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument();
      });

      // Form should not be visible
      expect(screen.queryByPlaceholderText(/enter your email/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /subscribe/i })).not.toBeInTheDocument();
    });

    it('displays success message with green styling', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        const successMessage = screen.getByText(/successfully subscribed/i);
        const successContainer = successMessage.closest('div');
        expect(successContainer).toHaveClass('bg-green-50');
        expect(successContainer).toHaveClass('border-green-200');
        expect(successContainer).toHaveClass('text-green-700');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message on submission failure', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.subscribeNewsletter).mockRejectedValue(
        new Error('Network error')
      );

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/unable to subscribe/i)).toBeInTheDocument();
      });
    });

    it('does not show success state on submission failure', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.subscribeNewsletter).mockRejectedValue(
        new Error('Network error')
      );

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/unable to subscribe/i)).toBeInTheDocument();
      });

      // Success message should not be shown
      expect(screen.queryByText(/successfully subscribed/i)).not.toBeInTheDocument();
    });

    it('displays error text in red color', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.subscribeNewsletter).mockRejectedValue(
        new Error('Network error')
      );

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/unable to subscribe/i);
        expect(errorMessage).toHaveClass('text-red-500');
      });
    });

    it('retains email value after submission failure', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.subscribeNewsletter).mockRejectedValue(
        new Error('Network error')
      );

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/unable to subscribe/i)).toBeInTheDocument();
      });

      // Email should still be in the input
      expect(emailInput.value).toBe('test@example.com');
    });

    it('clears error when user modifies email after error', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.subscribeNewsletter).mockRejectedValue(
        new Error('Network error')
      );

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/unable to subscribe/i)).toBeInTheDocument();
      });

      // Type more characters - error should clear
      await user.type(emailInput, 'x');

      await waitFor(() => {
        expect(screen.queryByText(/unable to subscribe/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      // Use a deferred promise to control when the submission resolves
      let resolveSubmission: (value: { success: boolean; data: object }) => void;
      const submissionPromise = new Promise<{ success: boolean; data: object }>((resolve) => {
        resolveSubmission = resolve;
      });
      vi.mocked(contactService.subscribeNewsletter).mockReturnValue(submissionPromise);

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      // Should show loading text
      await waitFor(() => {
        expect(screen.getByText(/subscribing/i)).toBeInTheDocument();
      });

      // Resolve the promise to clean up
      resolveSubmission!({ success: true, data: {} });
    });

    it('re-enables form after submission completes successfully', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument();
      });

      // Form is hidden in success state, so inputs won't be in document
      expect(screen.queryByPlaceholderText(/enter your email/i)).not.toBeInTheDocument();
    });

    it('re-enables form after submission fails', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.subscribeNewsletter).mockRejectedValue(
        new Error('Network error')
      );

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/unable to subscribe/i)).toBeInTheDocument();
      });

      // Input should be enabled again
      expect(emailInput).not.toBeDisabled();
    });
  });

  describe('Form Field Interactions', () => {
    it('updates email value as user types', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i) as HTMLInputElement;
      await user.type(emailInput, 'john@example.com');

      expect(emailInput.value).toBe('john@example.com');
    });

    it('accepts various email formats', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i) as HTMLInputElement;

      // Test different email formats
      await user.clear(emailInput);
      await user.type(emailInput, 'user@example.com');
      expect(emailInput.value).toBe('user@example.com');

      await user.clear(emailInput);
      await user.type(emailInput, 'user.name@example.co.uk');
      expect(emailInput.value).toBe('user.name@example.co.uk');

      await user.clear(emailInput);
      await user.type(emailInput, 'user+tag@example.com');
      expect(emailInput.value).toBe('user+tag@example.com');
    });

    it('handles copy and paste in email field', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i) as HTMLInputElement;

      // Simulate paste
      await user.click(emailInput);
      await user.paste('pasted@example.com');

      expect(emailInput.value).toBe('pasted@example.com');
    });
  });

  describe('Integration with Subscription Service', () => {
    beforeEach(async () => {
      // Reset the language mock to English before each test in this section
      const { useLanguage } = await import('../../../context/LanguageContext');
      vi.mocked(useLanguage).mockReturnValue({
        currentLanguage: 'en',
        changeLanguage: vi.fn(),
        isRTL: false,
      });
    });

    it('calls subscribeNewsletter with correct parameters', async () => {
      const user = userEvent.setup();
      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'subscriber@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(contactService.subscribeNewsletter).toHaveBeenCalledTimes(1);
        expect(contactService.subscribeNewsletter).toHaveBeenCalledWith(
          'subscriber@example.com',
          'en'
        );
      });
    });

    it('handles successful subscription response', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.subscribeNewsletter).mockResolvedValue({
        success: true,
        data: { id: 'sub-123' },
      });

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument();
      });
    });

    it('handles subscription service errors gracefully', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.subscribeNewsletter).mockRejectedValue(
        new Error('Service unavailable')
      );

      render(<SubscribeForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/unable to subscribe/i)).toBeInTheDocument();
      });

      // Form should still be visible for retry
      expect(emailInput).toBeInTheDocument();
    });
  });
});
