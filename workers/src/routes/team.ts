/**
 * Team Members Management Routes for Cloudflare Workers
 *
 * Provides endpoints for managing team members including public listing,
 * admin CRUD operations, and statistics.
 *
 * Endpoints:
 * - GET /admin/all    - Get all team members including inactive (protected)
 * - GET /admin/:id    - Get single team member by ID (protected)
 * - POST /admin/create - Create new team member (protected)
 * - PUT /admin/:id    - Update team member (protected)
 * - DELETE /admin/:id - Delete team member (protected)
 * - GET /stats        - Get team member statistics (protected)
 * - GET /             - Get active team members (public)
 * - GET /:id          - Get single team member by ID (public)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import { authenticateToken } from '../middleware/auth';
import { createStorageService } from '../services/storage';

// Team member record type from database
interface TeamMemberRecord {
  id: number;
  name_en: string;
  name_ar: string | null;
  name_es: string | null;
  name_pt: string | null;
  title_en: string;
  title_ar: string | null;
  title_es: string | null;
  title_pt: string | null;
  department: string;
  bio_en: string | null;
  bio_ar: string | null;
  bio_es: string | null;
  bio_pt: string | null;
  email: string | null;
  linkedin: string | null;
  image: string | null;
  display_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string | null;
}

// Localized team member response
interface LocalizedTeamMember extends TeamMemberRecord {
  name: string;
  title: string;
  bio: string | null;
}

// Zod schemas for validation

/**
 * Schema for creating a new team member
 */
const createTeamMemberSchema = z.object({
  name_en: z.string().min(1, 'English name is required').max(200, 'Name is too long'),
  name_ar: z.string().max(200, 'Name is too long').optional().nullable(),
  name_es: z.string().max(200, 'Name is too long').optional().nullable(),
  name_pt: z.string().max(200, 'Name is too long').optional().nullable(),
  title_en: z.string().min(1, 'English title is required').max(200, 'Title is too long'),
  title_ar: z.string().max(200, 'Title is too long').optional().nullable(),
  title_es: z.string().max(200, 'Title is too long').optional().nullable(),
  title_pt: z.string().max(200, 'Title is too long').optional().nullable(),
  department: z.string().min(1, 'Department is required').max(100, 'Department is too long'),
  bio_en: z.string().optional().nullable(),
  bio_ar: z.string().optional().nullable(),
  bio_es: z.string().optional().nullable(),
  bio_pt: z.string().optional().nullable(),
  email: z.string().email('Invalid email format').max(200).optional().nullable(),
  linkedin: z.string().url('Invalid LinkedIn URL').max(500).optional().nullable(),
  display_order: z.union([
    z.number().int().min(0),
    z.string().regex(/^\d+$/).transform(Number)
  ]).optional().default(0),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

/**
 * Schema for updating a team member
 */
const updateTeamMemberSchema = createTeamMemberSchema.partial();

/**
 * Schema for pagination query parameters
 */
const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  lang: z.string().max(10).optional(),
});

/**
 * Schema for team member ID parameter
 */
const teamMemberIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid team member ID'),
});

// Helper function to localize team member content
function localizeMember(member: TeamMemberRecord, lang: string): LocalizedTeamMember {
  let name = member.name_en;
  let title = member.title_en;
  let bio = member.bio_en;

  // Use language-specific content if available
  if (lang === 'ar' && member.name_ar) {
    name = member.name_ar;
    title = member.title_ar || member.title_en;
    bio = member.bio_ar || member.bio_en;
  } else if (lang === 'es' && member.name_es) {
    name = member.name_es;
    title = member.title_es || member.title_en;
    bio = member.bio_es || member.bio_en;
  } else if (lang === 'pt' && member.name_pt) {
    name = member.name_pt;
    title = member.title_pt || member.title_en;
    bio = member.bio_pt || member.bio_en;
  }

  return {
    ...member,
    name,
    title,
    bio,
  };
}

// Create team members router
const teamRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// Admin Routes (Protected) - MUST come before /:id route
// ============================================================================

/**
 * GET /api/team/admin/all
 * Get all team members including inactive (protected)
 */
teamRoutes.get('/admin/all', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);

    const members = await db.query<TeamMemberRecord>(
      'SELECT * FROM team_members ORDER BY display_order ASC, created_at DESC'
    );

    return c.json(members);
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * GET /api/team/admin/:id
 * Get single team member by ID (protected)
 */
teamRoutes.get(
  '/admin/:id',
  authenticateToken,
  zValidator('param', teamMemberIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid team member ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const member = await db.queryFirst<TeamMemberRecord>(
        'SELECT * FROM team_members WHERE id = ?',
        [id]
      );

      if (!member) {
        return c.json({ error: 'Team member not found' }, 404);
      }

      return c.json(member);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * POST /api/team/admin/create
 * Create new team member (protected)
 */
teamRoutes.post('/admin/create', authenticateToken, async (c) => {
  try {
    const contentType = c.req.header('Content-Type') || '';
    const db = createDatabaseService(c.env);
    let data: z.infer<typeof createTeamMemberSchema>;
    let imagePath: string | null = null;

    // Handle multipart form data (with image upload)
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
      const parseResult = createTeamMemberSchema.safeParse({
        name_en: formFields.name_en,
        name_ar: formFields.name_ar,
        name_es: formFields.name_es,
        name_pt: formFields.name_pt,
        title_en: formFields.title_en,
        title_ar: formFields.title_ar,
        title_es: formFields.title_es,
        title_pt: formFields.title_pt,
        department: formFields.department,
        bio_en: formFields.bio_en,
        bio_ar: formFields.bio_ar,
        bio_es: formFields.bio_es,
        bio_pt: formFields.bio_pt,
        email: formFields.email,
        linkedin: formFields.linkedin,
        display_order: formFields.display_order,
        status: formFields.status,
      });

      if (!parseResult.success) {
        return c.json(
          {
            error: 'Validation failed',
            details: parseResult.error.flatten().fieldErrors,
          },
          400
        );
      }

      data = parseResult.data;

      // Handle image upload
      const imageFile = formData.get('image');
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        const storage = createStorageService(c.env);
        const arrayBuffer = await imageFile.arrayBuffer();

        try {
          const uploadResult = await storage.uploadImage(arrayBuffer, {
            originalName: imageFile.name,
            contentType: imageFile.type,
            size: imageFile.size,
            category: 'team',
          });
          imagePath = uploadResult.url;
        } catch (uploadError) {
          return c.json(
            {
              error: uploadError instanceof Error ? uploadError.message : 'Image upload failed',
            },
            400
          );
        }
      }
    } else {
      // Handle JSON body
      const body = await c.req.json();
      const parseResult = createTeamMemberSchema.safeParse(body);

      if (!parseResult.success) {
        return c.json(
          {
            error: 'Validation failed',
            details: parseResult.error.flatten().fieldErrors,
          },
          400
        );
      }

      data = parseResult.data;
    }

    // Insert team member
    const memberId = await db.insert('team_members', {
      name_en: data.name_en,
      name_ar: data.name_ar || null,
      name_es: data.name_es || null,
      name_pt: data.name_pt || null,
      title_en: data.title_en,
      title_ar: data.title_ar || null,
      title_es: data.title_es || null,
      title_pt: data.title_pt || null,
      department: data.department,
      bio_en: data.bio_en || null,
      bio_ar: data.bio_ar || null,
      bio_es: data.bio_es || null,
      bio_pt: data.bio_pt || null,
      email: data.email || null,
      linkedin: data.linkedin || null,
      image: imagePath,
      display_order: data.display_order || 0,
      status: data.status || 'active',
    });

    if (!memberId) {
      return c.json({ error: 'Failed to create team member' }, 500);
    }

    // Fetch the created team member
    const newMember = await db.queryFirst<TeamMemberRecord>(
      'SELECT * FROM team_members WHERE id = ?',
      [memberId]
    );

    return c.json(newMember, 201);
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * PUT /api/team/admin/:id
 * Update team member (protected)
 */
teamRoutes.put(
  '/admin/:id',
  authenticateToken,
  zValidator('param', teamMemberIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid team member ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const contentType = c.req.header('Content-Type') || '';
      const db = createDatabaseService(c.env);

      // Check if team member exists
      const existing = await db.queryFirst<TeamMemberRecord>(
        'SELECT * FROM team_members WHERE id = ?',
        [id]
      );

      if (!existing) {
        return c.json({ error: 'Team member not found' }, 404);
      }

      let data: z.infer<typeof updateTeamMemberSchema>;
      let imagePath: string | null = existing.image;

      // Handle multipart form data (with image upload)
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
        const parseResult = updateTeamMemberSchema.safeParse({
          name_en: formFields.name_en,
          name_ar: formFields.name_ar,
          name_es: formFields.name_es,
          name_pt: formFields.name_pt,
          title_en: formFields.title_en,
          title_ar: formFields.title_ar,
          title_es: formFields.title_es,
          title_pt: formFields.title_pt,
          department: formFields.department,
          bio_en: formFields.bio_en,
          bio_ar: formFields.bio_ar,
          bio_es: formFields.bio_es,
          bio_pt: formFields.bio_pt,
          email: formFields.email,
          linkedin: formFields.linkedin,
          display_order: formFields.display_order,
          status: formFields.status,
        });

        if (!parseResult.success) {
          return c.json(
            {
              error: 'Validation failed',
              details: parseResult.error.flatten().fieldErrors,
            },
            400
          );
        }

        data = parseResult.data;

        // Handle image upload
        const imageFile = formData.get('image');
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
          const storage = createStorageService(c.env);
          const arrayBuffer = await imageFile.arrayBuffer();

          try {
            const uploadResult = await storage.uploadImage(arrayBuffer, {
              originalName: imageFile.name,
              contentType: imageFile.type,
              size: imageFile.size,
              category: 'team',
            });
            imagePath = uploadResult.url;
          } catch (uploadError) {
            return c.json(
              {
                error: uploadError instanceof Error ? uploadError.message : 'Image upload failed',
              },
              400
            );
          }
        }
      } else {
        // Handle JSON body
        const body = await c.req.json();
        const parseResult = updateTeamMemberSchema.safeParse(body);

        if (!parseResult.success) {
          return c.json(
            {
              error: 'Validation failed',
              details: parseResult.error.flatten().fieldErrors,
            },
            400
          );
        }

        data = parseResult.data;
      }

      // Build update data
      const updateData: Record<string, unknown> = {
        image: imagePath,
        updated_at: new Date().toISOString(),
      };

      if (data.name_en !== undefined) updateData.name_en = data.name_en;
      if (data.name_ar !== undefined) updateData.name_ar = data.name_ar || null;
      if (data.name_es !== undefined) updateData.name_es = data.name_es || null;
      if (data.name_pt !== undefined) updateData.name_pt = data.name_pt || null;
      if (data.title_en !== undefined) updateData.title_en = data.title_en;
      if (data.title_ar !== undefined) updateData.title_ar = data.title_ar || null;
      if (data.title_es !== undefined) updateData.title_es = data.title_es || null;
      if (data.title_pt !== undefined) updateData.title_pt = data.title_pt || null;
      if (data.department !== undefined) updateData.department = data.department;
      if (data.bio_en !== undefined) updateData.bio_en = data.bio_en || null;
      if (data.bio_ar !== undefined) updateData.bio_ar = data.bio_ar || null;
      if (data.bio_es !== undefined) updateData.bio_es = data.bio_es || null;
      if (data.bio_pt !== undefined) updateData.bio_pt = data.bio_pt || null;
      if (data.email !== undefined) updateData.email = data.email || null;
      if (data.linkedin !== undefined) updateData.linkedin = data.linkedin || null;
      if (data.display_order !== undefined) updateData.display_order = data.display_order;
      if (data.status !== undefined) updateData.status = data.status;

      // Update the team member
      await db.update('team_members', updateData, 'id = ?', [id]);

      // Fetch the updated team member
      const updatedMember = await db.queryFirst<TeamMemberRecord>(
        'SELECT * FROM team_members WHERE id = ?',
        [id]
      );

      return c.json(updatedMember);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * DELETE /api/team/admin/:id
 * Delete team member (protected)
 */
teamRoutes.delete(
  '/admin/:id',
  authenticateToken,
  zValidator('param', teamMemberIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid team member ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const changes = await db.delete('team_members', 'id = ?', [id]);

      if (changes === 0) {
        return c.json({ error: 'Team member not found' }, 404);
      }

      return c.json({ message: 'Team member deleted successfully' });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * GET /api/team/stats
 * Get team member statistics (protected)
 */
teamRoutes.get('/stats', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);

    // Execute all stats queries in parallel
    const [total, active, inactive, byDepartment, byStatus] = await Promise.all([
      // Total team members
      db.queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM team_members'),

      // Active team members
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM team_members WHERE status = 'active'"
      ),

      // Inactive team members
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM team_members WHERE status = 'inactive'"
      ),

      // Team members by department
      db.query<{ department: string; count: number }>(
        'SELECT department, COUNT(*) as count FROM team_members GROUP BY department ORDER BY count DESC'
      ),

      // Team members by status
      db.query<{ status: string; count: number }>(
        'SELECT status, COUNT(*) as count FROM team_members GROUP BY status'
      ),
    ]);

    return c.json({
      success: true,
      stats: {
        total: total?.count || 0,
        active: active?.count || 0,
        inactive: inactive?.count || 0,
        byDepartment,
        byStatus,
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
// Public Routes
// ============================================================================

/**
 * GET /api/team
 * Get all active team members (public)
 */
teamRoutes.get(
  '/',
  zValidator('query', paginationSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Invalid query parameters',
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const { lang = 'en' } = c.req.valid('query');
      const db = createDatabaseService(c.env);

      // Get all active team members ordered by display_order
      const members = await db.query<TeamMemberRecord>(
        "SELECT * FROM team_members WHERE status = 'active' ORDER BY display_order ASC, created_at DESC"
      );

      // Localize each member based on requested language
      const localizedMembers = members.map((member) => localizeMember(member, lang));

      return c.json(localizedMembers);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * GET /api/team/:id
 * Get single team member by ID (public) - MUST come after admin routes
 */
teamRoutes.get(
  '/:id',
  zValidator('param', teamMemberIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid team member ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const lang = c.req.query('lang') || 'en';
      const db = createDatabaseService(c.env);

      const member = await db.queryFirst<TeamMemberRecord>(
        'SELECT * FROM team_members WHERE id = ?',
        [id]
      );

      if (!member) {
        return c.json({ error: 'Team member not found' }, 404);
      }

      // Localize the member based on requested language
      return c.json(localizeMember(member, lang));
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

export { teamRoutes };
export default teamRoutes;
