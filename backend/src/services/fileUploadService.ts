import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { CustomError, asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

// Configure Cloudinary (only if credentials are provided)
if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common document types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed') as any, false);
    }
  },
});

export const uploadMiddleware = upload.single('file');

export const uploadFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new CustomError('No file provided', 400);
  }

  try {
    let fileUrl: string;
    let publicId: string;

    // If Cloudinary is configured, use it; otherwise, save to local storage
    if (config.CLOUDINARY_CLOUD_NAME) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'todo-app-attachments',
            public_id: `${req.user!.id}_${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file!.buffer);
      }) as any;

      fileUrl = result.secure_url;
      publicId = result.public_id;
    } else {
      // For development/local storage - in production, you'd want to use a proper file storage service
      const fileName = `${req.user!.id}_${Date.now()}_${req.file.originalname}`;
      fileUrl = `/uploads/${fileName}`;
      publicId = fileName;
      
      // Note: In a real implementation, you'd save the file to a local directory or storage service
      logger.warn('File upload: Using mock local storage. Configure Cloudinary for production.');
    }

    logger.info(`File uploaded: ${req.file.originalname} by user: ${req.user!.id}`);

    res.json({
      message: 'File uploaded successfully',
      file: {
        url: fileUrl,
        publicId,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    logger.error('File upload error:', error);
    throw new CustomError('Failed to upload file', 500);
  }
});

export const deleteFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { publicId } = req.params;

  if (!publicId) {
    throw new CustomError('Public ID is required', 400);
  }

  try {
    if (config.CLOUDINARY_CLOUD_NAME) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(publicId);
    } else {
      // For local storage - you'd implement file deletion here
      logger.warn('File deletion: Using mock local storage. Configure Cloudinary for production.');
    }

    logger.info(`File deleted: ${publicId} by user: ${req.user!.id}`);

    res.json({
      message: 'File deleted successfully',
    });
  } catch (error) {
    logger.error('File deletion error:', error);
    throw new CustomError('Failed to delete file', 500);
  }
});

// Middleware to validate file upload
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new CustomError('File too large. Maximum size is 10MB.', 400));
      }
      return next(new CustomError(err.message, 400));
    } else if (err) {
      return next(new CustomError(err.message, 400));
    }
    next();
  });
};