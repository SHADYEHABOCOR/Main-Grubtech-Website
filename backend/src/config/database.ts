import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../../grubtech.db'), {
  fileMustExist: false,
  timeout: 5000,
  // Disable verbose logging in production
  // verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
});

/**
 * Get the database instance
 * Used for health checks and direct queries
 */
export function getDatabase(): Database.Database {
  return db;
}

// Enable foreign keys and WAL mode for better concurrent access
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize database tables
export function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Blog posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_en TEXT NOT NULL,
      title_ar TEXT,
      title_es TEXT,
      title_pt TEXT,
      content_en TEXT NOT NULL,
      content_ar TEXT,
      content_es TEXT,
      content_pt TEXT,
      slug TEXT UNIQUE NOT NULL,
      featured_image TEXT,
      status TEXT DEFAULT 'draft',
      language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Testimonials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      company_logo TEXT,
      headline TEXT,
      headline_ar TEXT,
      headline_es TEXT,
      headline_pt TEXT,
      content TEXT NOT NULL,
      content_ar TEXT,
      content_es TEXT,
      content_pt TEXT,
      image TEXT,
      rating INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add multilingual columns to testimonials if they don't exist (migration)
  try {
    db.exec(`ALTER TABLE testimonials ADD COLUMN headline_ar TEXT`);
  } catch { /* column may already exist */ }
  try {
    db.exec(`ALTER TABLE testimonials ADD COLUMN headline_es TEXT`);
  } catch { /* column may already exist */ }
  try {
    db.exec(`ALTER TABLE testimonials ADD COLUMN headline_pt TEXT`);
  } catch { /* column may already exist */ }
  try {
    db.exec(`ALTER TABLE testimonials ADD COLUMN content_ar TEXT`);
  } catch { /* column may already exist */ }
  try {
    db.exec(`ALTER TABLE testimonials ADD COLUMN content_es TEXT`);
  } catch { /* column may already exist */ }
  try {
    db.exec(`ALTER TABLE testimonials ADD COLUMN content_pt TEXT`);
  } catch { /* column may already exist */ }

  // Website content table - for editable text across the site
  db.exec(`
    CREATE TABLE IF NOT EXISTS website_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT UNIQUE NOT NULL,
      content_en TEXT,
      content_ar TEXT,
      content_es TEXT,
      content_pt TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Job vacancies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_vacancies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT DEFAULT 'Full-time',
      description TEXT,
      requirements TEXT,
      application_link TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Integrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      logo_url TEXT,
      website_url TEXT,
      display_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Video galleries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS video_galleries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_en TEXT NOT NULL,
      title_ar TEXT,
      title_es TEXT,
      title_pt TEXT,
      description_en TEXT,
      description_ar TEXT,
      description_es TEXT,
      description_pt TEXT,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT,
      logo_url TEXT,
      duration INTEGER,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Team members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_en TEXT NOT NULL,
      name_ar TEXT,
      name_es TEXT,
      name_pt TEXT,
      title_en TEXT NOT NULL,
      title_ar TEXT,
      title_es TEXT,
      title_pt TEXT,
      department TEXT NOT NULL,
      bio_en TEXT,
      bio_ar TEXT,
      bio_es TEXT,
      bio_pt TEXT,
      email TEXT,
      linkedin TEXT,
      image TEXT,
      display_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for team members
  db.exec(`CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON team_members(display_order)`);

  // SECURITY: Default admin user creation removed from code
  // Admin users should be created via:
  // 1. The /api/setup/admin endpoint (should be disabled in production)
  // 2. Environment variables ADMIN_USERNAME and ADMIN_PASSWORD
  // 3. Direct database insertion during deployment

  // Refresh tokens table for secure token refresh flow
  db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      revoked_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for refresh tokens
  db.exec(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at)`);

  // Analytics tables for website monitoring
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      user_agent TEXT,
      device_type TEXT,
      browser TEXT,
      os TEXT,
      country TEXT,
      language TEXT,
      started_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_pageviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_url TEXT NOT NULL,
      page_title TEXT,
      referrer TEXT,
      session_id TEXT NOT NULL,
      user_agent TEXT,
      viewport_width INTEGER,
      viewport_height INTEGER,
      created_at TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      event_category TEXT,
      event_label TEXT,
      event_value REAL,
      page_url TEXT,
      session_id TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // Policy pages table - for legal/policy content (Privacy, Terms, etc.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS policy_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title_en TEXT NOT NULL,
      title_ar TEXT,
      title_es TEXT,
      title_pt TEXT,
      content_en TEXT NOT NULL,
      content_ar TEXT,
      content_es TEXT,
      content_pt TEXT,
      meta_description TEXT,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index for policy pages
  db.exec(`CREATE INDEX IF NOT EXISTS idx_policy_pages_slug ON policy_pages(slug)`);

  // Seed default policy pages if they don't exist
  const policyPages = [
    {
      slug: 'privacy-policy',
      title_en: 'Privacy Policy',
      content_en: `<h2>1. Introduction</h2>
<p>Grubtech ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our restaurant management platform and services.</p>

<h2>2. Information We Collect</h2>
<p>We collect information that you provide directly to us, including:</p>
<ul>
<li>Account information (name, email, phone number, business details)</li>
<li>Payment information (processed securely through third-party providers)</li>
<li>Restaurant operational data (orders, menu items, inventory)</li>
<li>Customer data you input into our system</li>
<li>Communications with our support team</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Provide, maintain, and improve our services</li>
<li>Process transactions and send related information</li>
<li>Send technical notices, updates, and support messages</li>
<li>Respond to your comments and questions</li>
<li>Analyze usage patterns and optimize our platform</li>
<li>Detect and prevent fraud and abuse</li>
</ul>

<h2>4. Data Security</h2>
<p>We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. We use encryption, secure servers, and regular security audits.</p>

<h2>5. Data Retention</h2>
<p>We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law.</p>

<h2>6. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access your personal data</li>
<li>Correct inaccurate data</li>
<li>Request deletion of your data</li>
<li>Object to processing of your data</li>
<li>Export your data</li>
</ul>

<h2>7. Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at:<br/>
Email: privacy@grubtech.com<br/>
Address: Grubtech, Dubai, UAE</p>`,
      meta_description: 'Grubtech Privacy Policy - Learn how we collect, use, and protect your data.'
    },
    {
      slug: 'terms-and-conditions',
      title_en: 'Terms & Conditions',
      content_en: `<h2>1. Acceptance of Terms</h2>
<p>By accessing and using Grubtech's services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>

<h2>2. Service Description</h2>
<p>Grubtech provides a cloud-based restaurant management platform including order management, POS integration, delivery coordination, analytics, and related services. We reserve the right to modify or discontinue services with reasonable notice.</p>

<h2>3. User Accounts</h2>
<p>Users are responsible for:</p>
<ul>
<li>Maintaining the confidentiality of account credentials</li>
<li>All activities that occur under their account</li>
<li>Notifying us immediately of any unauthorized use</li>
<li>Providing accurate and current information</li>
</ul>

<h2>4. Payment Terms</h2>
<p>Payment is due according to your selected plan. We accept major credit cards and other payment methods as specified. Failure to pay may result in service suspension. Refunds are subject to our refund policy.</p>

<h2>5. Acceptable Use</h2>
<p>You agree not to:</p>
<ul>
<li>Use the service for any illegal purpose</li>
<li>Attempt to gain unauthorized access to our systems</li>
<li>Interfere with or disrupt the service</li>
<li>Upload malicious code or content</li>
<li>Violate any applicable laws or regulations</li>
</ul>

<h2>6. Intellectual Property</h2>
<p>All content, features, and functionality of the Grubtech platform are owned by Grubtech and are protected by international copyright, trademark, and other intellectual property laws.</p>

<h2>7. Limitation of Liability</h2>
<p>Grubtech shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>

<h2>8. Termination</h2>
<p>We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the service will cease immediately.</p>

<h2>9. Contact Information</h2>
<p>For questions about these Terms, contact us at:<br/>
Email: legal@grubtech.com<br/>
Address: Grubtech, Dubai, UAE</p>`,
      meta_description: 'Grubtech Terms and Conditions - Read our terms of service agreement.'
    },
    {
      slug: 'dpa',
      title_en: 'Data Processing Agreement',
      content_en: `<h2>1. Definitions</h2>
<p>In this Data Processing Agreement ("DPA"):</p>
<ul>
<li><strong>Controller:</strong> The restaurant or business using Grubtech services</li>
<li><strong>Processor:</strong> Grubtech as the service provider</li>
<li><strong>Personal Data:</strong> Any data relating to identified or identifiable individuals</li>
<li><strong>Processing:</strong> Any operation performed on Personal Data</li>
</ul>

<h2>2. Scope and Purpose</h2>
<p>This DPA governs the processing of Personal Data by Grubtech on behalf of the Controller in connection with the services provided under our Terms of Service. Grubtech processes Personal Data only as instructed by the Controller.</p>

<h2>3. Processing Obligations</h2>
<p>Grubtech shall:</p>
<ul>
<li>Process Personal Data only on documented instructions from the Controller</li>
<li>Ensure personnel processing Personal Data are bound by confidentiality</li>
<li>Implement appropriate technical and organizational security measures</li>
<li>Assist the Controller in responding to data subject requests</li>
<li>Notify the Controller of any personal data breaches without undue delay</li>
<li>Delete or return Personal Data upon termination of services</li>
</ul>

<h2>4. Sub-processors</h2>
<p>Grubtech may engage sub-processors to process Personal Data. Current sub-processors are listed on our website. We will notify Controllers of any changes to sub-processors and allow reasonable time to object.</p>

<h2>5. Security Measures</h2>
<p>Grubtech implements:</p>
<ul>
<li>Encryption of Personal Data in transit and at rest</li>
<li>Regular security assessments and penetration testing</li>
<li>Access controls and authentication mechanisms</li>
<li>Logging and monitoring of system access</li>
<li>Regular backup and disaster recovery procedures</li>
</ul>

<h2>6. Data Subject Rights</h2>
<p>Grubtech will assist the Controller in fulfilling data subject rights requests, including access, rectification, erasure, restriction, portability, and objection to processing.</p>

<h2>7. International Transfers</h2>
<p>When Personal Data is transferred outside the EEA, Grubtech ensures appropriate safeguards are in place, including Standard Contractual Clauses or other approved mechanisms.</p>

<h2>8. Audits</h2>
<p>Controllers have the right to audit Grubtech's data processing activities. We maintain SOC 2 Type II certification and will provide audit reports upon request.</p>

<h2>9. Contact</h2>
<p>For questions about this DPA, contact our Data Protection Officer at:<br/>
Email: dpo@grubtech.com<br/>
Address: Grubtech, Dubai, UAE</p>`,
      meta_description: 'Grubtech Data Processing Agreement - Our commitment to data protection.'
    },
    {
      slug: 'service-level-agreement',
      title_en: 'Service Level Agreement',
      content_en: `<h2>1. Service Availability</h2>
<p>Grubtech commits to the following uptime guarantees:</p>
<ul>
<li><strong>Enterprise Plan:</strong> 99.9% uptime (less than 43.8 minutes downtime per month)</li>
<li><strong>Professional Plan:</strong> 99.5% uptime (less than 3.6 hours downtime per month)</li>
<li><strong>Standard Plan:</strong> 99.0% uptime (less than 7.2 hours downtime per month)</li>
</ul>

<h2>2. Scheduled Maintenance</h2>
<p>Scheduled maintenance windows are excluded from uptime calculations. We will provide at least 48 hours notice for planned maintenance and conduct it during off-peak hours when possible.</p>

<h2>3. Support Response Times</h2>
<table style="width:100%; border-collapse: collapse;">
<tr style="background:#f5f5f5;"><th style="border:1px solid #ddd; padding:8px;">Priority</th><th style="border:1px solid #ddd; padding:8px;">Description</th><th style="border:1px solid #ddd; padding:8px;">Response Time</th></tr>
<tr><td style="border:1px solid #ddd; padding:8px;">Critical</td><td style="border:1px solid #ddd; padding:8px;">Service completely unavailable</td><td style="border:1px solid #ddd; padding:8px;">1 hour</td></tr>
<tr><td style="border:1px solid #ddd; padding:8px;">High</td><td style="border:1px solid #ddd; padding:8px;">Major functionality impaired</td><td style="border:1px solid #ddd; padding:8px;">4 hours</td></tr>
<tr><td style="border:1px solid #ddd; padding:8px;">Medium</td><td style="border:1px solid #ddd; padding:8px;">Minor functionality issues</td><td style="border:1px solid #ddd; padding:8px;">12 hours</td></tr>
<tr><td style="border:1px solid #ddd; padding:8px;">Low</td><td style="border:1px solid #ddd; padding:8px;">General questions</td><td style="border:1px solid #ddd; padding:8px;">24 hours</td></tr>
</table>

<h2>4. Performance Standards</h2>
<p>Grubtech maintains:</p>
<ul>
<li>Page load times under 3 seconds for 95% of requests</li>
<li>API response times under 500ms for 99% of requests</li>
<li>Order processing latency under 1 second</li>
<li>Real-time data synchronization within 5 seconds</li>
</ul>

<h2>5. Data Backup & Recovery</h2>
<p>Customer data is backed up every 6 hours. In the event of data loss, we commit to:</p>
<ul>
<li><strong>Recovery Time Objective (RTO):</strong> 4 hours</li>
<li><strong>Recovery Point Objective (RPO):</strong> 6 hours maximum data loss</li>
</ul>

<h2>6. Security Incident Response</h2>
<p>In the event of a security incident affecting customer data, we will:</p>
<ul>
<li>Notify affected customers within 24 hours of discovery</li>
<li>Provide detailed incident report within 72 hours</li>
<li>Implement remediation measures immediately</li>
<li>Conduct post-incident review and implement preventive measures</li>
</ul>

<h2>7. Service Credits</h2>
<p>If we fail to meet our uptime commitments, customers are eligible for service credits:</p>
<ul>
<li>99.0% - 99.5% uptime: 10% credit</li>
<li>98.0% - 99.0% uptime: 25% credit</li>
<li>Below 98.0% uptime: 50% credit</li>
</ul>

<h2>8. Exclusions</h2>
<p>This SLA does not apply to outages caused by:</p>
<ul>
<li>Customer's equipment, software, or network</li>
<li>Third-party services beyond our control</li>
<li>Force majeure events</li>
<li>Customer's breach of Terms of Service</li>
</ul>

<h2>9. Contact</h2>
<p>For SLA-related questions or to request service credits:<br/>
Email: sla@grubtech.com<br/>
Phone: Available 24/7 for Enterprise customers</p>`,
      meta_description: 'Grubtech Service Level Agreement - Our uptime and support commitments.'
    },
    {
      slug: 'gdpr-eu',
      title_en: 'GDPR Compliance (EU)',
      content_en: `<h2>1. Our Commitment</h2>
<p>Grubtech is committed to full compliance with the General Data Protection Regulation (GDPR). We have implemented comprehensive measures to ensure that personal data is processed lawfully, fairly, and transparently.</p>

<h2>2. Legal Basis for Processing</h2>
<p>We process personal data under the following legal bases:</p>
<ul>
<li><strong>Contract Performance:</strong> To provide our services as agreed</li>
<li><strong>Legitimate Interests:</strong> To improve and optimize our services</li>
<li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
<li><strong>Consent:</strong> Where specifically obtained for certain processing activities</li>
</ul>

<h2>3. Your Rights</h2>
<p>As a data subject, you have the right to:</p>
<ul>
<li><strong>Access:</strong> Request a copy of your personal data</li>
<li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
<li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
<li><strong>Restriction:</strong> Limit how we use your data</li>
<li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
<li><strong>Objection:</strong> Object to certain types of processing</li>
<li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
</ul>

<h2>4. How to Exercise Your Rights</h2>
<p>To exercise any of your GDPR rights, please contact our Data Protection Officer:</p>
<p style="background:#f5f5f5; padding:15px; border-radius:8px;">
Email: dpo@grubtech.com<br/>
Subject: GDPR Rights Request<br/><br/>
We will respond to your request within 30 days. In complex cases, we may extend this period by an additional 60 days.
</p>

<h2>5. Data Protection Measures</h2>
<p>We implement:</p>
<ul>
<li>Encryption of data in transit and at rest</li>
<li>Regular security assessments and audits</li>
<li>Access controls and authentication</li>
<li>Employee training on data protection</li>
<li>Data minimization principles</li>
<li>Privacy by design and by default</li>
</ul>

<h2>6. Breach Notification</h2>
<p>In the event of a personal data breach, we will:</p>
<ul>
<li>Notify the relevant supervisory authority within 72 hours</li>
<li>Inform affected data subjects without undue delay if high risk is identified</li>
<li>Document all breaches and remediation actions taken</li>
<li>Implement measures to prevent future breaches</li>
</ul>

<h2>7. International Transfers</h2>
<p>When transferring data outside the European Economic Area (EEA), we ensure adequate protection through:</p>
<ul>
<li>EU Standard Contractual Clauses (SCCs)</li>
<li>Adequacy decisions by the European Commission</li>
<li>Binding Corporate Rules where applicable</li>
</ul>

<h2>8. Data Retention</h2>
<p>We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, or reporting requirements.</p>

<h2>9. Children's Privacy</h2>
<p>Our services are not directed to children under 16. We do not knowingly collect personal data from children. If we learn that we have collected such data, we will take steps to delete it promptly.</p>

<h2>10. Supervisory Authority</h2>
<p>You have the right to lodge a complaint with a supervisory authority, in particular in the EU member state of your habitual residence, place of work, or place of alleged infringement.</p>

<h2>11. Contact Information</h2>
<p><strong>Data Protection Officer:</strong><br/>
Email: dpo@grubtech.com<br/>
Address: Grubtech, Dubai, UAE</p>`,
      meta_description: 'Grubtech GDPR Compliance - How we protect EU data subjects rights.'
    }
  ];

  policyPages.forEach(page => {
    const exists = db.prepare('SELECT id FROM policy_pages WHERE slug = ?').get(page.slug);
    if (!exists) {
      db.prepare(`
        INSERT INTO policy_pages (slug, title_en, content_en, meta_description, status)
        VALUES (?, ?, ?, ?, 'published')
      `).run(page.slug, page.title_en, page.content_en, page.meta_description);
      console.log(`✅ Created policy page: ${page.title_en}`);
    }
  });

  // Create indexes for analytics tables
  db.exec(`CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON analytics_pageviews(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_pageviews_session_id ON analytics_pageviews(session_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_pageviews_page_url ON analytics_pageviews(page_url)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_events_session_id ON analytics_events(session_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_events_event_name ON analytics_events(event_name)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON analytics_sessions(started_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON analytics_sessions(session_id)`);

  // Composite indexes for common query patterns
  db.exec(`CREATE INDEX IF NOT EXISTS idx_pageviews_created_at_page_url ON analytics_pageviews(created_at, page_url)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_pageviews_created_at_session_id ON analytics_pageviews(created_at, session_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_events_created_at_name_category ON analytics_events(created_at, event_name, event_category)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_started_at_device_type ON analytics_sessions(started_at, device_type)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_started_at_browser ON analytics_sessions(started_at, browser)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_blog_posts_status_created_at ON blog_posts(status, created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_integrations_category_display_order ON integrations(category, display_order)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_integrations_status_category_order ON integrations(status, category, display_order)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_video_galleries_active_order ON video_galleries(is_active, display_order)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_team_members_status_order_created ON team_members(status, display_order, created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_job_vacancies_status_created_at ON job_vacancies(status, created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_leads_form_type_created_at ON leads(form_type, created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_job_applications_status_created_at ON job_applications(status, created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_valid ON refresh_tokens(user_id, revoked_at, expires_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_policy_pages_slug_status ON policy_pages(slug, status)`);

  // Insert default website content sections if they don't exist
  const sections = [
    'hero_title',
    'hero_subtitle',
    'cta_text',
    'about_text',
    'footer_text'
  ];

  sections.forEach(section => {
    const exists = db.prepare('SELECT * FROM website_content WHERE section = ?').get(section);
    if (!exists) {
      db.prepare('INSERT INTO website_content (section, content_en) VALUES (?, ?)').run(section, '');
    }
  });

  // Integration requests table - for partner integration requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS integration_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      company_name TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index for integration requests
  db.exec(`CREATE INDEX IF NOT EXISTS idx_integration_requests_status ON integration_requests(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_integration_requests_created_at ON integration_requests(created_at)`);

  // Admin user creation removed - use /api/setup/create-admin endpoint instead
  // This ensures credentials are never hardcoded or stored in environment variables

  console.log('Database initialized successfully');
}

export function getDb() {
  return db;
}

export default db;
