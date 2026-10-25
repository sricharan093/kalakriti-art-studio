import express from 'express';
import {
  getAllPaintings,
  getPaintingById,
  createPainting,
  updatePainting,
  deletePainting,
  restorePainting,
  uploadPaintingImage
} from '../controllers/paintingController.js';
import { authenticate, requireAdmin, optionalAuthenticate } from '../middleware/auth.js';
import { handleUploadSingle } from '../middleware/upload.js';

const router = express.Router();

// Catalogue routes (optional authentication allows admins to view archived items)
router.get('/', optionalAuthenticate, getAllPaintings);
router.get('/:id', optionalAuthenticate, getPaintingById);

// Admin-only upload & painting management routes
router.post(
  '/upload',
  authenticate,
  requireAdmin,
  handleUploadSingle('image'),
  uploadPaintingImage
);

router.post(
  '/upload-image',
  authenticate,
  requireAdmin,
  handleUploadSingle('image'),
  uploadPaintingImage
);

router.post(
  '/',
  authenticate,
  requireAdmin,
  handleUploadSingle('image'),
  createPainting
);

router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  handleUploadSingle('image'),
  updatePainting
);

router.patch(
  '/:id/restore',
  authenticate,
  requireAdmin,
  restorePainting
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  deletePainting
);

export default router;
