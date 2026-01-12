import express from 'express';
import { getDb } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

interface PolicyPage {
  id: number;
  slug: string;
  title?: string;
  title_en: string;
  title_ar: string | null;
  title_es: string | null;
  title_pt: string | null;
  content?: string;
  content_en: string;
  content_ar: string | null;
  content_es: string | null;
  content_pt: string | null;
  meta_description: string | null;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

const router = express.Router();

// Allowed languages based on PolicyPage interface columns
const ALLOWED_LANGUAGES = ['en', 'ar', 'es', 'pt'] as const;

// Helper function to validate language parameter
function validateLanguage(lang: string | undefined): string {
  if (!lang || !ALLOWED_LANGUAGES.includes(lang as any)) {
    return 'en';
  }
  return lang;
}

// Helper function to localize policy content
function localizePolicy(policy: any, lang: string) {
  let title = policy.title_en;
  let content = policy.content_en;

  // Use language-specific content if available
  if (lang === 'ar' && policy.title_ar) {
    title = policy.title_ar;
    content = policy.content_ar || policy.content_en;
  } else if (lang === 'es' && policy.title_es) {
    title = policy.title_es;
    content = policy.content_es || policy.content_en;
  } else if (lang === 'pt' && policy.title_pt) {
    title = policy.title_pt;
    content = policy.content_pt || policy.content_en;
  }

  return {
    ...policy,
    title,
    content
  };
}

// Get all policy pages (public)
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const lang = validateLanguage(req.query.lang as string);

    const pages = db.prepare(`
      SELECT *
      FROM policy_pages
      WHERE status = 'published'
      ORDER BY title_en
    `).all();

    // Localize each policy based on requested language
    const localizedPages = (pages as any[]).map(page => localizePolicy(page, lang));

    res.json({ data: localizedPages });
  } catch (error) {
    console.error('Error fetching policy pages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single policy page by slug (public)
router.get('/:slug', (req, res) => {
  try {
    const db = getDb();
    const { slug } = req.params;
    const lang = validateLanguage(req.query.lang as string);

    const page = db.prepare(`
      SELECT *
      FROM policy_pages
      WHERE slug = ? AND status = 'published'
    `).get(slug);

    if (!page) {
      return res.status(404).json({ error: 'Policy page not found' });
    }

    // Localize the policy based on requested language
    const localizedPage = localizePolicy(page, lang);

    res.json(localizedPage);
  } catch (error) {
    console.error('Error fetching policy page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all policy pages for admin (includes drafts)
router.get('/admin/all', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    const pages = db.prepare(`
      SELECT *
      FROM policy_pages
      ORDER BY created_at DESC
    `).all();

    res.json({ data: pages });
  } catch (error) {
    console.error('Error fetching policy pages for admin:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single policy page for admin
router.get('/admin/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const page = db.prepare('SELECT * FROM policy_pages WHERE id = ?').get(id);

    if (!page) {
      return res.status(404).json({ error: 'Policy page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching policy page for admin:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new policy page (admin only)
router.post('/admin', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const {
      slug,
      title_en,
      title_ar,
      title_es,
      title_pt,
      content_en,
      content_ar,
      content_es,
      content_pt,
      meta_description,
      status = 'published'
    } = req.body;

    if (!slug || !title_en || !content_en) {
      return res.status(400).json({ error: 'Slug, title (English), and content (English) are required' });
    }

    // Check if slug already exists
    const existing = db.prepare('SELECT id FROM policy_pages WHERE slug = ?').get(slug);
    if (existing) {
      return res.status(400).json({ error: 'A policy page with this slug already exists' });
    }

    const result = db.prepare(`
      INSERT INTO policy_pages (
        slug, title_en, title_ar, title_es, title_pt,
        content_en, content_ar, content_es, content_pt,
        meta_description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      slug, title_en, title_ar || null, title_es || null, title_pt || null,
      content_en, content_ar || null, content_es || null, content_pt || null,
      meta_description || null, status
    );

    const newPage = db.prepare('SELECT * FROM policy_pages WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Policy page created successfully',
      data: newPage
    });
  } catch (error) {
    console.error('Error creating policy page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update policy page (admin only)
router.put('/admin/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const {
      slug,
      title_en,
      title_ar,
      title_es,
      title_pt,
      content_en,
      content_ar,
      content_es,
      content_pt,
      meta_description,
      status
    } = req.body;

    // Check if page exists
    const existing = db.prepare('SELECT * FROM policy_pages WHERE id = ?').get(id) as PolicyPage | undefined;
    if (!existing) {
      return res.status(404).json({ error: 'Policy page not found' });
    }

    // Check if slug is being changed and if new slug already exists
    if (slug && slug !== existing.slug) {
      const slugExists = db.prepare('SELECT id FROM policy_pages WHERE slug = ? AND id != ?').get(slug, id);
      if (slugExists) {
        return res.status(400).json({ error: 'A policy page with this slug already exists' });
      }
    }

    db.prepare(`
      UPDATE policy_pages SET
        slug = COALESCE(?, slug),
        title_en = COALESCE(?, title_en),
        title_ar = ?,
        title_es = ?,
        title_pt = ?,
        content_en = COALESCE(?, content_en),
        content_ar = ?,
        content_es = ?,
        content_pt = ?,
        meta_description = ?,
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      slug, title_en,
      title_ar !== undefined ? title_ar : existing.title_ar,
      title_es !== undefined ? title_es : existing.title_es,
      title_pt !== undefined ? title_pt : existing.title_pt,
      content_en,
      content_ar !== undefined ? content_ar : existing.content_ar,
      content_es !== undefined ? content_es : existing.content_es,
      content_pt !== undefined ? content_pt : existing.content_pt,
      meta_description !== undefined ? meta_description : existing.meta_description,
      status,
      id
    );

    const updatedPage = db.prepare('SELECT * FROM policy_pages WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Policy page updated successfully',
      data: updatedPage
    });
  } catch (error) {
    console.error('Error updating policy page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete policy page (admin only)
router.delete('/admin/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM policy_pages WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Policy page not found' });
    }

    db.prepare('DELETE FROM policy_pages WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Policy page deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting policy page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
