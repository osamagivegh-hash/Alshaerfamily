/**
 * Utility functions for image URL handling
 */

/**
 * Normalize image URL - ensures URL is properly formatted
 * Handles both Cloudinary URLs and local uploads
 * @param {string} url - Image URL (can be relative or absolute)
 * @returns {string} - Normalized absolute URL
 */
export const normalizeImageUrl = (url) => {
  if (!url) return null;
  
  // If already a full URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a Cloudinary URL without protocol, add https
  if (url.startsWith('res.cloudinary.com')) {
    return `https://${url}`;
  }
  
  // For relative URLs (local uploads), construct full URL
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  
  // In production, use current origin, in dev use server port
  if (import.meta.env.PROD) {
    return `${window.location.origin}${cleanPath}`;
  } else {
    return `http://localhost:5000${cleanPath}`;
  }
};

export default { normalizeImageUrl };

