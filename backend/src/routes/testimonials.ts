import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure testimonials upload directory exists
const testimonialsUploadDir = path.join(__dirname, '../../public/uploads/testimonials');
if (!fs.existsSync(testimonialsUploadDir)) {
  fs.mkdirSync(testimonialsUploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, testimonialsUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'testimonial-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // If no file is provided, skip validation
    if (!file || !file.originalname) {
      return cb(null, false);
    }

    const allowedTypes = /jpeg|jpg|png|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/svg+xml';
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG, WEBP, SVG) are allowed'));
  }
});

// Helper function to localize testimonial content
function localizeTestimonial(testimonial: any, lang: string) {
  let headline = testimonial.headline;
  let content = testimonial.content;

  // Use language-specific content if available
  if (lang === 'ar' && testimonial.headline_ar) {
    headline = testimonial.headline_ar;
    content = testimonial.content_ar || testimonial.content;
  } else if (lang === 'es' && testimonial.headline_es) {
    headline = testimonial.headline_es;
    content = testimonial.content_es || testimonial.content;
  } else if (lang === 'pt' && testimonial.headline_pt) {
    headline = testimonial.headline_pt;
    content = testimonial.content_pt || testimonial.content;
  }

  return {
    ...testimonial,
    headline,
    content
  };
}

// Get all testimonials (public) with pagination
router.get('/', (req: Request, res: Response) => {
  try {
    const lang = req.query.lang || 'en';
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = db.prepare('SELECT COUNT(*) as total FROM testimonials').get() as { total: number };
    const total = countResult.total;

    // Get paginated testimonials
    const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);

    // Localize each testimonial based on requested language
    const localizedTestimonials = (testimonials as any[]).map(testimonial => localizeTestimonial(testimonial, lang as string));

    res.json({
      data: localizedTestimonials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin routes (protected)
// Get testimonials stats (protected)
router.get('/stats', authenticateToken, (req: Request, res: Response) => {
  try {
    const stats = {
      total: (db.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number }).count,
      today: (db.prepare("SELECT COUNT(*) as count FROM testimonials WHERE DATE(created_at) = DATE('now')").get() as { count: number }).count,
      thisWeek: (db.prepare("SELECT COUNT(*) as count FROM testimonials WHERE created_at >= datetime('now', '-7 days')").get() as { count: number }).count,
      thisMonth: (db.prepare("SELECT COUNT(*) as count FROM testimonials WHERE created_at >= datetime('now', '-30 days')").get() as { count: number }).count,
      byRating: db.prepare('SELECT rating, COUNT(*) as count FROM testimonials GROUP BY rating ORDER BY rating').all(),
      averageRating: (db.prepare('SELECT AVG(rating) as average FROM testimonials').get() as { average: number | null }).average || 0
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching testimonials stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// Get single testimonial by ID (admin)
router.get('/admin/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json(testimonial);
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new testimonial
router.post('/admin/create', authenticateToken, upload.fields([{ name: 'image' }, { name: 'company_logo' }]), (req: Request, res: Response) => {
  try {
    const {
      name, company, headline, content, rating,
      headline_ar, content_ar, headline_es, content_es, headline_pt, content_pt
    } = req.body;

    if (!name || !company || !content) {
      return res.status(400).json({ error: 'Name, company, and content are required' });
    }

    const files = (req as any).files;
    const imagePath = files?.image?.[0] ? `/uploads/testimonials/${files.image[0].filename}` : null;
    const companyLogoPath = files?.company_logo?.[0] ? `/uploads/testimonials/${files.company_logo[0].filename}` : null;

    const result = db.prepare(`
      INSERT INTO testimonials (
        name, company, company_logo, headline, content, image, rating,
        headline_ar, content_ar, headline_es, content_es, headline_pt, content_pt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, company, companyLogoPath, headline || null, content, imagePath, rating || 5,
      headline_ar || null, content_ar || null, headline_es || null, content_es || null, headline_pt || null, content_pt || null
    );

    const newTestimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTestimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update testimonial
router.put('/admin/:id', authenticateToken, upload.fields([{ name: 'image' }, { name: 'company_logo' }]), (req: Request, res: Response) => {
  try {
    const {
      name, company, headline, content, rating,
      headline_ar, content_ar, headline_es, content_es, headline_pt, content_pt
    } = req.body;

    const existing: any = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    const files = (req as any).files;
    const imagePath = files?.image?.[0] ? `/uploads/testimonials/${files.image[0].filename}` : existing.image;
    const companyLogoPath = files?.company_logo?.[0] ? `/uploads/testimonials/${files.company_logo[0].filename}` : existing.company_logo;

    db.prepare(`
      UPDATE testimonials SET
        name = ?, company = ?, company_logo = ?, headline = ?, content = ?, image = ?, rating = ?,
        headline_ar = ?, content_ar = ?, headline_es = ?, content_es = ?, headline_pt = ?, content_pt = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name, company, companyLogoPath, headline || null, content, imagePath, rating || 5,
      headline_ar || null, content_ar || null, headline_es || null, content_es || null, headline_pt || null, content_pt || null,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete testimonial
router.delete('/admin/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single testimonial by ID (public) - MUST come after admin routes
router.get('/:id', (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) || 'en';
    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    // Localize the testimonial based on requested language
    res.json(localizeTestimonial(testimonial, lang));
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
