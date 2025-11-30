import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Get optimized URL for an image
 * Utility function (not a server action)
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return "";
  }

  const transformation: any = [];
  
  if (options.width || options.height) {
    transformation.push({
      width: options.width,
      height: options.height,
      crop: "limit",
    });
  }

  if (options.quality) {
    transformation.push({ quality: options.quality });
  }

  if (options.format) {
    transformation.push({ format: options.format });
  }

  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  });
}

/**
 * Generate thumbnail URL
 * Utility function (not a server action)
 */
export function getThumbnailUrl(publicId: string, width: number = 200, height: number = 200): string {
  return getOptimizedUrl(publicId, { width, height, quality: 80 });
}

