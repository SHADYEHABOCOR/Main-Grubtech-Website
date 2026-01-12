import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/testUtils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Login } from '../Login';
import { apiClient, API_ENDPOINTS } from '../../../config/api';
import { getAuthErrorMessage } from '../../../utils/errorMessages';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock apiClient
vi.mock('../../../config/api', async () => {
  const actual = await vi.importActual('../../../config/api');
  return {
    ...actual,
    apiClient: {
      post: vi.fn(),
    },
  };
});

// Mock getAuthErrorMessage
vi.mock('../../../utils/errorMessages', () => ({
  getAuthErrorMessage: vi.fn(),
}));

describe('Admin Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset getAuthErrorMessage mock to default implementation
    vi.mocked(getAuthErrorMessage).mockReturnValue('Invalid username or password.');
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('Form Rendering', () => {
    it('renders the login form with all elements', () => {
      render(<Login />);

      // Check for branding
      expect(screen.getByText('Grubtech')).toBeInTheDocument();
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();

      // Check for form fields
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      // Check for submit button
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders username field with correct attributes', () => {
      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('placeholder', 'Enter your username');
      expect(usernameInput).toHaveAttribute('autocomplete', 'username');
      expect(usernameInput).toBeRequired();
    });

    it('renders password field with correct attributes', () => {
      render(<Login />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
      expect(passwordInput).toBeRequired();
    });

    it('renders User icon for username field', () => {
      render(<Login />);

      // Check that the User icon is present (lucide-react renders as SVG)
      const usernameField = screen.getByLabelText(/username/i).parentElement;
      const svg = usernameField?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders Lock icon for password field', () => {
      render(<Login />);

      // Check that the Lock icon is present (lucide-react renders as SVG)
      const passwordField = screen.getByLabelText(/password/i).parentElement;
      const svg = passwordField?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders the submit button with correct initial text', () => {
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toHaveTextContent('Sign In');
      expect(submitButton).not.toBeDisabled();
    });

    it('renders footer with copyright information', () => {
      render(<Login />);

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} Grubtech\\.? All rights reserved\\.?`, 'i'))).toBeInTheDocument();
    });

    it('has data-admin-panel attribute for styling purposes', () => {
      const { container } = render(<Login />);

      const adminPanel = container.querySelector('[data-admin-panel]');
      expect(adminPanel).toBeInTheDocument();
    });
  });

  describe('Field Validation', () => {
    it('marks username field as required', () => {
      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      expect(usernameInput).toBeRequired();
    });

    it('marks password field as required', () => {
      render(<Login />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeRequired();
    });

    it('does not submit form with empty fields due to HTML5 validation', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Try to submit without filling fields
      await user.click(submitButton);

      // API should not be called because HTML5 validation prevents submission
      expect(apiClient.post).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Field Interactions', () => {
    it('updates username field value when typing', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);

      await user.type(usernameInput, 'testuser');

      expect(usernameInput).toHaveValue('testuser');
    });

    it('updates password field value when typing', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(passwordInput, 'testpassword123');

      expect(passwordInput).toHaveValue('testpassword123');
    });

    it('allows clearing and re-entering field values', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);

      await user.type(usernameInput, 'wronguser');
      expect(usernameInput).toHaveValue('wronguser');

      await user.clear(usernameInput);
      expect(usernameInput).toHaveValue('');

      await user.type(usernameInput, 'correctuser');
      expect(usernameInput).toHaveValue('correctuser');
    });
  });

  describe('Authentication Flow', () => {
    it('calls apiClient.post with correct endpoint and credentials on submit', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
        },
      });

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          API_ENDPOINTS.AUTH.LOGIN,
          { username: 'testuser', password: 'testpassword123' }
        );
      });
    });

    it('prevents form submission during loading', async () => {
      const user = userEvent.setup();
      // Use a deferred promise to control when the API resolves
      let resolveApiCall: (value: unknown) => void;
      const apiPromise = new Promise(resolve => {
        resolveApiCall = resolve;
      });
      vi.mocked(apiClient.post).mockReturnValue(apiPromise as Promise<{ data: { success: boolean; user: { id: string; username: string } } }>);

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword123');
      await user.click(submitButton);

      // Button should be disabled during loading
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Should only be called once, even if user tries to click again
      expect(apiClient.post).toHaveBeenCalledTimes(1);

      // Resolve the promise to clean up
      resolveApiCall!({ data: { success: true, user: { id: '1', username: 'testuser' } } });
    });
  });

  describe('Successful Login', () => {
    it('stores user info in sessionStorage on successful login', async () => {
      const user = userEvent.setup();
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'admin' };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          user: mockUser,
        },
      });

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        const storedUser = sessionStorage.getItem('admin_user');
        expect(storedUser).not.toBeNull();
        expect(JSON.parse(storedUser!)).toEqual(mockUser);
      });
    });

    it('redirects to admin dashboard on successful login', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
        },
      });

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
      });
    });

    it('does not display error message on successful login', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
        },
      });

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });

      // No error message should be displayed
      expect(screen.queryByText(/invalid username or password/i)).not.toBeInTheDocument();
    });
  });

  describe('Failed Login', () => {
    it('displays error message on failed login', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockRejectedValue({
        response: {
          status: 401,
          data: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
        },
      });

      vi.mocked(getAuthErrorMessage).mockReturnValue('Invalid username or password.');

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });
    });

    it('does not redirect to dashboard on failed login', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockRejectedValue({
        response: {
          status: 401,
          data: { code: 'INVALID_CREDENTIALS' },
        },
      });

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not store user info in sessionStorage on failed login', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockRejectedValue({
        response: {
          status: 401,
          data: { code: 'INVALID_CREDENTIALS' },
        },
      });

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });

      expect(sessionStorage.getItem('admin_user')).toBeNull();
    });

    it('uses getAuthErrorMessage to sanitize error messages', async () => {
      const user = userEvent.setup();
      const mockError = {
        response: {
          status: 401,
          data: { code: 'INVALID_CREDENTIALS', message: 'Stack trace: at file.js:123' },
        },
      };

      vi.mocked(apiClient.post).mockRejectedValue(mockError);
      vi.mocked(getAuthErrorMessage).mockReturnValue('Invalid username or password.');

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(getAuthErrorMessage).toHaveBeenCalledWith(mockError);
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
        // Should not display raw error message
        expect(screen.queryByText(/stack trace/i)).not.toBeInTheDocument();
      });
    });

    it('displays network error message appropriately', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockRejectedValue({
        code: 'ERR_NETWORK',
        message: 'Network Error',
      });

      vi.mocked(getAuthErrorMessage).mockReturnValue('Unable to connect to the server. Please check your connection.');

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Unable to connect to the server. Please check your connection.')).toBeInTheDocument();
      });
    });

    it('clears error message when retrying login', async () => {
      const user = userEvent.setup();

      // First attempt fails
      vi.mocked(apiClient.post).mockRejectedValueOnce({
        response: {
          status: 401,
          data: { code: 'INVALID_CREDENTIALS' },
        },
      });

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First attempt
      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });

      // Second attempt - should clear error before submitting
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          user: { id: '1', username: 'correctuser', email: 'test@example.com' },
        },
      });

      await user.clear(usernameInput);
      await user.clear(passwordInput);
      await user.type(usernameInput, 'correctuser');
      await user.type(passwordInput, 'correctpassword');
      await user.click(submitButton);

      // Error should be cleared when starting new submission
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
      });

      expect(screen.queryByText('Invalid username or password.')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading text during submission', async () => {
      const user = userEvent.setup();
      // Use a deferred promise to control when the API resolves
      let resolveApiCall: (value: unknown) => void;
      const apiPromise = new Promise(resolve => {
        resolveApiCall = resolve;
      });
      vi.mocked(apiClient.post).mockReturnValue(apiPromise as Promise<{ data: { success: boolean; user: { id: string; username: string } } }>);

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword123');
      await user.click(submitButton);

      // Should show loading text
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in\.\.\./i })).toBeInTheDocument();
      });

      // Resolve the promise to clean up
      resolveApiCall!({ data: { success: true, user: { id: '1', username: 'testuser' } } });
    });

    it('disables submit button during loading', async () => {
      const user = userEvent.setup();
      // Use a deferred promise to control when the API resolves
      let resolveApiCall: (value: unknown) => void;
      const apiPromise = new Promise(resolve => {
        resolveApiCall = resolve;
      });
      vi.mocked(apiClient.post).mockReturnValue(apiPromise as Promise<{ data: { success: boolean; user: { id: string; username: string } } }>);

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword123');
      await user.click(submitButton);

      // Button should be disabled
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Resolve the promise to clean up
      resolveApiCall!({ data: { success: true, user: { id: '1', username: 'testuser' } } });
    });

    it('re-enables submit button after successful submission', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
        },
      });

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });

      // Button should be re-enabled (though user will be redirected)
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Sign In');
    });

    it('re-enables submit button after failed submission', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockRejectedValue({
        response: {
          status: 401,
          data: { code: 'INVALID_CREDENTIALS' },
        },
      });

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });

      // Button should be re-enabled so user can retry
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Sign In');
    });

    it('applies loading opacity style to submit button during loading', async () => {
      const user = userEvent.setup();
      // Use a deferred promise to control when the API resolves
      let resolveApiCall: (value: unknown) => void;
      const apiPromise = new Promise(resolve => {
        resolveApiCall = resolve;
      });
      vi.mocked(apiClient.post).mockReturnValue(apiPromise as Promise<{ data: { success: boolean; user: { id: string; username: string } } }>);

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpassword123');
      await user.click(submitButton);

      // Should have opacity and cursor styles during loading
      await waitFor(() => {
        expect(submitButton).toHaveClass('opacity-50', 'cursor-not-allowed');
      });

      // Resolve the promise to clean up
      resolveApiCall!({ data: { success: true, user: { id: '1', username: 'testuser' } } });
    });
  });

  describe('Page Layout and Structure', () => {
    it('renders the page with correct structure', () => {
      const { container } = render(<Login />);

      // Check for main container with gradient background
      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-primary', 'via-primary-dark', 'to-gray-900');
    });

    it('renders form in a white card container', () => {
      const { container } = render(<Login />);

      const formContainer = container.querySelector('.bg-white');
      expect(formContainer).toBeInTheDocument();
      expect(formContainer).toHaveClass('rounded-2xl', 'shadow-2xl');
    });

    it('centers the form on the page', () => {
      const { container } = render(<Login />);

      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure with labels', () => {
      render(<Login />);

      // Check that inputs are properly labeled
      const usernameLabel = screen.getByText('Username');
      const passwordLabel = screen.getByText('Password');

      expect(usernameLabel.tagName).toBe('LABEL');
      expect(passwordLabel.tagName).toBe('LABEL');
    });

    it('has proper heading hierarchy', () => {
      render(<Login />);

      const h1 = screen.getByRole('heading', { level: 1, name: /grubtech/i });
      const h2 = screen.getByRole('heading', { level: 2, name: /sign in/i });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });

    it('includes autocomplete attributes for password managers', () => {
      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(usernameInput).toHaveAttribute('autocomplete', 'username');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('renders error message in an accessible container', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockRejectedValue({
        response: {
          status: 401,
          data: { code: 'INVALID_CREDENTIALS' },
        },
      });

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Invalid username or password.');
        const errorContainer = errorMessage.parentElement;
        expect(errorContainer).toHaveClass('bg-red-50', 'border-red-200');
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive padding to main container', () => {
      const { container } = render(<Login />);

      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('p-4');
    });

    it('constrains form width for better readability', () => {
      const { container } = render(<Login />);

      const formWrapper = container.querySelector('.max-w-md');
      expect(formWrapper).toBeInTheDocument();
      expect(formWrapper).toHaveClass('w-full');
    });
  });
});
