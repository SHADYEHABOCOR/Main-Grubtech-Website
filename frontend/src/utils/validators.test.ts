import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateContactForm,
  validateNewsletterForm,
} from './validators';

describe('validators', () => {
  describe('validateEmail', () => {
    it('returns true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('returns true for valid phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('+1234567890')).toBe(true);
      expect(validatePhone('(123)456-7890')).toBe(true);
      expect(validatePhone('123-456-7890')).toBe(true);
    });

    it('returns false for invalid phone numbers', () => {
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('abc')).toBe(false);
      expect(validatePhone('12')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('returns null for non-empty values', () => {
      expect(validateRequired('test', 'Field')).toBe(null);
      expect(validateRequired('  test  ', 'Field')).toBe(null);
    });

    it('returns error message for empty values', () => {
      expect(validateRequired('', 'Name')).toBe('Name is required');
      expect(validateRequired('   ', 'Email')).toBe('Email is required');
    });
  });

  describe('validateMinLength', () => {
    it('returns null when value meets minimum length', () => {
      expect(validateMinLength('test', 4, 'Field')).toBe(null);
      expect(validateMinLength('testing', 4, 'Field')).toBe(null);
    });

    it('returns error when value is too short', () => {
      expect(validateMinLength('te', 4, 'Name')).toBe(
        'Name must be at least 4 characters'
      );
    });
  });

  describe('validateMaxLength', () => {
    it('returns null when value is within maximum length', () => {
      expect(validateMaxLength('test', 10, 'Field')).toBe(null);
      expect(validateMaxLength('test', 4, 'Field')).toBe(null);
    });

    it('returns error when value exceeds maximum length', () => {
      expect(validateMaxLength('testing', 4, 'Name')).toBe(
        'Name must not exceed 4 characters'
      );
    });
  });

  describe('validateContactForm', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters.',
    };

    it('returns empty errors for valid form data', () => {
      const errors = validateContactForm(validData);
      expect(Object.keys(errors).length).toBe(0);
    });

    it('validates name is required', () => {
      const errors = validateContactForm({ ...validData, name: '' });
      expect(errors.name).toBe('Name is required');
    });

    it('validates name minimum length', () => {
      const errors = validateContactForm({ ...validData, name: 'A' });
      expect(errors.name).toBe('Name must be at least 2 characters');
    });

    it('validates email is required', () => {
      const errors = validateContactForm({ ...validData, email: '' });
      expect(errors.email).toBe('Email is required');
    });

    it('validates email format', () => {
      const errors = validateContactForm({ ...validData, email: 'invalid' });
      expect(errors.email).toBe('Please enter a valid email address');
    });

    it('validates phone format when provided', () => {
      const errors = validateContactForm({ ...validData, phone: 'abc' });
      expect(errors.phone).toBe('Please enter a valid phone number');
    });

    it('allows empty phone (optional field)', () => {
      const errors = validateContactForm({ ...validData, phone: '' });
      expect(errors.phone).toBeUndefined();
    });

    it('validates subject is required', () => {
      const errors = validateContactForm({ ...validData, subject: '' });
      expect(errors.subject).toBe('Subject is required');
    });

    it('validates message is required', () => {
      const errors = validateContactForm({ ...validData, message: '' });
      expect(errors.message).toBe('Message is required');
    });

    it('validates message minimum length', () => {
      const errors = validateContactForm({ ...validData, message: 'Short' });
      expect(errors.message).toBe('Message must be at least 10 characters');
    });

    it('returns multiple errors for multiple invalid fields', () => {
      const errors = validateContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      expect(Object.keys(errors).length).toBe(4);
      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.subject).toBeDefined();
      expect(errors.message).toBeDefined();
    });
  });

  describe('validateNewsletterForm', () => {
    it('returns null for valid email', () => {
      expect(validateNewsletterForm('test@example.com')).toBe(null);
    });

    it('returns error for empty email', () => {
      expect(validateNewsletterForm('')).toBe('Email is required');
    });

    it('returns error for invalid email format', () => {
      expect(validateNewsletterForm('invalid')).toBe(
        'Please enter a valid email address'
      );
    });
  });
});
