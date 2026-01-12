// Common types
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// Contact Form
export interface ContactFormData extends Record<string, unknown> {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  preferredContact?: 'email' | 'phone';
}

export interface ContactSubmission extends BaseEntity, ContactFormData {
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  assignedTo?: string;
}

// Blog
export interface BlogPost extends BaseEntity {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: Author;
  category: string;
  tags: string[];
  published: boolean;
  publishedAt?: string;
  readTime: number;
  views: number;
}

export interface Author {
  name: string;
  avatar: string;
  bio?: string;
}

// Testimonial
export interface Testimonial {
  id: number;
  name: string;
  company: string;
  company_logo: string | null;
  headline: string | null;
  content: string;
  image: string | null;
  rating: number;
  created_at: string;
  updated_at: string;
  // i18n fields
  headline_ar?: string | null;
  content_ar?: string | null;
  headline_es?: string | null;
  content_es?: string | null;
  headline_pt?: string | null;
  content_pt?: string | null;
}

// Team Member
export interface TeamMember extends BaseEntity {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  social: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  order: number;
}

// Integration
export interface Integration {
  id: number;
  name: string;
  description: string;
  category: string;
  logo_url: string;
  website_url?: string;
  display_order: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// Newsletter
export interface NewsletterSubscription {
  email: string;
  language: string;
}

// Restaurant Types (for segmentation)
export type RestaurantType = 'smb' | 'regional-chain' | 'global-brand' | 'dark-kitchen';

export interface Restaurant extends BaseEntity {
  name: string;
  type: RestaurantType;
  locations: number;
  logo: string;
  testimonial?: string;
}
