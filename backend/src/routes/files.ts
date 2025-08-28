import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateFileUpload, uploadFile, deleteFile } from '../services/fileUploadService.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// File upload and management
router.post('/upload', validateFileUpload, uploadFile);
router.delete('/:publicId', deleteFile);

export default router;