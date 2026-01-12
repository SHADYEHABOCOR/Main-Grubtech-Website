import React from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicPolicyPage } from './DynamicPolicyPage';

// Static fallback content for when API is unavailable
const FallbackContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">1. {t('legal.gdpr.sections.commitment')}</h2>
        <p className="text-text-secondary leading-relaxed">
          Grubtech is committed to full compliance with the General Data Protection Regulation (GDPR). We have implemented
          comprehensive measures to ensure that personal data is processed lawfully, fairly, and transparently.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">2. {t('legal.gdpr.sections.legalBasis')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">We process personal data under the following legal bases:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li><strong>Contract Performance:</strong> To provide our services as agreed</li>
          <li><strong>Legitimate Interests:</strong> To improve and optimize our services</li>
          <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
          <li><strong>Consent:</strong> Where specifically obtained for certain processing activities</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">3. {t('legal.gdpr.sections.yourRights')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">As a data subject, you have the right to:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
          <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
          <li><strong>Restriction:</strong> Limit how we use your data</li>
          <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
          <li><strong>Objection:</strong> Object to certain types of processing</li>
          <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">4. {t('legal.gdpr.sections.howToExercise')}</h2>
        <p className="text-text-secondary leading-relaxed">
          To exercise any of your GDPR rights, please contact our Data Protection Officer:
        </p>
        <div className="mt-3 p-4 bg-background-alt rounded-lg">
          <p className="text-text-secondary">
            Email: dpo@grubtech.com
            <br />
            Subject: GDPR Rights Request
            <br />
            <br />
            We will respond to your request within 30 days. In complex cases, we may extend this period by an additional 60 days.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">5. {t('legal.gdpr.sections.dataProtection')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">We implement:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments and audits</li>
          <li>Access controls and authentication</li>
          <li>Employee training on data protection</li>
          <li>Data minimization principles</li>
          <li>Privacy by design and by default</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">6. {t('legal.gdpr.sections.breachNotification')}</h2>
        <p className="text-text-secondary leading-relaxed">
          In the event of a personal data breach, we will:
        </p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4 mt-3">
          <li>Notify the relevant supervisory authority within 72 hours</li>
          <li>Inform affected data subjects without undue delay if high risk is identified</li>
          <li>Document all breaches and remediation actions taken</li>
          <li>Implement measures to prevent future breaches</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">7. {t('legal.gdpr.sections.internationalTransfers')}</h2>
        <p className="text-text-secondary leading-relaxed">
          When transferring data outside the European Economic Area (EEA), we ensure adequate protection through:
        </p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4 mt-3">
          <li>EU Standard Contractual Clauses (SCCs)</li>
          <li>Adequacy decisions by the European Commission</li>
          <li>Binding Corporate Rules where applicable</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">8. {t('legal.gdpr.sections.dataRetention')}</h2>
        <p className="text-text-secondary leading-relaxed">
          We retain personal data only for as long as necessary to fulfill the purposes for which it was collected,
          including legal, accounting, or reporting requirements. Retention periods vary based on:
        </p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4 mt-3">
          <li>Nature of the data</li>
          <li>Purpose of processing</li>
          <li>Legal requirements</li>
          <li>Operational needs</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">9. {t('legal.gdpr.sections.childrenPrivacy')}</h2>
        <p className="text-text-secondary leading-relaxed">
          Our services are not directed to children under 16. We do not knowingly collect personal data from children.
          If we learn that we have collected such data, we will take steps to delete it promptly.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">10. {t('legal.gdpr.sections.supervisoryAuthority')}</h2>
        <p className="text-text-secondary leading-relaxed">
          You have the right to lodge a complaint with a supervisory authority, in particular in the EU member state
          of your habitual residence, place of work, or place of alleged infringement.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">11. {t('legal.gdpr.sections.updates')}</h2>
        <p className="text-text-secondary leading-relaxed">
          We may update this GDPR compliance statement from time to time. We will notify you of any material changes
          by posting the new policy on our website and updating the "Last Updated" date.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">12. {t('legal.gdpr.sections.contactInformation')}</h2>
        <p className="text-text-secondary leading-relaxed">
          <strong>Data Protection Officer:</strong>
          <br />
          Email: dpo@grubtech.com
          <br />
          Address: Grubtech, Dubai, UAE
          <br />
          <br />
          <strong>EU Representative:</strong>
          <br />
          Email: eu-rep@grubtech.com
          <br />
          Address: [EU Office Address]
        </p>
      </section>
    </div>
  );
};

export const GDPR: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DynamicPolicyPage
      slug="gdpr-eu"
      fallbackTitle={t('legal.gdpr.title')}
      fallbackContent={<FallbackContent />}
      fallbackLastUpdated="January 1, 2025"
    />
  );
};
