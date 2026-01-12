import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import testimonialsRouter from '../testimonials.js';
import db from '../../config/database.js';

// Mock the database module
vi.mock('../../config/database.js', () => ({
  default: {
    prepare: vi.fn(),
  },
}));

// Mock the auth middleware
vi.mock('../../middleware/auth.js', () => ({
  authenticateToken: vi.fn((req, res, next) => next()),
}));

describe('Testimonials API - Localization', () => {
  let app: Express;
  let mockPrepare: Mock;
  let mockGet: Mock;
  let mockAll: Mock;
  let mockRun: Mock;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/testimonials', testimonialsRouter);

    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock functions
    mockGet = vi.fn();
    mockAll = vi.fn();
    mockRun = vi.fn();
    mockPrepare = vi.fn(() => ({
      get: mockGet,
      all: mockAll,
      run: mockRun,
    }));

    (db.prepare as Mock) = mockPrepare;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET / - List all testimonials with localization', () => {
    const mockTestimonials = [
      {
        id: 1,
        name: 'John Doe',
        company: 'Tech Corp',
        company_logo: '/uploads/logo1.png',
        headline: 'Great service!',
        headline_ar: 'خدمة رائعة!',
        headline_es: '¡Excelente servicio!',
        headline_pt: 'Ótimo serviço!',
        content: 'This is amazing content.',
        content_ar: 'هذا محتوى مذهل.',
        content_es: 'Este es un contenido increíble.',
        content_pt: 'Este é um conteúdo incrível.',
        image: '/uploads/image1.png',
        rating: 5,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'Jane Smith',
        company: 'Business Inc',
        company_logo: '/uploads/logo2.png',
        headline: 'Highly recommended',
        headline_ar: 'موصى به بشدة',
        headline_es: 'Muy recomendado',
        headline_pt: 'Altamente recomendado',
        content: 'Best decision ever.',
        content_ar: 'أفضل قرار على الإطلاق.',
        content_es: 'La mejor decisión de todas.',
        content_pt: 'A melhor decisão de todas.',
        image: '/uploads/image2.png',
        rating: 5,
        created_at: '2026-01-02T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ];

    describe('Valid language codes', () => {
      it('should return English content by default (no lang parameter)', async () => {
        mockGet.mockReturnValue({ total: 2 });
        mockAll.mockReturnValue(mockTestimonials);

        const response = await request(app).get('/api/testimonials');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveLength(2);

        // Verify English content is returned
        expect(response.body.data[0].headline).toBe('Great service!');
        expect(response.body.data[0].content).toBe('This is amazing content.');
        expect(response.body.data[1].headline).toBe('Highly recommended');
        expect(response.body.data[1].content).toBe('Best decision ever.');
      });

      it('should return English content when lang=en', async () => {
        mockGet.mockReturnValue({ total: 2 });
        mockAll.mockReturnValue(mockTestimonials);

        const response = await request(app).get('/api/testimonials?lang=en');

        expect(response.status).toBe(200);
        expect(response.body.data[0].headline).toBe('Great service!');
        expect(response.body.data[0].content).toBe('This is amazing content.');
      });

      it('should return Arabic content when lang=ar', async () => {
        mockGet.mockReturnValue({ total: 2 });
        mockAll.mockReturnValue(mockTestimonials);

        const response = await request(app).get('/api/testimonials?lang=ar');

        expect(response.status).toBe(200);
        expect(response.body.data[0].headline).toBe('خدمة رائعة!');
        expect(response.body.data[0].content).toBe('هذا محتوى مذهل.');
      });

      it('should return Spanish content when lang=es', async () => {
        mockGet.mockReturnValue({ total: 2 });
        mockAll.mockReturnValue(mockTestimonials);

        const response = await request(app).get('/api/testimonials?lang=es');

        expect(response.status).toBe(200);
        expect(response.body.data[0].headline).toBe('¡Excelente servicio!');
        expect(response.body.data[0].content).toBe('Este es un contenido increíble.');
      });

      it('should return Portuguese content when lang=pt', async () => {
        mockGet.mockReturnValue({ total: 2 });
        mockAll.mockReturnValue(mockTestimonials);

        const response = await request(app).get('/api/testimonials?lang=pt');

        expect(response.status).toBe(200);
        expect(response.body.data[0].headline).toBe('Ótimo serviço!');
        expect(response.body.data[0].content).toBe('Este é um conteúdo incrível.');
      });
    });

    describe('Fallback to English when translated content is missing', () => {
      const testimonialWithMissingTranslations = {
        id: 3,
        name: 'Test User',
        company: 'Test Company',
        company_logo: '/uploads/logo3.png',
        headline: 'English headline',
        headline_ar: null,  // Missing Arabic translation
        headline_es: '',     // Empty Spanish translation
        headline_pt: 'Portuguese headline',
        content: 'English content',
        content_ar: null,    // Missing Arabic content
        content_es: 'Spanish content',
        content_pt: null,    // Missing Portuguese content
        image: '/uploads/image3.png',
        rating: 4,
        created_at: '2026-01-03T00:00:00Z',
        updated_at: '2026-01-03T00:00:00Z',
      };

      it('should fallback to English headline when Arabic headline is null', async () => {
        mockGet.mockReturnValue({ total: 1 });
        mockAll.mockReturnValue([testimonialWithMissingTranslations]);

        const response = await request(app).get('/api/testimonials?lang=ar');

        expect(response.status).toBe(200);
        expect(response.body.data[0].headline).toBe('English headline');
        expect(response.body.data[0].content).toBe('English content');
      });

      it('should fallback to English headline when Spanish headline is empty', async () => {
        mockGet.mockReturnValue({ total: 1 });
        mockAll.mockReturnValue([testimonialWithMissingTranslations]);

        const response = await request(app).get('/api/testimonials?lang=es');

        expect(response.status).toBe(200);
        expect(response.body.data[0].headline).toBe('English headline');
        expect(response.body.data[0].content).toBe('Spanish content');
      });

      it('should use Portuguese headline but fallback to English content when Portuguese content is null', async () => {
        mockGet.mockReturnValue({ total: 1 });
        mockAll.mockReturnValue([testimonialWithMissingTranslations]);

        const response = await request(app).get('/api/testimonials?lang=pt');

        expect(response.status).toBe(200);
        expect(response.body.data[0].headline).toBe('Portuguese headline');
        expect(response.body.data[0].content).toBe('English content');
      });
    });

    describe('Invalid language codes - should default to English', () => {
      it('should default to English for invalid language code: fr', async () => {
        mockGet.mockReturnValue({ total: 2 });
        mockAll.mockReturnValue(mockTestimonials);

        const response = await request(app).get('/api/testimonials?lang=fr');

        expect(response.status).toBe(200);
        expect(response.body.data[0].headline).toBe('Great service!');
        expect(response.body.data[0].content).toBe('This is amazing content.');
      });

      it('should default to English for invalid language code: xyz', async () => {
        mockGet.mockReturnValue({ total: 2 });
        mockAll.mockReturnValue(mockTestimonials);

        const response = await request(app).get('/api/testimonials?lang=xyz');

        expect(response.status).toBe(200);
        expect(response.body.data[0].headline).toBe('Great service!');
        expect(response.body.data[0].content).toBe('This is amazing content.');
      });
    });

    it('should handle pagination correctly', async () => {
      mockGet.mockReturnValue({ total: 2 });
      mockAll.mockReturnValue(mockTestimonials);

      const response = await request(app).get('/api/testimonials?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasMore: false,
      });
    });

    it('should handle database errors gracefully', async () => {
      mockPrepare.mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app).get('/api/testimonials');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Server error');
    });
  });

  describe('GET /:id - Get single testimonial with localization', () => {
    const mockTestimonial = {
      id: 1,
      name: 'John Doe',
      company: 'Tech Corp',
      company_logo: '/uploads/logo1.png',
      headline: 'Great service!',
      headline_ar: 'خدمة رائعة!',
      headline_es: '¡Excelente servicio!',
      headline_pt: 'Ótimo serviço!',
      content: 'This is amazing content.',
      content_ar: 'هذا محتوى مذهل.',
      content_es: 'Este es un contenido increíble.',
      content_pt: 'Este é um conteúdo incrível.',
      image: '/uploads/image1.png',
      rating: 5,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    describe('Valid language codes', () => {
      it('should return English content by default', async () => {
        mockGet.mockReturnValue(mockTestimonial);

        const response = await request(app).get('/api/testimonials/1');

        expect(response.status).toBe(200);
        expect(response.body.headline).toBe('Great service!');
        expect(response.body.content).toBe('This is amazing content.');
      });

      it('should return English content when lang=en', async () => {
        mockGet.mockReturnValue(mockTestimonial);

        const response = await request(app).get('/api/testimonials/1?lang=en');

        expect(response.status).toBe(200);
        expect(response.body.headline).toBe('Great service!');
        expect(response.body.content).toBe('This is amazing content.');
      });

      it('should return Arabic content when lang=ar', async () => {
        mockGet.mockReturnValue(mockTestimonial);

        const response = await request(app).get('/api/testimonials/1?lang=ar');

        expect(response.status).toBe(200);
        expect(response.body.headline).toBe('خدمة رائعة!');
        expect(response.body.content).toBe('هذا محتوى مذهل.');
      });

      it('should return Spanish content when lang=es', async () => {
        mockGet.mockReturnValue(mockTestimonial);

        const response = await request(app).get('/api/testimonials/1?lang=es');

        expect(response.status).toBe(200);
        expect(response.body.headline).toBe('¡Excelente servicio!');
        expect(response.body.content).toBe('Este es un contenido increíble.');
      });

      it('should return Portuguese content when lang=pt', async () => {
        mockGet.mockReturnValue(mockTestimonial);

        const response = await request(app).get('/api/testimonials/1?lang=pt');

        expect(response.status).toBe(200);
        expect(response.body.headline).toBe('Ótimo serviço!');
        expect(response.body.content).toBe('Este é um conteúdo incrível.');
      });
    });

    describe('Fallback to English when translated content is missing', () => {
      const testimonialWithPartialTranslations = {
        id: 2,
        name: 'Jane Smith',
        company: 'Business Inc',
        company_logo: '/uploads/logo2.png',
        headline: 'English only headline',
        headline_ar: null,
        headline_es: null,
        headline_pt: null,
        content: 'English only content',
        content_ar: 'Arabic content only',
        content_es: null,
        content_pt: null,
        image: '/uploads/image2.png',
        rating: 5,
        created_at: '2026-01-02T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      };

      it('should fallback to English when Arabic translations are missing', async () => {
        mockGet.mockReturnValue(testimonialWithPartialTranslations);

        const response = await request(app).get('/api/testimonials/2?lang=ar');

        expect(response.status).toBe(200);
        expect(response.body.headline).toBe('English only headline');
        expect(response.body.content).toBe('Arabic content only');
      });

      it('should fallback to English when Spanish translations are missing', async () => {
        mockGet.mockReturnValue(testimonialWithPartialTranslations);

        const response = await request(app).get('/api/testimonials/2?lang=es');

        expect(response.status).toBe(200);
        expect(response.body.headline).toBe('English only headline');
        expect(response.body.content).toBe('English only content');
      });
    });

    it('should return 404 for non-existent testimonial', async () => {
      mockGet.mockReturnValue(undefined);

      const response = await request(app).get('/api/testimonials/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Testimonial not found');
    });

    it('should handle database errors gracefully', async () => {
      mockPrepare.mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app).get('/api/testimonials/1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Server error');
    });
  });

  describe('Language validation edge cases', () => {
    it('should handle null lang parameter', async () => {
      mockGet.mockReturnValue({ total: 0 });
      mockAll.mockReturnValue([]);

      const response = await request(app).get('/api/testimonials').query({ lang: null });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle numeric lang parameter', async () => {
      mockGet.mockReturnValue({ total: 0 });
      mockAll.mockReturnValue([]);

      const response = await request(app).get('/api/testimonials?lang=123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle special characters in lang parameter', async () => {
      mockGet.mockReturnValue({ total: 0 });
      mockAll.mockReturnValue([]);

      const response = await request(app).get('/api/testimonials?lang=<script>alert("xss")</script>');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });
});
