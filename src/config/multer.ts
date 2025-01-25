import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { AppError } from '../middleware/error.middleware';

// Configure storage
const storage = multer.diskStorage({
  destination: function (_req: Request, _file: Express.Multer.File, cb) {
    cb(null, 'uploads/');
  },
  filename: function (_req: Request, file: Express.Multer.File, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new AppError('Only image files are allowed!', 400) as any);
  }
  cb(null, true);
};

// Create multer instance with configuration
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
} 