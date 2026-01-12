import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure blog upload directory exists
const blogUploadDir = path.join(__dirname, '../../public/uploads/blog');
if (!fs.existsSync(blogUploadDir)) {
  fs.mkdirSync(blogUploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, blogUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper function to generate slug
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Admin routes (protected) - MUST come before /:slug route
// Get all posts including drafts
router.get('/admin/all', authenticateToken, (req, res) => {
  try {
    const posts = db.prepare('SELECT * FROM blog_posts ORDER BY created_at DESC').all();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post by ID (admin)
router.get('/admin/:id', authenticateToken, (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to localize blog post content
function localizePost(post: any, lang: string) {
  let title = post.title_en;
  let content = post.content_en;
  let excerpt = post.excerpt_en;

  // Use language-specific content if available
  if (lang === 'ar' && post.title_ar) {
    title = post.title_ar;
    content = post.content_ar || post.content_en;
    excerpt = post.excerpt_ar || post.excerpt_en;
  } else if (lang === 'es' && post.title_es) {
    title = post.title_es;
    content = post.content_es || post.content_en;
    excerpt = post.excerpt_es || post.excerpt_en;
  } else if (lang === 'pt' && post.title_pt) {
    title = post.title_pt;
    content = post.content_pt || post.content_en;
    excerpt = post.excerpt_pt || post.excerpt_en;
  }

  return {
    ...post,
    title,
    content,
    excerpt
  };
}

// Get blog stats (protected)
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = {
      total: (db.prepare('SELECT COUNT(*) as count FROM blog_posts').get() as { count: number }).count,
      today: (db.prepare("SELECT COUNT(*) as count FROM blog_posts WHERE DATE(created_at) = DATE('now')").get() as { count: number }).count,
      thisWeek: (db.prepare("SELECT COUNT(*) as count FROM blog_posts WHERE created_at >= datetime('now', '-7 days')").get() as { count: number }).count,
      thisMonth: (db.prepare("SELECT COUNT(*) as count FROM blog_posts WHERE created_at >= datetime('now', '-30 days')").get() as { count: number }).count,
      byStatus: db.prepare('SELECT status, COUNT(*) as count FROM blog_posts GROUP BY status').all(),
      byLanguage: db.prepare('SELECT language, COUNT(*) as count FROM blog_posts GROUP BY language').all()
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// Get all blog posts (public) with pagination
router.get('/', (req, res) => {
  try {
    const lang = (req.query.lang as string) || 'en';
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = db.prepare('SELECT COUNT(*) as total FROM blog_posts WHERE status = ?').get('published') as { total: number };
    const total = countResult.total;

    // Get paginated posts
    const posts = db.prepare('SELECT * FROM blog_posts WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all('published', limit, offset);

    // Localize each post based on requested language
    const localizedPosts = (posts as any[]).map(post => localizePost(post, lang));

    res.json({
      data: localizedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog post by slug (public) - MUST come after admin routes
router.get('/:slug', (req, res) => {
  try {
    const lang = (req.query.lang as string) || 'en';
    const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(req.params.slug);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Localize the post based on requested language
    res.json(localizePost(post, lang));
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new blog post
router.post('/admin/create', authenticateToken, upload.single('featured_image'), (req, res) => {
  try {
    const {
      title_en, title_ar, title_es, title_pt,
      content_en, content_ar, content_es, content_pt,
      status, language
    } = req.body;

    const slug = generateSlug(title_en) + '-' + Date.now();
    const featured_image = req.file ? `/uploads/blog/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO blog_posts (
        title_en, title_ar, title_es, title_pt,
        content_en, content_ar, content_es, content_pt,
        slug, featured_image, status, language
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title_en, title_ar || null, title_es || null, title_pt || null,
      content_en, content_ar || null, content_es || null, content_pt || null,
      slug, featured_image, status || 'draft', language || 'en'
    );

    const newPost = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update blog post
router.put('/admin/:id', authenticateToken, upload.single('featured_image'), (req, res) => {
  try {
    const {
      title_en, title_ar, title_es, title_pt,
      content_en, content_ar, content_es, content_pt,
      status, language
    } = req.body;

    const existing: any = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const featured_image = req.file ? `/uploads/blog/${req.file.filename}` : existing.featured_image;

    db.prepare(`
      UPDATE blog_posts SET
        title_en = ?, title_ar = ?, title_es = ?, title_pt = ?,
        content_en = ?, content_ar = ?, content_es = ?, content_pt = ?,
        featured_image = ?, status = ?, language = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title_en, title_ar || null, title_es || null, title_pt || null,
      content_en, content_ar || null, content_es || null, content_pt || null,
      featured_image, status || 'draft', language || 'en',
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog post
router.delete('/admin/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
