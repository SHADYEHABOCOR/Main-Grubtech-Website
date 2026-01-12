import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Path to content.json file
const CONTENT_FILE_PATH = path.join(__dirname, '../../content.json');

// Helper function to read content from JSON file
const readContent = () => {
  try {
    const data = fs.readFileSync(CONTENT_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading content.json:', error);
    return {};
  }
};

// Helper function to write content to JSON file
const writeContent = (content: any) => {
  try {
    fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(content, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing content.json:', error);
    return false;
  }
};

// Get all website content (public)
router.get('/', (req, res) => {
  try {
    const content = readContent();
    res.json(content);
  } catch (error) {
    console.error('Error fetching website content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get content for specific page (public)
router.get('/:page', (req, res) => {
  try {
    const content = readContent();
    const pageContent = content[req.params.page];

    if (!pageContent) {
      return res.status(404).json({ error: 'Page content not found' });
    }

    res.json(pageContent);
  } catch (error) {
    console.error('Error fetching page content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin routes (protected)
// Get all content for admin
router.get('/admin/all', authenticateToken, (req, res) => {
  try {
    const content = readContent();
    res.json(content);
  } catch (error) {
    console.error('Error fetching all content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update all website content (admin only)
router.put('/admin/update', authenticateToken, (req, res) => {
  try {
    const newContent = req.body;

    // Validate that content is an object
    if (!newContent || typeof newContent !== 'object') {
      return res.status(400).json({ error: 'Invalid content format' });
    }

    // Write to file
    const success = writeContent(newContent);

    if (!success) {
      return res.status(500).json({ error: 'Failed to save content' });
    }

    res.json({
      success: true,
      message: 'Content updated successfully',
      content: newContent
    });
  } catch (error) {
    console.error('Error updating website content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update specific page content (admin only)
router.put('/admin/:page', authenticateToken, (req, res) => {
  try {
    const { page } = req.params;
    const pageContent = req.body;

    // Read existing content
    const content = readContent();

    // Update specific page
    content[page] = pageContent;

    // Write to file
    const success = writeContent(content);

    if (!success) {
      return res.status(500).json({ error: 'Failed to save content' });
    }

    res.json({
      success: true,
      message: `Page '${page}' updated successfully`,
      content: content[page]
    });
  } catch (error) {
    console.error('Error updating page content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
