import React from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicPolicyPage } from './DynamicPolicyPage';

// Static fallback content for when API is unavailable
const FallbackContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">1. {t('legal.dpa.sections.definitions')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">In this Data Processing Agreement ("DPA"):</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li><strong>Controller:</strong> The restaurant or business using Grubtech services</li>
          <li><strong>Processor:</strong> Grubtech as the service provider</li>
          <li><strong>Personal Data:</strong> Any data relating to identified or identifiable individuals</li>
          <li><strong>Processing:</strong> Any operation performed on Personal Data</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">2. {t('legal.dpa.sections.scopePurpose')}</h2>
        <p className="text-text-secondary leading-relaxed">
          This DPA governs the processing of Personal Data by Grubtech on behalf of the Controller in connection with
          the services provided under our Terms of Service. Grubtech processes Personal Data only as instructed by the Controller.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">3. {t('legal.dpa.sections.processingObligations')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">Grubtech shall:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li>Process Personal Data only on documented instructions from the Controller</li>
          <li>Ensure personnel processing Personal Data are bound by confidentiality</li>
          <li>Implement appropriate technical and organizational security measures</li>
          <li>Assist the Controller in responding to data subject requests</li>
          <li>Notify the Controller of any personal data breaches without undue delay</li>
          <li>Delete or return Personal Data upon termination of services</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">4. {t('legal.dpa.sections.subProcessors')}</h2>
        <p className="text-text-secondary leading-relaxed">
          Grubtech may engage sub-processors to process Personal Data. Current sub-processors are listed on our website.
          We will notify Controllers of any changes to sub-processors and allow reasonable time to object.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">5. {t('legal.dpa.sections.securityMeasures')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">Grubtech implements:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li>Encryption of Personal Data in transit and at rest</li>
          <li>Regular security assessments and penetration testing</li>
          <li>Access controls and authentication mechanisms</li>
          <li>Logging and monitoring of system access</li>
          <li>Regular backup and disaster recovery procedures</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">6. {t('legal.dpa.sections.dataSubjectRights')}</h2>
        <p className="text-text-secondary leading-relaxed">
          Grubtech will assist the Controller in fulfilling data subject rights requests, including access, rectification,
          erasure, restriction, portability, and objection to processing.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">7. {t('legal.dpa.sections.internationalTransfers')}</h2>
        <p className="text-text-secondary leading-relaxed">
          When Personal Data is transferred outside the EEA, Grubtech ensures appropriate safeguards are in place,
          including Standard Contractual Clauses or other approved mechanisms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">8. {t('legal.dpa.sections.audits')}</h2>
        <p className="text-text-secondary leading-relaxed">
          Controllers have the right to audit Grubtech's data processing activities. We maintain SOC 2 Type II certification
          and will provide audit reports upon request.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">9. {t('legal.dpa.sections.contact')}</h2>
        <p className="text-text-secondary leading-relaxed">
          For questions about this DPA, contact our Data Protection Officer at:
          <br />
          Email: dpo@grubtech.com
          <br />
          Address: Grubtech, Dubai, UAE
        </p>
      </section>
    </div>
  );
};

export const DPA: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DynamicPolicyPage
      slug="dpa"
      fallbackTitle={t('legal.dpa.title')}
      fallbackContent={<FallbackContent />}
      fallbackLastUpdated="January 1, 2025"
    />
  );
};
