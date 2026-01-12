import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormInput } from '../FormInput';

describe('FormInput accessibility', () => {
  const mockOnChange = vi.fn();

  it('has aria-invalid false when no error is present', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        value="test@example.com"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox', { name: /email/i });
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('has aria-invalid true when error exists', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        error="Email is required"
      />
    );

    const input = screen.getByRole('textbox', { name: /email/i });
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no aria-describedby when no error is present', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        value="test@example.com"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox', { name: /email/i });
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('has aria-describedby pointing to error message ID when error exists', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        error="Email is required"
      />
    );

    const input = screen.getByRole('textbox', { name: /email/i });
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('renders error message with correct ID attribute', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        error="Email is required"
      />
    );

    const errorMessage = screen.getByText('Email is required');
    expect(errorMessage).toHaveAttribute('id', 'email-error');
  });

  it('error message has role="alert" for screen reader announcements', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        error="Email is required"
      />
    );

    const errorMessage = screen.getByText('Email is required');
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  it('does not render error message when no error', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        value="test@example.com"
        onChange={mockOnChange}
      />
    );

    const errorMessage = screen.queryByRole('alert');
    expect(errorMessage).not.toBeInTheDocument();
  });

  it('generates unique error IDs based on input name', () => {
    const { rerender } = render(
      <FormInput
        label="First Name"
        name="firstName"
        value=""
        onChange={mockOnChange}
        error="First name is required"
      />
    );

    const firstInput = screen.getByRole('textbox', { name: /first name/i });
    const firstError = screen.getByText('First name is required');
    expect(firstInput).toHaveAttribute('aria-describedby', 'firstName-error');
    expect(firstError).toHaveAttribute('id', 'firstName-error');

    rerender(
      <FormInput
        label="Last Name"
        name="lastName"
        value=""
        onChange={mockOnChange}
        error="Last name is required"
      />
    );

    const lastInput = screen.getByRole('textbox', { name: /last name/i });
    const lastError = screen.getByText('Last name is required');
    expect(lastInput).toHaveAttribute('aria-describedby', 'lastName-error');
    expect(lastError).toHaveAttribute('id', 'lastName-error');
  });

  it('associates input with label correctly', () => {
    render(
      <FormInput
        label="Username"
        name="username"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox', { name: /username/i });
    expect(input).toHaveAttribute('id', 'username');
    expect(input).toHaveAttribute('name', 'username');
  });
});
