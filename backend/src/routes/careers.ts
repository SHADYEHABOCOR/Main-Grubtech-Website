import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { emailService } from '../services/emailService.js';
import { parsePagination, calculatePagination } from '../utils/apiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads/applications');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for CV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for CVs
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
});

// Create job_applications table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    linkedin TEXT,
    expertise TEXT,
    cv_path TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Submit job application (public)
router.post('/apply', upload.single('cv'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, city, country, linkedin, expertise, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    const cvPath = req.file ? `/uploads/applications/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO job_applications (first_name, last_name, email, phone, address, city, country, linkedin, expertise, cv_path, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      firstName,
      lastName,
      email,
      phone || null,
      address || null,
      city || null,
      country || null,
      linkedin || null,
      expertise || null,
      cvPath,
      message || null
    );

    // Send notification email
    const application = {
      id: result.lastInsertRowid,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      expertise,
      message,
      form_type: 'job_application'
    };

    emailService.sendLeadEmails(application).catch((err: Error) => {
      console.error('Email notification error:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error submitting job application:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all job applications (admin)
router.get('/applications', authenticateToken, (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);

    // Get total count
    const countResult = db.prepare('SELECT COUNT(*) as total FROM job_applications').get() as { total: number };
    const total = countResult.total;

    // Get paginated applications
    const applications = db.prepare('SELECT * FROM job_applications ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);

    // Calculate pagination metadata
    const pagination = calculatePagination(page, limit, total);

    res.json({
      data: applications,
      pagination
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update application status (admin)
router.put('/applications/:id', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE job_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete application (admin)
router.delete('/applications/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM job_applications WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get careers stats (protected)
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = {
      vacancies: {
        total: (db.prepare('SELECT COUNT(*) as count FROM job_vacancies').get() as { count: number }).count,
        byDepartment: db.prepare('SELECT department, COUNT(*) as count FROM job_vacancies GROUP BY department').all(),
        byLocation: db.prepare('SELECT location, COUNT(*) as count FROM job_vacancies GROUP BY location').all(),
        byType: db.prepare('SELECT type, COUNT(*) as count FROM job_vacancies GROUP BY type').all(),
        byStatus: db.prepare('SELECT status, COUNT(*) as count FROM job_vacancies GROUP BY status').all()
      },
      applications: {
        total: (db.prepare('SELECT COUNT(*) as count FROM job_applications').get() as { count: number }).count,
        today: (db.prepare("SELECT COUNT(*) as count FROM job_applications WHERE DATE(created_at) = DATE('now')").get() as { count: number }).count,
        thisWeek: (db.prepare("SELECT COUNT(*) as count FROM job_applications WHERE created_at >= datetime('now', '-7 days')").get() as { count: number }).count,
        thisMonth: (db.prepare("SELECT COUNT(*) as count FROM job_applications WHERE created_at >= datetime('now', '-30 days')").get() as { count: number }).count,
        byStatus: db.prepare('SELECT status, COUNT(*) as count FROM job_applications GROUP BY status').all()
      }
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching careers stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// Get all active job vacancies (public)
router.get('/', (_req, res) => {
  try {
    const vacancies = db.prepare('SELECT * FROM job_vacancies WHERE status = ? ORDER BY created_at DESC').all('active');
    res.json(vacancies);
  } catch (error) {
    console.error('Error fetching job vacancies:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single job vacancy by ID (public)
router.get('/:id', (req, res) => {
  try {
    const vacancy = db.prepare('SELECT * FROM job_vacancies WHERE id = ? AND status = ?').get(req.params.id, 'active');
    if (!vacancy) {
      return res.status(404).json({ error: 'Job vacancy not found' });
    }
    res.json(vacancy);
  } catch (error) {
    console.error('Error fetching job vacancy:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin routes (protected)
// Get all job vacancies including inactive
router.get('/admin/all', authenticateToken, (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);

    // Get total count
    const countResult = db.prepare('SELECT COUNT(*) as total FROM job_vacancies').get() as { total: number };
    const total = countResult.total;

    // Get paginated vacancies
    const vacancies = db.prepare('SELECT * FROM job_vacancies ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);

    // Calculate pagination metadata
    const pagination = calculatePagination(page, limit, total);

    res.json({
      data: vacancies,
      pagination
    });
  } catch (error) {
    console.error('Error fetching job vacancies:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new job vacancy
router.post('/admin/create', authenticateToken, (req, res) => {
  try {
    const { title, department, location, type, description, requirements, application_link, status } = req.body;

    if (!title || !department || !location) {
      return res.status(400).json({ error: 'Title, department, and location are required' });
    }

    const result = db.prepare(`
      INSERT INTO job_vacancies (title, department, location, type, description, requirements, application_link, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      department,
      location,
      type || 'Full-time',
      description || null,
      requirements || null,
      application_link || null,
      status || 'active'
    );

    const newVacancy = db.prepare('SELECT * FROM job_vacancies WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newVacancy);
  } catch (error) {
    console.error('Error creating job vacancy:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update job vacancy
router.put('/admin/:id', authenticateToken, (req, res) => {
  try {
    const { title, department, location, type, description, requirements, application_link, status } = req.body;

    const existing = db.prepare('SELECT * FROM job_vacancies WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Job vacancy not found' });
    }

    db.prepare(`
      UPDATE job_vacancies SET
        title = ?, department = ?, location = ?, type = ?,
        description = ?, requirements = ?, application_link = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      department,
      location,
      type || 'Full-time',
      description || null,
      requirements || null,
      application_link || null,
      status || 'active',
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM job_vacancies WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating job vacancy:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete job vacancy
router.delete('/admin/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM job_vacancies WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job vacancy not found' });
    }
    res.json({ message: 'Job vacancy deleted successfully' });
  } catch (error) {
    console.error('Error deleting job vacancy:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
