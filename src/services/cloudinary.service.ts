import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../middleware/error.middleware';
import fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class CloudinaryService {
  async uploadImage(filePath: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'task-management-app',
        resource_type: 'auto'
      });

      // Delete file from local storage after upload
      await unlinkAsync(filePath);

      return result.secure_url;
    } catch (error) {
      // Delete file from local storage if upload fails
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
      }
      
      if (error instanceof Error) {
        throw new AppError(`Error uploading image: ${error.message}`, 500);
      }
      throw new AppError('Error uploading image to Cloudinary', 500);
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const publicId = this.getPublicIdFromUrl(imageUrl);
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result !== 'ok') {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Error deleting image: ${error.message}`, 500);
      }
      throw new AppError('Error deleting image from Cloudinary', 500);
    }
  }

  private getPublicIdFromUrl(imageUrl: string): string {
    const splitUrl = imageUrl.split('/');
    const filename = splitUrl[splitUrl.length - 1];
    return `task-management-app/${filename.split('.')[0]}`;
  }
} 