import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { contactService } from '../../services/contactService';
import { validateNewsletterForm } from '../../utils/validators';
import { useLanguage } from '../../context/LanguageContext';
import { getFormErrorMessage } from '../../utils/errorMessages';

export const SubscribeForm: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    const validationError = validateNewsletterForm(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Submit
    setIsSubmitting(true);

    try {
      await contactService.subscribeNewsletter(email, currentLanguage);
      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      // Use sanitized error message to prevent exposing technical details
      setError(getFormErrorMessage(err, 'newsletter'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
        <p className="font-semibold">
          {t('newsletter.successMessage', { defaultValue: 'Successfully subscribed! Check your email for confirmation.' })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder={t('newsletter.placeholder', { defaultValue: 'Enter your email' })}
            className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
              error
                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
            } outline-none`}
            disabled={isSubmitting}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="whitespace-nowrap"
          loading={isSubmitting}
          loadingText={t('newsletter.subscribing', { defaultValue: 'Subscribing...' })}
        >
          <span className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t('newsletter.subscribe', { defaultValue: 'Subscribe' })}
          </span>
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
};
