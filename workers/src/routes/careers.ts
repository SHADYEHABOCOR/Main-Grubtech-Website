/**
 * Careers Management Routes for Cloudflare Workers
 *
 * Provides endpoints for job vacancies and job applications management.
 * Public endpoints for viewing jobs and submitting applications.
 * Admin endpoints for managing vacancies and reviewing applications.
 *
 * Endpoints:
 * - POST /apply              - Submit a job application with CV upload (public)
 * - GET /applications        - Get all job applications (protected)
 * - PUT /applications/:id    - Update application status (protected)
 * - DELETE /applications/:id - Delete application (protected)
 * - GET /stats               - Get careers statistics (protected)
 * - GET /                    - Get all active job vacancies (public)
 * - GET /:id                 - Get single job vacancy by ID (public)
 * - GET /admin/all           - Get all job vacancies including inactive (protected)
 * - POST /admin/create       - Create new job vacancy (protected)
 * - PUT /admin/:id           - Update job vacancy (protected)
 * - DELETE /admin/:id        - Delete job vacancy (protected)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import { authenticateToken } from '../middleware/auth';
import { createStorageService } from '../services/storage';
import { createEmailService, type LeadData } from '../services/email';

// Job application record type from database
interface JobApplicationRecord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  linkedin: string | null;
  expertise: string | null;
  cv_path: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Job vacancy record type from database
interface JobVacancyRecord {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string | null;
  requirements: string | null;
  application_link: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Zod schemas for validation

/**
 * Schema for submitting a job application
 */
const applyJobSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(50, 'Phone number is too long').optional().nullable(),
  address: z.string().max(500, 'Address is too long').optional().nullable(),
  city: z.string().max(100, 'City is too long').optional().nullable(),
  country: z.string().max(100, 'Country is too long').optional().nullable(),
  linkedin: z.string().max(500, 'LinkedIn URL is too long').optional().nullable(),
  expertise: z.string().max(500, 'Expertise is too long').optional().nullable(),
  message: z.string().max(5000, 'Message is too long').optional().nullable(),
});

/**
 * Schema for updating application status
 */
const updateApplicationStatusSchema = z.object({
  status: z.string().min(1, 'Status is required').max(50, 'Status is too long'),
});

/**
 * Schema for creating a job vacancy
 */
const createVacancySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  department: z.string().min(1, 'Department is required').max(100, 'Department is too long'),
  location: z.string().min(1, 'Location is required').max(200, 'Location is too long'),
  type: z.string().max(50, 'Type is too long').optional().default('Full-time'),
  description: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  application_link: z.string().max(500, 'Application link is too long').optional().nullable(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

/**
 * Schema for updating a job vacancy
 */
const updateVacancySchema = createVacancySchema.partial();

/**
 * Schema for pagination query parameters
 */
const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

/**
 * Schema for ID parameter
 */
const idSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID'),
});

// Create careers router
const careersRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// Job Applications Routes
// ============================================================================

/**
 * POST /api/careers/apply
 * Submit a job application with optional CV upload (public)
 */
careersRoutes.post('/apply', async (c) => {
  try {
    const contentType = c.req.header('Content-Type') || '';
    const db = createDatabaseService(c.env);
    let data: z.infer<typeof applyJobSchema>;
    let cvPath: string | null = null;

    // Handle multipart form data (with CV upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData();

      // Extract form fields
      const formFields: Record<string, string | null> = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          formFields[key] = value || null;
        }
      }

      // Validate form data
      const parseResult = applyJobSchema.safeParse({
        firstName: formFields.firstName,
        lastName: formFields.lastName,
        email: formFields.email,
        phone: formFields.phone,
        address: formFields.address,
        city: formFields.city,
        country: formFields.country,
        linkedin: formFields.linkedin,
        expertise: formFields.expertise,
        message: formFields.message,
      });

      if (!parseResult.success) {
        return c.json(
          {
            success: false,
            error: 'Validation failed',
            details: parseResult.error.flatten().fieldErrors,
          },
          400
        );
      }

      data = parseResult.data;

      // Handle CV upload
      const cvFile = formData.get('cv');
      if (cvFile && cvFile instanceof File && cvFile.size > 0) {
        const storage = createStorageService(c.env);
        const arrayBuffer = await cvFile.arrayBuffer();

        try {
          const uploadResult = await storage.uploadResume(arrayBuffer, {
            originalName: cvFile.name,
            contentType: cvFile.type,
            size: cvFile.size,
            category: 'applications',
          });
          cvPath = uploadResult.url;
        } catch (uploadError) {
          return c.json(
            {
              success: false,
              error: uploadError instanceof Error ? uploadError.message : 'CV upload failed',
            },
            400
          );
        }
      }
    } else {
      // Handle JSON body
      const body = await c.req.json();
      const parseResult = applyJobSchema.safeParse(body);

      if (!parseResult.success) {
        return c.json(
          {
            success: false,
            error: 'Validation failed',
            details: parseResult.error.flatten().fieldErrors,
          },
          400
        );
      }

      data = parseResult.data;
    }

    // Insert job application
    const applicationId = await db.insert('job_applications', {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || null,
      linkedin: data.linkedin || null,
      expertise: data.expertise || null,
      cv_path: cvPath,
      message: data.message || null,
      status: 'new',
    });

    if (!applicationId) {
      return c.json(
        {
          success: false,
          error: 'Failed to submit application',
        },
        500
      );
    }

    // Send email notifications (async, don't block response)
    const emailService = createEmailService(c.env);
    const leadData: LeadData = {
      id: applicationId,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone || undefined,
      message: data.message || undefined,
      formType: 'job_application',
    };

    // Fire and forget email sending (use waitUntil if available)
    const emailPromise = emailService.sendLeadEmails(leadData).catch(() => {
      // Silently fail - email sending shouldn't affect application submission
    });

    // Use c.executionCtx.waitUntil if available (Cloudflare Workers)
    if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
      c.executionCtx.waitUntil(emailPromise);
    }

    return c.json(
      {
        success: true,
        message: 'Application submitted successfully',
        applicationId,
      },
      201
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'Failed to submit application',
      },
      500
    );
  }
});

/**
 * GET /api/careers/applications
 * Get all job applications with pagination (protected)
 */
careersRoutes.get(
  '/applications',
  authenticateToken,
  zValidator('query', paginationSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Invalid pagination parameters',
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const { page = 1, limit = 50 } = c.req.valid('query');
      const db = createDatabaseService(c.env);

      // Ensure reasonable limits
      const safeLimit = Math.min(Math.max(1, limit), 100);
      const safePage = Math.max(1, page);
      const offset = (safePage - 1) * safeLimit;

      // Get applications with pagination
      const applications = await db.query<JobApplicationRecord>(
        `SELECT * FROM job_applications ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [safeLimit, offset]
      );

      // Get total count
      const countResult = await db.queryFirst<{ total: number }>(
        'SELECT COUNT(*) as total FROM job_applications'
      );
      const total = countResult?.total || 0;

      return c.json({
        data: applications,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        },
      });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * PUT /api/careers/applications/:id
 * Update application status (protected)
 */
careersRoutes.put(
  '/applications/:id',
  authenticateToken,
  zValidator('param', idSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid application ID' }, 400);
    }
  }),
  zValidator('json', updateApplicationStatusSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const { status } = c.req.valid('json');
      const db = createDatabaseService(c.env);

      const changes = await db.update(
        'job_applications',
        { status, updated_at: new Date().toISOString() },
        'id = ?',
        [id]
      );

      if (changes === 0) {
        return c.json({ error: 'Application not found' }, 404);
      }

      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * DELETE /api/careers/applications/:id
 * Delete application (protected)
 */
careersRoutes.delete(
  '/applications/:id',
  authenticateToken,
  zValidator('param', idSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid application ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const changes = await db.delete('job_applications', 'id = ?', [id]);

      if (changes === 0) {
        return c.json({ error: 'Application not found' }, 404);
      }

      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

// ============================================================================
// Statistics Route
// ============================================================================

/**
 * GET /api/careers/stats
 * Get careers statistics (protected)
 */
careersRoutes.get('/stats', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);

    // Execute all stats queries in parallel
    const [
      vacanciesTotal,
      vacanciesByDepartment,
      vacanciesByLocation,
      vacanciesByType,
      vacanciesByStatus,
      applicationsTotal,
      applicationsToday,
      applicationsThisWeek,
      applicationsThisMonth,
      applicationsByStatus,
    ] = await Promise.all([
      // Vacancies stats
      db.queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM job_vacancies'),
      db.query<{ department: string; count: number }>(
        'SELECT department, COUNT(*) as count FROM job_vacancies GROUP BY department'
      ),
      db.query<{ location: string; count: number }>(
        'SELECT location, COUNT(*) as count FROM job_vacancies GROUP BY location'
      ),
      db.query<{ type: string; count: number }>(
        'SELECT type, COUNT(*) as count FROM job_vacancies GROUP BY type'
      ),
      db.query<{ status: string; count: number }>(
        'SELECT status, COUNT(*) as count FROM job_vacancies GROUP BY status'
      ),

      // Applications stats
      db.queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM job_applications'),
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM job_applications WHERE DATE(created_at) = DATE('now')"
      ),
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM job_applications WHERE created_at >= datetime('now', '-7 days')"
      ),
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM job_applications WHERE created_at >= datetime('now', '-30 days')"
      ),
      db.query<{ status: string; count: number }>(
        'SELECT status, COUNT(*) as count FROM job_applications GROUP BY status'
      ),
    ]);

    return c.json({
      success: true,
      stats: {
        vacancies: {
          total: vacanciesTotal?.count || 0,
          byDepartment: vacanciesByDepartment,
          byLocation: vacanciesByLocation,
          byType: vacanciesByType,
          byStatus: vacanciesByStatus,
        },
        applications: {
          total: applicationsTotal?.count || 0,
          today: applicationsToday?.count || 0,
          thisWeek: applicationsThisWeek?.count || 0,
          thisMonth: applicationsThisMonth?.count || 0,
          byStatus: applicationsByStatus,
        },
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'Failed to fetch stats',
      },
      500
    );
  }
});

// ============================================================================
// Admin Routes (Protected) - MUST come before /:id route
// ============================================================================

/**
 * GET /api/careers/admin/all
 * Get all job vacancies including inactive (protected)
 */
careersRoutes.get(
  '/admin/all',
  authenticateToken,
  zValidator('query', paginationSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid pagination parameters' }, 400);
    }
  }),
  async (c) => {
    try {
      const { page = 1, limit = 50 } = c.req.valid('query');
      const db = createDatabaseService(c.env);

      // Ensure reasonable limits
      const safeLimit = Math.min(Math.max(1, limit), 100);
      const safePage = Math.max(1, page);
      const offset = (safePage - 1) * safeLimit;

      // Get vacancies with pagination
      const vacancies = await db.query<JobVacancyRecord>(
        `SELECT * FROM job_vacancies ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [safeLimit, offset]
      );

      // Get total count
      const countResult = await db.queryFirst<{ total: number }>(
        'SELECT COUNT(*) as total FROM job_vacancies'
      );
      const total = countResult?.total || 0;

      return c.json({
        data: vacancies,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        },
      });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * POST /api/careers/admin/create
 * Create new job vacancy (protected)
 */
careersRoutes.post(
  '/admin/create',
  authenticateToken,
  zValidator('json', createVacancySchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const db = createDatabaseService(c.env);

      // Insert vacancy
      const vacancyId = await db.insert('job_vacancies', {
        title: data.title,
        department: data.department,
        location: data.location,
        type: data.type || 'Full-time',
        description: data.description || null,
        requirements: data.requirements || null,
        application_link: data.application_link || null,
        status: data.status || 'active',
      });

      if (!vacancyId) {
        return c.json({ error: 'Failed to create vacancy' }, 500);
      }

      // Fetch the created vacancy
      const newVacancy = await db.queryFirst<JobVacancyRecord>(
        'SELECT * FROM job_vacancies WHERE id = ?',
        [vacancyId]
      );

      return c.json(newVacancy, 201);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * PUT /api/careers/admin/:id
 * Update job vacancy (protected)
 */
careersRoutes.put(
  '/admin/:id',
  authenticateToken,
  zValidator('param', idSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid vacancy ID' }, 400);
    }
  }),
  zValidator('json', updateVacancySchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const data = c.req.valid('json');
      const db = createDatabaseService(c.env);

      // Check if vacancy exists
      const existing = await db.queryFirst<JobVacancyRecord>(
        'SELECT * FROM job_vacancies WHERE id = ?',
        [id]
      );

      if (!existing) {
        return c.json({ error: 'Job vacancy not found' }, 404);
      }

      // Build update data
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.department !== undefined) updateData.department = data.department;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.type !== undefined) updateData.type = data.type || 'Full-time';
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.requirements !== undefined) updateData.requirements = data.requirements || null;
      if (data.application_link !== undefined) updateData.application_link = data.application_link || null;
      if (data.status !== undefined) updateData.status = data.status || 'active';

      // Update the vacancy
      await db.update('job_vacancies', updateData, 'id = ?', [id]);

      // Fetch the updated vacancy
      const updatedVacancy = await db.queryFirst<JobVacancyRecord>(
        'SELECT * FROM job_vacancies WHERE id = ?',
        [id]
      );

      return c.json(updatedVacancy);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * DELETE /api/careers/admin/:id
 * Delete job vacancy (protected)
 */
careersRoutes.delete(
  '/admin/:id',
  authenticateToken,
  zValidator('param', idSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid vacancy ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const changes = await db.delete('job_vacancies', 'id = ?', [id]);

      if (changes === 0) {
        return c.json({ error: 'Job vacancy not found' }, 404);
      }

      return c.json({ message: 'Job vacancy deleted successfully' });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

// ============================================================================
// Public Routes
// ============================================================================

/**
 * GET /api/careers
 * Get all active job vacancies (public)
 */
careersRoutes.get('/', async (c) => {
  try {
    const db = createDatabaseService(c.env);

    const vacancies = await db.query<JobVacancyRecord>(
      "SELECT * FROM job_vacancies WHERE status = 'active' ORDER BY created_at DESC"
    );

    return c.json(vacancies);
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * GET /api/careers/:id
 * Get single job vacancy by ID (public) - MUST come after admin routes
 */
careersRoutes.get(
  '/:id',
  zValidator('param', idSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid vacancy ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const vacancy = await db.queryFirst<JobVacancyRecord>(
        "SELECT * FROM job_vacancies WHERE id = ? AND status = 'active'",
        [id]
      );

      if (!vacancy) {
        return c.json({ error: 'Job vacancy not found' }, 404);
      }

      return c.json(vacancy);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

export { careersRoutes };
export default careersRoutes;
