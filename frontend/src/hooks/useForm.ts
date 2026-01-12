import { useState, ChangeEvent } from 'react';
import type { ValidationErrors } from '../utils/validators';
import { getFormErrorMessage } from '../utils/errorMessages';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => ValidationErrors;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validate
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    // Submit
    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit(values);
      setIsSuccess(true);
      setValues(initialValues); // Reset form on success
    } catch (error) {
      // Use sanitized error message to prevent exposing technical details
      setErrors({ submit: getFormErrorMessage(error) });
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
    setIsSuccess(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    isSuccess,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
}
