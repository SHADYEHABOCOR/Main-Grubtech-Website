import React from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicPolicyPage } from './DynamicPolicyPage';

// Static fallback content for when API is unavailable
const FallbackContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">1. {t('legal.terms.sections.acceptance')}</h2>
        <p className="text-text-secondary leading-relaxed">
          By accessing and using Grubtech's services, you accept and agree to be bound by these Terms and Conditions.
          If you do not agree to these terms, please do not use our services.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">2. {t('legal.terms.sections.serviceDescription')}</h2>
        <p className="text-text-secondary leading-relaxed">
          Grubtech provides a cloud-based restaurant management platform including order management, POS integration,
          delivery coordination, analytics, and related services. We reserve the right to modify or discontinue services
          with reasonable notice.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">3. {t('legal.terms.sections.userAccounts')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">Users are responsible for:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li>Maintaining the confidentiality of account credentials</li>
          <li>All activities that occur under their account</li>
          <li>Notifying us immediately of any unauthorized use</li>
          <li>Providing accurate and current information</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">4. {t('legal.terms.sections.paymentTerms')}</h2>
        <p className="text-text-secondary leading-relaxed">
          Payment is due according to your selected plan. We accept major credit cards and other payment methods as specified.
          Failure to pay may result in service suspension. Refunds are subject to our refund policy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">5. {t('legal.terms.sections.acceptableUse')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">You agree not to:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li>Use the service for any illegal purpose</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with or disrupt the service</li>
          <li>Upload malicious code or content</li>
          <li>Violate any applicable laws or regulations</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">6. {t('legal.terms.sections.intellectualProperty')}</h2>
        <p className="text-text-secondary leading-relaxed">
          All content, features, and functionality of the Grubtech platform are owned by Grubtech and are protected by
          international copyright, trademark, and other intellectual property laws.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">7. {t('legal.terms.sections.limitationLiability')}</h2>
        <p className="text-text-secondary leading-relaxed">
          Grubtech shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting
          from your use of or inability to use the service.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">8. {t('legal.terms.sections.termination')}</h2>
        <p className="text-text-secondary leading-relaxed">
          We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms.
          Upon termination, your right to use the service will cease immediately.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">9. {t('legal.terms.sections.contactInformation')}</h2>
        <p className="text-text-secondary leading-relaxed">
          For questions about these Terms, contact us at:
          <br />
          Email: legal@grubtech.com
          <br />
          Address: Grubtech, Dubai, UAE
        </p>
      </section>
    </div>
  );
};

export const Terms: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DynamicPolicyPage
      slug="terms-and-conditions"
      fallbackTitle={t('legal.terms.title')}
      fallbackContent={<FallbackContent />}
      fallbackLastUpdated="January 1, 2025"
    />
  );
};
