import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import policiesRouter from '../policies.js';
import { getDb } from '../../config/database.js';

// Mock the database module
vi.mock('../../config/database.js', () => ({
  getDb: vi.fn(),
}));

// Mock the auth middleware
vi.mock('../../middleware/auth.js', () => ({
  authenticateToken: vi.fn((req, res, next) => next()),
}));

describe('Policies API - Localization', () => {
  let app: Express;
  let mockPrepare: Mock;
  let mockGet: Mock;
  let mockAll: Mock;
  let mockRun: Mock;
  let mockDb: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/policies', policiesRouter);

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

    mockDb = {
      prepare: mockPrepare,
    };

    (getDb as Mock).mockReturnValue(mockDb);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET / - List all policy pages with localization', () => {
    const mockPolicyPages = [
      {
        id: 1,
        slug: 'privacy-policy',
        title_en: 'Privacy Policy',
        title_ar: 'سياسة الخصوصية',
        title_es: 'Política de Privacidad',
        title_pt: 'Política de Privacidade',
        content_en: 'This is our privacy policy.',
        content_ar: 'هذه سياسة الخصوصية لدينا.',
        content_es: 'Esta es nuestra política de privacidad.',
        content_pt: 'Esta é a nossa política de privacidade.',
        meta_description: 'Our privacy policy',
        status: 'published',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 2,
        slug: 'terms-of-service',
        title_en: 'Terms of Service',
        title_ar: 'شروط الخدمة',
        title_es: 'Términos de Servicio',
        title_pt: 'Termos de Serviço',
        content_en: 'These are our terms of service.',
        content_ar: 'هذه شروط الخدمة لدينا.',
        content_es: 'Estos son nuestros términos de servicio.',
        content_pt: 'Estes são os nossos termos de serviço.',
        meta_description: 'Our terms of service',
        status: 'published',
        created_at: '2026-01-02T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ];

    describe('Valid language codes', () => {
      it('should return English content by default (no lang parameter)', async () => {
        mockAll.mockReturnValue(mockPolicyPages);

        const response = await request(app).get('/api/policies');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveLength(2);

        // Verify English content is returned
        expect(response.body.data[0].title).toBe('Privacy Policy');
        expect(response.body.data[0].content).toBe('This is our privacy policy.');
        expect(response.body.data[1].title).toBe('Terms of Service');
        expect(response.body.data[1].content).toBe('These are our terms of service.');
      });

      it('should return English content when lang=en', async () => {
        mockAll.mockReturnValue(mockPolicyPages);

        const response = await request(app).get('/api/policies?lang=en');

        expect(response.status).toBe(200);
        expect(response.body.data[0].title).toBe('Privacy Policy');
        expect(response.body.data[0].content).toBe('This is our privacy policy.');
      });

      it('should return Arabic content when lang=ar', async () => {
        mockAll.mockReturnValue(mockPolicyPages);

        const response = await request(app).get('/api/policies?lang=ar');

        expect(response.status).toBe(200);
        expect(response.body.data[0].title).toBe('سياسة الخصوصية');
        expect(response.body.data[0].content).toBe('هذه سياسة الخصوصية لدينا.');
      });

      it('should return Spanish content when lang=es', async () => {
        mockAll.mockReturnValue(mockPolicyPages);

        const response = await request(app).get('/api/policies?lang=es');

        expect(response.status).toBe(200);
        expect(response.body.data[0].title).toBe('Política de Privacidad');
        expect(response.body.data[0].content).toBe('Esta es nuestra política de privacidad.');
      });

      it('should return Portuguese content when lang=pt', async () => {
        mockAll.mockReturnValue(mockPolicyPages);

        const response = await request(app).get('/api/policies?lang=pt');

        expect(response.status).toBe(200);
        expect(response.body.data[0].title).toBe('Política de Privacidade');
        expect(response.body.data[0].content).toBe('Esta é a nossa política de privacidade.');
      });
    });

    describe('Fallback to English when translated content is missing', () => {
      const policyWithMissingTranslations = {
        id: 3,
        slug: 'refund-policy',
        title_en: 'Refund Policy',
        title_ar: null,  // Missing Arabic translation
        title_es: '',    // Empty Spanish translation
        title_pt: 'Política de Reembolso',
        content_en: 'Our refund policy details.',
        content_ar: null, // Missing Arabic content
        content_es: 'Detalles de la política de reembolso.',
        content_pt: null, // Missing Portuguese content
        meta_description: 'Refund policy',
        status: 'published',
        created_at: '2026-01-03T00:00:00Z',
        updated_at: '2026-01-03T00:00:00Z',
      };

      it('should fallback to English title when Arabic title is null', async () => {
        mockAll.mockReturnValue([policyWithMissingTranslations]);

        const response = await request(app).get('/api/policies?lang=ar');

        expect(response.status).toBe(200);
        expect(response.body.data[0].title).toBe('Refund Policy');
        expect(response.body.data[0].content).toBe('Our refund policy details.');
      });

      it('should fallback to English title when Spanish title is empty', async () => {
        mockAll.mockReturnValue([policyWithMissingTranslations]);

        const response = await request(app).get('/api/policies?lang=es');

        expect(response.status).toBe(200);
        expect(response.body.data[0].title).toBe('Refund Policy');
        expect(response.body.data[0].content).toBe('Detalles de la política de reembolso.');
      });

      it('should use Portuguese title but fallback to English content when Portuguese content is null', async () => {
        mockAll.mockReturnValue([policyWithMissingTranslations]);

        const response = await request(app).get('/api/policies?lang=pt');

        expect(response.status).toBe(200);
        expect(response.body.data[0].title).toBe('Política de Reembolso');
        expect(response.body.data[0].content).toBe('Our refund policy details.');
      });
    });

    describe('Invalid language codes - should default to English', () => {
      it('should default to English for invalid language code: fr', async () => {
        mockAll.mockReturnValue(mockPolicyPages);

        const response = await request(app).get('/api/policies?lang=fr');

        expect(response.status).toBe(200);
        expect(response.body.data[0].title).toBe('Privacy Policy');
        expect(response.body.data[0].content).toBe('This is our privacy policy.');
      });

      it('should default to English for invalid language code: xyz', async () => {
        mockAll.mockReturnValue(mockPolicyPages);

        const response = await request(app).get('/api/policies?lang=xyz');

        expect(response.status).toBe(200);
        expect(response.body.data[0].title).toBe('Privacy Policy');
        expect(response.body.data[0].content).toBe('This is our privacy policy.');
      });
    });

    it('should handle database errors gracefully', async () => {
      mockPrepare.mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app).get('/api/policies?lang=en');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Server error');
    });
  });

  describe('GET /:slug - Get single policy page', () => {
    const mockPolicyPage = {
      id: 1,
      slug: 'privacy-policy',
      title_en: 'Privacy Policy',
      title_ar: 'سياسة الخصوصية',
      title_es: 'Política de Privacidad',
      title_pt: 'Política de Privacidade',
      content_en: 'This is our privacy policy content.',
      content_ar: 'هذا محتوى سياسة الخصوصية لدينا.',
      content_es: 'Este es el contenido de nuestra política de privacidad.',
      content_pt: 'Este é o conteúdo da nossa política de privacidade.',
      meta_description: 'Our privacy policy',
      status: 'published',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    describe('Valid language codes', () => {
      it('should return English content by default (no lang parameter)', async () => {
        mockGet.mockReturnValue(mockPolicyPage);

        const response = await request(app).get('/api/policies/privacy-policy');

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Privacy Policy');
        expect(response.body.content).toBe('This is our privacy policy content.');
      });

      it('should return English content when lang=en', async () => {
        mockGet.mockReturnValue(mockPolicyPage);

        const response = await request(app).get('/api/policies/privacy-policy?lang=en');

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Privacy Policy');
        expect(response.body.content).toBe('This is our privacy policy content.');
      });

      it('should return Arabic content when lang=ar', async () => {
        mockGet.mockReturnValue(mockPolicyPage);

        const response = await request(app).get('/api/policies/privacy-policy?lang=ar');

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('سياسة الخصوصية');
        expect(response.body.content).toBe('هذا محتوى سياسة الخصوصية لدينا.');
      });

      it('should return Spanish content when lang=es', async () => {
        mockGet.mockReturnValue(mockPolicyPage);

        const response = await request(app).get('/api/policies/privacy-policy?lang=es');

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Política de Privacidad');
        expect(response.body.content).toBe('Este es el contenido de nuestra política de privacidad.');
      });

      it('should return Portuguese content when lang=pt', async () => {
        mockGet.mockReturnValue(mockPolicyPage);

        const response = await request(app).get('/api/policies/privacy-policy?lang=pt');

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Política de Privacidade');
        expect(response.body.content).toBe('Este é o conteúdo da nossa política de privacidade.');
      });
    });

    describe('Fallback to English when translated content is missing', () => {
      const policyWithMissingTranslations = {
        id: 3,
        slug: 'refund-policy',
        title_en: 'Refund Policy',
        title_ar: null,  // Missing Arabic translation
        title_es: '',    // Empty Spanish translation
        title_pt: 'Política de Reembolso',
        content_en: 'Our refund policy details.',
        content_ar: null, // Missing Arabic content
        content_es: 'Detalles de la política de reembolso.',
        content_pt: null, // Missing Portuguese content
        meta_description: 'Refund policy',
        status: 'published',
        created_at: '2026-01-03T00:00:00Z',
        updated_at: '2026-01-03T00:00:00Z',
      };

      it('should fallback to English when Arabic translation is null', async () => {
        mockGet.mockReturnValue(policyWithMissingTranslations);

        const response = await request(app).get('/api/policies/refund-policy?lang=ar');

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Refund Policy');
        expect(response.body.content).toBe('Our refund policy details.');
      });

      it('should use Spanish content but fallback to English title when Spanish title is empty', async () => {
        mockGet.mockReturnValue(policyWithMissingTranslations);

        const response = await request(app).get('/api/policies/refund-policy?lang=es');

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Refund Policy');
        expect(response.body.content).toBe('Detalles de la política de reembolso.');
      });

      it('should use Portuguese title but fallback to English content when Portuguese content is null', async () => {
        mockGet.mockReturnValue(policyWithMissingTranslations);

        const response = await request(app).get('/api/policies/refund-policy?lang=pt');

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Política de Reembolso');
        expect(response.body.content).toBe('Our refund policy details.');
      });
    });

    describe('Invalid language codes - should default to en', () => {
      it('should default to en for invalid language code: fr', async () => {
        mockGet.mockReturnValue(mockPolicyPage);

        const response = await request(app).get('/api/policies/privacy-policy?lang=fr');

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Privacy Policy');
        expect(response.body.content).toBe('This is our privacy policy content.');
      });

      it('should default to en for invalid language code: invalid', async () => {
        mockGet.mockReturnValue(mockPolicyPage);

        const response = await request(app).get('/api/policies/privacy-policy?lang=invalid');

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Privacy Policy');
        expect(response.body.content).toBe('This is our privacy policy content.');
      });
    });

    describe('SQL injection prevention', () => {
      it('should handle SQL injection attempts by defaulting to English', async () => {
        const injectionPayloads = [
          'en; DROP TABLE policy_pages; --',
          'en\' OR \'1\'=\'1',
          'en; DELETE FROM policy_pages WHERE 1=1; --',
          'en UNION SELECT * FROM users --',
          '\'; DROP TABLE users; --',
          '../../../etc/passwd',
        ];

        for (const payload of injectionPayloads) {
          vi.clearAllMocks();
          mockGet.mockReturnValue(mockPolicyPage);

          const response = await request(app).get(
            `/api/policies/privacy-policy?lang=${encodeURIComponent(payload)}`
          );

          // Should still return 200 with English content (sanitized)
          expect(response.status).toBe(200);
          expect(response.body.title).toBe('Privacy Policy');
          expect(response.body.content).toBe('This is our privacy policy content.');
        }
      });
    });

    it('should return 404 for non-existent policy page', async () => {
      mockGet.mockReturnValue(undefined);

      const response = await request(app).get('/api/policies/non-existent?lang=en');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Policy page not found');
    });

    it('should handle database errors gracefully', async () => {
      mockPrepare.mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app).get('/api/policies/privacy-policy?lang=en');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Server error');
    });
  });

  describe('Language validation edge cases', () => {
    it('should handle null lang parameter', async () => {
      mockAll.mockReturnValue([]);

      const response = await request(app).get('/api/policies').query({ lang: null });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle undefined lang parameter', async () => {
      mockAll.mockReturnValue([]);

      const response = await request(app).get('/api/policies');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle numeric lang parameter', async () => {
      mockAll.mockReturnValue([]);

      const response = await request(app).get('/api/policies?lang=123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle special characters in lang parameter', async () => {
      mockAll.mockReturnValue([]);

      const response = await request(app).get('/api/policies?lang=<script>alert("xss")</script>');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });
});
