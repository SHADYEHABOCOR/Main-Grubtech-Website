import express, { Request, Response } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Public endpoint - submit integration request
router.post(
  '/',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('company_name').optional().trim().isLength({ max: 255 }),
    body('message').optional().trim().isLength({ max: 2000 }),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, company_name, message } = req.body;

      const result = db.prepare(`
        INSERT INTO integration_requests (email, company_name, message)
        VALUES (?, ?, ?)
      `).run(email, company_name || null, message || null);

      res.status(201).json({
        message: 'Integration request submitted successfully',
        id: result.lastInsertRowid
      });
    } catch (error) {
      console.error('Error creating integration request:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Admin endpoints - Get all integration requests
router.get('/admin', authenticateToken, (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    // Build query
    let query = 'SELECT * FROM integration_requests';
    let countQuery = 'SELECT COUNT(*) as total FROM integration_requests';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      countQuery += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    const countResult = db.prepare(countQuery).get(...params) as { total: number };
    const total = countResult.total;

    const requests = db.prepare(query).all(...params, limit, offset);

    res.json({
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching integration requests:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin endpoint - Update status
router.patch('/admin/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!['pending', 'contacted', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.prepare(`
      UPDATE integration_requests 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(status, req.params.id);

    const updated = db.prepare('SELECT * FROM integration_requests WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating integration request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin endpoint - Delete integration request
router.delete('/admin/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM integration_requests WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Integration request not found' });
    }
    res.json({ message: 'Integration request deleted successfully' });
  } catch (error) {
    console.error('Error deleting integration request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
