import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Select } from '../Select';

describe('Select accessibility', () => {
  const mockOnChange = vi.fn();
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('has aria-invalid false when no error is present', () => {
    render(
      <Select
        label="Country"
        name="country"
        value="option1"
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox', { name: /country/i });
    expect(select).toHaveAttribute('aria-invalid', 'false');
  });

  it('has aria-invalid true when error exists', () => {
    render(
      <Select
        label="Country"
        name="country"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        error="Country is required"
      />
    );

    const select = screen.getByRole('combobox', { name: /country/i });
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no aria-describedby when no error is present', () => {
    render(
      <Select
        label="Country"
        name="country"
        value="option1"
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox', { name: /country/i });
    expect(select).not.toHaveAttribute('aria-describedby');
  });

  it('has aria-describedby pointing to error message ID when error exists', () => {
    render(
      <Select
        label="Country"
        name="country"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        error="Country is required"
      />
    );

    const select = screen.getByRole('combobox', { name: /country/i });
    expect(select).toHaveAttribute('aria-describedby', 'country-error');
  });

  it('renders error message with correct ID attribute', () => {
    render(
      <Select
        label="Country"
        name="country"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        error="Country is required"
      />
    );

    const errorMessage = screen.getByText('Country is required');
    expect(errorMessage).toHaveAttribute('id', 'country-error');
  });

  it('error message has role="alert" for screen reader announcements', () => {
    render(
      <Select
        label="Country"
        name="country"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        error="Country is required"
      />
    );

    const errorMessage = screen.getByText('Country is required');
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  it('does not render error message when no error', () => {
    render(
      <Select
        label="Country"
        name="country"
        value="option1"
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const errorMessage = screen.queryByRole('alert');
    expect(errorMessage).not.toBeInTheDocument();
  });

  it('generates unique error IDs based on select name', () => {
    const { rerender } = render(
      <Select
        label="Country"
        name="country"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        error="Country is required"
      />
    );

    const countrySelect = screen.getByRole('combobox', { name: /country/i });
    const countryError = screen.getByText('Country is required');
    expect(countrySelect).toHaveAttribute('aria-describedby', 'country-error');
    expect(countryError).toHaveAttribute('id', 'country-error');

    rerender(
      <Select
        label="State"
        name="state"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        error="State is required"
      />
    );

    const stateSelect = screen.getByRole('combobox', { name: /state/i });
    const stateError = screen.getByText('State is required');
    expect(stateSelect).toHaveAttribute('aria-describedby', 'state-error');
    expect(stateError).toHaveAttribute('id', 'state-error');
  });

  it('associates select with label correctly', () => {
    render(
      <Select
        label="Country"
        name="country"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox', { name: /country/i });
    expect(select).toHaveAttribute('id', 'country');
    expect(select).toHaveAttribute('name', 'country');
  });

  it('renders all options correctly', () => {
    render(
      <Select
        label="Country"
        name="country"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const options = screen.getAllByRole('option');
    // +1 for the placeholder option
    expect(options).toHaveLength(mockOptions.length + 1);
  });
});
