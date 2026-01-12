import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to localize team member content
function localizeMember(member: any, lang: string) {
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
    bio
  };
}

// Get all active team members (public)
router.get('/', (req, res) => {
  try {
    const lang = (req.query.lang as string) || 'en';
    const members = db.prepare('SELECT * FROM team_members WHERE status = ? ORDER BY display_order ASC, created_at DESC').all('active');

    // Localize each member based on requested language
    const localizedMembers = (members as any[]).map(member => localizeMember(member, lang));

    res.json(localizedMembers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single team member by ID (public)
router.get('/:id', (req, res) => {
  try {
    const lang = (req.query.lang as string) || 'en';
    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Localize the member based on requested language
    res.json(localizeMember(member, lang));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new team member (admin)
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      name_en, name_ar, name_es, name_pt,
      title_en, title_ar, title_es, title_pt,
      department,
      bio_en, bio_ar, bio_es, bio_pt,
      email, linkedin, image,
      display_order, status
    } = req.body;

    if (!name_en || !title_en || !department) {
      return res.status(400).json({ error: 'Name (English), title (English), and department are required' });
    }

    const result = db.prepare(`
      INSERT INTO team_members (
        name_en, name_ar, name_es, name_pt,
        title_en, title_ar, title_es, title_pt,
        department,
        bio_en, bio_ar, bio_es, bio_pt,
        email, linkedin, image,
        display_order, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name_en, name_ar || null, name_es || null, name_pt || null,
      title_en, title_ar || null, title_es || null, title_pt || null,
      department,
      bio_en || null, bio_ar || null, bio_es || null, bio_pt || null,
      email || null, linkedin || null, image || null,
      display_order || 0, status || 'active'
    );

    const newMember = db.prepare('SELECT * FROM team_members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update team member (admin)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const {
      name_en, name_ar, name_es, name_pt,
      title_en, title_ar, title_es, title_pt,
      department,
      bio_en, bio_ar, bio_es, bio_pt,
      email, linkedin, image,
      display_order, status
    } = req.body;

    const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    db.prepare(`
      UPDATE team_members SET
        name_en = ?, name_ar = ?, name_es = ?, name_pt = ?,
        title_en = ?, title_ar = ?, title_es = ?, title_pt = ?,
        department = ?,
        bio_en = ?, bio_ar = ?, bio_es = ?, bio_pt = ?,
        email = ?, linkedin = ?, image = ?,
        display_order = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name_en, name_ar || null, name_es || null, name_pt || null,
      title_en, title_ar || null, title_es || null, title_pt || null,
      department,
      bio_en || null, bio_ar || null, bio_es || null, bio_pt || null,
      email || null, linkedin || null, image || null,
      display_order || 0, status || 'active',
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete team member (admin)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
