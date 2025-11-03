const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const DEFAULT_UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'al-shaer-family';

const hasExplicitUrl = !!process.env.CLOUDINARY_URL;
const hasDiscreteCreds = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
  .every((key) => !!process.env[key]);

let warnedMissingConfig = false;

if (hasExplicitUrl) {
  cloudinary.config(process.env.CLOUDINARY_URL);
  cloudinary.config({ secure: true });
} else if (hasDiscreteCreds) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

const getCloudinaryConfig = () => cloudinary.config();

const isConfigured = () => {
  const config = getCloudinaryConfig();
  return Boolean(config?.cloud_name && config?.api_key && config?.api_secret);
};

const shouldUseCloudinary = () => {
  const preference = (process.env.USE_CLOUDINARY || '').trim().toLowerCase();
  if (preference === 'true') {
    if (!isConfigured()) {
      if (!warnedMissingConfig) {
        console.warn('[Cloudinary] USE_CLOUDINARY=true but credentials are missing; falling back to local storage.');
        warnedMissingConfig = true;
      }
      return false;
    }
    return true;
  }
  if (preference === 'false') return false;
  return isConfigured();
};

const ensureConfigured = () => {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured. Check environment variables.');
  }
};

/**
 * Upload image to Cloudinary
 * @param {Buffer} imageBuffer - Image buffer
 * @param {String} folder - Folder name in Cloudinary (optional)
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadImage = async (imageBuffer, folder = DEFAULT_UPLOAD_FOLDER) => {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      // Optimize images
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    ).end(imageBuffer);
  });
};

/**
 * Upload image from file path
 * @param {String} filePath - Path to image file
 * @param {String} folder - Folder name in Cloudinary (optional)
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadImageFromPath = async (filePath, folder = DEFAULT_UPLOAD_FOLDER) => {
  try {
    ensureConfigured();
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    ensureConfigured();
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String} Public ID
 */
const getPublicIdFromUrl = (url) => {
  try {
    // Cloudinary URLs format: https://res.cloudinary.com/CLOUD_NAME/image/upload/v1234567890/FOLDER/IMAGE.jpg
    const matches = url.match(/\/upload\/.*\/(.+)$/);
    if (matches && matches[1]) {
      // Remove version number and get public ID
      const publicId = matches[1].replace(/^v\d+\//, '');
      // Remove file extension
      return publicId.replace(/\.[^/.]+$/, '');
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  uploadImage,
  uploadImageFromPath,
  deleteImage,
  getPublicIdFromUrl,
  isConfigured,
  shouldUseCloudinary,
  DEFAULT_UPLOAD_FOLDER
};

