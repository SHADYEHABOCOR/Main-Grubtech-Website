import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextArea } from '../TextArea';

describe('TextArea accessibility', () => {
  const mockOnChange = vi.fn();

  it('has aria-invalid false when no error is present', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="This is a test message"
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).toHaveAttribute('aria-invalid', 'false');
  });

  it('has aria-invalid true when error exists', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value=""
        onChange={mockOnChange}
        error="Message is required"
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no aria-describedby when no error is present', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="This is a test message"
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).not.toHaveAttribute('aria-describedby');
  });

  it('has aria-describedby pointing to error message ID when error exists', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value=""
        onChange={mockOnChange}
        error="Message is required"
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).toHaveAttribute('aria-describedby', 'message-error');
  });

  it('renders error message with correct ID attribute', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value=""
        onChange={mockOnChange}
        error="Message is required"
      />
    );

    const errorMessage = screen.getByText('Message is required');
    expect(errorMessage).toHaveAttribute('id', 'message-error');
  });

  it('error message has role="alert" for screen reader announcements', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value=""
        onChange={mockOnChange}
        error="Message is required"
      />
    );

    const errorMessage = screen.getByText('Message is required');
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  it('does not render error message when no error', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="This is a test message"
        onChange={mockOnChange}
      />
    );

    const errorMessage = screen.queryByRole('alert');
    expect(errorMessage).not.toBeInTheDocument();
  });

  it('generates unique error IDs based on textarea name', () => {
    const { rerender } = render(
      <TextArea
        label="Message"
        name="message"
        value=""
        onChange={mockOnChange}
        error="Message is required"
      />
    );

    const messageTextarea = screen.getByRole('textbox', { name: /message/i });
    const messageError = screen.getByText('Message is required');
    expect(messageTextarea).toHaveAttribute('aria-describedby', 'message-error');
    expect(messageError).toHaveAttribute('id', 'message-error');

    rerender(
      <TextArea
        label="Comments"
        name="comments"
        value=""
        onChange={mockOnChange}
        error="Comments are required"
      />
    );

    const commentsTextarea = screen.getByRole('textbox', { name: /comments/i });
    const commentsError = screen.getByText('Comments are required');
    expect(commentsTextarea).toHaveAttribute('aria-describedby', 'comments-error');
    expect(commentsError).toHaveAttribute('id', 'comments-error');
  });

  it('associates textarea with label correctly', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).toHaveAttribute('id', 'message');
    expect(textarea).toHaveAttribute('name', 'message');
  });

  it('respects rows prop', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value=""
        onChange={mockOnChange}
        rows={6}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).toHaveAttribute('rows', '6');
  });
});

describe('TextArea character counter', () => {
  const mockOnChange = vi.fn();

  it('displays character counter when maxLength is provided', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Hello"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    const counter = screen.getByText('5 / 100');
    expect(counter).toBeInTheDocument();
  });

  it('shows correct format "X / Y" for character count', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Test message"
        onChange={mockOnChange}
        maxLength={200}
      />
    );

    const counter = screen.getByText('12 / 200');
    expect(counter).toBeInTheDocument();
    expect(counter).toHaveTextContent(/^Character count: \d+ \/ \d+$/);
  });

  it('displays 0 count when value is empty', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value=""
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    const counter = screen.getByText('0 / 100');
    expect(counter).toBeInTheDocument();
  });

  it('updates counter when value changes', () => {
    const { rerender } = render(
      <TextArea
        label="Message"
        name="message"
        value="Hello"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    expect(screen.getByText('5 / 100')).toBeInTheDocument();

    rerender(
      <TextArea
        label="Message"
        name="message"
        value="Hello World"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    expect(screen.getByText('11 / 100')).toBeInTheDocument();
    expect(screen.queryByText('5 / 100')).not.toBeInTheDocument();
  });

  it('does not display counter when maxLength is not provided', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Hello World"
        onChange={mockOnChange}
      />
    );

    const counter = screen.queryByText(/\d+ \/ \d+/);
    expect(counter).not.toBeInTheDocument();
  });

  it('hides counter when showCharacterCount is false', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Hello"
        onChange={mockOnChange}
        maxLength={100}
        showCharacterCount={false}
      />
    );

    const counter = screen.queryByText('5 / 100');
    expect(counter).not.toBeInTheDocument();
  });

  it('shows counter by default when maxLength is provided', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Test"
        onChange={mockOnChange}
        maxLength={50}
      />
    );

    // showCharacterCount defaults to true, so counter should be visible
    const counter = screen.getByText('4 / 50');
    expect(counter).toBeInTheDocument();
  });

  it('displays correct count for various maxLength values', () => {
    const { rerender } = render(
      <TextArea
        label="Message"
        name="message"
        value="Short"
        onChange={mockOnChange}
        maxLength={10}
      />
    );

    expect(screen.getByText('5 / 10')).toBeInTheDocument();

    rerender(
      <TextArea
        label="Message"
        name="message"
        value="Short"
        onChange={mockOnChange}
        maxLength={500}
      />
    );

    expect(screen.getByText('5 / 500')).toBeInTheDocument();

    rerender(
      <TextArea
        label="Message"
        name="message"
        value="Short"
        onChange={mockOnChange}
        maxLength={5000}
      />
    );

    expect(screen.getByText('5 / 5000')).toBeInTheDocument();
  });

  it('displays counter at maximum length', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="12345"
        onChange={mockOnChange}
        maxLength={5}
      />
    );

    const counter = screen.getByText('5 / 5');
    expect(counter).toBeInTheDocument();
  });

  it('counter has correct ID based on input name', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Test"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    const counter = screen.getByText('4 / 100');
    expect(counter).toHaveAttribute('id', 'message-counter');
  });

  it('counter is aligned to the right', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Test"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    const counter = screen.getByText('4 / 100');
    expect(counter).toHaveClass('text-right');
  });

  it('counter has text-sm class for appropriate sizing', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Test"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    const counter = screen.getByText('4 / 100');
    expect(counter).toHaveClass('text-sm');
  });

  it('textarea has maxLength attribute when maxLength prop is provided', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Test"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).toHaveAttribute('maxLength', '100');
  });

  it('textarea does not have maxLength attribute when maxLength prop is not provided', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Test"
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).not.toHaveAttribute('maxLength');
  });
});

describe('TextArea visual feedback states', () => {
  const mockOnChange = vi.fn();

  it('displays normal state (text-text-secondary) when below warning threshold', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Hello"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    // 5 characters out of 100 = 5% (below 80% threshold)
    const counter = screen.getByText('5 / 100');
    expect(counter).toHaveClass('text-text-secondary');
    expect(counter).not.toHaveClass('text-amber-500');
    expect(counter).not.toHaveClass('text-red-500');
  });

  it('displays warning state (text-amber-500) when at 80% threshold', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(80)}
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    // 80 characters out of 100 = 80% (exactly at threshold)
    const counter = screen.getByText('80 / 100');
    expect(counter).toHaveClass('text-amber-500');
    expect(counter).not.toHaveClass('text-text-secondary');
    expect(counter).not.toHaveClass('text-red-500');
  });

  it('displays warning state (text-amber-500) when between 80% and 99%', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(90)}
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    // 90 characters out of 100 = 90% (in warning range)
    const counter = screen.getByText('90 / 100');
    expect(counter).toHaveClass('text-amber-500');
    expect(counter).not.toHaveClass('text-text-secondary');
    expect(counter).not.toHaveClass('text-red-500');
  });

  it('displays warning state (text-amber-500) when at 99%', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(99)}
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    // 99 characters out of 100 = 99% (still in warning range)
    const counter = screen.getByText('99 / 100');
    expect(counter).toHaveClass('text-amber-500');
    expect(counter).not.toHaveClass('text-text-secondary');
    expect(counter).not.toHaveClass('text-red-500');
  });

  it('displays error state (text-red-500) when at 100% of limit', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(100)}
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    // 100 characters out of 100 = 100% (at limit)
    const counter = screen.getByText('100 / 100');
    expect(counter).toHaveClass('text-red-500');
    expect(counter).not.toHaveClass('text-text-secondary');
    expect(counter).not.toHaveClass('text-amber-500');
  });

  it('respects custom warningThreshold prop at 90%', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(85)}
        onChange={mockOnChange}
        maxLength={100}
        warningThreshold={0.9}
      />
    );

    // 85 characters out of 100 = 85% (below 90% custom threshold)
    const counter = screen.getByText('85 / 100');
    expect(counter).toHaveClass('text-text-secondary');
    expect(counter).not.toHaveClass('text-amber-500');
    expect(counter).not.toHaveClass('text-red-500');
  });

  it('displays warning state with custom warningThreshold at 90%', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(90)}
        onChange={mockOnChange}
        maxLength={100}
        warningThreshold={0.9}
      />
    );

    // 90 characters out of 100 = 90% (exactly at 90% custom threshold)
    const counter = screen.getByText('90 / 100');
    expect(counter).toHaveClass('text-amber-500');
    expect(counter).not.toHaveClass('text-text-secondary');
    expect(counter).not.toHaveClass('text-red-500');
  });

  it('respects custom warningThreshold prop at 70%', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(70)}
        onChange={mockOnChange}
        maxLength={100}
        warningThreshold={0.7}
      />
    );

    // 70 characters out of 100 = 70% (exactly at 70% custom threshold)
    const counter = screen.getByText('70 / 100');
    expect(counter).toHaveClass('text-amber-500');
    expect(counter).not.toHaveClass('text-text-secondary');
    expect(counter).not.toHaveClass('text-red-500');
  });

  it('transitions from normal to warning state as characters increase', () => {
    const { rerender } = render(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(79)}
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    // 79% - should be normal
    let counter = screen.getByText('79 / 100');
    expect(counter).toHaveClass('text-text-secondary');
    expect(counter).not.toHaveClass('text-amber-500');

    rerender(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(80)}
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    // 80% - should be warning
    counter = screen.getByText('80 / 100');
    expect(counter).toHaveClass('text-amber-500');
    expect(counter).not.toHaveClass('text-text-secondary');
  });

  it('transitions from warning to error state as characters increase', () => {
    const { rerender } = render(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(99)}
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    // 99% - should be warning
    let counter = screen.getByText('99 / 100');
    expect(counter).toHaveClass('text-amber-500');
    expect(counter).not.toHaveClass('text-red-500');

    rerender(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(100)}
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    // 100% - should be error
    counter = screen.getByText('100 / 100');
    expect(counter).toHaveClass('text-red-500');
    expect(counter).not.toHaveClass('text-amber-500');
  });

  it('counter has smooth transition classes for color changes', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(80)}
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    const counter = screen.getByText('80 / 100');
    expect(counter).toHaveClass('transition-colors');
    expect(counter).toHaveClass('duration-200');
  });
});

describe('TextArea character counter accessibility', () => {
  const mockOnChange = vi.fn();

  it('counter has aria-live="polite" for screen reader announcements', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Hello"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    const counter = screen.getByText('5 / 100');
    expect(counter).toHaveAttribute('aria-live', 'polite');
  });

  it('counter has aria-atomic="true" for complete announcements', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Test"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    const counter = screen.getByText('4 / 100');
    expect(counter).toHaveAttribute('aria-atomic', 'true');
  });

  it('textarea aria-describedby includes counter ID when counter is present', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Hello World"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).toHaveAttribute('aria-describedby', 'message-counter');
  });

  it('textarea aria-describedby includes only error ID when counter is hidden', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value=""
        onChange={mockOnChange}
        maxLength={100}
        showCharacterCount={false}
        error="Message is required"
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).toHaveAttribute('aria-describedby', 'message-error');
  });

  it('textarea aria-describedby combines both error and counter IDs when both present', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Test"
        onChange={mockOnChange}
        maxLength={100}
        error="Message is too short"
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).toHaveAttribute('aria-describedby', 'message-error message-counter');
  });

  it('aria-describedby IDs are space-separated as per ARIA spec', () => {
    render(
      <TextArea
        label="Comments"
        name="comments"
        value="Sample text"
        onChange={mockOnChange}
        maxLength={200}
        error="Validation error"
      />
    );

    const textarea = screen.getByRole('textbox', { name: /comments/i });
    const ariaDescribedBy = textarea.getAttribute('aria-describedby');

    // Should be space-separated
    expect(ariaDescribedBy).toBe('comments-error comments-counter');
    expect(ariaDescribedBy).toContain('comments-error');
    expect(ariaDescribedBy).toContain('comments-counter');
    expect(ariaDescribedBy?.split(' ')).toHaveLength(2);
  });

  it('counter includes visually hidden context text for screen readers', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Hello"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    // The VisuallyHidden component should render "Character count: " text
    // It's visually hidden but present in DOM for screen readers
    const counter = screen.getByText('5 / 100');

    // Check that the counter's parent or the counter itself contains the hidden text
    // The text "Character count: " should be in the DOM
    expect(counter.textContent).toContain('Character count:');
  });

  it('screen reader text provides context before the count', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Testing"
        onChange={mockOnChange}
        maxLength={50}
      />
    );

    const counter = screen.getByText('7 / 50');

    // Full text content should include "Character count: 7 / 50"
    expect(counter.textContent).toBe('Character count: 7 / 50');
  });

  it('counter updates aria-live region as value changes', () => {
    const { rerender } = render(
      <TextArea
        label="Message"
        name="message"
        value="Initial"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    let counter = screen.getByText('7 / 100');
    expect(counter).toHaveAttribute('aria-live', 'polite');
    expect(counter).toHaveAttribute('aria-atomic', 'true');

    // Rerender with new value
    rerender(
      <TextArea
        label="Message"
        name="message"
        value="Initial text updated"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    // Counter should still have aria-live attributes after update
    counter = screen.getByText('20 / 100');
    expect(counter).toHaveAttribute('aria-live', 'polite');
    expect(counter).toHaveAttribute('aria-atomic', 'true');
  });

  it('counter does not interfere with aria-describedby when maxLength is not provided', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value="Test message"
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    expect(textarea).not.toHaveAttribute('aria-describedby');
  });

  it('counter with error maintains proper ARIA relationships', () => {
    render(
      <TextArea
        label="Message"
        name="message"
        value={"a".repeat(100)}
        onChange={mockOnChange}
        maxLength={100}
        error="Message has reached maximum length"
      />
    );

    const textarea = screen.getByRole('textbox', { name: /message/i });
    const counter = screen.getByText('100 / 100');
    const errorMessage = screen.getByText('Message has reached maximum length');

    // Verify textarea references both
    expect(textarea).toHaveAttribute('aria-describedby', 'message-error message-counter');

    // Verify counter has proper ARIA attributes
    expect(counter).toHaveAttribute('aria-live', 'polite');
    expect(counter).toHaveAttribute('id', 'message-counter');

    // Verify error has proper attributes
    expect(errorMessage).toHaveAttribute('role', 'alert');
    expect(errorMessage).toHaveAttribute('id', 'message-error');
  });

  it('generates unique counter IDs based on textarea name', () => {
    const { rerender } = render(
      <TextArea
        label="Message"
        name="message"
        value="Test"
        onChange={mockOnChange}
        maxLength={100}
      />
    );

    const messageCounter = screen.getByText('4 / 100');
    expect(messageCounter).toHaveAttribute('id', 'message-counter');

    rerender(
      <TextArea
        label="Comments"
        name="comments"
        value="Sample"
        onChange={mockOnChange}
        maxLength={50}
      />
    );

    const commentsCounter = screen.getByText('6 / 50');
    expect(commentsCounter).toHaveAttribute('id', 'comments-counter');
  });
});
