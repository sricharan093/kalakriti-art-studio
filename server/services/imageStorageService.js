import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Stores an uploaded file to persistent storage (Cloudinary if configured, else local disk).
 * Returns the final URL or relative path to be saved in MongoDB.
 */
export const persistUploadedImage = async (file) => {
  if (!file) return null;

  // Cloudinary persistent upload if configured
  if (isCloudinaryConfigured()) {
    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'kalakriti/paintings',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      });

      // Safely delete local temp file after cloud upload
      if (fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          // ignore cleanup error
        }
      }

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        storage: 'cloudinary'
      };
    } catch (err) {
      console.warn('[Storage] Cloudinary upload failed, falling back to local storage:', err.message);
      // Fallback to local storage if Cloudinary upload errors
    }
  }

  // Local storage (default / development / testing)
  const relativePath = `uploads/paintings/${file.filename}`;
  return {
    url: relativePath,
    filename: file.filename,
    storage: 'local'
  };
};

/**
 * Deletes an image from storage if safe (not seeded asset).
 */
export const removeStoredImage = async (imageUrl) => {
  if (!imageUrl) return;

  // Never delete seeded assets
  if (imageUrl.startsWith('images/') || imageUrl.startsWith('/images/')) {
    return;
  }

  // Cloudinary deletion
  if (imageUrl.includes('cloudinary.com')) {
    if (isCloudinaryConfigured()) {
      try {
        const matches = imageUrl.match(/\/v\d+\/(.+)\.[a-zA-Z]+$/);
        const publicId = matches ? matches[1] : null;
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.warn('[Storage] Failed to delete Cloudinary asset:', err.message);
      }
    }
    return;
  }

  // Local file deletion
  try {
    const cleanPath = imageUrl.replace(/^\//, '');
    if (cleanPath.startsWith('uploads/paintings/')) {
      const filename = path.basename(cleanPath);
      const localFilePath = path.resolve(__dirname, '..', 'uploads', 'paintings', filename);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }
  } catch (err) {
    console.warn('[Storage] Failed to delete local image file:', err.message);
  }
};
