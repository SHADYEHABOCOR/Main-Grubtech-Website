import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { FormInput } from '../ui/FormInput';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { RequiredFieldsLegend } from '../ui/RequiredFieldsLegend';
import { useForm } from '../../hooks/useForm';
import { useToast } from '../ui/Toast';
import { contactService } from '../../services/contactService';
import { validateContactForm } from '../../utils/validators';
import type { ContactFormData } from '../../types';

const initialValues: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: '',
  preferredContact: 'email',
};

export const ContactForm: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const prevSuccess = useRef(false);
  const prevError = useRef<string | undefined>(undefined);

  const { values, errors, isSubmitting, isSuccess, handleChange, handleSubmit, reset } =
    useForm<ContactFormData>({
      initialValues,
      validate: validateContactForm,
      onSubmit: async (data) => {
        await contactService.submitContact(data);
      },
    });

  // Show toast notifications on state changes
  useEffect(() => {
    if (isSuccess && !prevSuccess.current) {
      toast.success(t('contact.successMessage', { defaultValue: 'Thank you for contacting us. We\'ll get back to you within 24 hours.' }));
    }
    prevSuccess.current = isSuccess;
  }, [isSuccess, toast, t]);

  useEffect(() => {
    if (errors.submit && errors.submit !== prevError.current) {
      toast.error(errors.submit);
    }
    prevError.current = errors.submit;
  }, [errors.submit, toast]);

  const subjectOptions = [
    { value: 'demo', label: t('contact.subjects.demo', { defaultValue: 'Request a Demo' }) },
    { value: 'sales', label: t('contact.subjects.sales', { defaultValue: 'Sales Inquiry' }) },
    { value: 'support', label: t('contact.subjects.support', { defaultValue: 'Technical Support' }) },
    { value: 'partnership', label: t('contact.subjects.partnership', { defaultValue: 'Partnership Opportunities' }) },
    { value: 'other', label: t('contact.subjects.other', { defaultValue: 'Other' }) },
  ];

  const contactMethodOptions = [
    { value: 'email', label: t('contact.preferredContact.email', { defaultValue: 'Email' }) },
    { value: 'phone', label: t('contact.preferredContact.phone', { defaultValue: 'Phone' }) },
  ];

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">
          {t('contact.successTitle', { defaultValue: 'Message Sent!' })}
        </h3>
        <p className="text-green-700 mb-6">
          {t('contact.successMessage', { defaultValue: 'Thank you for contacting us. We\'ll get back to you within 24 hours.' })}
        </p>
        <Button onClick={reset} variant="primary">
          {t('contact.sendAnother', { defaultValue: 'Send Another Message' })}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <RequiredFieldsLegend />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label={t('contact.form.name', { defaultValue: 'Full Name' })}
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="John Doe"
          required
        />

        <FormInput
          label={t('contact.form.email', { defaultValue: 'Email Address' })}
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="john@example.com"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label={t('contact.form.phone', { defaultValue: 'Phone Number' })}
          name="phone"
          type="tel"
          value={values.phone || ''}
          onChange={handleChange}
          error={errors.phone}
          placeholder="+971 50 123 4567"
        />

        <FormInput
          label={t('contact.form.company', { defaultValue: 'Company Name' })}
          name="company"
          value={values.company || ''}
          onChange={handleChange}
          placeholder="Acme Restaurant Group"
        />
      </div>

      <Select
        label={t('contact.form.subject', { defaultValue: 'Subject' })}
        name="subject"
        value={values.subject}
        onChange={handleChange}
        options={subjectOptions}
        error={errors.subject}
        placeholder={t('contact.form.selectSubject', { defaultValue: 'Select a subject' })}
        required
      />

      <Select
        label={t('contact.form.preferredContact', { defaultValue: 'Preferred Contact Method' })}
        name="preferredContact"
        value={values.preferredContact || 'email'}
        onChange={handleChange}
        options={contactMethodOptions}
      />

      <TextArea
        label={t('contact.form.message', { defaultValue: 'Message' })}
        name="message"
        value={values.message}
        onChange={handleChange}
        error={errors.message}
        placeholder={t('contact.form.messagePlaceholder', { defaultValue: 'Tell us about your requirements...' })}
        rows={6}
        required
      />

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {errors.submit}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={isSubmitting}
        loadingText={t('contact.form.sending', { defaultValue: 'Sending...' })}
      >
        <span className="flex items-center justify-center gap-2">
          <Send className="w-5 h-5" />
          {t('contact.form.submit', { defaultValue: 'Send Message' })}
        </span>
      </Button>
    </form>
  );
};
