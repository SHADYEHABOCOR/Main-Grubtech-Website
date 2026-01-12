/**
 * Structured Data (JSON-LD) utilities for SEO
 * Generates schema.org markup for different page types
 */

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  contactPoint?: ContactPoint[];
  sameAs?: string[];
  address?: Address;
}

export interface ContactPoint {
  '@type': 'ContactPoint';
  contactType: string;
  telephone?: string;
  email?: string;
  availableLanguage?: string[];
}

export interface Address {
  '@type': 'PostalAddress';
  addressCountry: string;
  addressRegion?: string;
  addressLocality?: string;
}

export interface WebsiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: SearchAction;
}

export interface SearchAction {
  '@type': 'SearchAction';
  target: {
    '@type': 'EntryPoint';
    urlTemplate: string;
  };
  'query-input': string;
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export interface BlogPostingSchema {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: Author;
  publisher: Organization;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
}

export interface Author {
  '@type': 'Person' | 'Organization';
  name: string;
  url?: string;
}

export interface Organization {
  '@type': 'Organization';
  name: string;
  logo: {
    '@type': 'ImageObject';
    url: string;
  };
}

export interface ProductSchema {
  '@context': 'https://schema.org';
  '@type': 'SoftwareApplication';
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: Offer;
  aggregateRating?: AggregateRating;
}

export interface Offer {
  '@type': 'Offer';
  price?: string;
  priceCurrency?: string;
}

export interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: string;
  reviewCount: string;
}

export interface FAQPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: FAQItem[];
}

export interface FAQItem {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}

export interface JobPostingSchema {
  '@context': 'https://schema.org';
  '@type': 'JobPosting';
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string;
  hiringOrganization: Organization;
  jobLocation: JobLocation;
}

export interface JobLocation {
  '@type': 'Place';
  address: Address;
}

/**
 * Generate Organization structured data
 */
export const generateOrganizationSchema = (): OrganizationSchema => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Grubtech',
  url: 'https://grubtech.com',
  logo: 'https://grubtech.com/favicon.png',
  description: 'Unified Restaurant Operations and Management Platform',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'hello@grubtech.com',
      availableLanguage: ['English', 'Arabic']
    }
  ],
  sameAs: [
    'https://www.linkedin.com/company/grubtech',
    'https://twitter.com/grubtech',
    'https://www.facebook.com/grubtech'
  ]
});

/**
 * Generate Website structured data with search
 */
export const generateWebsiteSchema = (): WebsiteSchema => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Grubtech',
  url: 'https://grubtech.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://grubtech.com/search?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
});

/**
 * Generate Breadcrumb structured data
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url?: string }>): BreadcrumbSchema => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    ...(item.url && { item: item.url })
  }))
});

/**
 * Generate Blog Posting structured data
 */
export const generateBlogPostingSchema = (post: {
  title: string;
  description: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  url: string;
}): BlogPostingSchema => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.description,
  image: post.image,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt || post.publishedAt,
  author: {
    '@type': 'Organization',
    name: post.author
  },
  publisher: {
    '@type': 'Organization',
    name: 'Grubtech',
    logo: {
      '@type': 'ImageObject',
      url: 'https://grubtech.com/favicon.png'
    }
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': post.url
  }
});

/**
 * Generate Software Application (Product) structured data
 */
export const generateProductSchema = (product: {
  name: string;
  description: string;
  category: string;
}): ProductSchema => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: product.name,
  description: product.description,
  applicationCategory: product.category,
  operatingSystem: 'Web, iOS, Android'
});

/**
 * Generate FAQ Page structured data
 */
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>): FAQPageSchema => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

/**
 * Generate Job Posting structured data
 */
export const generateJobPostingSchema = (job: {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string;
  location: {
    country: string;
    region?: string;
    locality?: string;
  };
}): JobPostingSchema => ({
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: job.title,
  description: job.description,
  datePosted: job.datePosted,
  validThrough: job.validThrough,
  employmentType: job.employmentType,
  hiringOrganization: {
    '@type': 'Organization',
    name: 'Grubtech',
    logo: {
      '@type': 'ImageObject',
      url: 'https://grubtech.com/favicon.png'
    }
  },
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressCountry: job.location.country,
      addressRegion: job.location.region,
      addressLocality: job.location.locality
    }
  }
});
