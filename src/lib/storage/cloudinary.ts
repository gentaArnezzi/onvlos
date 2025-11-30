"use server";

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Upload a file to Cloudinary
 * Server Action
 */
export async function uploadFile(
  file: Buffer | string,
  options: {
    folder?: string;
    publicId?: string;
    resourceType?: "image" | "video" | "raw" | "auto";
    transformation?: any;
  } = {}
): Promise<UploadResult> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return {
        success: false,
        error: "Cloudinary credentials not configured",
      };
    }

    const uploadOptions: any = {
      resource_type: options.resourceType || "auto",
    };

    if (options.folder) {
      uploadOptions.folder = options.folder;
    }

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    let uploadResult;

    if (typeof file === "string") {
      // File path or URL
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    } else {
      // Buffer
      // For buffer upload, we need to use upload_stream
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file);
      });
      
      uploadResult = await uploadPromise;
    }

    return {
      success: true,
      url: (uploadResult as any).secure_url,
      publicId: (uploadResult as any).public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Delete a file from Cloudinary
 * Server Action
 */
export async function deleteFile(publicId: string): Promise<DeleteResult> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return {
        success: false,
        error: "Cloudinary credentials not configured",
      };
    }

    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

// Note: Utility functions (getOptimizedUrl, getThumbnailUrl) are in cloudinary-utils.ts
// to avoid "use server" requirement for non-async functions
