import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { FormInput } from '../ui/FormInput';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { logError } from '../../utils/logger';

interface IntegrationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  email: string;
  company_name: string;
  message: string;
}

interface FormErrors {
  email?: string;
  company_name?: string;
  message?: string;
}

export const IntegrationRequestModal: React.FC<IntegrationRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    company_name: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = t('integrations.requestModal.emailRequired');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('integrations.requestModal.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await axios.post(API_ENDPOINTS.INTEGRATION_REQUESTS.BASE, {
        email: formData.email.trim(),
        company_name: formData.company_name.trim() || undefined,
        message: formData.message.trim() || undefined,
      });

      setSubmitSuccess(true);

      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setFormData({ email: '', company_name: '', message: '' });
        setSubmitSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      logError('Error submitting integration request', err);
      setSubmitError(t('integrations.requestModal.errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ email: '', company_name: '', message: '' });
      setErrors({});
      setSubmitSuccess(false);
      setSubmitError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('integrations.requestModal.title')} maxWidth="lg">
      {submitSuccess ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {t('integrations.requestModal.successMessage')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-text-secondary mb-6">
            {t('integrations.requestModal.subtitle')}
          </p>

          <div className="space-y-4">
            <FormInput
              label={t('integrations.requestModal.emailLabel')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder={t('integrations.requestModal.emailPlaceholder')}
              required
              disabled={isSubmitting}
            />

            <FormInput
              label={t('integrations.requestModal.companyLabel')}
              name="company_name"
              type="text"
              value={formData.company_name}
              onChange={handleInputChange}
              error={errors.company_name}
              placeholder={t('integrations.requestModal.companyPlaceholder')}
              disabled={isSubmitting}
            />

            <TextArea
              label={t('integrations.requestModal.messageLabel')}
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              error={errors.message}
              placeholder={t('integrations.requestModal.messagePlaceholder')}
              rows={5}
              disabled={isSubmitting}
            />
          </div>

          {submitError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          <div className="flex gap-3 mt-6 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t('integrations.requestModal.cancelButton')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t('integrations.requestModal.submitting')
                : t('integrations.requestModal.submitButton')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
