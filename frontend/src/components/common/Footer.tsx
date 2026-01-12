import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Linkedin, Instagram } from 'lucide-react';
import grubtechFooterLogo from '../../assets/icons/67c6aba329ae96a9feab695f_grubtech-footer-logo.svg';

// X (Twitter) Icon Component
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  const footerSections = [
    {
      title: t('global.footer.restaurants'),
      links: [
        { name: t('global.footer.independentSMEs'), path: '/persona/smbs' },
        { name: t('global.footer.regionalChains'), path: '/persona/regional-chains' },
        { name: t('global.footer.globalBrands'), path: '/persona/global-chains' },
        { name: t('global.footer.darkKitchens'), path: '/persona/dark-kitchens' },
      ],
    },
    {
      title: t('global.footer.solutions'),
      links: [
        { name: t('global.footer.gOnline'), path: '/gonline' },
        { name: t('global.footer.gOnlineLite'), path: '/gonline-lite' },
        { name: t('global.footer.gKDS'), path: '/gkds' },
        { name: t('global.footer.gDispatch'), path: '/gdispatch' },
        { name: t('global.footer.gData'), path: '/gdata' },
      ],
    },
    {
      title: t('global.footer.resources'),
      links: [
        { name: t('global.footer.blog'), path: '/blog' },
        { name: t('global.footer.knowledgeBase'), path: 'https://knowledge.grubtech.com/', external: true },
        { name: t('global.footer.faqs'), path: '/faqs' },
        { name: t('global.footer.integrations'), path: '/integrations' },
      ],
    },
    {
      title: t('global.footer.company'),
      links: [
        { name: t('global.footer.aboutUs'), path: '/about' },
        { name: t('global.footer.careers'), path: '/careers' },
        { name: t('global.footer.contact'), path: '/connect-with-us' },
      ],
    },
  ];

  const legalLinks = [
    { name: t('global.footer.privacyPolicy'), path: '/privacy-policy' },
    { name: t('global.footer.termsConditions'), path: '/terms-and-conditions' },
    { name: t('global.footer.dpa'), path: '/dpa' },
    { name: t('global.footer.sla'), path: '/service-level-agreement' },
    { name: t('global.footer.gdprEU'), path: '/gdpr-eu' },
  ];

  const socialLinks = [
    { icon: Facebook, url: 'https://facebook.com/grubtech', label: t('footer.socialLabels.facebook') },
    { icon: XIcon, url: 'https://x.com/grubtech', label: t('footer.socialLabels.twitter') },
    { icon: Linkedin, url: 'https://linkedin.com/company/grubtech', label: t('footer.socialLabels.linkedin') },
    { icon: Instagram, url: 'https://instagram.com/grubtech', label: t('footer.socialLabels.instagram') },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 md:gap-12 mb-12">
          {/* Logo, Tagline, and Social Media */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
              {/* Footer logo with explicit dimensions to prevent CLS */}
              <img
                src={grubtechFooterLogo}
                alt="Grubtech"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-300 text-sm mb-6 font-medium">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-400 hover:text-primary-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-sm"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-bold text-lg mb-4 text-white">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link: { name: string; path: string; external?: boolean }, linkIdx) => (
                  <li key={linkIdx}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-primary-light hover:underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-gray-300 hover:text-primary-light hover:underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section: Copyright and Legal Links */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">{t('footer.copyright')}</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {legalLinks.map((link, idx) => (
                <React.Fragment key={idx}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-light hover:underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
                  >
                    {link.name}
                  </Link>
                  {idx < legalLinks.length - 1 && (
                    <span className="text-gray-600">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
