import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';

describe('useForm hook', () => {
  const initialValues = {
    name: '',
    email: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with provided values', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('updates values on handleChange', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John Doe' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.name).toBe('John Doe');
  });

  it('clears field error when user types', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: vi.fn(),
        validate: () => ({ name: 'Name is required' }),
      })
    );

    // First, trigger validation to set error
    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.errors.name).toBe('Name is required');

    // Now type in the field
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it('validates before submit and sets errors', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit,
        validate: (values) => {
          const errors: Record<string, string> = {};
          if (!values.name) errors.name = 'Name is required';
          if (!values.email) errors.email = 'Email is required';
          return errors;
        },
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.name).toBe('Name is required');
    expect(result.current.errors.email).toBe('Email is required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit when validation passes', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'John', email: 'john@example.com' },
        onSubmit,
        validate: () => ({}), // No errors
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
    });
  });

  it('sets isSubmitting during submission', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });

    const onSubmit = vi.fn(() => submitPromise);
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'John', email: 'john@example.com' },
        onSubmit,
      })
    );

    expect(result.current.isSubmitting).toBe(false);

    let submitCompleted = false;
    act(() => {
      result.current.handleSubmit().then(() => {
        submitCompleted = true;
      });
    });

    // Wait for state to update
    await vi.waitFor(() => {
      expect(result.current.isSubmitting).toBe(true);
    });

    // Resolve the promise
    await act(async () => {
      resolveSubmit!();
      await submitPromise;
    });

    // Wait for completion
    await vi.waitFor(() => {
      expect(submitCompleted).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  it('sets isSuccess on successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'John', email: 'john@example.com' },
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.isSuccess).toBe(true);
  });

  it('resets form values on successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit,
      })
    );

    // Set some values
    act(() => {
      result.current.setValues({ name: 'John', email: 'john@example.com' });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.values).toEqual(initialValues);
  });

  it('sets sanitized error on submission failure', async () => {
    const error = new Error('Network error at /api/submit:123');
    const onSubmit = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'John', email: 'john@example.com' },
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should use sanitized error message, not the raw error
    expect(result.current.errors.submit).toBeDefined();
    expect(result.current.errors.submit).not.toContain('/api/submit');
    expect(result.current.isSuccess).toBe(false);
  });

  it('prevents form event default when provided', async () => {
    const preventDefault = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault,
      } as unknown as React.FormEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('resets form state with reset function', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: vi.fn(),
      })
    );

    // Modify state
    act(() => {
      result.current.setValues({ name: 'John', email: 'john@example.com' });
      result.current.setErrors({ name: 'Error' });
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });
});
