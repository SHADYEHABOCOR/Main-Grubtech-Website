import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Mock the useReducedMotion hook
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(),
}));

describe('Button Component', () => {
  // Set default mock return value to false (animations enabled) for all tests
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies variant styles correctly', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-brand', 'text-white');

      rerender(<Button variant="secondary">Secondary</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white', 'text-brand');

      rerender(<Button variant="outline">Outline</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('border-2', 'border-white', 'text-white');
    });

    it('applies size styles correctly', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-2.5', 'text-xs');

      rerender(<Button size="md">Medium</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('px-8', 'py-3', 'text-sm');

      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('px-10', 'py-4', 'text-base');
    });
  });

  describe('Loading state', () => {
    it('renders spinner when loading prop is true', () => {
      render(<Button loading>Submit</Button>);

      // Check for SVG spinner element
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toBeInTheDocument();
    });

    it('disables button when loading is true', () => {
      render(<Button loading>Submit</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('prevents onClick handler from being called when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button loading onClick={handleClick}>Submit</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('displays loadingText when provided', () => {
      render(
        <Button loading loadingText="Submitting...">
          Submit
        </Button>
      );

      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('displays original children when loading but loadingText not provided', () => {
      render(<Button loading>Submit</Button>);

      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('renders small spinner for sm and md button sizes', () => {
      const { rerender } = render(
        <Button loading size="sm">
          Small
        </Button>
      );

      let button = screen.getByRole('button');
      let spinnerContainer = button.querySelector('div');
      expect(spinnerContainer).toHaveClass('w-4', 'h-4');

      rerender(
        <Button loading size="md">
          Medium
        </Button>
      );

      button = screen.getByRole('button');
      spinnerContainer = button.querySelector('div');
      expect(spinnerContainer).toHaveClass('w-4', 'h-4');
    });

    it('renders medium spinner for lg button size', () => {
      render(
        <Button loading size="lg">
          Large
        </Button>
      );

      const button = screen.getByRole('button');
      const spinnerContainer = button.querySelector('div');
      expect(spinnerContainer).toHaveClass('w-8', 'h-8');
    });

    it('applies correct spinner color for primary variant', () => {
      render(
        <Button loading variant="primary">
          Primary
        </Button>
      );

      const button = screen.getByRole('button');
      const spinnerContainer = button.querySelector('div');
      expect(spinnerContainer).toHaveClass('text-white');
    });

    it('applies correct spinner color for secondary variant', () => {
      render(
        <Button loading variant="secondary">
          Secondary
        </Button>
      );

      const button = screen.getByRole('button');
      const spinnerContainer = button.querySelector('div');
      expect(spinnerContainer).toHaveClass('text-brand');
    });

    it('applies correct spinner color for outline variant', () => {
      render(
        <Button loading variant="outline">
          Outline
        </Button>
      );

      const button = screen.getByRole('button');
      const spinnerContainer = button.querySelector('div');
      expect(spinnerContainer).toHaveClass('text-white');
    });

    it('applies correct spinner color for white variant', () => {
      render(
        <Button loading variant="white">
          White
        </Button>
      );

      const button = screen.getByRole('button');
      const spinnerContainer = button.querySelector('div');
      expect(spinnerContainer).toHaveClass('text-brand');
    });

    it('applies correct spinner color for ghost variant', () => {
      render(
        <Button loading variant="ghost">
          Ghost
        </Button>
      );

      const button = screen.getByRole('button');
      const spinnerContainer = button.querySelector('div');
      expect(spinnerContainer).toHaveClass('text-current');
    });

    it('applies correct spinner color for outline-dark variant', () => {
      render(
        <Button loading variant="outline-dark">
          Outline Dark
        </Button>
      );

      const button = screen.getByRole('button');
      const spinnerContainer = button.querySelector('div');
      expect(spinnerContainer).toHaveClass('text-current');
    });
  });

  describe('Disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Submit</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('prevents onClick handler from being called when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button disabled onClick={handleClick}>Submit</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('combines disabled and loading states', () => {
      render(<Button disabled loading>Submit</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');

      // Should still show spinner
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Additional props', () => {
    it('applies fullWidth class when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('w-full');
    });

    it('applies iconOnly padding when iconOnly is true', () => {
      render(<Button iconOnly size="md">X</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('p-2.5');
      expect(button).not.toHaveClass('px-8', 'py-3');
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('custom-class');
    });

    it('sets correct button type attribute', () => {
      const { rerender } = render(<Button type="submit">Submit</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');

      rerender(<Button type="reset">Reset</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');

      rerender(<Button type="button">Button</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Animation states', () => {
    it('does not apply hover animations when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');

      // Check that primary gradient overlay is not rendered
      const gradientOverlay = button.querySelector('.bg-gradient-to-r.from-primary-light');
      expect(gradientOverlay).not.toBeInTheDocument();
    });

    it('does not apply hover animations when loading', () => {
      render(<Button loading variant="primary">Loading</Button>);
      const button = screen.getByRole('button');

      // Check that primary gradient overlay is not rendered
      const gradientOverlay = button.querySelector('.bg-gradient-to-r.from-primary-light');
      expect(gradientOverlay).not.toBeInTheDocument();
    });

    it('renders hover animations when not disabled or loading', () => {
      render(<Button variant="primary">Enabled</Button>);
      const button = screen.getByRole('button');

      // Check that primary gradient overlay is rendered
      const gradientOverlay = button.querySelector('.bg-gradient-to-r.from-primary-light');
      expect(gradientOverlay).toBeInTheDocument();

      // Check that shimmer effect is rendered
      const shimmerEffect = button.querySelector('.bg-gradient-to-r.from-transparent');
      expect(shimmerEffect).toBeInTheDocument();
    });
  });

  describe('Reduced Motion Support', () => {
    describe('When reduced motion is enabled', () => {
      beforeEach(() => {
        vi.mocked(useReducedMotion).mockReturnValue(true);
      });

      it('does not apply hover scale classes', () => {
        render(<Button variant="primary">Button</Button>);
        const button = screen.getByRole('button');

        // Should not have scale animation classes
        expect(button.className).not.toMatch(/hover:scale-\[1\.01\]/);
        expect(button.className).not.toMatch(/active:scale-\[0\.99\]/);
      });

      it('does not render gradient overlay for primary buttons', () => {
        render(<Button variant="primary">Primary Button</Button>);
        const button = screen.getByRole('button');

        // Gradient overlay should not be rendered
        const gradientOverlay = button.querySelector('.bg-gradient-to-r.from-primary-light');
        expect(gradientOverlay).not.toBeInTheDocument();
      });

      it('does not render shimmer effect for primary buttons', () => {
        render(<Button variant="primary">Primary Button</Button>);
        const button = screen.getByRole('button');

        // Shimmer effect should not be rendered
        const shimmerEffect = button.querySelector('.bg-gradient-to-r.from-transparent');
        expect(shimmerEffect).not.toBeInTheDocument();
      });

      it('applies reduced motion styling for all button variants', () => {
        const variants: Array<'primary' | 'secondary' | 'outline' | 'outline-dark' | 'white' | 'ghost'> = [
          'primary',
          'secondary',
          'outline',
          'outline-dark',
          'white',
          'ghost',
        ];

        variants.forEach((variant) => {
          const { unmount } = render(<Button variant={variant}>{variant}</Button>);
          const button = screen.getByRole('button');

          // Should not have scale animation classes
          expect(button.className).not.toMatch(/hover:scale-\[1\.01\]/);
          expect(button.className).not.toMatch(/active:scale-\[0\.99\]/);

          unmount();
        });
      });

      it('still maintains functionality when reduced motion is enabled', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();
        render(
          <Button variant="primary" onClick={handleClick}>
            Click me
          </Button>
        );

        const button = screen.getByRole('button');
        await user.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it('keeps button styles and hover states active except animations', () => {
        render(<Button variant="primary">Primary</Button>);
        const button = screen.getByRole('button');

        // Should still have variant styles
        expect(button).toHaveClass('bg-brand', 'text-white');

        // Should still have base styles
        expect(button).toHaveClass('transition-elegant');
      });
    });

    describe('When reduced motion is disabled', () => {
      beforeEach(() => {
        vi.mocked(useReducedMotion).mockReturnValue(false);
      });

      it('applies hover scale classes', () => {
        render(<Button variant="primary">Button</Button>);
        const button = screen.getByRole('button');

        // Should have scale animation classes
        expect(button.className).toMatch(/hover:scale-\[1\.01\]/);
        expect(button.className).toMatch(/active:scale-\[0\.99\]/);
      });

      it('renders gradient overlay for primary buttons', () => {
        render(<Button variant="primary">Primary Button</Button>);
        const button = screen.getByRole('button');

        // Gradient overlay should be rendered
        const gradientOverlay = button.querySelector('.bg-gradient-to-r.from-primary-light');
        expect(gradientOverlay).toBeInTheDocument();
      });

      it('renders shimmer effect for primary buttons', () => {
        render(<Button variant="primary">Primary Button</Button>);
        const button = screen.getByRole('button');

        // Shimmer effect should be rendered
        const shimmerEffect = button.querySelector('.bg-gradient-to-r.from-transparent');
        expect(shimmerEffect).toBeInTheDocument();
      });

      it('does not render animations for disabled buttons even with motion enabled', () => {
        render(
          <Button variant="primary" disabled>
            Disabled
          </Button>
        );
        const button = screen.getByRole('button');

        // Gradient overlay should not be rendered for disabled buttons
        const gradientOverlay = button.querySelector('.bg-gradient-to-r.from-primary-light');
        expect(gradientOverlay).not.toBeInTheDocument();

        // Shimmer effect should not be rendered for disabled buttons
        const shimmerEffect = button.querySelector('.bg-gradient-to-r.from-transparent');
        expect(shimmerEffect).not.toBeInTheDocument();
      });

      it('does not render animations for loading buttons even with motion enabled', () => {
        render(
          <Button variant="primary" loading>
            Loading
          </Button>
        );
        const button = screen.getByRole('button');

        // Gradient overlay should not be rendered for loading buttons
        const gradientOverlay = button.querySelector('.bg-gradient-to-r.from-primary-light');
        expect(gradientOverlay).not.toBeInTheDocument();

        // Shimmer effect should not be rendered for loading buttons
        const shimmerEffect = button.querySelector('.bg-gradient-to-r.from-transparent');
        expect(shimmerEffect).not.toBeInTheDocument();
      });
    });

    describe('Hook integration', () => {
      it('calls useReducedMotion hook on render', () => {
        render(<Button>Test</Button>);

        expect(useReducedMotion).toHaveBeenCalled();
      });

      it('re-evaluates animations when reduced motion preference changes', () => {
        // Use a key to force React.memo to re-render when we change the mock
        const { rerender } = render(<Button key="1" variant="primary">Button</Button>);
        let button = screen.getByRole('button');

        // Initially with animations (false)
        expect(button.className).toMatch(/hover:scale-\[1\.01\]/);
        let gradientOverlay = button.querySelector('.bg-gradient-to-r.from-primary-light');
        expect(gradientOverlay).toBeInTheDocument();

        // Change to reduced motion (true) - use different key to force remount
        vi.mocked(useReducedMotion).mockReturnValue(true);
        rerender(<Button key="2" variant="primary">Button</Button>);
        button = screen.getByRole('button');

        // Should not have animations
        expect(button.className).not.toMatch(/hover:scale-\[1\.01\]/);
        gradientOverlay = button.querySelector('.bg-gradient-to-r.from-primary-light');
        expect(gradientOverlay).not.toBeInTheDocument();

        // Change back to normal motion (false) - use different key to force remount
        vi.mocked(useReducedMotion).mockReturnValue(false);
        rerender(<Button key="3" variant="primary">Button</Button>);
        button = screen.getByRole('button');

        // Should have animations again
        expect(button.className).toMatch(/hover:scale-\[1\.01\]/);
        gradientOverlay = button.querySelector('.bg-gradient-to-r.from-primary-light');
        expect(gradientOverlay).toBeInTheDocument();
      });
    });
  });
});
