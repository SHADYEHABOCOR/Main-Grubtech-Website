import { EMAIL_REGEX, PHONE_REGEX } from './constants';

export interface ValidationErrors {
  [key: string]: string;
}

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): string | null => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

export const validateContactForm = (data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Name validation
  const nameError = validateRequired(data.name, 'Name');
  if (nameError) errors.name = nameError;
  else {
    const minLengthError = validateMinLength(data.name, 2, 'Name');
    if (minLengthError) errors.name = minLengthError;
  }

  // Email validation
  const emailError = validateRequired(data.email, 'Email');
  if (emailError) errors.email = emailError;
  else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation (optional)
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // Subject validation
  const subjectError = validateRequired(data.subject, 'Subject');
  if (subjectError) errors.subject = subjectError;

  // Message validation
  const messageError = validateRequired(data.message, 'Message');
  if (messageError) errors.message = messageError;
  else {
    const minLengthError = validateMinLength(data.message, 10, 'Message');
    if (minLengthError) errors.message = minLengthError;
  }

  return errors;
};

export const validateNewsletterForm = (email: string): string | null => {
  const emailError = validateRequired(email, 'Email');
  if (emailError) return emailError;

  if (!validateEmail(email)) {
    return 'Please enter a valid email address';
  }

  return null;
};
