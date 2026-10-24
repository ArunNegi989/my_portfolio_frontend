// Locally picked images for the admin prototype. NOTHING IS UPLOADED: a picked file becomes a
// browser object URL (blob:…) that only works in this tab until it is revoked or the page reloads.
// The URL is stored in the form value like any other image URL, so saved demo data can still
// contain it after a reload — by then it is dead and is reported as an expired upload.

import { validateUrl } from "@/lib/validation";
import { adminStore } from "./store";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const IMAGE_EXTENSION = /\.(jpe?g|png|webp|gif)$/i;

export interface LocalImage {
  url: string;
  name: string;
  size: number;
}

const live = new Map<string, LocalImage>();

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Returns an error message, or null when the file is an acceptable image. */
export function checkImageFile(file: File): string | null {
  if (!IMAGE_EXTENSION.test(file.name) || (file.type && !IMAGE_TYPES.has(file.type))) return "Unsupported file type. Choose a JPG, PNG, WEBP or GIF image.";
  if (file.size > MAX_IMAGE_BYTES) return `That image is ${formatBytes(file.size)}. The maximum size is 5 MB.`;
  return null;
}

export function createLocalImage(file: File): LocalImage {
  const image = { url: URL.createObjectURL(file), name: file.name, size: file.size };
  live.set(image.url, image);
  return image;
}

export const isBlobUrl = (src: string | undefined) => Boolean(src?.startsWith("blob:"));

/** The picked file behind `src`, if it is still alive in this tab. */
export const getLocalImage = (src: string | undefined) => (src ? live.get(src) : undefined);

/** A blob: URL left over from an earlier session; the file behind it is gone. */
export const isExpiredLocalImage = (src: string | undefined) => isBlobUrl(src) && !live.has(src!);

/** Revokes a picked image's object URL unless saved demo content still shows it. */
export function releaseLocalImage(url: string | undefined) {
  if (!url || !live.has(url)) return;
  if (JSON.stringify(adminStore.getSnapshot()).includes(url)) return;
  URL.revokeObjectURL(url);
  live.delete(url);
}

/** validateUrl that also accepts images picked in this session. */
export function validateImageSrc(value: string | undefined, { optional = true } = {}): true | string {
  if (isBlobUrl(value)) return live.has(value!) || "This uploaded image expired after a reload. Upload it again or paste a URL.";
  if (!value) return optional ? true : "An image is required. Paste a URL or upload a file.";
  return validateUrl(value, { optional });
}
