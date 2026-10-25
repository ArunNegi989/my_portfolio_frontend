// Image and document uploads for the admin dashboard. Files are checked here for quick feedback
// and checked again by the backend (real file contents, size limits, admin-only endpoint).

import { API_URL } from "@/lib/api/config";
import { uploadFile, type UploadedMedia } from "@/lib/api/client";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_RESUME_BYTES = 10 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const IMAGE_EXTENSION = /\.(jpe?g|png|webp|gif)$/i;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Returns an error message, or null when the file looks like an acceptable image. */
export function checkImageFile(file: File): string | null {
  if (!IMAGE_EXTENSION.test(file.name) || (file.type && !IMAGE_TYPES.has(file.type))) return "Unsupported file type. Choose a JPG, PNG, WEBP or GIF image.";
  if (file.size > MAX_IMAGE_BYTES) return `That image is ${formatBytes(file.size)}. The maximum size is 5 MB.`;
  return null;
}

export function checkResumeFile(file: File): string | null {
  const isPdf = /\.pdf$/i.test(file.name) && (file.type === "application/pdf" || !file.type);
  if (!isPdf) return "Please choose a PDF file (.pdf).";
  if (file.size > MAX_RESUME_BYTES) return `That file is ${formatBytes(file.size)}. The maximum resume size is 10 MB.`;
  return null;
}

export const uploadImage = (file: File): Promise<UploadedMedia> => uploadFile(file, "image");
export const uploadResume = (file: File): Promise<UploadedMedia> => uploadFile(file, "document");

/** True for files stored by this backend's upload endpoint. */
export function isUploadedFile(src: string | undefined): boolean {
  if (!src || !API_URL) return false;
  try {
    return new URL(src).pathname.startsWith("/uploads/") && new URL(src).origin === new URL(API_URL, window.location.origin).origin;
  } catch {
    return false;
  }
}

/** Image sources must be an http(s) URL or a site path; temporary blob:/data: URLs are rejected. */
export function validateImageSrc(value: string | undefined, { optional = true } = {}): true | string {
  const src = value?.trim();
  if (!src) return optional ? true : "An image is required. Paste a URL or upload a file.";
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    if (url.protocol === "http:" || url.protocol === "https:") return true;
  } catch {
    // fall through
  }
  return "Enter a valid image URL (https://…) or a site path (/…), or upload a file.";
}
