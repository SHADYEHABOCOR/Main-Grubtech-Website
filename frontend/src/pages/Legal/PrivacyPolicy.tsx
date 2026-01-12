import React from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicPolicyPage } from './DynamicPolicyPage';

// Static fallback content for when API is unavailable
const FallbackContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">1. {t('legal.privacyPolicy.sections.introduction')}</h2>
        <p className="text-text-secondary leading-relaxed">
          Grubtech ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our restaurant management platform and services.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">2. {t('legal.privacyPolicy.sections.informationWeCollect')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">We collect information that you provide directly to us, including:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li>Account information (name, email, phone number, business details)</li>
          <li>Payment information (processed securely through third-party providers)</li>
          <li>Restaurant operational data (orders, menu items, inventory)</li>
          <li>Customer data you input into our system</li>
          <li>Communications with our support team</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">3. {t('legal.privacyPolicy.sections.howWeUse')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">We use the information we collect to:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices, updates, and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Analyze usage patterns and optimize our platform</li>
          <li>Detect and prevent fraud and abuse</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">4. {t('legal.privacyPolicy.sections.dataSecurity')}</h2>
        <p className="text-text-secondary leading-relaxed">
          We implement appropriate technical and organizational security measures to protect your information against unauthorized
          access, alteration, disclosure, or destruction. We use encryption, secure servers, and regular security audits.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">5. {t('legal.privacyPolicy.sections.dataRetention')}</h2>
        <p className="text-text-secondary leading-relaxed">
          We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy,
          unless a longer retention period is required by law.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">6. {t('legal.privacyPolicy.sections.yourRights')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">You have the right to:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing of your data</li>
          <li>Export your data</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">7. {t('legal.privacyPolicy.sections.contactUs')}</h2>
        <p className="text-text-secondary leading-relaxed">
          If you have questions about this Privacy Policy, please contact us at:
          <br />
          Email: privacy@grubtech.com
          <br />
          Address: Grubtech, Dubai, UAE
        </p>
      </section>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DynamicPolicyPage
      slug="privacy-policy"
      fallbackTitle={t('legal.privacyPolicy.title')}
      fallbackContent={<FallbackContent />}
      fallbackLastUpdated="January 1, 2025"
    />
  );
};
