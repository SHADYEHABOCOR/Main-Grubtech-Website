import express, { Request, Response } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { parsePagination, calculatePagination } from '../utils/apiResponse.js';

const router = express.Router();

// Get all video galleries (public)
router.get('/', (req: Request, res: Response) => {
  try {
    const lang = req.query.lang || 'en';
    const videos = db.prepare('SELECT * FROM video_galleries WHERE is_active = 1 ORDER BY display_order ASC').all();

    // Map videos to include language-specific content
    const localizedVideos = videos.map((video: any) => {
      let title = video.title_en;
      let description = video.description_en;

      // Use language-specific content if available
      if (lang === 'ar' && video.title_ar) {
        title = video.title_ar;
        description = video.description_ar;
      } else if (lang === 'es' && video.title_es) {
        title = video.title_es;
        description = video.description_es;
      } else if (lang === 'pt' && video.title_pt) {
        title = video.title_pt;
        description = video.description_pt;
      }

      return {
        id: video.id,
        title,
        description,
        videoUrl: video.video_url,
        thumbnailUrl: video.thumbnail_url,
        logoUrl: video.logo_url,
        duration: video.duration,
        displayOrder: video.display_order
      };
    });

    res.json(localizedVideos);
  } catch (error) {
    console.error('Error fetching video galleries:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin routes (protected)
// Get single video by ID (admin)
router.get('/admin/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const video = db.prepare('SELECT * FROM video_galleries WHERE id = ?').get(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all videos for admin (including inactive)
router.get('/admin', authenticateToken, (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);

    // Get total count
    const countResult = db.prepare('SELECT COUNT(*) as total FROM video_galleries').get() as { total: number };
    const total = countResult.total;

    // Get paginated videos
    const videos = db.prepare('SELECT * FROM video_galleries ORDER BY display_order ASC LIMIT ? OFFSET ?').all(limit, offset);

    // Calculate pagination metadata
    const pagination = calculatePagination(page, limit, total);

    res.json({
      data: videos,
      pagination
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new video
router.post('/admin/create', authenticateToken, (req: Request, res: Response) => {
  try {
    const {
      title_en,
      title_ar,
      title_es,
      title_pt,
      video_url,
      description_en,
      description_ar,
      description_es,
      description_pt,
      thumbnail_url,
      logo_url,
      duration,
      display_order,
      is_active
    } = req.body;

    if (!title_en || !video_url) {
      return res.status(400).json({ error: 'Title (English) and video URL are required' });
    }

    const result = db.prepare(`
      INSERT INTO video_galleries (
        title_en, title_ar, title_es, title_pt,
        video_url, description_en, description_ar, description_es, description_pt,
        thumbnail_url, logo_url, duration, display_order, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title_en,
      title_ar || null,
      title_es || null,
      title_pt || null,
      video_url,
      description_en || null,
      description_ar || null,
      description_es || null,
      description_pt || null,
      thumbnail_url || null,
      logo_url || null,
      duration || null,
      display_order || 0,
      is_active !== undefined ? is_active : 1
    );

    const newVideo = db.prepare('SELECT * FROM video_galleries WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newVideo);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update video
router.put('/admin/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const {
      title_en,
      title_ar,
      title_es,
      title_pt,
      video_url,
      description_en,
      description_ar,
      description_es,
      description_pt,
      thumbnail_url,
      logo_url,
      duration,
      display_order,
      is_active
    } = req.body;

    const existing = db.prepare('SELECT * FROM video_galleries WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Video not found' });
    }

    db.prepare(`
      UPDATE video_galleries SET
        title_en = ?, title_ar = ?, title_es = ?, title_pt = ?,
        video_url = ?, description_en = ?, description_ar = ?, description_es = ?, description_pt = ?,
        thumbnail_url = ?, logo_url = ?, duration = ?, display_order = ?, is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title_en,
      title_ar || null,
      title_es || null,
      title_pt || null,
      video_url,
      description_en || null,
      description_ar || null,
      description_es || null,
      description_pt || null,
      thumbnail_url || null,
      logo_url || null,
      duration || null,
      display_order || 0,
      is_active !== undefined ? is_active : 1,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM video_galleries WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete video
router.delete('/admin/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM video_galleries WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
