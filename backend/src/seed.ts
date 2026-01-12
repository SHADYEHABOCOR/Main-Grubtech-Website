import db, { initDatabase } from './config/database.js';

// Initialize database first
initDatabase();

// Seed blog posts
const blogPosts = [
  {
    title_en: 'Digital Transformation in Restaurants: 2024 Trends',
    content_en: `
      <p>The restaurant industry is undergoing a massive digital transformation. Here's what you need to know to stay ahead of the curve in 2024.</p>

      <h2>1. Cloud-Based Operations</h2>
      <p>Cloud technology is enabling restaurants to manage operations from anywhere. Modern cloud-based POS systems provide real-time insights into sales, inventory, and customer behavior, allowing restaurant owners to make data-driven decisions on the go.</p>

      <h2>2. AI and Automation</h2>
      <p>Artificial intelligence is revolutionizing everything from <strong>inventory management</strong> to <strong>customer service</strong>. Smart systems can predict demand, optimize staffing, and even personalize menu recommendations.</p>

      <h2>3. Data-Driven Decision Making</h2>
      <p>Restaurants are leveraging analytics to optimize menus, pricing, and staffing. By analyzing customer preferences and sales patterns, operators can maximize profitability while delivering better experiences.</p>

      <h3>Key Takeaways</h3>
      <ul>
        <li>Embrace cloud-based technology for flexibility and real-time insights</li>
        <li>Invest in AI-powered solutions to automate routine tasks</li>
        <li>Use data analytics to make informed business decisions</li>
        <li>Stay ahead of competitors by adopting new technologies early</li>
      </ul>
    `,
    slug: 'digital-transformation-restaurants-2024',
    featured_image: '/src/assets/images/67dc711ca538931a3fa8e856_1.webp',
    status: 'published',
    language: 'en'
  },
  {
    title_en: '10 Proven Strategies to Increase Online Orders',
    content_en: `
      <p>Looking to boost your restaurant's online presence and grow your delivery business? Here are ten proven strategies that will help you increase online orders and revenue.</p>

      <h2>1. Optimize Your Online Menu</h2>
      <p>Your online menu is your digital storefront. Make sure it's <strong>visually appealing</strong>, easy to navigate, and includes high-quality photos of your dishes.</p>

      <h2>2. Improve Delivery Times</h2>
      <p>Fast delivery is crucial for customer satisfaction. Implement efficient kitchen operations and partner with reliable delivery services to minimize wait times.</p>

      <h2>3. Create Compelling Promotions</h2>
      <p>Regular promotions and special offers can drive repeat orders. Consider:</p>
      <ul>
        <li>First-order discounts for new customers</li>
        <li>Loyalty programs for regular customers</li>
        <li>Limited-time seasonal offers</li>
        <li>Bundle deals and meal combos</li>
      </ul>

      <p>By implementing these strategies, you can significantly increase your online order volume and build a loyal customer base.</p>
    `,
    slug: 'increasing-online-orders',
    featured_image: '/src/assets/images/67dc7cfdb715a068a177ec7f_3.webp',
    status: 'published',
    language: 'en'
  },
  {
    title_en: 'Kitchen Efficiency: Reduce Wait Times by 40%',
    content_en: `
      <p>Learn how leading restaurants are optimizing their kitchen operations to reduce wait times and improve customer satisfaction.</p>

      <h2>Kitchen Workflow Optimization</h2>
      <p>A well-organized kitchen is the foundation of fast service. Implement these proven techniques:</p>

      <h3>1. Station Setup</h3>
      <p>Organize cooking stations based on menu items and cooking methods. Keep frequently used ingredients and tools within arm's reach.</p>

      <h3>2. Prep Work</h3>
      <p>Maximize prep time during slow hours to reduce cooking time during peak periods. Pre-portion ingredients and prepare sauces in advance.</p>

      <h2>Technology Integration</h2>
      <p>Modern kitchen display systems (KDS) can significantly improve efficiency by:</p>
      <ul>
        <li>Eliminating paper tickets and reducing errors</li>
        <li>Automatically routing orders to the correct stations</li>
        <li>Tracking preparation times and bottlenecks</li>
        <li>Syncing with online ordering platforms</li>
      </ul>

      <h2>Staff Training</h2>
      <p>Well-trained staff are your most valuable asset. Regular training sessions and clear standard operating procedures ensure consistent, fast service.</p>

      <p><strong>Result:</strong> Restaurants implementing these strategies typically see a <strong>40% reduction in wait times</strong> and improved customer satisfaction scores.</p>
    `,
    slug: 'kitchen-efficiency-tips',
    featured_image: '/src/assets/images/67dc711c8f07d9dd28e15139_4.webp',
    status: 'published',
    language: 'en'
  },
  {
    title_en: 'The Future of Ghost Kitchens: What You Need to Know',
    content_en: `
      <p>Ghost kitchens are revolutionizing the food service industry. Learn how this model is reshaping restaurant operations and what it means for your business.</p>

      <h2>What Are Ghost Kitchens?</h2>
      <p>Ghost kitchens, also known as dark kitchens or cloud kitchens, are delivery-only restaurants without a dining room or storefront. They focus solely on fulfilling online orders.</p>

      <h2>Benefits of the Ghost Kitchen Model</h2>
      <ul>
        <li><strong>Lower overhead costs:</strong> No front-of-house expenses or prime location requirements</li>
        <li><strong>Multiple brands:</strong> Operate several virtual brands from one kitchen</li>
        <li><strong>Flexibility:</strong> Test new concepts with minimal investment</li>
        <li><strong>Scalability:</strong> Expand to new markets quickly</li>
      </ul>

      <h2>Technology Requirements</h2>
      <p>Success in the ghost kitchen model requires robust technology infrastructure including order aggregation, kitchen display systems, and delivery management.</p>

      <p>As consumer preferences shift toward delivery, ghost kitchens represent a significant opportunity for innovative restaurateurs.</p>
    `,
    slug: 'future-of-ghost-kitchens',
    featured_image: '/src/assets/images/67dc711ca538931a3fa8e856_1.webp',
    status: 'published',
    language: 'en'
  },
  {
    title_en: 'Menu Engineering: Maximizing Profitability in 2024',
    content_en: `
      <p>Learn the art and science of menu engineering to boost your restaurant's profitability through strategic pricing and positioning.</p>

      <h2>Understanding Menu Psychology</h2>
      <p>Menu design is more than aesthetics—it's a powerful tool to guide customer choices and maximize revenue. Strategic placement, descriptions, and pricing can significantly impact ordering behavior.</p>

      <h2>The Four Categories</h2>
      <ul>
        <li><strong>Stars:</strong> High profit, high popularity—promote these heavily</li>
        <li><strong>Plowhorses:</strong> Low profit, high popularity—increase prices or reduce costs</li>
        <li><strong>Puzzles:</strong> High profit, low popularity—reposition or improve marketing</li>
        <li><strong>Dogs:</strong> Low profit, low popularity—consider removing</li>
      </ul>

      <h2>Data-Driven Optimization</h2>
      <p>Use analytics to track item performance, food costs, and customer preferences. Regular menu analysis helps you make informed decisions about pricing, placement, and promotions.</p>

      <h3>Best Practices</h3>
      <ul>
        <li>Review menu performance quarterly</li>
        <li>Test price changes gradually</li>
        <li>Use descriptive, enticing language</li>
        <li>Highlight high-margin items strategically</li>
      </ul>
    `,
    slug: 'menu-engineering-guide',
    featured_image: '/src/assets/images/67dc7cfdb715a068a177ec7f_3.webp',
    status: 'published',
    language: 'en'
  },
  {
    title_en: 'Managing Multi-Location Restaurants: Best Practices',
    content_en: `
      <p>Scaling your restaurant to multiple locations brings unique challenges. Here's how to maintain consistency and quality across all your venues.</p>

      <h2>Centralized Operations</h2>
      <p>A unified management system is essential for multi-location success. Centralize your menu management, inventory tracking, and reporting to maintain oversight while allowing location-specific flexibility.</p>

      <h2>Standardization vs. Localization</h2>
      <p>Strike the right balance between brand consistency and local market adaptation:</p>
      <ul>
        <li><strong>Standardize:</strong> Core recipes, service standards, branding</li>
        <li><strong>Localize:</strong> Menu variations, pricing, marketing campaigns</li>
      </ul>

      <h2>Technology Infrastructure</h2>
      <p>Modern restaurant management platforms enable:</p>
      <ul>
        <li>Real-time visibility across all locations</li>
        <li>Consolidated reporting and analytics</li>
        <li>Role-based access for different management levels</li>
        <li>Automated inventory and supply chain management</li>
      </ul>

      <h2>Communication and Training</h2>
      <p>Establish clear communication channels and standardized training programs. Regular manager meetings and shared best practices help maintain quality as you scale.</p>

      <p>With the right systems and processes, you can successfully grow your restaurant brand while maintaining the quality that made you successful.</p>
    `,
    slug: 'multi-location-restaurant-management',
    featured_image: '/src/assets/images/67dc711c8f07d9dd28e15139_4.webp',
    status: 'published',
    language: 'en'
  }
];

// Check if blog posts already exist
const existingPosts = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get() as { count: number };

if (existingPosts.count === 0) {
  console.log('Seeding blog posts...');

  const insertStmt = db.prepare(`
    INSERT INTO blog_posts (title_en, content_en, slug, featured_image, status, language)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  blogPosts.forEach(post => {
    insertStmt.run(
      post.title_en,
      post.content_en,
      post.slug,
      post.featured_image,
      post.status,
      post.language
    );
  });

  console.log(`Seeded ${blogPosts.length} blog posts`);
} else {
  console.log(`Database already has ${existingPosts.count} blog post(s), skipping seed`);
}

// Seed website content sections with actual text from the website
const contentSections = [
  // Home Page
  { section: 'home_hero_title', content_en: 'Smart restaurants run on Grubtech' },
  { section: 'home_hero_subtitle', content_en: 'We connect your restaurant systems - from online orders to POS to delivery - so everything runs smoother, faster, and smarter.' },
  { section: 'home_hero_cta_primary', content_en: "Let's Talk" },
  { section: 'home_hero_cta_secondary', content_en: 'Learn More' },

  // About Page
  { section: 'about_hero_title', content_en: 'About Grubtech' },
  { section: 'about_hero_subtitle', content_en: 'Empowering restaurants worldwide with innovative technology solutions' },

  // Contact Page
  { section: 'contact_hero_title', content_en: 'Get in Touch' },
  { section: 'contact_hero_subtitle', content_en: "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible." },
  { section: 'contact_email_title', content_en: 'Email Us' },
  { section: 'contact_phone_title', content_en: 'Call Us' },
  { section: 'contact_address_title', content_en: 'Visit Us' },
  { section: 'contact_hours_title', content_en: 'Business Hours' },

  // Careers Page
  { section: 'careers_hero_title', content_en: 'Join Our Team' },
  { section: 'careers_hero_subtitle', content_en: 'Help us transform the restaurant industry. Join a global team of passionate innovators building the future of food technology.' },

  // FAQs Page
  { section: 'faqs_hero_title', content_en: 'Frequently Asked Questions' },
  { section: 'faqs_hero_subtitle', content_en: 'Find answers to common questions about Grubtech' },
  { section: 'faqs_search_placeholder', content_en: 'Search FAQs...' },

  // Connect With Us
  { section: 'connect_hero_title', content_en: "Let's Talk" },
  { section: 'connect_hero_subtitle', content_en: "Have questions? Want to see a demo? Our team is here to help you transform your restaurant operations." },

  // Integrations
  { section: 'integrations_hero_title', content_en: 'Integrations' },
  { section: 'integrations_hero_subtitle', content_en: 'Connect Grubtech with all your existing systems. Seamless integrations with leading POS, delivery platforms, and business tools.' },
];

console.log('Seeding website content sections...');

const contentStmt = db.prepare(`
  INSERT OR REPLACE INTO website_content (section, content_en)
  VALUES (?, ?)
`);

contentSections.forEach(section => {
  contentStmt.run(section.section, section.content_en);
});

console.log(`Seeded ${contentSections.length} content sections`);

// Seed testimonials
// Images are stored in frontend/public/images/testimonials/ and served by Vercel
const testimonials = [
  {
    name: 'Ahmed Al-Mansouri',
    company: 'The Kebab House',
    company_logo: null,
    headline: 'The Essential Ingredient for Restaurant Success',
    content: 'Grubtech has transformed our operations. We\'ve seen a 40% increase in online orders since implementing their system. The unified dashboard makes managing multiple delivery platforms effortless.',
    image: '/images/testimonials/avatar-1.webp',
    rating: 5
  },
  {
    name: 'Sarah Johnson',
    company: 'Burger Haven',
    company_logo: null,
    headline: 'Streamlined Operations, Exceptional Results',
    content: 'The integration with our POS was seamless. Customer support is excellent and the platform is very intuitive. Our team was up and running in just two days!',
    image: '/images/testimonials/avatar-2.webp',
    rating: 5
  },
  {
    name: 'Carlos Rodriguez',
    company: 'Tapas & More',
    company_logo: null,
    headline: 'Data-Driven Decisions That Drive Growth',
    content: 'Best decision we made for our restaurant. The analytics help us make better business decisions every day. We can now track performance across all our locations in real-time.',
    image: '/images/testimonials/avatar-3.webp',
    rating: 5
  },
  {
    name: 'Fatima Hassan',
    company: 'Golden Spice Restaurant',
    company_logo: null,
    headline: 'All Your Delivery Platforms in One Place',
    content: 'Managing multiple delivery platforms used to be a nightmare. Grubtech brought everything together in one place. Game changer for our business!',
    image: '/images/testimonials/avatar-1.webp',
    rating: 5
  },
  {
    name: 'Michael Chen',
    company: 'Wok & Roll',
    company_logo: null,
    headline: 'Precision and Speed in the Kitchen',
    content: 'The kitchen display system reduced our order errors by 90%. Our staff loves how easy it is to use and our customers notice the difference in service quality.',
    image: '/images/testimonials/avatar-2.webp',
    rating: 5
  },
  {
    name: 'Layla Abdullah',
    company: 'Desert Rose Cafe',
    company_logo: null,
    headline: 'Real-Time Analytics, Real Business Impact',
    content: 'Real-time analytics help us optimize our menu and pricing. We\'ve increased our profit margins by 25% in just 6 months. The ROI has been phenomenal!',
    image: '/images/testimonials/avatar-3.webp',
    rating: 5
  }
];

const existingTestimonials = db.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number };

// Always reseed testimonials to ensure correct image paths
if (existingTestimonials.count === 0 || existingTestimonials.count <= testimonials.length) {
  console.log('Seeding testimonials...');

  // Clear existing testimonials to reseed with correct paths
  db.prepare('DELETE FROM testimonials').run();

  const testimonialStmt = db.prepare(`
    INSERT INTO testimonials (name, company, company_logo, headline, content, image, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  testimonials.forEach(testimonial => {
    testimonialStmt.run(
      testimonial.name,
      testimonial.company,
      testimonial.company_logo,
      testimonial.headline,
      testimonial.content,
      testimonial.image,
      testimonial.rating
    );
  });

  console.log(`Seeded ${testimonials.length} testimonials`);
} else {
  console.log(`Database already has ${existingTestimonials.count} testimonial(s), skipping seed`);
}

// Seed job vacancies
const jobVacancies = [
  {
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'Dubai, UAE',
    type: 'Full-time',
    description: 'We are looking for an experienced Full Stack Engineer to join our growing engineering team. You will work on building scalable web applications that power restaurants worldwide. Join us in revolutionizing the restaurant technology industry.',
    requirements: '5+ years of experience with React and Node.js\nExperience with TypeScript\nStrong understanding of databases (PostgreSQL, MongoDB)\nExperience with cloud platforms (AWS, Azure)\nExcellent problem-solving skills',
    application_link: 'https://grubtech.com/careers/apply',
    status: 'active'
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
    description: 'Join our product team to help define and execute our product strategy. You will work closely with engineering, design, and customers to build products that restaurants love. Drive the vision and roadmap for our platform.',
    requirements: '3+ years of product management experience\nExperience in B2B SaaS\nStrong analytical skills\nExcellent communication\nData-driven decision making',
    application_link: 'https://grubtech.com/careers/apply',
    status: 'active'
  },
  {
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Riyadh, KSA',
    type: 'Full-time',
    description: 'Help our restaurant partners succeed by providing exceptional support and guidance. You will be the main point of contact for our customers in the KSA region. Build lasting relationships and drive customer satisfaction.',
    requirements: 'Fluent in Arabic and English\n2+ years in customer success or account management\nExperience in the restaurant or hospitality industry\nStrong relationship-building skills\nTechnical aptitude',
    application_link: 'https://grubtech.com/careers/apply',
    status: 'active'
  },
  {
    title: 'Senior UI/UX Designer',
    department: 'Design',
    location: 'Dubai, UAE',
    type: 'Full-time',
    description: 'Create beautiful and intuitive user experiences for restaurant operators. You will own the design process from research to final implementation, working closely with product and engineering teams.',
    requirements: '4+ years of UI/UX design experience\nProficiency in Figma and design systems\nStrong portfolio demonstrating B2B SaaS design\nExperience with user research and testing\nCollaboration skills',
    application_link: 'https://grubtech.com/careers/apply',
    status: 'active'
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build and maintain the infrastructure that powers thousands of restaurants. Ensure high availability, security, and performance of our cloud-based platform. Implement CI/CD pipelines and monitoring solutions.',
    requirements: '3+ years of DevOps experience\nExperience with AWS or Azure\nKnowledge of Docker, Kubernetes\nProficiency in Infrastructure as Code (Terraform)\nStrong scripting skills (Python, Bash)',
    application_link: 'https://grubtech.com/careers/apply',
    status: 'active'
  },
  {
    title: 'Sales Executive',
    department: 'Sales',
    location: 'Dubai, UAE',
    type: 'Full-time',
    description: 'Drive new business growth by connecting with restaurant owners and operators across the Middle East. Understand their challenges and demonstrate how Grubtech can transform their operations.',
    requirements: '2+ years of B2B sales experience\nExperience in SaaS or technology sales preferred\nStrong negotiation and presentation skills\nSelf-motivated and target-driven\nArabic and English fluency',
    application_link: 'https://grubtech.com/careers/apply',
    status: 'active'
  }
];

const existingVacancies = db.prepare('SELECT COUNT(*) as count FROM job_vacancies').get() as { count: number };

if (existingVacancies.count === 0) {
  console.log('Seeding job vacancies...');

  const vacancyStmt = db.prepare(`
    INSERT INTO job_vacancies (title, department, location, type, description, requirements, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  jobVacancies.forEach(job => {
    vacancyStmt.run(
      job.title,
      job.department,
      job.location,
      job.type,
      job.description,
      job.requirements,
      job.status
    );
  });

  console.log(`Seeded ${jobVacancies.length} job vacancies`);
} else {
  console.log(`Database already has ${existingVacancies.count} job vacanc(ies), skipping seed`);
}

// Seed video galleries (YouTube videos)
const videoGalleries = [
  {
    title_en: 'Grubtech Platform Overview',
    description_en: 'Discover how Grubtech revolutionizes restaurant operations with our comprehensive management platform.',
    video_url: 'https://www.youtube.com/watch?v=PU-zae2rTR0',
    thumbnail_url: 'https://i.ytimg.com/vi/PU-zae2rTR0/maxresdefault.jpg',
    duration: 180,
    display_order: 1,
    is_active: 1
  },
  {
    title_en: 'Order Management Made Simple',
    description_en: 'See how our unified order management system streamlines operations across all delivery platforms.',
    video_url: 'https://www.youtube.com/watch?v=-LJQfoJIoAE',
    thumbnail_url: 'https://i.ytimg.com/vi/-LJQfoJIoAE/maxresdefault.jpg',
    duration: 240,
    display_order: 2,
    is_active: 1
  },
  {
    title_en: 'Kitchen Display System in Action',
    description_en: 'Watch how our KDS improves kitchen efficiency and reduces order preparation time by 40%.',
    video_url: 'https://www.youtube.com/watch?v=f1WCFVdQY3g',
    thumbnail_url: 'https://i.ytimg.com/vi/f1WCFVdQY3g/maxresdefault.jpg',
    duration: 200,
    display_order: 3,
    is_active: 1
  }
];

const existingVideos = db.prepare('SELECT COUNT(*) as count FROM video_galleries').get() as { count: number };

if (existingVideos.count === 0) {
  console.log('Seeding video galleries...');

  const videoStmt = db.prepare(`
    INSERT INTO video_galleries (title_en, description_en, video_url, thumbnail_url, duration, display_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  videoGalleries.forEach(video => {
    videoStmt.run(
      video.title_en,
      video.description_en,
      video.video_url,
      video.thumbnail_url,
      video.duration,
      video.display_order,
      video.is_active
    );
  });

  console.log(`Seeded ${videoGalleries.length} video galleries`);
} else {
  console.log(`Database already has ${existingVideos.count} video(s), skipping seed`);
}

console.log('\nDatabase seeding completed!');
