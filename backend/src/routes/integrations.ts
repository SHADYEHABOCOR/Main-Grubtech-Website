import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure integrations upload directory exists
const integrationsUploadDir = path.join(__dirname, '../../uploads/integrations');
if (!fs.existsSync(integrationsUploadDir)) {
  fs.mkdirSync(integrationsUploadDir, { recursive: true });
}

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, integrationsUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'integration-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
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

// Get all integrations with pagination and filtering
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;
  const category = req.query.category as string | undefined;
  const status = req.query.status as string | undefined;

  // Build WHERE clause dynamically
  const conditions: string[] = [];
  const params: any[] = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count with filters
  const countResult = db.prepare(`SELECT COUNT(*) as total FROM integrations ${whereClause}`).get(...params) as { total: number };
  const total = countResult.total;

  // Get paginated integrations with filters
  const integrations = db.prepare(`SELECT * FROM integrations ${whereClause} ORDER BY category, display_order LIMIT ? OFFSET ?`).all(...params, limit, offset);

  res.json({
    data: integrations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  });
});

// Get integrations by category
router.get('/category/:category', (req: Request, res: Response) => {
  const db = getDb();
  const integrations = db.prepare('SELECT * FROM integrations WHERE category = ? ORDER BY display_order').all(req.params.category);
  res.json(integrations);
});

// Get single integration
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const integration = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
  if (!integration) {
    return res.status(404).json({ error: 'Integration not found' });
  }
  res.json(integration);
});

// Create integration (protected - requires authentication)
router.post('/', authenticateToken, upload.single('logo'), (req: Request, res: Response) => {
  const { name, description, category, website_url, display_order, status } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'Name and category are required' });
  }

  const db = getDb();
  try {
    const logoPath = req.file ? `/uploads/integrations/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO integrations (name, description, category, logo_url, website_url, display_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, description, category, logoPath, website_url, display_order || 0, status || 'active');

    const integration = db.prepare('SELECT * FROM integrations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(integration);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update integration (protected - requires authentication)
router.put('/:id', authenticateToken, upload.single('logo'), (req: Request, res: Response) => {
  const { name, description, category, website_url, display_order, status } = req.body;

  const db = getDb();
  try {
    const existing: any = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const logoPath = req.file ? `/uploads/integrations/${req.file.filename}` : existing.logo_url;

    db.prepare(`
      UPDATE integrations
      SET name = ?, description = ?, category = ?, logo_url = ?, website_url = ?, display_order = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, description, category, logoPath, website_url, display_order, status, req.params.id);

    const integration = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
    res.json(integration);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete integration (protected - requires authentication)
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const result = db.prepare('DELETE FROM integrations WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

export default router;
