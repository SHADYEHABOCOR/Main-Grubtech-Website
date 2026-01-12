import express, { Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { emailService } from '../services/emailService.js';
import { leadRateLimiter, sanitizeLeadInput } from '../middleware/security.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Database connection
const dbPath = path.join(__dirname, '../../grubtech.db');
const db = new Database(dbPath);

// Create leads table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    restaurant_type TEXT,
    message TEXT,
    form_type TEXT DEFAULT 'contact',
    source_page TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// POST /api/leads - Capture a new lead (with rate limiting and sanitization)
router.post('/', leadRateLimiter, sanitizeLeadInput, async (req: Request, res: Response) => {
  try {
    const { name, email, company, phone, restaurant_type, message, form_type, source_page } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Insert lead into database
    const stmt = db.prepare(`
      INSERT INTO leads (name, email, company, phone, restaurant_type, message, form_type, source_page)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      email,
      company || null,
      phone || null,
      restaurant_type || null,
      message || null,
      form_type || 'contact',
      source_page || null
    );

    const leadId = result.lastInsertRowid;

    // Send email notifications (async, don't wait)
    const lead = { id: leadId, name, email, company, phone, restaurant_type, message, form_type, source_page };
    emailService.sendLeadEmails(lead).catch((err: Error) => {
      console.error('Email notification error:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Lead captured successfully',
      leadId
    });
  } catch (error: any) {
    console.error('❌ Error capturing lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to capture lead'
    });
  }
});

// GET /api/leads - Get all leads (protected)
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const leads = db.prepare(`
      SELECT * FROM leads
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const totalCount = (db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number }).count;

    res.json({
      success: true,
      leads,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leads'
    });
  }
});

// GET /api/leads/stats - Get lead statistics (protected)
router.get('/stats', authenticateToken, (req: Request, res: Response) => {
  try {
    const stats = {
      total: (db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number }).count,
      today: (db.prepare("SELECT COUNT(*) as count FROM leads WHERE DATE(created_at) = DATE('now')").get() as { count: number }).count,
      thisWeek: (db.prepare("SELECT COUNT(*) as count FROM leads WHERE created_at >= datetime('now', '-7 days')").get() as { count: number }).count,
      thisMonth: (db.prepare("SELECT COUNT(*) as count FROM leads WHERE created_at >= datetime('now', '-30 days')").get() as { count: number }).count,
      byType: db.prepare('SELECT form_type, COUNT(*) as count FROM leads GROUP BY form_type').all(),
      bySource: db.prepare('SELECT source_page as source, COUNT(*) as count FROM leads WHERE source_page IS NOT NULL GROUP BY source_page ORDER BY count DESC LIMIT 5').all()
    };

    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// GET /api/leads/:id - Get single lead (protected)
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({ success: true, lead });
  } catch (error: any) {
    console.error('❌ Error fetching lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lead'
    });
  }
});

// DELETE /api/leads/:id - Delete a lead (protected)
router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM leads WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('❌ Error deleting lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete lead'
    });
  }
});

export default router;
