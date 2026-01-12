import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RequiredFieldsLegend } from '../RequiredFieldsLegend';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => {
      if (key === 'form.requiredFieldsLegend') {
        return options?.defaultValue || 'Fields marked with * are required';
      }
      return key;
    },
  }),
}));

describe('RequiredFieldsLegend', () => {
  it('renders the legend text with required fields message', () => {
    render(<RequiredFieldsLegend />);

    const legendText = screen.getByText(/Fields marked with \* are required/i);
    expect(legendText).toBeInTheDocument();
  });

  it('has aria-label attribute for screen reader accessibility', () => {
    render(<RequiredFieldsLegend />);

    const paragraph = screen.getByText(/Fields marked with \* are required/i);
    expect(paragraph).toHaveAttribute('aria-label');
    expect(paragraph.getAttribute('aria-label')).toContain('Fields marked with');
  });

  it('displays red asterisk with proper styling', () => {
    render(<RequiredFieldsLegend />);

    const paragraph = screen.getByText(/Fields marked with \* are required/i);
    const asteriskSpan = paragraph.querySelector('span.text-red-500');

    expect(asteriskSpan).toBeInTheDocument();
    expect(asteriskSpan).toHaveTextContent('*');
    expect(asteriskSpan).toHaveClass('text-red-500');
  });

  it('has correct CSS classes for styling', () => {
    render(<RequiredFieldsLegend />);

    const paragraph = screen.getByText(/Fields marked with \* are required/i);
    expect(paragraph).toHaveClass('text-sm');
    expect(paragraph).toHaveClass('text-text-secondary');
    expect(paragraph).toHaveClass('mb-4');
  });

  it('renders as a paragraph element', () => {
    const { container } = render(<RequiredFieldsLegend />);

    const paragraph = container.querySelector('p');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent('Fields marked with * are required');
  });
});
