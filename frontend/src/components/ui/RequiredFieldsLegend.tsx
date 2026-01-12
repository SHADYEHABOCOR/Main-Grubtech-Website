import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * RequiredFieldsLegend component displays a legend explaining that asterisk (*)
 * indicates required fields in forms. Improves form accessibility and WCAG 3.3.2 compliance.
 *
 * @example
 * <RequiredFieldsLegend />
 */
export const RequiredFieldsLegend: React.FC = React.memo(() => {
  const { t } = useTranslation();

  return (
    <p
      className="text-sm text-text-secondary mb-4"
      aria-label={t('form.requiredFieldsLegend', { defaultValue: 'Fields marked with asterisk are required' })}
    >
      <span className="text-red-500">*</span> {t('form.requiredFieldsLegend', { defaultValue: 'Fields marked with * are required' })}
    </p>
  );
});
