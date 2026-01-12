import React from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicPolicyPage } from './DynamicPolicyPage';

// Static fallback content for when API is unavailable
const FallbackContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">1. {t('legal.sla.sections.serviceAvailability')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          Grubtech commits to the following uptime guarantees:
        </p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li><strong>Enterprise Plan:</strong> 99.9% uptime (less than 43.8 minutes downtime per month)</li>
          <li><strong>Professional Plan:</strong> 99.5% uptime (less than 3.6 hours downtime per month)</li>
          <li><strong>Standard Plan:</strong> 99.0% uptime (less than 7.2 hours downtime per month)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">2. {t('legal.sla.sections.scheduledMaintenance')}</h2>
        <p className="text-text-secondary leading-relaxed">
          Scheduled maintenance windows are excluded from uptime calculations. We will provide at least 48 hours notice
          for planned maintenance and conduct it during off-peak hours when possible.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">3. {t('legal.sla.sections.supportResponseTimes')}</h2>
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr className="bg-background-alt">
              <th className="border border-gray-300 px-4 py-2 text-left">Priority</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Response Time</th>
            </tr>
          </thead>
          <tbody className="text-text-secondary">
            <tr>
              <td className="border border-gray-300 px-4 py-2">Critical</td>
              <td className="border border-gray-300 px-4 py-2">Service completely unavailable</td>
              <td className="border border-gray-300 px-4 py-2">1 hour</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">High</td>
              <td className="border border-gray-300 px-4 py-2">Major functionality impaired</td>
              <td className="border border-gray-300 px-4 py-2">4 hours</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Medium</td>
              <td className="border border-gray-300 px-4 py-2">Minor functionality issues</td>
              <td className="border border-gray-300 px-4 py-2">12 hours</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Low</td>
              <td className="border border-gray-300 px-4 py-2">General questions</td>
              <td className="border border-gray-300 px-4 py-2">24 hours</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">4. {t('legal.sla.sections.performanceStandards')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">Grubtech maintains:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li>Page load times under 3 seconds for 95% of requests</li>
          <li>API response times under 500ms for 99% of requests</li>
          <li>Order processing latency under 1 second</li>
          <li>Real-time data synchronization within 5 seconds</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">5. {t('legal.sla.sections.dataBackupRecovery')}</h2>
        <p className="text-text-secondary leading-relaxed">
          Customer data is backed up every 6 hours. In the event of data loss, we commit to:
        </p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4 mt-3">
          <li><strong>Recovery Time Objective (RTO):</strong> 4 hours</li>
          <li><strong>Recovery Point Objective (RPO):</strong> 6 hours maximum data loss</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">6. {t('legal.sla.sections.securityIncidentResponse')}</h2>
        <p className="text-text-secondary leading-relaxed">
          In the event of a security incident affecting customer data, we will:
        </p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4 mt-3">
          <li>Notify affected customers within 24 hours of discovery</li>
          <li>Provide detailed incident report within 72 hours</li>
          <li>Implement remediation measures immediately</li>
          <li>Conduct post-incident review and implement preventive measures</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">7. {t('legal.sla.sections.serviceCredits')}</h2>
        <p className="text-text-secondary leading-relaxed">
          If we fail to meet our uptime commitments, customers are eligible for service credits:
        </p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4 mt-3">
          <li>99.0% - 99.5% uptime: 10% credit</li>
          <li>98.0% - 99.0% uptime: 25% credit</li>
          <li>Below 98.0% uptime: 50% credit</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">8. {t('legal.sla.sections.exclusions')}</h2>
        <p className="text-text-secondary leading-relaxed mb-3">This SLA does not apply to outages caused by:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li>Customer's equipment, software, or network</li>
          <li>Third-party services beyond our control</li>
          <li>Force majeure events</li>
          <li>Customer's breach of Terms of Service</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">9. {t('legal.sla.sections.contact')}</h2>
        <p className="text-text-secondary leading-relaxed">
          For SLA-related questions or to request service credits:
          <br />
          Email: sla@grubtech.com
          <br />
          Phone: Available 24/7 for Enterprise customers
        </p>
      </section>
    </div>
  );
};

export const SLA: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DynamicPolicyPage
      slug="service-level-agreement"
      fallbackTitle={t('legal.sla.title')}
      fallbackContent={<FallbackContent />}
      fallbackLastUpdated="January 1, 2025"
    />
  );
};
