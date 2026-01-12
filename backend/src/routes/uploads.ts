import { Router, Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const imagesDir = path.join(uploadsDir, 'images');
const thumbnailsDir = path.join(imagesDir, 'thumbnails');

[uploadsDir, imagesDir, thumbnailsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for memory storage (we'll process with sharp before saving)
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Image size configurations
interface ImageSizeConfig {
  width: number;
  height?: number;
  suffix: string;
}

const imageSizes: ImageSizeConfig[] = [
  { width: 1920, suffix: 'large' },     // Full size for hero images
  { width: 1280, suffix: 'medium' },    // Standard desktop
  { width: 640, suffix: 'small' },      // Tablet/mobile
  { width: 320, suffix: 'thumbnail' },  // Thumbnails
];

// Generate unique filename
const generateFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  return `${baseName}-${timestamp}-${randomString}`;
};

// Process and save image
const processImage = async (
  buffer: Buffer,
  filename: string,
  quality: number = 85
): Promise<{ original: string; webp: string; sizes: Record<string, { original: string; webp: string }> }> => {
  const results: { original: string; webp: string; sizes: Record<string, { original: string; webp: string }> } = {
    original: '',
    webp: '',
    sizes: {},
  };

  // Get image metadata
  const metadata = await sharp(buffer).metadata();
  const originalWidth = metadata.width || 1920;

  // Save original as optimized JPEG/PNG
  const originalPath = path.join(imagesDir, `${filename}.jpg`);
  await sharp(buffer)
    .jpeg({ quality, mozjpeg: true })
    .toFile(originalPath);
  results.original = `/uploads/images/${filename}.jpg`;

  // Save as WebP (better compression)
  const webpPath = path.join(imagesDir, `${filename}.webp`);
  await sharp(buffer)
    .webp({ quality })
    .toFile(webpPath);
  results.webp = `/uploads/images/${filename}.webp`;

  // Generate responsive sizes
  for (const size of imageSizes) {
    // Only generate smaller sizes, not upscale
    if (size.width < originalWidth) {
      const sizeFilename = `${filename}-${size.suffix}`;

      // JPEG version
      const jpegPath = path.join(imagesDir, `${sizeFilename}.jpg`);
      await sharp(buffer)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality, mozjpeg: true })
        .toFile(jpegPath);

      // WebP version
      const webpSizePath = path.join(imagesDir, `${sizeFilename}.webp`);
      await sharp(buffer)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality })
        .toFile(webpSizePath);

      results.sizes[size.suffix] = {
        original: `/uploads/images/${sizeFilename}.jpg`,
        webp: `/uploads/images/${sizeFilename}.webp`,
      };
    }
  }

  // Generate thumbnail (square crop for avatars/icons)
  const thumbnailFilename = `${filename}-thumb`;
  const thumbnailPath = path.join(thumbnailsDir, `${thumbnailFilename}.webp`);
  await sharp(buffer)
    .resize(150, 150, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 80 })
    .toFile(thumbnailPath);

  results.sizes['thumb'] = {
    original: `/uploads/images/thumbnails/${thumbnailFilename}.webp`,
    webp: `/uploads/images/thumbnails/${thumbnailFilename}.webp`,
  };

  return results;
};

// Upload single image
router.post('/image', authenticateToken, upload.single('image'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const filename = generateFilename(req.file.originalname);
    const quality = parseInt(req.body.quality as string) || 85;

    const result = await processImage(req.file.buffer, filename, quality);

    res.json({
      success: true,
      message: 'Image uploaded and optimized successfully',
      data: {
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        paths: result,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Upload multiple images
router.post('/images', authenticateToken, upload.array('images', 10), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No image files provided' });
      return;
    }

    const quality = parseInt(req.body.quality as string) || 85;
    const results = [];

    for (const file of files) {
      const filename = generateFilename(file.originalname);
      const result = await processImage(file.buffer, filename, quality);

      results.push({
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        paths: result,
      });
    }

    res.json({
      success: true,
      message: `${results.length} images uploaded and optimized successfully`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

// Delete image and all its variants
router.delete('/image/:filename', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { filename } = req.params;

    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      res.status(400).json({ error: 'Invalid filename' });
      return;
    }

    const deletedFiles: string[] = [];
    const baseFilename = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');

    // Find and delete all variants
    const files = fs.readdirSync(imagesDir);
    const thumbnails = fs.readdirSync(thumbnailsDir);

    // Delete from images directory
    for (const file of files) {
      if (file.startsWith(baseFilename)) {
        const filePath = path.join(imagesDir, file);
        fs.unlinkSync(filePath);
        deletedFiles.push(file);
      }
    }

    // Delete from thumbnails directory
    for (const file of thumbnails) {
      if (file.startsWith(baseFilename)) {
        const filePath = path.join(thumbnailsDir, file);
        fs.unlinkSync(filePath);
        deletedFiles.push(`thumbnails/${file}`);
      }
    }

    if (deletedFiles.length === 0) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Image and all variants deleted',
      deletedFiles,
    });
  } catch (error) {
    next(error);
  }
});

// List all uploaded images
router.get('/images', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = fs.readdirSync(imagesDir);

    // Group files by base filename
    const images: Record<string, { original?: string; webp?: string; sizes: string[] }> = {};

    for (const file of files) {
      // Skip directories
      const filePath = path.join(imagesDir, file);
      if (fs.statSync(filePath).isDirectory()) continue;

      // Extract base filename (without size suffix and extension)
      const match = file.match(/^(.+?)(?:-(large|medium|small|thumbnail|thumb))?\.(\w+)$/);
      if (match) {
        const [, baseName, sizeSuffix, ext] = match;
        const key = baseName;

        if (!images[key]) {
          images[key] = { sizes: [] };
        }

        if (!sizeSuffix) {
          // Original size
          if (ext === 'webp') {
            images[key].webp = `/uploads/images/${file}`;
          } else {
            images[key].original = `/uploads/images/${file}`;
          }
        } else {
          images[key].sizes.push(`/uploads/images/${file}`);
        }
      }
    }

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
